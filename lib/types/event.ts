/**
 * Segregated Event domain interfaces following the Interface Segregation Principle (ISP).
 */

export type EventCategory =
  | 'unlecture'
  | 'grounds-for-thought'
  | 'community'
  | 'unlecture-series';

export type EventArchiveStatus =
  | 'active'
  | 'pending_archive'
  | 'archived'
  | 'hidden'
  | 'discarded'; // Legacy: existing DB rows may still have this. New discards hard-delete.

export interface EventIdentity {
  id: string;
  title: string;
  speaker: string;
  venue: string;
  venue_map_url?: string | null;
  category: EventCategory;
}

export interface EventSchedule {
  date: string;
  time: string;
  event_datetime: string | null;
}

export interface EventTicketing {
  price: string;
  urbanaut_url: string;
}

export interface EventMedia {
  image: string;
  description: string;
}

export interface EventArchiveMetadata {
  archive_status: EventArchiveStatus;
  archive_image: string | null;
  archive_badge: string | null;
  archive_tags: string; // JSON string or comma-separated
  youtube_urls: string; // JSON string
  substack_urls: string; // JSON string
}

export interface EventTimestamps {
  created_at: string;
  updated_at: string;
}

/**
 * Full Event database row representing a persistent SQLite record.
 */
export interface EventRow
  extends EventIdentity,
    EventSchedule,
    EventTicketing,
    EventMedia,
    EventArchiveMetadata,
    EventTimestamps {}

/**
 * Consumer-facing Event card interface for the live active website.
 */
export interface Event {
  id: string;
  category: EventCategory;
  title: string;
  speaker: string;
  venue: string;
  venueMapUrl?: string;
  venue_map_url?: string;
  date: string;
  time: string;
  price: string;
  description: string;
  image: string;
  urbanautUrl: string;
  badge?: string;
}

/**
 * Consumer-facing Archive card interface for the Postcard Archive.
 */
export interface FormattedArchiveCard {
  id: string;
  date: string;
  title: string;
  venue: string;
  venueMapUrl?: string;
  venue_map_url?: string;
  speaker: string;
  description: string;
  image: string;
  tags: string[];
  specialBadge?: string;
  category: string;
  urbanautUrl: string;
  youtubeUrls?: string[];
  substackUrls?: string[];
}
