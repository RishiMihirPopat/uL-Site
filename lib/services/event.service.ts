/**
 * Event Domain Service (SRP & DIP).
 * Handles business logic, data transformation, validation, and lifecycle coordination.
 */

import { IEventRepository, eventRepository } from '../repositories/event.repository';
import { EventRow, Event, FormattedArchiveCard, EventCategory } from '../types/event';
import { normalizeTags, validateEventLinks } from '../validators';
import { canPerformTransition, LIFECYCLE_TRANSITIONS } from '../domain/lifecycle';
import { AdminRole } from '../auth';
import { generateEventId } from '../utils/id';
import { uploadService } from './upload.service';

export function mapRowToDisplayEvent(e: EventRow): Event {
  return {
    id: e.id,
    category: e.category as EventCategory,
    title: e.title,
    speaker: e.speaker,
    venue: e.venue,
    venueMapUrl: e.venue_map_url || undefined,
    venue_map_url: e.venue_map_url || undefined,
    date: e.date,
    time: e.time,
    price: e.price,
    description: e.description,
    image: e.image,
    urbanautUrl: e.urbanaut_url,
    badge: e.archive_badge || undefined,
  };
}

export class EventService {
  constructor(private readonly repo: IEventRepository = eventRepository) {}

  public async getAllEvents(): Promise<EventRow[]> {
    return await this.repo.getAll();
  }

  public async getEventById(id: string): Promise<EventRow | null> {
    return await this.repo.getById(id);
  }

  public async getActiveDisplayEvents(): Promise<Event[]> {
    const activeRows = await this.repo.getActive();
    return activeRows.map(mapRowToDisplayEvent);
  }

  public async getFormattedArchiveCards(): Promise<FormattedArchiveCard[]> {
    const archivedRows = await this.repo.getArchived();
    return archivedRows.map((event) => {
      const tags = normalizeTags(event.archive_tags);

      let youtubeUrls: string[] = [];
      try {
        youtubeUrls =
          typeof event.youtube_urls === 'string'
            ? JSON.parse(event.youtube_urls)
            : event.youtube_urls || [];
      } catch {
        youtubeUrls = [];
      }

      let substackUrls: string[] = [];
      try {
        substackUrls =
          typeof event.substack_urls === 'string'
            ? JSON.parse(event.substack_urls)
            : event.substack_urls || [];
      } catch {
        substackUrls = [];
      }

      return {
        id: event.id,
        date: event.date,
        title: event.title,
        venue: event.venue,
        venueMapUrl: event.venue_map_url || undefined,
        venue_map_url: event.venue_map_url || undefined,
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

  public async createEvent(
    data: Partial<EventRow>
  ): Promise<{ success: boolean; id?: string; error?: string; errors?: Record<string, string> }> {
    const validation = validateEventLinks(data);
    if (!validation.valid) {
      return {
        success: false,
        error: Object.values(validation.errors).join(' '),
        errors: validation.errors,
      };
    }

    const id = data.id || generateEventId();
    const tagsArray = normalizeTags(data.archive_tags);

    const newEvent: Partial<EventRow> = {
      ...data,
      id,
      venue_map_url: data.venue_map_url || '',
      archive_status: data.archive_status || 'active',
      archive_tags: JSON.stringify(tagsArray),
      youtube_urls: data.youtube_urls
        ? typeof data.youtube_urls === 'string'
          ? data.youtube_urls
          : JSON.stringify(data.youtube_urls)
        : '[]',
      substack_urls: data.substack_urls
        ? typeof data.substack_urls === 'string'
          ? data.substack_urls
          : JSON.stringify(data.substack_urls)
        : '[]',
    };

    await this.repo.create(newEvent);
    return { success: true, id };
  }

  public async updateEvent(
    id: string,
    data: Partial<EventRow>
  ): Promise<{ success: boolean; error?: string; errors?: Record<string, string> }> {
    const validation = validateEventLinks(data);
    if (!validation.valid) {
      return {
        success: false,
        error: Object.values(validation.errors).join(' '),
        errors: validation.errors,
      };
    }

    const updates = { ...data };
    delete (updates as any).id;
    delete (updates as any).created_at;
    delete (updates as any).updated_at;

    if (updates.archive_tags !== undefined) {
      updates.archive_tags = JSON.stringify(normalizeTags(updates.archive_tags));
    }
    if (updates.youtube_urls !== undefined && typeof updates.youtube_urls !== 'string') {
      updates.youtube_urls = JSON.stringify(updates.youtube_urls);
    }
    if (updates.substack_urls !== undefined && typeof updates.substack_urls !== 'string') {
      updates.substack_urls = JSON.stringify(updates.substack_urls);
    }

    await this.repo.update(id, updates);
    return { success: true };
  }

  public async transitionStatus(
    id: string,
    action: string,
    userRole: AdminRole | null
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    const check = canPerformTransition(action, userRole);
    if (!check.allowed) {
      return { success: false, error: check.reason, status: 403 };
    }

    const transition = LIFECYCLE_TRANSITIONS[action];
    await this.repo.updateStatus(id, transition.to);
    return { success: true };
  }

  public async deleteEvent(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  /**
   * Hard-deletes an event and cleans up its uploaded assets (poster + archive images).
   */
  public async discardEvent(id: string): Promise<{ success: boolean; error?: string }> {
    const event = await this.repo.getById(id);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    // Collect image URLs to delete
    const urlsToDelete = [event.image, event.archive_image].filter(
      (url): url is string => Boolean(url)
    );

    // Clean up uploaded assets (best-effort — don't block deletion on asset cleanup failure)
    if (urlsToDelete.length > 0) {
      try {
        await uploadService.deleteUrls(urlsToDelete);
      } catch {
        // Log but don't fail — the DB row should still be removed
        console.warn(`[EventService] Asset cleanup failed for event ${id}, proceeding with deletion.`);
      }
    }

    await this.repo.delete(id);
    return { success: true };
  }

  public async publishToArchive(
    id: string,
    archiveMetadata?: {
      archive_badge?: string | null;
      archive_tags?: string[] | string;
      archive_image?: string | null;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const updates: Partial<EventRow> = {
      archive_status: 'archived',
    };
    if (archiveMetadata?.archive_badge !== undefined) {
      updates.archive_badge = archiveMetadata.archive_badge;
    }
    if (archiveMetadata?.archive_tags !== undefined) {
      updates.archive_tags = JSON.stringify(normalizeTags(archiveMetadata.archive_tags));
    }
    if (archiveMetadata?.archive_image !== undefined) {
      updates.archive_image = archiveMetadata.archive_image;
    }
    await this.repo.update(id, updates);
    return { success: true };
  }
}

export const eventService = new EventService();
