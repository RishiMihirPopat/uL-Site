'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const router = useRouter();

  const fetchEvents = () => {
    fetch('/api/admin/events/all')
      .then(res => res.json())
      .then(data => setEvents(data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAction = async (id: number, action: string) => {
    await fetch(`/api/admin/events/${id}/${action}`, { method: 'POST' });
    fetchEvents();
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'All') return true;
    return e.archive_status.toLowerCase() === filter.toLowerCase();
  });

  const getBadgeClass = (status: string) => {
    if (status === 'active') return styles.badgeActive;
    if (status === 'archived') return styles.badgeArchived;
    if (status === 'hidden') return styles.badgeHidden;
    if (status === 'discarded') return styles.badgeDiscarded;
    return '';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Events</h1>
        <Link href="/admin/events/new" className={`${styles.btn} ${styles.btnPrimary}`}>New Event</Link>
      </div>

      <div className={styles.filterBar}>
        {['All', 'Active', 'Archived', 'Hidden', 'Discarded'].map(f => (
          <button
            key={f}
            className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.card} style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Speaker</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(e => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.title}</td>
                <td>{e.speaker}</td>
                <td>{e.date}</td>
                <td>
                  <span className={`${styles.badge} ${getBadgeClass(e.archive_status)}`}>
                    {e.archive_status}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {e.archive_status === 'active' && (
                      <>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => router.push(`/admin/events/${e.id}`)}>Edit</button>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'archive')}>Archive</button>
                        <button className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`} onClick={() => handleAction(e.id, 'discard')}>Discard</button>
                      </>
                    )}
                    {e.archive_status === 'archived' && (
                      <>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => router.push(`/admin/events/${e.id}`)}>Edit</button>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => router.push(`/admin/events/${e.id}`)}>Add Content</button>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'hide')}>Hide</button>
                      </>
                    )}
                    {e.archive_status === 'hidden' && (
                      <>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => router.push(`/admin/events/${e.id}`)}>Edit</button>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'restore')}>Restore</button>
                        <button className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`} onClick={() => handleAction(e.id, 'discard')}>Discard</button>
                      </>
                    )}
                    {e.archive_status === 'discarded' && (
                      <>
                        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'restore')}>Restore</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
