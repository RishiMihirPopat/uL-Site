/**
 * Database Entry Point (Refactored to Bridge Pattern adhering to SOLID).
 * Re-exports domain types, database connection, repositories, and services.
 */

export * from './types/event';
export * from './types/testimonial';
export * from './types/article';
export * from './db/client';
export * from './repositories/event.repository';
export * from './repositories/settings.repository';
export * from './repositories/testimonial.repository';
export * from './repositories/article.repository';
export * from './services/event.service';
export * from './services/article.service';
export * from './services/upload.service';

import { getDatabaseConnection } from './db/client';
import { eventService } from './services/event.service';
import { articleService } from './services/article.service';
import { settingsRepository } from './repositories/settings.repository';
import { testimonialRepository } from './repositories/testimonial.repository';
import { EventRow, FormattedArchiveCard } from './types/event';
import { Testimonial } from './types/testimonial';
import { Article } from './types/article';

export const getDb = getDatabaseConnection;

export async function getAllArticles(): Promise<Article[]> {
  try {
    return await articleService.getAllArticles();
  } catch (err) {
    console.warn('[Database] Failed to get all articles:', err);
    return [];
  }
}

export async function getPublishedArticles(): Promise<Article[]> {
  try {
    return await articleService.getPublishedArticles();
  } catch (err) {
    console.warn('[Database] Failed to get published articles:', err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    return await articleService.getArticleBySlug(slug);
  } catch (err) {
    console.warn('[Database] Failed to get article by slug:', err);
    return null;
  }
}

export async function getAdjacentArticles(slug: string): Promise<{ prev: Article | null; next: Article | null }> {
  try {
    return await articleService.getAdjacentArticles(slug);
  } catch (err) {
    console.warn('[Database] Failed to get adjacent articles:', err);
    return { prev: null, next: null };
  }
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    return await testimonialRepository.getAll();
  } catch (err) {
    console.warn('[Database] Failed to get testimonials:', err);
    return [];
  }
}

export async function getActiveEvents(): Promise<EventRow[]> {
  try {
    await runAutoExpire();
    const events = await eventService.getAllEvents();
    return events.filter((e) => {
      if (e.archive_status !== 'active') return false;
      if (e.event_datetime && !Number.isNaN(Date.parse(e.event_datetime))) {
        return new Date(e.event_datetime).getTime() > Date.now();
      }
      return true;
    });
  } catch (err) {
    console.warn('[Database] Failed to get active events:', err);
    return [];
  }
}

export async function getPendingArchiveEvents(): Promise<EventRow[]> {
  try {
    const events = await eventService.getAllEvents();
    return events.filter((e) => e.archive_status === 'pending_archive');
  } catch (err) {
    console.warn('[Database] Failed to get pending archive events:', err);
    return [];
  }
}

export async function getArchivedEvents(): Promise<EventRow[]> {
  try {
    const events = await eventService.getAllEvents();
    return events.filter((e) => e.archive_status === 'archived');
  } catch (err) {
    console.warn('[Database] Failed to get archived events:', err);
    return [];
  }
}

export async function getFormattedArchivedEvents(): Promise<FormattedArchiveCard[]> {
  try {
    return await eventService.getFormattedArchiveCards();
  } catch (err) {
    console.warn('[Database] Failed to get formatted archived events:', err);
    return [];
  }
}

export async function getAllEvents(): Promise<EventRow[]> {
  try {
    await runAutoExpire();
    return await eventService.getAllEvents();
  } catch (err) {
    console.warn('[Database] Failed to get all events:', err);
    return [];
  }
}

export async function getEventById(id: string): Promise<EventRow | undefined> {
  try {
    const ev = await eventService.getEventById(id);
    return ev || undefined;
  } catch (err) {
    console.warn('[Database] Failed to get event by id:', err);
    return undefined;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  await eventService.deleteEvent(id);
}

export async function getCarouselEventIds(): Promise<string[]> {
  const settings = await settingsRepository.getSettings();
  return settings.carouselEventIds;
}

export async function setCarouselEventIds(ids: string[]): Promise<void> {
  await settingsRepository.updateSettings({ carouselEventIds: ids });
}

export async function getTickerText(): Promise<string> {
  const settings = await settingsRepository.getSettings();
  return settings.tickerText || '';
}

export async function setTickerText(text: string): Promise<void> {
  await settingsRepository.updateSettings({ tickerText: text });
}

export async function getSetting(key: string): Promise<string | undefined> {
  const settings = await settingsRepository.getSettings();
  if (key === 'auto_archive_days') return String(settings.autoArchiveDelayDays);
  if (key === 'auto_archive_action') return settings.defaultAction;
  if (key === 'carousel_event_ids') return JSON.stringify(settings.carouselEventIds);
  if (key === 'ticker_text') return settings.tickerText;
  return undefined;
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (key === 'auto_archive_days') {
    await settingsRepository.updateSettings({ autoArchiveDelayDays: parseInt(value, 10) || 7 });
  } else if (key === 'auto_archive_action') {
    await settingsRepository.updateSettings({ defaultAction: value as 'archive' | 'discard' });
  } else if (key === 'carousel_event_ids') {
    try {
      await settingsRepository.updateSettings({ carouselEventIds: JSON.parse(value) });
    } catch {}
  } else if (key === 'ticker_text') {
    await settingsRepository.updateSettings({ tickerText: value });
  }
}

export async function runAutoExpire(): Promise<{ expiredCount: number }> {
  try {
    const sql = getDatabaseConnection();
    const result = await sql`
      UPDATE events
      SET archive_status = 'hidden', updated_at = NOW()
      WHERE (archive_status = 'active' OR archive_status = 'pending_archive')
        AND event_datetime IS NOT NULL
        AND event_datetime != ''
        AND event_datetime ~ '^\d{4}-\d{2}-\d{2}'
        AND event_datetime::timestamptz <= NOW()
      RETURNING id
    `;
    return { expiredCount: Array.isArray(result) ? result.length : 0 };
  } catch (err: any) {
    console.warn('[AutoExpire] Notice:', err?.message || 'Database temporarily unreachable');
    return { expiredCount: 0 };
  }
}

export async function runAutoArchive(): Promise<{ pending: number; archived: number; expired: number }> {
  const { expiredCount } = await runAutoExpire();
  return {
    pending: 0,
    archived: 0,
    expired: expiredCount,
  };
}
