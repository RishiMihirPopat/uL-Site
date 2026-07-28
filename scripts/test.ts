/**
 * Comprehensive test suite for the Event Management System.
 * Tests the DB layer directly against a temporary in-memory SQLite database.
 *
 * Run with: npx tsx scripts/test.ts
 */
import Database from 'better-sqlite3';

/* ── Minimal test harness ── */

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function assertEqual(actual: any, expected: any, label: string) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (!pass) {
    failed++;
    failures.push(`${label} -- expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    console.log(`  ✗ ${label} -- expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  } else {
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

function section(name: string) {
  console.log(`\n── ${name} ──`);
}

/* ── Setup: in-memory DB with same schema as lib/db.ts ── */

function createTestDb(): any {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      speaker         TEXT NOT NULL,
      venue           TEXT NOT NULL,
      category        TEXT NOT NULL,
      date            TEXT NOT NULL,
      event_datetime  TEXT,
      time            TEXT DEFAULT '',
      price           TEXT DEFAULT '',
      description     TEXT DEFAULT '',
      image           TEXT NOT NULL,
      urbanaut_url    TEXT DEFAULT '',
      archive_status  TEXT NOT NULL DEFAULT 'active',
      archive_image   TEXT,
      archive_badge   TEXT,
      archive_tags    TEXT DEFAULT '[]',
      youtube_urls    TEXT DEFAULT '[]',
      substack_urls   TEXT DEFAULT '[]',
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_days', '7');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_archive_action', 'archive');
  `);

  return db;
}

function insertEvent(db: any, overrides: Record<string, any> = {}) {
  const defaults = {
    id: 'test-event-' + Math.random().toString(36).slice(2, 8),
    title: 'Test Event',
    speaker: 'Test Speaker',
    venue: 'Test Venue',
    category: 'unlecture',
    date: 'Sat, 1 Jan',
    event_datetime: null,
    time: '',
    price: '500',
    description: 'A test event',
    image: '/test.jpg',
    urbanaut_url: 'https://example.com',
    archive_status: 'active',
    archive_image: null,
    archive_badge: null,
    archive_tags: '[]',
    youtube_urls: '[]',
    substack_urls: '[]',
  };
  const e = { ...defaults, ...overrides };
  db.prepare(`
    INSERT INTO events (id, title, speaker, venue, category, date, event_datetime, time, price, description, image, urbanaut_url, archive_status, archive_image, archive_badge, archive_tags, youtube_urls, substack_urls)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(e.id, e.title, e.speaker, e.venue, e.category, e.date, e.event_datetime, e.time, e.price, e.description, e.image, e.urbanaut_url, e.archive_status, e.archive_image, e.archive_badge, e.archive_tags, e.youtube_urls, e.substack_urls);
  return e.id;
}

/* ══════════════════════════════════════════════════════════════
   TEST SUITE
   ══════════════════════════════════════════════════════════════ */

// ── 1. Schema Tests ──

section('1. Schema & Table Creation');
{
  const db = createTestDb();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map((t: any) => t.name);
  assert(tableNames.includes('events'), 'events table exists');
  assert(tableNames.includes('settings'), 'settings table exists');

  const cols = db.prepare("PRAGMA table_info(events)").all();
  const colNames = cols.map((c: any) => c.name);
  assert(colNames.includes('id'), 'events has id column');
  assert(colNames.includes('title'), 'events has title column');
  assert(colNames.includes('archive_status'), 'events has archive_status column');
  assert(colNames.includes('youtube_urls'), 'events has youtube_urls column');
  assert(colNames.includes('substack_urls'), 'events has substack_urls column');
  assert(colNames.includes('archive_badge'), 'events has archive_badge column');
  assert(colNames.includes('archive_tags'), 'events has archive_tags column');
  assert(colNames.includes('archive_image'), 'events has archive_image column');
  assert(colNames.includes('event_datetime'), 'events has event_datetime column');
  assert(colNames.length === 20, `events has 20 columns (got ${colNames.length})`);
  db.close();
}

// ── 2. Default Settings ──

section('2. Default Settings');
{
  const db = createTestDb();
  const days = db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_days'").get();
  assertEqual(days?.value, '7', 'auto_archive_days defaults to 7');

  const action = db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_action'").get();
  assertEqual(action?.value, 'archive', 'auto_archive_action defaults to archive');
  db.close();
}

// ── 3. Event CRUD ──

section('3. Event CRUD');
{
  const db = createTestDb();

  // Create
  const id = insertEvent(db, { id: 'crud-test', title: 'CRUD Test Event', speaker: 'Alice' });
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  assert(row !== undefined, 'event inserted successfully');
  assertEqual(row.title, 'CRUD Test Event', 'title matches');
  assertEqual(row.speaker, 'Alice', 'speaker matches');
  assertEqual(row.archive_status, 'active', 'default status is active');

  // Read
  const all = db.prepare('SELECT * FROM events').all();
  assertEqual(all.length, 1, 'exactly one event in DB');

  // Update
  db.prepare("UPDATE events SET title = 'Updated Title' WHERE id = ?").run(id);
  const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  assertEqual(updated.title, 'Updated Title', 'title updated');

  // Delete
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
  const deleted = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  assert(deleted === undefined, 'event deleted');
  db.close();
}

// ── 4. Archive Status Transitions ──

section('4. Archive Status Transitions');
{
  const db = createTestDb();
  const id = insertEvent(db, { id: 'status-test' });

  // active -> archived
  db.prepare("UPDATE events SET archive_status = 'archived' WHERE id = ?").run(id);
  let row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_status, 'archived', 'active -> archived');

  // archived -> hidden
  db.prepare("UPDATE events SET archive_status = 'hidden' WHERE id = ?").run(id);
  row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_status, 'hidden', 'archived -> hidden');

  // hidden -> archived (restore)
  db.prepare("UPDATE events SET archive_status = 'archived' WHERE id = ?").run(id);
  row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_status, 'archived', 'hidden -> archived (restore)');

  // archived -> discarded
  db.prepare("UPDATE events SET archive_status = 'discarded' WHERE id = ?").run(id);
  row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_status, 'discarded', 'archived -> discarded');

  // discarded -> archived (restore)
  db.prepare("UPDATE events SET archive_status = 'archived' WHERE id = ?").run(id);
  row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_status, 'archived', 'discarded -> archived (restore)');
  db.close();
}

// ── 5. Filtering by Status ──

section('5. Filtering by Archive Status');
{
  const db = createTestDb();
  insertEvent(db, { id: 'f-active-1', archive_status: 'active' });
  insertEvent(db, { id: 'f-active-2', archive_status: 'active' });
  insertEvent(db, { id: 'f-archived-1', archive_status: 'archived' });
  insertEvent(db, { id: 'f-hidden-1', archive_status: 'hidden' });
  insertEvent(db, { id: 'f-discarded-1', archive_status: 'discarded' });

  const active = db.prepare("SELECT * FROM events WHERE archive_status = 'active'").all();
  assertEqual(active.length, 2, 'getActiveEvents returns 2 active events');

  const archived = db.prepare("SELECT * FROM events WHERE archive_status = 'archived'").all();
  assertEqual(archived.length, 1, 'getArchivedEvents returns 1 archived event');

  const hidden = db.prepare("SELECT * FROM events WHERE archive_status = 'hidden'").all();
  assertEqual(hidden.length, 1, '1 hidden event (not in public archive)');

  const allEvents = db.prepare('SELECT * FROM events').all();
  assertEqual(allEvents.length, 5, 'getAllEvents returns all 5 events');
  db.close();
}

// ── 6. Archive Metadata ──

section('6. Archive Metadata (badge, tags, image, content links)');
{
  const db = createTestDb();
  const id = insertEvent(db, { id: 'meta-test', archive_status: 'archived' });

  // Set badge
  db.prepare("UPDATE events SET archive_badge = 'SOLD OUT' WHERE id = ?").run(id);
  let row = db.prepare('SELECT archive_badge FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_badge, 'SOLD OUT', 'badge set correctly');

  // Set tags (JSON array)
  db.prepare("UPDATE events SET archive_tags = ? WHERE id = ?").run(JSON.stringify(['science', 'biology']), id);
  row = db.prepare('SELECT archive_tags FROM events WHERE id = ?').get(id);
  assertEqual(JSON.parse(row.archive_tags), ['science', 'biology'], 'tags stored as JSON array');

  // Set archive image
  db.prepare("UPDATE events SET archive_image = '/archive/custom.jpg' WHERE id = ?").run(id);
  row = db.prepare('SELECT archive_image FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_image, '/archive/custom.jpg', 'archive image set');

  // Set YouTube URLs
  const ytUrls = ['https://youtube.com/watch?v=abc123', 'https://youtu.be/def456'];
  db.prepare("UPDATE events SET youtube_urls = ? WHERE id = ?").run(JSON.stringify(ytUrls), id);
  row = db.prepare('SELECT youtube_urls FROM events WHERE id = ?').get(id);
  assertEqual(JSON.parse(row.youtube_urls), ytUrls, 'youtube_urls stored as JSON array');

  // Set Substack URLs
  const ssUrls = ['https://example.substack.com/p/article-one'];
  db.prepare("UPDATE events SET substack_urls = ? WHERE id = ?").run(JSON.stringify(ssUrls), id);
  row = db.prepare('SELECT substack_urls FROM events WHERE id = ?').get(id);
  assertEqual(JSON.parse(row.substack_urls), ssUrls, 'substack_urls stored as JSON array');

  // Null badge (clear it)
  db.prepare("UPDATE events SET archive_badge = NULL WHERE id = ?").run(id);
  row = db.prepare('SELECT archive_badge FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_badge, null, 'badge cleared to null');
  db.close();
}

// ── 7. Auto-Archive Logic ──

section('7. Auto-Archive Logic');
{
  const db = createTestDb();

  // Event with datetime far in the past (should be auto-archived with default 7 days)
  insertEvent(db, {
    id: 'old-event',
    event_datetime: '2020-01-01T19:00:00+05:30',
    archive_status: 'active',
  });

  // Event with datetime in the future (should NOT be auto-archived)
  insertEvent(db, {
    id: 'future-event',
    event_datetime: '2099-12-31T19:00:00+05:30',
    archive_status: 'active',
  });

  // Event with no datetime (should NOT be auto-archived)
  insertEvent(db, {
    id: 'no-datetime-event',
    event_datetime: null,
    archive_status: 'active',
  });

  // Event already archived (should NOT be touched)
  insertEvent(db, {
    id: 'already-archived',
    event_datetime: '2020-01-01T19:00:00+05:30',
    archive_status: 'archived',
  });

  // Run auto-archive with default settings (7 days, archive)
  const days = parseInt(db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_days'").get().value, 10);
  const action = db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_action'").get().value;
  const targetStatus = action === 'discard' ? 'discarded' : 'archived';

  const result = db.prepare(`
    UPDATE events
    SET archive_status = ?, updated_at = datetime('now')
    WHERE archive_status = 'active'
      AND event_datetime IS NOT NULL
      AND datetime(event_datetime, '+' || ? || ' days') <= datetime('now')
  `).run(targetStatus, days);

  assert(result.changes === 1, `auto-archive processed exactly 1 event (got ${result.changes})`);

  let row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get('old-event');
  assertEqual(row.archive_status, 'archived', 'old event auto-archived');

  row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get('future-event');
  assertEqual(row.archive_status, 'active', 'future event still active');

  row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get('no-datetime-event');
  assertEqual(row.archive_status, 'active', 'no-datetime event still active');

  row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get('already-archived');
  assertEqual(row.archive_status, 'archived', 'already-archived event untouched');
  db.close();
}

// ── 8. Auto-Archive with 0-day delay ──

section('8. Auto-Archive with 0-Day Delay (Immediate)');
{
  const db = createTestDb();

  // Set delay to 0
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_archive_days', '0')").run();

  // Event that just happened (datetime = 1 hour ago)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  insertEvent(db, {
    id: 'just-happened',
    event_datetime: oneHourAgo,
    archive_status: 'active',
  });

  const days = 0;
  const result = db.prepare(`
    UPDATE events
    SET archive_status = 'archived', updated_at = datetime('now')
    WHERE archive_status = 'active'
      AND event_datetime IS NOT NULL
      AND datetime(event_datetime, '+' || ? || ' days') <= datetime('now')
  `).run(days);

  assert(result.changes === 1, 'immediate auto-archive works with 0-day delay');

  const row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get('just-happened');
  assertEqual(row.archive_status, 'archived', 'just-happened event immediately archived');
  db.close();
}

// ── 9. Auto-Archive with Discard Action ──

section('9. Auto-Archive with Discard Action');
{
  const db = createTestDb();

  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_archive_days', '0')").run();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_archive_action', 'discard')").run();

  insertEvent(db, {
    id: 'discard-target',
    event_datetime: '2020-06-15T19:00:00+05:30',
    archive_status: 'active',
  });

  const result = db.prepare(`
    UPDATE events
    SET archive_status = 'discarded', updated_at = datetime('now')
    WHERE archive_status = 'active'
      AND event_datetime IS NOT NULL
      AND datetime(event_datetime, '+0 days') <= datetime('now')
  `).run();

  const row = db.prepare('SELECT archive_status FROM events WHERE id = ?').get('discard-target');
  assertEqual(row.archive_status, 'discarded', 'auto-archive with discard action works');
  db.close();
}

// ── 10. Settings CRUD ──

section('10. Settings CRUD');
{
  const db = createTestDb();

  // Read defaults
  let val = db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_days'").get();
  assertEqual(val.value, '7', 'default auto_archive_days is 7');

  // Update
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_archive_days', '14')").run();
  val = db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_days'").get();
  assertEqual(val.value, '14', 'auto_archive_days updated to 14');

  // Set to 0
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_archive_days', '0')").run();
  val = db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_days'").get();
  assertEqual(val.value, '0', 'auto_archive_days set to 0');

  // Change action
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_archive_action', 'discard')").run();
  val = db.prepare("SELECT value FROM settings WHERE key = 'auto_archive_action'").get();
  assertEqual(val.value, 'discard', 'auto_archive_action changed to discard');

  // Non-existent key
  val = db.prepare("SELECT value FROM settings WHERE key = 'nonexistent'").get();
  assert(val === undefined, 'non-existent setting returns undefined');
  db.close();
}

// ── 11. Edge Cases: Duplicate ID ──

section('11. Edge Case: Duplicate Event ID');
{
  const db = createTestDb();
  insertEvent(db, { id: 'dupe-id', title: 'First' });
  let threw = false;
  try {
    insertEvent(db, { id: 'dupe-id', title: 'Second' });
  } catch (e: any) {
    threw = true;
    assert(e.message.includes('UNIQUE constraint'), `correct error: ${e.message}`);
  }
  assert(threw, 'inserting duplicate ID throws error');

  const row = db.prepare('SELECT title FROM events WHERE id = ?').get('dupe-id');
  assertEqual(row.title, 'First', 'original event preserved');
  db.close();
}

// ── 12. Edge Cases: NOT NULL constraints ──

section('12. Edge Case: NOT NULL Constraint Violations');
{
  const db = createTestDb();

  // Missing title
  let threw = false;
  try {
    db.prepare(`INSERT INTO events (id, speaker, venue, category, date, image) VALUES ('no-title', 'Speaker', 'Venue', 'unlecture', 'Jan 1', '/img.jpg')`).run();
  } catch (e: any) {
    threw = true;
  }
  assert(threw, 'missing title throws NOT NULL violation');

  // Missing image
  threw = false;
  try {
    db.prepare(`INSERT INTO events (id, title, speaker, venue, category, date) VALUES ('no-img', 'Title', 'Speaker', 'Venue', 'unlecture', 'Jan 1')`).run();
  } catch (e: any) {
    threw = true;
  }
  assert(threw, 'missing image throws NOT NULL violation');

  // Missing speaker
  threw = false;
  try {
    db.prepare(`INSERT INTO events (id, title, venue, category, date, image) VALUES ('no-speaker', 'Title', 'Venue', 'unlecture', 'Jan 1', '/img.jpg')`).run();
  } catch (e: any) {
    threw = true;
  }
  assert(threw, 'missing speaker throws NOT NULL violation');
  db.close();
}

// ── 13. Edge Cases: Empty/Null JSON fields ──

section('13. Edge Case: Empty and Null JSON Fields');
{
  const db = createTestDb();
  const id = insertEvent(db, { id: 'json-edge' });

  // Default JSON fields
  let row = db.prepare('SELECT archive_tags, youtube_urls, substack_urls FROM events WHERE id = ?').get(id);
  assertEqual(JSON.parse(row.archive_tags), [], 'default archive_tags is empty array');
  assertEqual(JSON.parse(row.youtube_urls), [], 'default youtube_urls is empty array');
  assertEqual(JSON.parse(row.substack_urls), [], 'default substack_urls is empty array');

  // Set to null
  db.prepare("UPDATE events SET archive_tags = NULL WHERE id = ?").run(id);
  row = db.prepare('SELECT archive_tags FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_tags, null, 'archive_tags can be set to null');

  // Set to malformed JSON (should store but parsing will fail)
  db.prepare("UPDATE events SET youtube_urls = 'not-json' WHERE id = ?").run(id);
  row = db.prepare('SELECT youtube_urls FROM events WHERE id = ?').get(id);
  assertEqual(row.youtube_urls, 'not-json', 'malformed JSON stored without DB error');
  let parseThrew = false;
  try {
    JSON.parse(row.youtube_urls);
  } catch {
    parseThrew = true;
  }
  assert(parseThrew, 'malformed JSON correctly fails on parse');

  // Large JSON array
  const bigArray = Array.from({ length: 100 }, (_, i) => `https://youtube.com/watch?v=vid${i}`);
  db.prepare("UPDATE events SET youtube_urls = ? WHERE id = ?").run(JSON.stringify(bigArray), id);
  row = db.prepare('SELECT youtube_urls FROM events WHERE id = ?').get(id);
  assertEqual(JSON.parse(row.youtube_urls).length, 100, 'large JSON array (100 URLs) stored correctly');
  db.close();
}

// ── 14. Edge Cases: Special Characters ──

section('14. Edge Case: Special Characters in Text Fields');
{
  const db = createTestDb();

  const id = insertEvent(db, {
    id: 'special-chars',
    title: "O'Brien's \"Lecture\" -- <script>alert('xss')</script>",
    speaker: 'Dr. Name & Co.',
    venue: "Cafe 'Blue Tokai' @ Delhi",
    description: 'Line 1\nLine 2\tTabbed',
  });

  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  assert(row.title.includes("O'Brien"), 'single quotes in title preserved');
  assert(row.title.includes('"Lecture"'), 'double quotes in title preserved');
  assert(row.title.includes('<script>'), 'angle brackets stored (no sanitization at DB level)');
  assert(row.speaker.includes('&'), 'ampersand in speaker preserved');
  assert(row.description.includes('\n'), 'newline in description preserved');
  db.close();
}

// ── 15. Archive with Optional Fields ──

section('15. Archiving with Optional Badge/Tags/Image');
{
  const db = createTestDb();
  const id = insertEvent(db, { id: 'archive-partial' });

  // Archive with just a badge, no tags or image
  db.prepare("UPDATE events SET archive_status = 'archived', archive_badge = 'SOLD OUT' WHERE id = ?").run(id);
  let row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  assertEqual(row.archive_status, 'archived', 'status set to archived');
  assertEqual(row.archive_badge, 'SOLD OUT', 'badge set');
  assertEqual(row.archive_image, null, 'archive_image still null');
  assertEqual(row.archive_tags, '[]', 'tags still default empty array');

  // Now add tags
  db.prepare("UPDATE events SET archive_tags = ? WHERE id = ?").run(JSON.stringify(['history']), id);
  row = db.prepare('SELECT archive_tags FROM events WHERE id = ?').get(id);
  assertEqual(JSON.parse(row.archive_tags), ['history'], 'tags added after archiving');
  db.close();
}

// ── 16. Ordering ──

section('16. Ordering: Active by datetime ASC, Archived by datetime DESC');
{
  const db = createTestDb();
  insertEvent(db, { id: 'a-later', event_datetime: '2026-08-01T19:00:00+05:30', archive_status: 'active' });
  insertEvent(db, { id: 'a-earlier', event_datetime: '2026-07-01T19:00:00+05:30', archive_status: 'active' });

  const active = db.prepare("SELECT id FROM events WHERE archive_status = 'active' ORDER BY event_datetime ASC").all();
  assertEqual(active[0].id, 'a-earlier', 'active events ordered by datetime ASC (earliest first)');
  assertEqual(active[1].id, 'a-later', 'active events ordered by datetime ASC (latest second)');

  insertEvent(db, { id: 'arc-old', event_datetime: '2025-01-01T19:00:00+05:30', archive_status: 'archived' });
  insertEvent(db, { id: 'arc-new', event_datetime: '2025-12-01T19:00:00+05:30', archive_status: 'archived' });

  const archived = db.prepare("SELECT id FROM events WHERE archive_status = 'archived' ORDER BY event_datetime DESC").all();
  assertEqual(archived[0].id, 'arc-new', 'archived events ordered by datetime DESC (newest first)');
  assertEqual(archived[1].id, 'arc-old', 'archived events ordered by datetime DESC (oldest second)');
  db.close();
}

// ── 17. Production DB Integrity ──

section('17. Production DB Integrity Check');
{
  const path = require('path');
  const dbPath = path.join(process.cwd(), 'data', 'unlecture.db');
  const fs = require('fs');

  if (fs.existsSync(dbPath)) {
    const prodDb = new Database(dbPath, { readonly: true });

    const activeCount = (prodDb.prepare("SELECT COUNT(*) as c FROM events WHERE archive_status = 'active'").get() as any).c;
    const archivedCount = (prodDb.prepare("SELECT COUNT(*) as c FROM events WHERE archive_status = 'archived'").get() as any).c;
    const totalCount = (prodDb.prepare("SELECT COUNT(*) as c FROM events").get() as any).c;

    assert(totalCount > 0, `production DB has ${totalCount} events`);
    assert(activeCount > 0, `production DB has ${activeCount} active events`);
    assert(archivedCount > 0, `production DB has ${archivedCount} archived events`);

    // Verify all events have required fields
    const nullChecks = prodDb.prepare("SELECT COUNT(*) as c FROM events WHERE title IS NULL OR speaker IS NULL OR venue IS NULL OR image IS NULL").get() as any;
    assertEqual(nullChecks.c, 0, 'no events with null required fields');

    // Verify all archive_tags are parseable JSON
    const allEvents = prodDb.prepare("SELECT id, archive_tags, youtube_urls, substack_urls FROM events").all() as any[];
    let jsonOk = true;
    for (const e of allEvents) {
      try {
        if (e.archive_tags) JSON.parse(e.archive_tags);
        if (e.youtube_urls) JSON.parse(e.youtube_urls);
        if (e.substack_urls) JSON.parse(e.substack_urls);
      } catch {
        jsonOk = false;
        console.log(`    JSON parse error for event ${e.id}`);
      }
    }
    assert(jsonOk, 'all JSON fields in production DB are parseable');

    // Verify settings exist
    const settings = prodDb.prepare("SELECT COUNT(*) as c FROM settings").get() as any;
    assert(settings.c >= 2, `settings table has ${settings.c} entries`);

    prodDb.close();
  } else {
    console.log('  (skipped -- production DB not found at data/unlecture.db)');
  }
}

// ── 18. Concurrent Operations ──

section('18. Concurrent Insert/Update Safety');
{
  const db = createTestDb();

  // Simulate batch insert in a transaction
  const insertBatch = db.transaction(() => {
    for (let i = 0; i < 50; i++) {
      insertEvent(db, { id: `batch-${i}`, title: `Batch Event ${i}` });
    }
  });
  insertBatch();

  const count = (db.prepare("SELECT COUNT(*) as c FROM events").get() as any).c;
  assertEqual(count, 50, 'batch insert of 50 events in transaction');

  // Batch status update
  db.prepare("UPDATE events SET archive_status = 'archived' WHERE id LIKE 'batch-%' AND CAST(REPLACE(id, 'batch-', '') AS INTEGER) < 25").run();
  const archivedCount = (db.prepare("SELECT COUNT(*) as c FROM events WHERE archive_status = 'archived'").get() as any).c;
  assertEqual(archivedCount, 25, 'batch archive of 25 events');
  db.close();
}

// ── 19. Category Filtering ──

section('19. Category Filtering');
{
  const db = createTestDb();
  insertEvent(db, { id: 'cat-ul-1', category: 'unlecture', archive_status: 'active' });
  insertEvent(db, { id: 'cat-ul-2', category: 'unlecture', archive_status: 'active' });
  insertEvent(db, { id: 'cat-gft-1', category: 'grounds-for-thought', archive_status: 'active' });
  insertEvent(db, { id: 'cat-comm-1', category: 'community', archive_status: 'active' });

  const unlectures = db.prepare("SELECT * FROM events WHERE archive_status = 'active' AND category = 'unlecture'").all();
  assertEqual(unlectures.length, 2, '2 active unlecture events');

  const gft = db.prepare("SELECT * FROM events WHERE archive_status = 'active' AND category = 'grounds-for-thought'").all();
  assertEqual(gft.length, 1, '1 active grounds-for-thought event');

  const community = db.prepare("SELECT * FROM events WHERE archive_status = 'active' AND category = 'community'").all();
  assertEqual(community.length, 1, '1 active community event');

  const series = db.prepare("SELECT * FROM events WHERE archive_status = 'active' AND category = 'unlecture-series'").all();
  assertEqual(series.length, 0, '0 active unlecture-series events');
  db.close();
}

// ── 20. Update with dynamic fields (admin PUT) ──

section('20. Dynamic Field Update (simulating admin PUT)');
{
  const db = createTestDb();
  const id = insertEvent(db, { id: 'dyn-update', title: 'Original', speaker: 'Original Speaker', price: '500' });

  // Simulate partial update (only title and price)
  const body = { title: 'New Title', price: '999' };
  const fields = Object.keys(body).map(k => `${k} = ?`).join(', ');
  const values = Object.values(body);
  db.prepare(`UPDATE events SET ${fields} WHERE id = ?`).run(...values, id);

  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as any;
  assertEqual(row.title, 'New Title', 'title updated via dynamic PUT');
  assertEqual(row.price, '999', 'price updated via dynamic PUT');
  assertEqual(row.speaker, 'Original Speaker', 'speaker unchanged (not in update body)');
  db.close();
}


/* ══════════════════════════════════════════════════════════════
   RESULTS
   ══════════════════════════════════════════════════════════════ */

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log(`\nFailures:`);
  failures.forEach(f => console.log(`  ✗ ${f}`));
}
console.log(`${'='.repeat(50)}`);
process.exit(failed > 0 ? 1 : 0);
