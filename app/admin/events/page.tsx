'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const fetchEvents = () => {
    fetch('/api/admin/events/all')
      .then(res => res.json())
      .then(data => setEvents(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => { if (data.role) setRole(data.role); });

    fetchEvents();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlFilter = params.get('filter');
      if (urlFilter) setFilter(urlFilter);
    }
  }, []);

  const handleAction = async (id: string, action: string) => {
    const res = await fetch(`/api/admin/events/${id}/${action}`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Action failed');
    }
    fetchEvents();
  };

  const counts = useMemo(() => ({
    all: events.length,
    active: events.filter(e => e.archive_status === 'active').length,
    pending: events.filter(e => e.archive_status === 'pending_archive').length,
    archived: events.filter(e => e.archive_status === 'archived').length,
    hidden: events.filter(e => e.archive_status === 'hidden').length,
    discarded: events.filter(e => e.archive_status === 'discarded').length,
  }), [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Status filter
      if (filter === 'Active' && e.archive_status !== 'active') return false;
      if (filter === 'Pending Archive' && e.archive_status !== 'pending_archive') return false;
      if (filter === 'Archived' && e.archive_status !== 'archived') return false;
      if (filter === 'Hidden' && e.archive_status !== 'hidden') return false;
      if (filter === 'Discarded' && e.archive_status !== 'discarded') return false;

      // Category filter
      if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (e.title || '').toLowerCase().includes(q);
        const matchSpeaker = (e.speaker || '').toLowerCase().includes(q);
        const matchVenue = (e.venue || '').toLowerCase().includes(q);
        const matchId = (e.id || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSpeaker && !matchVenue && !matchId) return false;
      }

      return true;
    });
  }, [events, filter, categoryFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>;
      case 'pending_archive':
        return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Archive</span>;
      case 'archived':
        return <span className={`${styles.badge} ${styles.badgeArchived}`}>Archived</span>;
      case 'hidden':
        return <span className={`${styles.badge} ${styles.badgeHidden}`}>Hidden Draft</span>;
      case 'discarded':
        return <span className={`${styles.badge} ${styles.badgeDiscarded}`}>Discarded</span>;
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Events Directory</h1>
          <p className={styles.headerSubtitle}>
            Manage sessions, ticketing links, recap media, and archive publications.
          </p>
        </div>
        <Link href="/admin/events/new" className={`${styles.btn} ${styles.btnPrimary}`}>
          + Create New Event
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className={styles.controlsRow}>
        <div className={styles.filterTabs}>
          {[
            { label: 'All', key: 'All', count: counts.all },
            { label: 'Active', key: 'Active', count: counts.active },
            { label: 'Pending Archive', key: 'Pending Archive', count: counts.pending },
            { label: 'Archived', key: 'Archived', count: counts.archived },
            { label: 'Hidden', key: 'Hidden', count: counts.hidden },
            ...(role === 'super_admin' ? [{ label: 'Discarded', key: 'Discarded', count: counts.discarded }] : []),
          ].map(t => (
            <button
              key={t.key}
              className={`${styles.filterTab} ${filter === t.key ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              <span className={styles.filterCount}>{t.count}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className={styles.select}
            style={{ width: 'auto', padding: '5px 10px', fontSize: '0.85rem' }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Formats</option>
            <option value="grounds-for-thought">Grounds for Thought</option>
            <option value="unlecture">unLecture</option>
            <option value="community">Community Events</option>
            <option value="unlecture-series">unLecture Series</option>
          </select>

          <div className={styles.searchBox}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search title, speaker, venue..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events Table Card */}
      <div className={styles.card} style={{ padding: 0 }}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Poster & Title</th>
                <th>Format</th>
                <th>Speaker / Venue</th>
                <th>Display Date & Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                    <p style={{ margin: 0, fontSize: '1rem' }}>No events found matching current filters.</p>
                    {(searchQuery || categoryFilter !== 'All' || filter !== 'All') && (
                      <button
                        className={`${styles.btn} ${styles.btnSmall}`}
                        style={{ marginTop: '10px' }}
                        onClick={() => { setFilter('All'); setCategoryFilter('All'); setSearchQuery(''); }}
                      >
                        Reset all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEvents.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {e.image ? (
                          <img
                            src={e.image}
                            alt=""
                            style={{ width: '44px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D6C9B0' }}
                          />
                        ) : (
                          <div style={{ width: '44px', height: '56px', background: '#EDE4D3', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            🖼️
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: '0.98rem', display: 'block' }}>{e.title}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#777', marginTop: '2px' }}>ID: {e.id}</div>
                          {e.archive_badge && (
                            <span style={{ fontSize: '0.7rem', background: '#2A2420', color: '#F0E8DC', padding: '1px 5px', borderRadius: '3px', marginTop: '3px', display: 'inline-block' }}>
                              {e.archive_badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', color: '#444' }}>
                        {e.category ? e.category.replace(/-/g, ' ') : '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{e.speaker || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{e.venue || '—'}</div>
                    </td>
                    <td>
                      <div>{e.date}</div>
                      {e.time && <div style={{ fontSize: '0.8rem', color: '#777' }}>{e.time}</div>}
                    </td>
                    <td>{getStatusBadge(e.archive_status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                        {e.archive_status === 'active' && (
                          <>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => router.push(`/admin/events/${e.id}`)}>
                              Edit
                            </button>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'archive')}>
                              Archive
                            </button>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'hide')}>
                              Hide
                            </button>
                          </>
                        )}
                        {e.archive_status === 'pending_archive' && (
                          <>
                            <button
                              className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`}
                              onClick={() => router.push(`/admin/events/${e.id}`)}
                            >
                              Review & Publish
                            </button>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'hide')}>
                              Hide
                            </button>
                            {role === 'super_admin' && (
                              <button className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`} onClick={() => handleAction(e.id, 'discard')}>
                                Discard
                              </button>
                            )}
                          </>
                        )}
                        {e.archive_status === 'archived' && (
                          <>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => router.push(`/admin/events/${e.id}`)}>
                              Edit Recap
                            </button>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'hide')}>
                              Hide
                            </button>
                          </>
                        )}
                        {e.archive_status === 'hidden' && (
                          <>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => router.push(`/admin/events/${e.id}`)}>
                              Edit
                            </button>
                            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'restore')}>
                              Restore
                            </button>
                            {role === 'super_admin' && (
                              <button className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`} onClick={() => handleAction(e.id, 'discard')}>
                                Discard
                              </button>
                            )}
                          </>
                        )}
                        {e.archive_status === 'discarded' && (
                          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => handleAction(e.id, 'restore')}>
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
