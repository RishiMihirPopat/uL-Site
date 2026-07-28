import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'unlecture.db');

let _db: any = null;

export function getDb(): any {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initSchema(_db);
  return _db;
}

function initSchema(db: any) {
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
}

/* ── Typed helpers ── */

export interface EventRow {
  id: string;
  title: string;
  speaker: string;
  venue: string;
  category: string;
  date: string;
  event_datetime: string | null;
  time: string;
  price: string;
  description: string;
  image: string;
  urbanaut_url: string;
  archive_status: 'active' | 'archived' | 'hidden' | 'discarded';
  archive_image: string | null;
  archive_badge: string | null;
  archive_tags: string;
  youtube_urls: string;
  substack_urls: string;
  created_at: string;
  updated_at: string;
}

export function getActiveEvents(): EventRow[] {
  return getDb().prepare(
    `SELECT * FROM events WHERE archive_status = 'active' ORDER BY event_datetime ASC, created_at DESC`
  ).all() as EventRow[];
}

export function getArchivedEvents(): EventRow[] {
  return getDb().prepare(
    `SELECT * FROM events WHERE archive_status = 'archived' ORDER BY event_datetime DESC, created_at DESC`
  ).all() as EventRow[];
}

export function getAllEvents(): EventRow[] {
  return getDb().prepare(
    `SELECT * FROM events ORDER BY created_at DESC`
  ).all() as EventRow[];
}

export function getEventById(id: string): EventRow | undefined {
  return getDb().prepare(
    `SELECT * FROM events WHERE id = ?`
  ).get(id) as EventRow | undefined;
}

export function getSetting(key: string): string | undefined {
  const row = getDb().prepare(
    `SELECT value FROM settings WHERE key = ?`
  ).get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  getDb().prepare(
    `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`
  ).run(key, value);
}

export function runAutoArchive(): { archived: number; discarded: number } {
  const db = getDb();
  const days = parseInt(getSetting('auto_archive_days') || '7', 10);
  const action = getSetting('auto_archive_action') || 'archive';
  const targetStatus = action === 'discard' ? 'discarded' : 'archived';

  const result = db.prepare(`
    UPDATE events
    SET archive_status = ?, updated_at = datetime('now')
    WHERE archive_status = 'active'
      AND event_datetime IS NOT NULL
      AND datetime(event_datetime, '+' || ? || ' days') <= datetime('now')
  `).run(targetStatus, days);

  return {
    archived: targetStatus === 'archived' ? result.changes : 0,
    discarded: targetStatus === 'discarded' ? result.changes : 0,
  };
}
