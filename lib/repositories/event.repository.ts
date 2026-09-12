/**
 * Event Repository Interface & SQLite Implementation (LSP & SRP).
 * Implements data access layer isolated from business logic and controllers.
 */

import { getDatabaseConnection } from '../db/client';
import { EventRow, EventArchiveStatus } from '../types/event';

export interface IEventRepository {
  getAll(): EventRow[];
  getById(id: string): EventRow | null;
  getByStatus(status: EventArchiveStatus): EventRow[];
  getActive(): EventRow[];
  getPendingArchive(): EventRow[];
  getArchived(): EventRow[];
  create(event: Partial<EventRow>): void;
  update(id: string, updates: Partial<EventRow>): void;
  updateStatus(id: string, status: EventArchiveStatus): void;
  delete(id: string): void;
}

export class SqliteEventRepository implements IEventRepository {
  private get db() {
    return getDatabaseConnection();
  }

  getAll(): EventRow[] {
    return this.db.prepare(
      `SELECT * FROM events ORDER BY event_datetime DESC, created_at DESC`
    ).all() as EventRow[];
  }

  getById(id: string): EventRow | null {
    return (this.db.prepare(
      `SELECT * FROM events WHERE id = ?`
    ).get(id) as EventRow) || null;
  }

  getByStatus(status: EventArchiveStatus): EventRow[] {
    return this.db.prepare(
      `SELECT * FROM events WHERE archive_status = ? ORDER BY event_datetime DESC, created_at DESC`
    ).all(status) as EventRow[];
  }

  getActive(): EventRow[] {
    return this.db.prepare(
      `SELECT * FROM events WHERE archive_status = 'active' ORDER BY event_datetime ASC, created_at DESC`
    ).all() as EventRow[];
  }

  getPendingArchive(): EventRow[] {
    return this.db.prepare(
      `SELECT * FROM events WHERE archive_status = 'pending_archive' ORDER BY event_datetime DESC, created_at DESC`
    ).all() as EventRow[];
  }

  getArchived(): EventRow[] {
    return this.db.prepare(
      `SELECT * FROM events WHERE archive_status = 'archived' ORDER BY event_datetime DESC, created_at DESC`
    ).all() as EventRow[];
  }

  create(event: Partial<EventRow>): void {
    const stmt = this.db.prepare(`
      INSERT INTO events (
        id, title, speaker, venue, category, date, event_datetime, time, price, description, image, urbanaut_url, archive_status, archive_image, archive_badge, archive_tags, youtube_urls, substack_urls
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      event.id,
      event.title,
      event.speaker,
      event.venue,
      event.category,
      event.date,
      event.event_datetime || null,
      event.time || '',
      event.price || '',
      event.description || '',
      event.image,
      event.urbanaut_url || '',
      event.archive_status || 'active',
      event.archive_image || null,
      event.archive_badge || null,
      event.archive_tags || '[]',
      event.youtube_urls || '[]',
      event.substack_urls || '[]'
    );
  }

  update(id: string, updates: Partial<EventRow>): void {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(
      `UPDATE events SET ${fields}, updated_at = datetime('now') WHERE id = ?`
    );
    stmt.run(...values, id);
  }

  updateStatus(id: string, status: EventArchiveStatus): void {
    const stmt = this.db.prepare(
      `UPDATE events SET archive_status = ?, updated_at = datetime('now') WHERE id = ?`
    );
    stmt.run(status, id);
  }

  delete(id: string): void {
    const stmt = this.db.prepare(`DELETE FROM events WHERE id = ?`);
    stmt.run(id);
  }
}

export const eventRepository = new SqliteEventRepository();
