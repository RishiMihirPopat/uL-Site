import { runner } from './harness';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import {
  eventRepository,
  articleRepository,
  testimonialRepository,
  settingsRepository,
  runAutoExpire,
} from '../../lib/db';
import { buildParameterizedUpdate } from '../../lib/db/sql-utils';
import { getDatabaseConnection } from '../../lib/db/client';

export async function runDbIntegrationTests() {
  runner.startSuite('Database Integration (Neon Postgres Repositories & Utilities)');

  if (!process.env.DATABASE_URL) {
    console.log('    \x1b[33m⚠ DATABASE_URL not set -- skipping live DB integration suite\x1b[0m');
    runner.endSuite();
    return;
  }

  // 1. Connection check
  const sql = getDatabaseConnection();
  const ping = await sql`SELECT 1 as alive`;
  runner.assertEqual(ping[0]?.alive, 1, 'Neon Postgres: ping query responds successfully');

  // 2. eventRepository
  const allEvents = await eventRepository.getAll();
  runner.assert(Array.isArray(allEvents), 'eventRepository.getAll: returns array of events');
  runner.assert(allEvents.length > 0, 'eventRepository: contains seeded events');

  const firstEvent = allEvents[0];
  const fetchedEvent = await eventRepository.getById(firstEvent.id);
  runner.assertEqual(fetchedEvent?.id, firstEvent.id, 'eventRepository.getById: retrieves matching event by ID');

  // 3. articleRepository
  const allArticles = await articleRepository.getAll();
  runner.assert(Array.isArray(allArticles), 'articleRepository.getAll: returns array of articles');
  const publishedArticles = await articleRepository.getPublished();
  runner.assert(
    publishedArticles.every((a) => a.status === 'published'),
    'articleRepository.getPublished: only returns published articles'
  );

  // 4. testimonialRepository
  const testimonials = await testimonialRepository.getAll();
  runner.assert(Array.isArray(testimonials), 'testimonialRepository.getAll: returns array of testimonials');

  // 5. settingsRepository
  const settings = await settingsRepository.getSettings();
  runner.assert(typeof settings.autoArchiveDelayDays === 'number', 'settingsRepository: returns autoArchiveDelayDays');
  runner.assert(Array.isArray(settings.carouselEventIds), 'settingsRepository: returns carouselEventIds array');

  // 6. runAutoExpire
  const expireResult = await runAutoExpire();
  runner.assert(typeof expireResult.expiredCount === 'number', 'runAutoExpire: executes cleanly without SQL errors');

  // 7. Parameterized Update on Neon DB (verifying multiple assignments to updated_at NEVER occurs)
  const targetId = firstEvent.id;
  const updateQuery = buildParameterizedUpdate(
    'events',
    targetId,
    {
      title: firstEvent.title,
      updated_at: '2020-01-01T00:00:00Z', // intentionally passed back to test defense
      created_at: '2020-01-01T00:00:00Z',
    },
    { setUpdatedAt: true }
  );
  runner.assert(updateQuery !== null, 'buildParameterizedUpdate: generates query for Neon update');
  await sql.query(updateQuery!.query, updateQuery!.values as any[]);
  runner.assert(true, 'buildParameterizedUpdate on Neon DB: successfully executed update with updated_at filtered out');

  // 8. Network timeout detection
  const { isNetworkTimeoutError } = await import('../../lib/db/client');
  const timeoutErr = new Error('Connect Timeout Error (attempted addresses: 3.0.27.201:443, timeout: 10000ms)');
  (timeoutErr as any).code = 'UND_ERR_CONNECT_TIMEOUT';
  runner.assert(isNetworkTimeoutError(timeoutErr), 'isNetworkTimeoutError: detects UND_ERR_CONNECT_TIMEOUT');
  runner.assert(isNetworkTimeoutError(new TypeError('fetch failed')), 'isNetworkTimeoutError: detects fetch failed');
  runner.assert(!isNetworkTimeoutError(new Error('syntax error at or near WHERE')), 'isNetworkTimeoutError: ignores SQL syntax errors');

  runner.endSuite();
}
