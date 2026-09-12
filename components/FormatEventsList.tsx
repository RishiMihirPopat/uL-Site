'use client';

import EventCard from './EventCard';
import type { Event } from '../lib/db';
import styles from './FormatEventsList.module.css';

interface FormatEventsListProps {
  initialEvents: Event[];
}

export function FormatEventsList({ initialEvents }: FormatEventsListProps) {
  if (initialEvents.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No upcoming gatherings scheduled in this format yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {initialEvents.map((event, index) => (
        <EventCard key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}

