import { runner } from './harness';
import { EventService, mapRowToDisplayEvent } from '../../lib/services/event.service';
import { IEventRepository } from '../../lib/repositories/event.repository';
import { EventRow, EventArchiveStatus } from '../../lib/types/event';

class MockEventRepository implements IEventRepository {
  public events: EventRow[] = [];
  public lastUpdatedId: string | null = null;
  public lastUpdatedData: Partial<EventRow> | null = null;
  public lastUpdatedStatus: { id: string; status: EventArchiveStatus } | null = null;

  async getAll(): Promise<EventRow[]> {
    return [...this.events];
  }
  async getById(id: string): Promise<EventRow | null> {
    return this.events.find((e) => e.id === id) || null;
  }
  async getByStatus(status: EventArchiveStatus): Promise<EventRow[]> {
    return this.events.filter((e) => e.archive_status === status);
  }
  async getActive(): Promise<EventRow[]> {
    return this.events.filter((e) => e.archive_status === 'active');
  }
  async getPendingArchive(): Promise<EventRow[]> {
    return this.events.filter((e) => e.archive_status === 'pending_archive');
  }
  async getArchived(): Promise<EventRow[]> {
    return this.events.filter((e) => e.archive_status === 'archived');
  }
  async create(event: Partial<EventRow>): Promise<void> {
    this.events.push(event as EventRow);
  }
  async update(id: string, updates: Partial<EventRow>): Promise<void> {
    this.lastUpdatedId = id;
    this.lastUpdatedData = updates;
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.events[idx] = { ...this.events[idx], ...updates };
    }
  }
  async updateStatus(id: string, status: EventArchiveStatus): Promise<void> {
    this.lastUpdatedStatus = { id, status };
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx !== -1) {
      this.events[idx].archive_status = status;
    }
  }
  async delete(id: string): Promise<void> {
    this.events = this.events.filter((e) => e.id !== id);
  }
}

export async function runEventServiceTests() {
  runner.startSuite('Event Service (lib/services/event.service.ts)');

  const mockRepo = new MockEventRepository();
  const service = new EventService(mockRepo);

  // 1. mapRowToDisplayEvent
  const row: EventRow = {
    id: 'ev-test-1',
    title: 'Test Lecture',
    speaker: 'Apar Gupta',
    venue: 'India Habitat Centre',
    venue_map_url: 'https://maps.app.goo.gl/abcdef123',
    category: 'unlecture',
    date: 'Sat, 20 Sep',
    event_datetime: '2026-09-20T17:00:00Z',
    time: '5:00 PM',
    price: '500',
    description: 'Lecture synopsis',
    image: '/uploads/poster.png',
    urbanaut_url: 'https://urbanaut.app/event/1',
    archive_status: 'active',
    archive_image: null,
    archive_badge: 'SPECIAL',
    archive_tags: '["law", "tech"]',
    youtube_urls: '[]',
    substack_urls: '[]',
    created_at: '2026-09-19T00:00:00Z',
    updated_at: '2026-09-19T00:00:00Z',
  };

  const display = mapRowToDisplayEvent(row);
  runner.assertEqual(display.id, 'ev-test-1', 'mapRowToDisplayEvent: maps id');
  runner.assertEqual(display.badge, 'SPECIAL', 'mapRowToDisplayEvent: maps archive_badge to badge');
  runner.assertEqual(display.category, 'unlecture', 'mapRowToDisplayEvent: preserves category');
  runner.assertEqual(display.venueMapUrl, 'https://maps.app.goo.gl/abcdef123', 'mapRowToDisplayEvent: maps venue_map_url to venueMapUrl');

  // 2. createEvent validation failure
  const invalidCreate = await service.createEvent({
    title: 'Invalid Event',
    image: 'not-a-valid-path',
  });
  runner.assert(!invalidCreate.success && Boolean(invalidCreate.errors?.image), 'createEvent: rejects invalid image URL with structured errors');

  const invalidMapCreate = await service.createEvent({
    title: 'Invalid Map Event',
    image: '/uploads/valid.png',
    venue_map_url: 'https://not-google-maps.com/xyz',
  });
  runner.assert(!invalidMapCreate.success && Boolean(invalidMapCreate.errors?.venue_map_url), 'createEvent: rejects non-Google Maps URL');

  // 3. createEvent valid payload & auto-ID
  const validCreate = await service.createEvent({
    title: 'When Algorithms Speak',
    speaker: 'Dr. Rao',
    venue: 'Bangalore',
    venue_map_url: 'https://maps.app.goo.gl/xyz789',
    category: 'unlecture',
    date: 'Sun, 28 Sep',
    image: '/uploads/algos.png',
    archive_tags: 'tech, ai, ethics',
  });
  runner.assert(validCreate.success && Boolean(validCreate.id), 'createEvent: successfully creates valid event');
  runner.assertEqual(validCreate.id, 'when-algorithms-speak', 'createEvent: auto-generates slugified id from title');

  const createdEv = await service.getEventById(validCreate.id!);
  runner.assertEqual(createdEv?.archive_tags, '["tech","ai","ethics"]', 'createEvent: normalizes comma tags to JSON array string');
  runner.assertEqual(createdEv?.venue_map_url, 'https://maps.app.goo.gl/xyz789', 'createEvent: preserves attached venue_map_url');

  // 4. updateEvent validation failure & audit column stripping
  const invalidUpdate = await service.updateEvent('when-algorithms-speak', {
    youtube_urls: ['https://notyoutube.com/evil'],
  } as any);
  runner.assert(!invalidUpdate.success && Boolean(invalidUpdate.errors?.youtube_urls), 'updateEvent: rejects invalid YouTube link');

  await service.updateEvent('when-algorithms-speak', {
    title: 'Updated Algorithm Title',
    id: 'attempted-override',
    created_at: '2020-01-01',
    updated_at: '2020-01-01',
  } as any);

  runner.assert(!('id' in mockRepo.lastUpdatedData!), 'updateEvent: strips id before repository update');
  runner.assert(!('created_at' in mockRepo.lastUpdatedData!), 'updateEvent: strips created_at before repository update');
  runner.assert(!('updated_at' in mockRepo.lastUpdatedData!), 'updateEvent: strips updated_at before repository update');
  runner.assertEqual(mockRepo.lastUpdatedData?.title, 'Updated Algorithm Title', 'updateEvent: updates specified title');

  // 5. publishToArchive
  await service.publishToArchive('when-algorithms-speak', {
    archive_badge: 'SOLD OUT',
    archive_tags: ['computer-science', 'ai'],
    archive_image: '/archive/recap-photo.jpg',
  });
  const archivedEv = await service.getEventById('when-algorithms-speak');
  runner.assertEqual(archivedEv?.archive_status, 'archived', 'publishToArchive: changes status to "archived"');
  runner.assertEqual(archivedEv?.archive_badge, 'SOLD OUT', 'publishToArchive: updates archive_badge');
  runner.assertEqual(archivedEv?.archive_image, '/archive/recap-photo.jpg', 'publishToArchive: updates archive_image');

  // 6. getFormattedArchiveCards
  const archiveCards = await service.getFormattedArchiveCards();
  runner.assert(archiveCards.length > 0, 'getFormattedArchiveCards: returns archived items');
  const card = archiveCards[0];
  runner.assertEqual(card.image, '/archive/recap-photo.jpg', 'getFormattedArchiveCards: prefers archive_image over poster image');
  runner.assertEqual(card.specialBadge, 'SOLD OUT', 'getFormattedArchiveCards: maps archive_badge to specialBadge');
  runner.assertEqual(card.tags, ['computer-science', 'ai'], 'getFormattedArchiveCards: normalizes archive tags');
  runner.assertEqual(card.venueMapUrl, 'https://maps.app.goo.gl/xyz789', 'getFormattedArchiveCards: maps venueMapUrl');

  // 7. transitionStatus
  const transRes = await service.transitionStatus('when-algorithms-speak', 'hide', 'event_manager');
  runner.assertEqual(transRes.success, true, 'transitionStatus: allows valid transition');
  runner.assertEqual(mockRepo.lastUpdatedStatus?.status, 'hidden', 'transitionStatus: executes transition to "hidden"');

  const invalidTrans = await service.transitionStatus('when-algorithms-speak', 'non-existent-action', 'event_manager');
  runner.assert(!invalidTrans.success, 'transitionStatus: fails on invalid action name');

  runner.endSuite();
}
