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
import { articleRepository } from './repositories/article.repository';
import { EventRow, FormattedArchiveCard } from './types/event';
import { Testimonial } from './types/testimonial';
import { Article, ArticleRow } from './types/article';

export const getDb = getDatabaseConnection;

export function getAllArticles(): Article[] {
  return articleService.getAllArticles();
}

export function getPublishedArticles(): Article[] {
  return articleService.getPublishedArticles();
}

export function getArticleBySlug(slug: string): Article | null {
  return articleService.getArticleBySlug(slug);
}

export function getAdjacentArticles(slug: string) {
  return articleService.getAdjacentArticles(slug);
}

export function getAllTestimonials(): Testimonial[] {
  return testimonialRepository.getAll();
}

export function getActiveEvents(): EventRow[] {
  return eventService.getAllEvents().filter(e => e.archive_status === 'active');
}

export function getPendingArchiveEvents(): EventRow[] {
  return eventService.getAllEvents().filter(e => e.archive_status === 'pending_archive');
}

export function getArchivedEvents(): EventRow[] {
  return eventService.getAllEvents().filter(e => e.archive_status === 'archived');
}

export function getFormattedArchivedEvents(): FormattedArchiveCard[] {
  return eventService.getFormattedArchiveCards();
}

export function getAllEvents(): EventRow[] {
  return eventService.getAllEvents();
}

export function getEventById(id: string): EventRow | undefined {
  return eventService.getEventById(id) || undefined;
}

export function getCarouselEventIds(): string[] {
  return settingsRepository.getSettings().carouselEventIds;
}

export function setCarouselEventIds(ids: string[]): void {
  settingsRepository.updateSettings({ carouselEventIds: ids });
}

export function getTickerText(): string {
  return settingsRepository.getSettings().tickerText;
}

export function setTickerText(text: string): void {
  settingsRepository.updateSettings({ tickerText: text });
}

export function getSetting(key: string): string | undefined {
  const settings = settingsRepository.getSettings();
  if (key === 'auto_archive_days') return String(settings.autoArchiveDelayDays);
  if (key === 'auto_archive_action') return settings.defaultAction;
  if (key === 'carousel_event_ids') return JSON.stringify(settings.carouselEventIds);
  if (key === 'ticker_text') return settings.tickerText;
  return undefined;
}

export function setSetting(key: string, value: string): void {
  if (key === 'auto_archive_days') {
    settingsRepository.updateSettings({ autoArchiveDelayDays: parseInt(value, 10) || 7 });
  } else if (key === 'auto_archive_action') {
    settingsRepository.updateSettings({ defaultAction: value as 'archive' | 'discard' });
  } else if (key === 'carousel_event_ids') {
    try {
      settingsRepository.updateSettings({ carouselEventIds: JSON.parse(value) });
    } catch {}
  } else if (key === 'ticker_text') {
    settingsRepository.updateSettings({ tickerText: value });
  }
}

export function runAutoArchive(): { pending: number; archived: number; discarded: number } {
  const db = getDatabaseConnection();
  const settings = settingsRepository.getSettings();

  const result = db.prepare(`
    UPDATE events
    SET archive_status = 'pending_archive', updated_at = datetime('now')
    WHERE archive_status = 'active'
      AND event_datetime IS NOT NULL
      AND datetime(event_datetime, '+' || ? || ' days') <= datetime('now')
  `).run(settings.autoArchiveDelayDays);

  return {
    pending: result.changes,
    archived: 0,
    discarded: 0,
  };
}
