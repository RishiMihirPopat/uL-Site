'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoArchiveDelayDays: 7,
    defaultAction: 'archive',
    tickerText: 'Next Gathering: Intimate Lectures in Unconventional Spaces • Limited Capacity • Book on Urbanaut • New Sessions Announced Weekly',
  });
  const [msg, setMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSettings({
            autoArchiveDelayDays: data.auto_archive_days !== undefined ? parseInt(data.auto_archive_days, 10) || 0 : 7,
            defaultAction: data.auto_archive_action || 'archive',
            tickerText: data.ticker_text || 'Next Gathering: Intimate Lectures in Unconventional Spaces • Limited Capacity • Book on Urbanaut • New Sessions Announced Weekly',
          });
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auto_archive_days: String(settings.autoArchiveDelayDays),
        auto_archive_action: settings.defaultAction,
        ticker_text: settings.tickerText,
      }),
    });
    if (res.ok) {
      setMsg('Settings saved successfully');
      setTimeout(() => setMsg(''), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>System Settings</h1>
          <p className={styles.headerSubtitle}>
            Configure automated event archiving and homepage announcement marquee text.
          </p>
        </div>
        <Link href="/admin/dashboard" className={styles.btn}>
          &larr; Back to Dashboard
        </Link>
      </div>

      {msg && <div className={`${styles.alert} ${styles.alertSuccess}`}>✓ {msg}</div>}

      {/* ── Ticker Banner Settings Card ── */}
      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Homepage Moving Orange Ticker Banner</h2>
            <p className={styles.cardDesc}>
              Custom text displayed on the continuously scrolling orange marquee ticker banner on the homepage.
            </p>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Ticker Banner Announcement Text</label>
          <textarea
            rows={3}
            className={styles.textarea}
            value={settings.tickerText}
            onChange={(e) => setSettings({ ...settings, tickerText: e.target.value })}
            placeholder="e.g. Next Gathering: Intimate Lectures in Unconventional Spaces • Limited Capacity • Book on Urbanaut"
          />
          <span className={styles.formGroupHelper}>
            This text scrolls smoothly across the orange banner below the hero section. Separate phrases with bullet points (•).
          </span>
        </div>
      </div>

      {/* ── Auto-Archive Rules Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Event Lifecycle & Auto-Archive Rules</h2>
            <p className={styles.cardDesc}>
              The background cron job periodically scans events whose timestamp has passed and moves them to <em>Pending Archive</em> for review.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Auto-archive delay (in days after event concludes)</label>
            <input
              type="number"
              min="0"
              className={styles.input}
              style={{ maxWidth: '200px' }}
              value={settings.autoArchiveDelayDays ?? 0}
              onChange={e => setSettings({ ...settings, autoArchiveDelayDays: parseInt(e.target.value, 10) || 0 })}
            />
            <span className={styles.formGroupHelper}>
              Events older than this number of days will trigger the default action below. (Default: 7 days).
            </span>
          </div>

          <div className={styles.formGroup}>
            <label>Default Action on Expiry</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="defaultAction"
                  value="archive"
                  checked={settings.defaultAction === 'archive'}
                  onChange={e => setSettings({ ...settings, defaultAction: e.target.value })}
                />
                <strong>Move to Archive</strong> (recommended)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="defaultAction"
                  value="discard"
                  checked={settings.defaultAction === 'discard'}
                  onChange={e => setSettings({ ...settings, defaultAction: e.target.value })}
                />
                <span>Discard / Trash</span>
              </label>
            </div>
          </div>

          <div className={styles.actions} style={{ marginTop: '1rem' }}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
