'use client';

import React, { useEffect, useState } from 'react';
import styles from '../admin.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ autoArchiveDelayDays: 7, defaultAction: 'archive' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            autoArchiveDelayDays: data.auto_archive_days !== undefined ? parseInt(data.auto_archive_days, 10) || 0 : (data.autoArchiveDelayDays ?? 7),
            defaultAction: data.auto_archive_action || data.defaultAction || 'archive',
          });
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auto_archive_days: String(settings.autoArchiveDelayDays),
        auto_archive_action: settings.defaultAction,
      }),
    });
    if (res.ok) {
      setMsg('Settings saved successfully');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Settings</h1>
      </div>
      {msg && <div className={`${styles.alert} ${styles.alertSuccess}`}>{msg}</div>}

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label>Auto-archive delay (days)</label>
            <input 
              type="number" 
              className={styles.input} 
              value={settings.autoArchiveDelayDays ?? 0}
              onChange={e => setSettings({ ...settings, autoArchiveDelayDays: parseInt(e.target.value, 10) || 0 })}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Set to 0 for immediate action after event datetime.</small>
          </div>
          <div>
            <label>Default Action (after delay)</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label>
                <input 
                  type="radio" 
                  name="defaultAction" 
                  value="archive" 
                  checked={settings.defaultAction === 'archive'}
                  onChange={e => setSettings({ ...settings, defaultAction: e.target.value })}
                /> Archive
              </label>
              <label>
                <input 
                  type="radio" 
                  name="defaultAction" 
                  value="discard"
                  checked={settings.defaultAction === 'discard'}
                  onChange={e => setSettings({ ...settings, defaultAction: e.target.value })}
                /> Discard
              </label>
            </div>
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save Settings</button>
        </form>
      </div>
    </div>
  );
}
