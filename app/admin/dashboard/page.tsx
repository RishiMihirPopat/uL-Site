'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    archived: 0,
    hidden: 0,
    discarded: 0
  });
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/events/all')
      .then(res => res.json())
      .then(events => {
        const stats = {
          total: events.length,
          active: events.filter((e: any) => e.archive_status === 'active').length,
          archived: events.filter((e: any) => e.archive_status === 'archived').length,
          hidden: events.filter((e: any) => e.archive_status === 'hidden').length,
          discarded: events.filter((e: any) => e.archive_status === 'discarded').length,
        };
        setCounts(stats);
      });

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Total Events</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{counts.total}</p>
        </div>
        <div className={styles.card}>
          <h3>Active</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e8e3e' }}>{counts.active}</p>
        </div>
        <div className={styles.card}>
          <h3>Archived</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a73e8' }}>{counts.archived}</p>
        </div>
        <div className={styles.card}>
          <h3>Hidden</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#5f6368' }}>{counts.hidden}</p>
        </div>
        <div className={styles.card}>
          <h3>Discarded</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d93025' }}>{counts.discarded}</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Settings Summary</h2>
        {settings ? (
          <div>
            <p><strong>Auto-archive delay:</strong> {settings.autoArchiveDelayDays} days</p>
            <p><strong>Default action:</strong> {settings.defaultAction}</p>
          </div>
        ) : (
          <p>Loading settings...</p>
        )}
      </div>

      <div className={styles.actions}>
        <Link href="/admin/events" className={`${styles.btn} ${styles.btnPrimary}`}>Manage Events</Link>
        <Link href="/admin/settings" className={styles.btn}>Edit Settings</Link>
      </div>
    </div>
  );
}
