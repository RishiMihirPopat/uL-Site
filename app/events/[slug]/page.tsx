import { getActiveEvents } from '@/lib/db';
import type { EventCategory } from '@/lib/db';
import { BackButton } from '@/components/FormatCardLink';
import { HeaderTitle } from '@/components/AnimatedTitle';
import { FormatEventsList } from '@/components/FormatEventsList';
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
      "Held across Blue Tokai cafés. A more intimate format to sit with topics that are actually relevant to us. Sometimes it's someone's PhD thesis, other times it's a question that doesn't have a paper written on it yet.",
  },
  'unlecture': {
    name: 'unLecture',
    category: 'unlecture',
    description:
      'Our flagship event. It breaks the binary that certain conversations only happen inside certain institutions. We make room for that discourse in the casual spaces we already frequent, and treat learning as something you do out in the city.',
  },
  'community': {
    name: 'Community Events',
    category: 'community',
    description:
      'Unique events that build the space along with us. The formats keep evolving. This is our way of keeping the community, and the interactions that matter, accessible to most.',
  },
  'unlecture-series': {
    name: 'unLecture Series',
    category: 'unlecture-series',
    description:
      "A chance to go deep into one topic of interest, programmed over a few weeks. By the end of it, you're sure to have grown and taken something away with you.",
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

  const allActive = getActiveEvents();
  const dbEvents = allActive.map((e) => ({
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

  const events = dbEvents.filter((e) => e.category === config.category);

  return (
    <main className={styles.main}>
      <header className={styles.header} data-format={slug}>
        <BackButton className={styles.back}>
          &larr; All formats
        </BackButton>
        <div className={styles.headerInner}>
          <HeaderTitle href={`/events/${slug}`} className={styles.headerTitle}>{config.name}</HeaderTitle>
          <p className={styles.headerDesc}>{config.description}</p>
        </div>
        <div className={styles.headerRule} aria-hidden="true" />
      </header>

      <section className={styles.section}>
        <FormatEventsList initialEvents={events} />
      </section>
    </main>
  );
}
