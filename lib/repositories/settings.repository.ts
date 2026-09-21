/**
 * Settings Repository Interface & Neon Postgres Implementation (LSP & SRP).
 */

import { getDatabaseConnection } from '../db/client';

export interface SystemSettings {
  autoArchiveDelayDays: number;
  defaultAction: 'archive' | 'discard';
  carouselEventIds: string[];
  tickerText?: string;
}

export interface ISettingsRepository {
  getSettings(): Promise<SystemSettings>;
  updateSettings(settings: Partial<SystemSettings>): Promise<void>;
}

export class NeonSettingsRepository implements ISettingsRepository {
  private get sql() {
    return getDatabaseConnection();
  }

  async getSettings(): Promise<SystemSettings> {
    const rows = await this.sql`SELECT key, value FROM settings`;
    const settingsMap = new Map<string, string>();
    for (const r of rows) {
      settingsMap.set(r.key, r.value);
    }

    const daysVal = settingsMap.get('auto_archive_days');
    const actionVal = settingsMap.get('auto_archive_action');
    const carouselVal = settingsMap.get('carousel_event_ids');
    const tickerVal = settingsMap.get('ticker_text');

    let carouselEventIds: string[] = [];
    try {
      if (carouselVal) {
        carouselEventIds = JSON.parse(carouselVal);
      }
    } catch {}

    return {
      autoArchiveDelayDays: daysVal ? parseInt(daysVal, 10) || 7 : 7,
      defaultAction: actionVal === 'discard' ? 'discard' : 'archive',
      carouselEventIds: Array.isArray(carouselEventIds) ? carouselEventIds : [],
      tickerText: tickerVal || undefined,
    };
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    if (settings.autoArchiveDelayDays !== undefined) {
      await this.sql`
        INSERT INTO settings (key, value) VALUES ('auto_archive_days', ${String(settings.autoArchiveDelayDays)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    if (settings.defaultAction !== undefined) {
      await this.sql`
        INSERT INTO settings (key, value) VALUES ('auto_archive_action', ${settings.defaultAction})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    if (settings.carouselEventIds !== undefined) {
      await this.sql`
        INSERT INTO settings (key, value) VALUES ('carousel_event_ids', ${JSON.stringify(settings.carouselEventIds)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    if (settings.tickerText !== undefined) {
      await this.sql`
        INSERT INTO settings (key, value) VALUES ('ticker_text', ${settings.tickerText})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
  }
}

export const settingsRepository = new NeonSettingsRepository();
