import { getActiveEvents } from '@/lib/db';
import type { EventCategory } from '@/data/events';
import { BackButton } from '@/components/FormatCardLink';
import { HeaderTitle } from '@/components/AnimatedTitle';
import EventCard from '@/components/EventCard';
import styles from './page.module.css';

/* ── Format configuration ───────────────────────── */

const FORMAT_CONFIG: Record<string, {
  name: string;
  category: EventCategory;
  description: string;
}> = {
  'grounds-for-thought': {
    name: 'Grounds for Thought',
    category: 'grounds-for-thought',
    description:
      'In partnership with Blue Tokai. A smaller format, more intimate setting — conversations on the things we actually live with.',
  },
  'unlecture': {
    name: 'unLecture',
    category: 'unlecture',
    description:
      'In-person lectures in unconventional spaces. A speaker, an idea, and an evening that unfolds with the conversation.',
  },
  'community': {
    name: 'Community Events',
    category: 'community',
    description:
      'Recurring evenings shaped by the people who show up. Familiar faces, evolving formats, ideas that stay with you.',
  },
  'unlecture-series': {
    name: 'unLecture Series',
    category: 'unlecture-series',
    description:
      'A series of connected conversations and hands-on sessions exploring one idea deeply — multiple perspectives, one thread.',
  },
};

export const dynamic = 'force-dynamic';

/* ── Static params ──────────────────────────────── */

export function generateStaticParams() {
  return Object.keys(FORMAT_CONFIG).map((slug) => ({ slug }));
}

/* ── Page ───────────────────────────────────────── */

export default async function EventsFormatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = FORMAT_CONFIG[slug];

  if (!config) {
    return (
      <main className={styles.main}>
        <p className={styles.empty}>Format not found.</p>
      </main>
    );
  }

  let dbEvents: any[] = [];
  try {
    const allActive = getActiveEvents();
    dbEvents = allActive.map((e) => ({
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
    }));
  } catch {
    /* Fallback if DB unavailable */
    const { EVENTS } = await import('@/data/events');
    dbEvents = EVENTS;
  }

  const events = dbEvents.filter((e) => e.category === config.category);

  return (
    <main className={styles.main}>

      <header className={styles.header} data-format={slug}>
        <BackButton className={styles.back}>
          ← All formats
        </BackButton>
        <div className={styles.headerInner}>
          <p className={styles.headerLabel}>Format</p>
          <HeaderTitle href={`/events/${slug}`} className={styles.headerTitle}>{config.name}</HeaderTitle>
          <p className={styles.headerDesc}>{config.description}</p>
        </div>
        <div className={styles.headerRule} aria-hidden="true" />
      </header>

      <section className={styles.section}>
        {events.length === 0 ? (
          <p className={styles.empty}>No upcoming events in this category currently — check back soon.</p>
        ) : (
          <div className={styles.grid}>
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
