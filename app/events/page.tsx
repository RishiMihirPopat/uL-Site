import { getActiveEvents, getFormattedArchivedEvents } from '@/lib/db';
import EventsPageV2 from '@/components/EventsPageV2';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Events Archive — unLecture',
  description: 'Browse upcoming and past unLecture events.',
};

export default function EventsPage() {
  const upcoming = getActiveEvents().map((e) => ({
    id: e.id,
    title: e.title,
    speaker: e.speaker,
    venue: e.venue,
    date: e.date,
    image: e.image,
  }));

  const past = getFormattedArchivedEvents().map((e) => ({
    id: e.id,
    title: e.title,
    speaker: e.speaker,
    venue: e.venue,
    date: e.date,
    image: e.image,
  }));

  return <EventsPageV2 upcoming={upcoming} past={past} />;
}
