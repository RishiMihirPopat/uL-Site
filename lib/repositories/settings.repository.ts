/**
 * Settings Repository Interface & SQLite Implementation (LSP & SRP).
 */

import { getDatabaseConnection } from '../db/client';

export interface SystemSettings {
  autoArchiveDelayDays: number;
  defaultAction: 'archive' | 'discard';
  carouselEventIds: string[];
  tickerText: string;
}

export interface ISettingsRepository {
  getSettings(): SystemSettings;
  updateSettings(settings: Partial<SystemSettings>): void;
}

export class SqliteSettingsRepository implements ISettingsRepository {
  private get db() {
    return getDatabaseConnection();
  }

  getSettings(): SystemSettings {
    const daysRow = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('auto_archive_days') as { value: string } | undefined;
    const actionRow = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('auto_archive_action') as { value: string } | undefined;
    const carouselRow = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('carousel_event_ids') as { value: string } | undefined;
    const tickerRow = this.db.prepare('SELECT value FROM settings WHERE key = ?').get('ticker_text') as { value: string } | undefined;

    let carouselEventIds: string[] = [];
    try {
      if (carouselRow?.value) {
        carouselEventIds = JSON.parse(carouselRow.value);
      }
    } catch {}

    return {
      autoArchiveDelayDays: daysRow ? parseInt(daysRow.value, 10) || 7 : 7,
      defaultAction: (actionRow?.value === 'discard' ? 'discard' : 'archive'),
      carouselEventIds: Array.isArray(carouselEventIds) ? carouselEventIds : [],
      tickerText: tickerRow?.value || 'Next Gathering: Intimate Lectures in Unconventional Spaces • Limited Capacity • Book on Urbanaut • New Sessions Announced Weekly',
    };
  }

  updateSettings(settings: Partial<SystemSettings>): void {
    const stmt = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    if (settings.autoArchiveDelayDays !== undefined) {
      stmt.run('auto_archive_days', String(settings.autoArchiveDelayDays));
    }
    if (settings.defaultAction !== undefined) {
      stmt.run('auto_archive_action', settings.defaultAction);
    }
    if (settings.carouselEventIds !== undefined) {
      stmt.run('carousel_event_ids', JSON.stringify(settings.carouselEventIds));
    }
    if (settings.tickerText !== undefined) {
      stmt.run('ticker_text', settings.tickerText);
    }
  }
}

export const settingsRepository = new SqliteSettingsRepository();
