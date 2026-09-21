import { getActiveEvents, mapRowToDisplayEvent } from '@/lib/db';
import { FORMAT_REGISTRY, getFormatDefinition } from '@/lib/constants/formats';
import { BackButton } from '@/components/FormatCardLink';
import { HeaderTitle } from '@/components/AnimatedTitle';
import { FormatEventsList } from '@/components/FormatEventsList';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

/* ── Static params ──────────────────────────────── */

export function generateStaticParams() {
  return Object.keys(FORMAT_REGISTRY).map((slug) => ({ slug }));
}

/* ── Page ───────────────────────────────────────── */

export default async function EventsFormatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getFormatDefinition(slug);

  if (!config) {
    return (
      <main className={styles.main}>
        <p className={styles.empty}>Format not found.</p>
      </main>
    );
  }

  const allActive = await getActiveEvents();
  const dbEvents = allActive.map(mapRowToDisplayEvent);

  const events = dbEvents.filter((e) => e.category === config.id);

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
