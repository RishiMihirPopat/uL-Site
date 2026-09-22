import { getActiveEvents, getFormattedArchivedEvents } from '@/lib/db';
import EventsPageV2, { EventType, FormatFilter } from '@/components/EventsPageV2';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Events — unLecture',
  description: 'Browse upcoming and past unLecture events.',
};

interface EventsPageProps {
  searchParams: Promise<{ type?: string; format?: string; q?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const initialType: EventType = params?.type === 'archived' || params?.type === 'past' ? 'archived' : 'upcoming';
  const validFormats: FormatFilter[] = ['all', 'unlecture', 'unlecture-series', 'community', 'grounds-for-thought'];
  const initialFormat: FormatFilter =
    params?.format && validFormats.includes(params.format as FormatFilter)
      ? (params.format as FormatFilter)
      : 'all';
  const initialSearch = typeof params?.q === 'string' ? params.q : '';

  const activeEvents = await getActiveEvents();
  const archivedEvents = await getFormattedArchivedEvents();

  const upcoming = activeEvents.map((e) => ({
    id: e.id,
    title: e.title,
    speaker: e.speaker,
    venue: e.venue,
    date: e.date,
    image: e.image,
    category: e.category,
    urbanautUrl: e.urbanaut_url || '',
  }));

  const archived = archivedEvents.map((e) => ({
    id: e.id,
    title: e.title,
    speaker: e.speaker,
    venue: e.venue,
    date: e.date,
    image: e.image,
    archiveImage: e.image,
    category: e.category,
    urbanautUrl: e.urbanautUrl || '',
    specialBadge: e.specialBadge,
    tags: e.tags || [],
    youtubeUrls: e.youtubeUrls || [],
    substackUrls: e.substackUrls || [],
    description: e.description || '',
  }));

  return (
    <EventsPageV2
      upcoming={upcoming}
      archived={archived}
      past={archived}
      initialType={initialType}
      initialFormat={initialFormat}
      initialSearch={initialSearch}
    />
  );
}
