import { runner } from './harness';
import { buildParameterizedUpdate } from '../../lib/db/sql-utils';

export function runSqlUtilsTests() {
  runner.startSuite('SQL Parameterized Builder (lib/db/sql-utils.ts)');

  // 1. Basic update
  const basic = buildParameterizedUpdate('events', 'ev-123', { title: 'Lecture 1' });
  runner.assert(basic !== null, 'buildParameterizedUpdate: generates valid query object');
  runner.assertEqual(
    basic?.query,
    'UPDATE events SET "title" = $1 WHERE "id" = $2',
    'buildParameterizedUpdate: correct placeholders and quoted identifiers'
  );
  runner.assertEqual(basic?.values, ['Lecture 1', 'ev-123'], 'buildParameterizedUpdate: correct values array');

  // 2. Multiple columns
  const multi = buildParameterizedUpdate('articles', 'art-456', {
    title: 'New Article',
    author: 'Author Name',
    read_time: '5 min read',
  });
  runner.assertEqual(
    multi?.query,
    'UPDATE articles SET "title" = $1, "author" = $2, "read_time" = $3 WHERE "id" = $4',
    'buildParameterizedUpdate: correctly positions multiple placeholders'
  );
  runner.assertEqual(
    multi?.values,
    ['New Article', 'Author Name', '5 min read', 'art-456'],
    'buildParameterizedUpdate: maintains positional alignment of values'
  );

  // 3. Filtering immutable audit columns (id, created_at, updated_at)
  const auditFilter = buildParameterizedUpdate(
    'events',
    'ev-123',
    {
      title: 'Valid Title',
      id: 'hacked-id',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    { setUpdatedAt: true }
  );
  runner.assertEqual(
    auditFilter?.query,
    'UPDATE events SET "title" = $1, "updated_at" = NOW() WHERE "id" = $2',
    'buildParameterizedUpdate: strips id, created_at, and payload updated_at, assigning NOW() exactly once'
  );
  runner.assertEqual(auditFilter?.values, ['Valid Title', 'ev-123'], 'buildParameterizedUpdate: stripped columns not present in values');

  // 4. Undefined fields ignored, null fields preserved
  const undefinedCheck = buildParameterizedUpdate('events', 'ev-999', {
    title: 'Valid Title',
    venue: undefined,
    archive_badge: null,
  });
  runner.assertEqual(
    undefinedCheck?.query,
    'UPDATE events SET "title" = $1, "archive_badge" = $2 WHERE "id" = $3',
    'buildParameterizedUpdate: skips undefined properties but includes null properties'
  );
  runner.assertEqual(undefinedCheck?.values, ['Valid Title', null, 'ev-999'], 'buildParameterizedUpdate: preserves null value in parameters');

  // 5. Empty updates return null
  runner.assertEqual(buildParameterizedUpdate('events', 'ev-1', {}), null, 'buildParameterizedUpdate: empty object returns null');
  runner.assertEqual(
    buildParameterizedUpdate('events', 'ev-1', { id: 'ev-1', created_at: '2026' }),
    null,
    'buildParameterizedUpdate: object with only filtered columns returns null'
  );

  // 6. Only updated_at with setUpdatedAt: true
  const onlyUpdated = buildParameterizedUpdate('events', 'ev-1', { updated_at: 'old-date' }, { setUpdatedAt: true });
  runner.assertEqual(
    onlyUpdated?.query,
    'UPDATE events SET "updated_at" = NOW() WHERE "id" = $1',
    'buildParameterizedUpdate: single updated_at with setUpdatedAt generates pure NOW() update'
  );
  runner.assertEqual(onlyUpdated?.values, ['ev-1'], 'buildParameterizedUpdate: only id in values when only updated_at is set');

  runner.endSuite();
}
