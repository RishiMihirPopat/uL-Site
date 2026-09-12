/**
 * Event Domain Service (SRP & DIP).
 * Handles business logic, data transformation, validation, and lifecycle coordination.
 */

import { IEventRepository, eventRepository } from '../repositories/event.repository';
import { EventRow, Event, FormattedArchiveCard, EventArchiveStatus, EventCategory } from '../types/event';
import { normalizeTags, validateEventLinks } from '../validators';
import { canPerformTransition, LIFECYCLE_TRANSITIONS } from '../domain/lifecycle';
import { AdminRole } from '../auth';

export class EventService {
  constructor(private readonly repo: IEventRepository = eventRepository) {}

  public slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  public getAllEvents(): EventRow[] {
    return this.repo.getAll();
  }

  public getEventById(id: string): EventRow | null {
    return this.repo.getById(id);
  }

  public getActiveDisplayEvents(): Event[] {
    const activeRows = this.repo.getActive();
    return activeRows.map(e => ({
      id: e.id,
      category: e.category as EventCategory,
      title: e.title,
      speaker: e.speaker,
      venue: e.venue,
      date: e.date,
      time: e.time,
      price: e.price,
      description: e.description,
      image: e.image,
      urbanautUrl: e.urbanaut_url,
      badge: e.archive_badge || undefined,
    }));
  }

  public getFormattedArchiveCards(): FormattedArchiveCard[] {
    const archivedRows = this.repo.getArchived();
    return archivedRows.map(event => {
      const tags = normalizeTags(event.archive_tags);

      let youtubeUrls: string[] = [];
      try {
        youtubeUrls = typeof event.youtube_urls === 'string' ? JSON.parse(event.youtube_urls) : (event.youtube_urls || []);
      } catch {
        youtubeUrls = [];
      }

      let substackUrls: string[] = [];
      try {
        substackUrls = typeof event.substack_urls === 'string' ? JSON.parse(event.substack_urls) : (event.substack_urls || []);
      } catch {
        substackUrls = [];
      }

      return {
        id: event.id,
        date: event.date,
        title: event.title,
        venue: event.venue,
        speaker: event.speaker,
        description: event.description,
        image: event.archive_image || event.image,
        tags,
        specialBadge: event.archive_badge || undefined,
        category: event.category,
        urbanautUrl: event.urbanaut_url,
        youtubeUrls: Array.isArray(youtubeUrls) ? youtubeUrls : [],
        substackUrls: Array.isArray(substackUrls) ? substackUrls : [],
      };
    });
  }

  public createEvent(data: Partial<EventRow>): { success: boolean; id?: string; error?: string; errors?: Record<string, string> } {
    const validation = validateEventLinks(data);
    if (!validation.valid) {
      return {
        success: false,
        error: Object.values(validation.errors).join(' '),
        errors: validation.errors,
      };
    }

    const id = data.id || this.slugify(data.title || 'untitled-event');
    const tagsArray = normalizeTags(data.archive_tags);

    const newEvent: Partial<EventRow> = {
      ...data,
      id,
      archive_status: data.archive_status || 'active',
      archive_tags: JSON.stringify(tagsArray),
      youtube_urls: data.youtube_urls ? (typeof data.youtube_urls === 'string' ? data.youtube_urls : JSON.stringify(data.youtube_urls)) : '[]',
      substack_urls: data.substack_urls ? (typeof data.substack_urls === 'string' ? data.substack_urls : JSON.stringify(data.substack_urls)) : '[]',
    };

    this.repo.create(newEvent);
    return { success: true, id };
  }

  public updateEvent(id: string, data: Partial<EventRow>): { success: boolean; error?: string; errors?: Record<string, string> } {
    const validation = validateEventLinks(data);
    if (!validation.valid) {
      return {
        success: false,
        error: Object.values(validation.errors).join(' '),
        errors: validation.errors,
      };
    }

    const updates = { ...data };
    if (updates.archive_tags !== undefined) {
      updates.archive_tags = JSON.stringify(normalizeTags(updates.archive_tags));
    }
    if (updates.youtube_urls !== undefined && typeof updates.youtube_urls !== 'string') {
      updates.youtube_urls = JSON.stringify(updates.youtube_urls);
    }
    if (updates.substack_urls !== undefined && typeof updates.substack_urls !== 'string') {
      updates.substack_urls = JSON.stringify(updates.substack_urls);
    }

    this.repo.update(id, updates);
    return { success: true };
  }

  public transitionStatus(
    id: string,
    action: string,
    userRole: AdminRole | null
  ): { success: boolean; error?: string; status?: number } {
    const check = canPerformTransition(action, userRole);
    if (!check.allowed) {
      return { success: false, error: check.reason, status: 403 };
    }

    const transition = LIFECYCLE_TRANSITIONS[action];
    this.repo.updateStatus(id, transition.to);
    return { success: true };
  }

  public publishToArchive(
    id: string,
    archiveMetadata: {
      archive_badge?: string | null;
      archive_tags?: string[] | string;
      archive_image?: string | null;
    }
  ): { success: boolean; error?: string } {
    const tags = normalizeTags(archiveMetadata.archive_tags);
    this.repo.update(id, {
      archive_status: 'archived',
      archive_badge: archiveMetadata.archive_badge || null,
      archive_tags: JSON.stringify(tags),
      archive_image: archiveMetadata.archive_image || null,
    });
    return { success: true };
  }
}

export const eventService = new EventService();
