/**
 * Event Repository Interface & Neon Postgres Implementation (LSP & SRP).
 * Implements data access layer isolated from business logic and controllers.
 */

import { getDatabaseConnection } from '../db/client';
import { buildParameterizedUpdate } from '../db/sql-utils';
import { EventRow, EventArchiveStatus } from '../types/event';

export interface IEventRepository {
  getAll(): Promise<EventRow[]>;
  getById(id: string): Promise<EventRow | null>;
  getByStatus(status: EventArchiveStatus): Promise<EventRow[]>;
  getActive(): Promise<EventRow[]>;
  getPendingArchive(): Promise<EventRow[]>;
  getArchived(): Promise<EventRow[]>;
  create(event: Partial<EventRow>): Promise<void>;
  update(id: string, updates: Partial<EventRow>): Promise<void>;
  updateStatus(id: string, status: EventArchiveStatus): Promise<void>;
  delete(id: string): Promise<void>;
}

export class NeonEventRepository implements IEventRepository {
  private get sql() {
    return getDatabaseConnection();
  }

  async getAll(): Promise<EventRow[]> {
    const rows = await this.sql`
      SELECT * FROM events ORDER BY event_datetime DESC NULLS LAST, created_at DESC
    `;
    return rows as EventRow[];
  }

  async getById(id: string): Promise<EventRow | null> {
    const rows = await this.sql`
      SELECT * FROM events WHERE id = ${id} LIMIT 1
    `;
    return (rows[0] as EventRow) || null;
  }

  async getByStatus(status: EventArchiveStatus): Promise<EventRow[]> {
    const rows = await this.sql`
      SELECT * FROM events WHERE archive_status = ${status} ORDER BY event_datetime DESC NULLS LAST, created_at DESC
    `;
    return rows as EventRow[];
  }

  async getActive(): Promise<EventRow[]> {
    const rows = await this.sql`
      SELECT * FROM events WHERE archive_status = 'active' ORDER BY event_datetime ASC NULLS LAST, created_at DESC
    `;
    return rows as EventRow[];
  }

  async getPendingArchive(): Promise<EventRow[]> {
    const rows = await this.sql`
      SELECT * FROM events WHERE archive_status = 'pending_archive' ORDER BY event_datetime DESC NULLS LAST, created_at DESC
    `;
    return rows as EventRow[];
  }

  async getArchived(): Promise<EventRow[]> {
    const rows = await this.sql`
      SELECT * FROM events WHERE archive_status = 'archived' ORDER BY event_datetime DESC NULLS LAST, created_at DESC
    `;
    return rows as EventRow[];
  }

  async create(event: Partial<EventRow>): Promise<void> {
    await this.sql`
      INSERT INTO events (
        id, title, speaker, venue, venue_map_url, category, date, event_datetime, time, price, description,
        image, urbanaut_url, archive_status, archive_image, archive_badge, archive_tags,
        youtube_urls, substack_urls, created_at, updated_at
      ) VALUES (
        ${event.id}, ${event.title}, ${event.speaker}, ${event.venue}, ${event.venue_map_url || ''}, ${event.category}, ${event.date},
        ${event.event_datetime || null}, ${event.time || ''}, ${event.price || ''}, ${event.description || ''},
        ${event.image}, ${event.urbanaut_url || ''}, ${event.archive_status || 'active'},
        ${event.archive_image || null}, ${event.archive_badge || null}, ${event.archive_tags || '[]'},
        ${event.youtube_urls || '[]'}, ${event.substack_urls || '[]'}, NOW(), NOW()
      )
    `;
  }

  async update(id: string, updates: Partial<EventRow>): Promise<void> {
    const queryData = buildParameterizedUpdate('events', id, updates as Record<string, unknown>, { setUpdatedAt: true });
    if (!queryData) return;

    await this.sql.query(queryData.query, queryData.values as any[]);
  }

  async updateStatus(id: string, status: EventArchiveStatus): Promise<void> {
    await this.sql`
      UPDATE events SET archive_status = ${status}, updated_at = NOW() WHERE id = ${id}
    `;
  }

  async delete(id: string): Promise<void> {
    await this.sql`DELETE FROM events WHERE id = ${id}`;
  }
}

export const eventRepository = new NeonEventRepository();
