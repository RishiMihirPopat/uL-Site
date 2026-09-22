'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { Testimonial } from '@/lib/types/testimonial';
import { StatusBadge } from '@/components/admin/StatusBadge';

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    pending: 0,
    archived: 0,
    hidden: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [selectedCarouselIds, setSelectedCarouselIds] = useState<string[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [carouselSaving, setCarouselSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = () => {
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.role) setRole(data.role);
      });

    fetch('/api/admin/events/all')
      .then((res) => res.json())
      .then((events) => {
        if (!Array.isArray(events)) return;
        const stats = {
          total: events.length,
          active: events.filter((e: any) => e.archive_status === 'active').length,
          pending: events.filter((e: any) => e.archive_status === 'pending_archive').length,
          archived: events.filter((e: any) => e.archive_status === 'archived').length,
          hidden: events.filter((e: any) => e.archive_status === 'hidden').length,
        };
        setCounts(stats);
        setRecentEvents(events.slice(0, 6));
        setActiveEvents(events.filter((e: any) => e.archive_status === 'active'));
      });

    fetch('/api/admin/carousel')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.selectedIds)) {
          setSelectedCarouselIds(data.selectedIds);
        }
      });

    fetch('/api/admin/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        }
      });

    fetch('/api/admin/articles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArticlesCount(data.length);
        }
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCarousel = async (eventId: string) => {
    let newSelected: string[];
    if (selectedCarouselIds.includes(eventId)) {
      newSelected = selectedCarouselIds.filter((id) => id !== eventId);
    } else {
      newSelected = [...selectedCarouselIds, eventId];
    }

    setSelectedCarouselIds(newSelected);
    setCarouselSaving(true);

    try {
      const res = await fetch('/api/admin/carousel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIds: newSelected }),
      });
      if (res.ok) {
        showToast('success', 'Hero carousel playlist updated');
      } else {
        showToast('error', 'Failed to update carousel');
      }
    } catch {
      showToast('error', 'Network error updating carousel');
    } finally {
      setCarouselSaving(false);
    }
  };

  const handleSelectAllActive = async (select: boolean) => {
    const newSelected = select ? activeEvents.map((e) => e.id) : [];
    setSelectedCarouselIds(newSelected);
    setCarouselSaving(true);

    try {
      const res = await fetch('/api/admin/carousel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIds: newSelected }),
      });
      if (res.ok) {
        showToast('success', select ? 'All active events added to hero carousel' : 'Cleared carousel selection');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setCarouselSaving(false);
    }
  };


  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>Overview</h1>
          <p className={styles.headerSubtitle}>
            Managing unLecture events, hero slideshow, community recommendations, and the Postcard Archive.
          </p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/events/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Create Event
          </Link>
          <Link href="/admin/articles" className={styles.btn}>
            Articles ({articlesCount})
          </Link>
          <Link href="/admin/testimonials" className={styles.btn}>
            Testimonials
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className={`${styles.alert} ${toastMsg.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {toastMsg.text}
        </div>
      )}

      {/* Hidden Drafts / Concluded Events Alert Banner */}
      {counts.hidden > 0 && (
        <div className={styles.card} style={{ borderLeft: '5px solid var(--color-primary, #6B2D2D)', background: 'var(--color-bg-surface, #EDE4D3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <h3 style={{ color: 'var(--color-primary, #6B2D2D)', margin: 0, fontSize: '1.15rem', fontFamily: 'var(--font-brand, Atelier, serif)' }}>
                Concluded / Draft Events: {counts.hidden} Event{counts.hidden > 1 ? 's' : ''} in Hidden Drafts
              </h3>
              <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted, #3D332A)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Events that have concluded are moved to Hidden Drafts. Review each event to send it to the public archive or discard it.
              </p>
            </div>
            <Link href="/admin/events?filter=Hidden" className={`${styles.btn} ${styles.btnPrimary}`}>
              Review Concluded Events ({counts.hidden}) &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Link href="/admin/events" className={styles.statCard}>
          <span className={styles.statLabel}>Total Events</span>
          <span className={styles.statValue}>{counts.total}</span>
        </Link>
        <Link href="/admin/events?filter=Active" className={styles.statCard} style={{ borderTop: '3px solid var(--color-olive, #5A5A3C)' }}>
          <span className={styles.statLabel}>Active & Booking</span>
          <span className={styles.statValue} style={{ color: 'var(--color-olive, #5A5A3C)' }}>{counts.active}</span>
        </Link>
        <Link href="/admin/events?filter=Hidden" className={styles.statCard} style={{ borderTop: '3px solid var(--color-text-muted, #3D332A)' }}>
          <span className={styles.statLabel}>Hidden Drafts</span>
          <span className={styles.statValue} style={{ color: 'var(--color-text-muted, #3D332A)' }}>{counts.hidden}</span>
        </Link>
        <Link href="/admin/events?filter=Archived" className={styles.statCard} style={{ borderTop: '3px solid var(--color-primary, #6B2D2D)' }}>
          <span className={styles.statLabel}>Postcard Archive</span>
          <span className={styles.statValue} style={{ color: 'var(--color-primary, #6B2D2D)' }}>{counts.archived}</span>
        </Link>
        <Link href="/admin/testimonials" className={styles.statCard} style={{ borderTop: '3px solid var(--color-bg-dark, #2A2420)' }}>
          <span className={styles.statLabel}>Testimonials</span>
          <span className={styles.statValue} style={{ color: 'var(--color-bg-dark, #2A2420)' }}>{testimonials.length}</span>
        </Link>
      </div>

      {/* ── Section: Homepage Hero Carousel Selection ──────────────── */}
      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <div className={styles.cardHeader} style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>Homepage Hero Carousel Selection</h2>
            <p className={styles.cardDesc}>
              Select which active events are included in the front-page auto-slideshow. Checked events will cycle every 2.5 seconds.
            </p>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSmall}`}
              onClick={() => handleSelectAllActive(true)}
              disabled={carouselSaving}
            >
              Select All Active
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSmall}`}
              onClick={() => handleSelectAllActive(false)}
              disabled={carouselSaving}
            >
              Deselect All
            </button>
          </div>
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text, #1A1714)' }}>
              Currently cycling <strong>{selectedCarouselIds.length}</strong> of <strong>{activeEvents.length}</strong> active events on the homepage hero.
            </span>
            {carouselSaving && <span style={{ fontSize: '0.8rem', color: 'var(--color-primary, #6B2D2D)', fontFamily: 'var(--font-mono, monospace)' }}>Saving changes...</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {activeEvents.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #3D332A)', fontStyle: 'italic', margin: 0 }}>No active events found. Create an event to include it in the carousel.</p>
            ) : (
              activeEvents.map((evt) => {
                const isSelected = selectedCarouselIds.includes(evt.id);
                return (
                  <label
                    key={evt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      background: isSelected ? 'var(--color-bg-surface, #EDE4D3)' : '#FFFFFF',
                      border: isSelected ? '1.5px solid var(--color-primary, #6B2D2D)' : '1px solid var(--color-border, #D6C9B0)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCarousel(evt.id)}
                      style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: 'var(--color-primary, #6B2D2D)', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-primary, #6B2D2D)', fontFamily: 'var(--font-mono, monospace)' }}>
                          {evt.category ? evt.category.replace(/-/g, ' ') : 'Event'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #3D332A)' }}>&bull; {evt.date}</span>
                      </div>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--color-text, #1A1714)', display: 'block', lineHeight: 1.3 }}>
                        {evt.title}
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #3D332A)', marginTop: '2px' }}>
                        {evt.speaker && evt.speaker !== '—' ? evt.speaker : 'unLecture Collective'} {evt.venue && evt.venue !== '—' ? `· ${evt.venue}` : ''}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Section: Community Testimonials Quick Access ────────────── */}
      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Community Testimonials & Recommendations</h2>
            <p className={styles.cardDesc}>
              Manage book, film, and thinker recommendations displayed on the yellow homepage section.
            </p>
          </div>
          <Link href="/admin/testimonials" className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`}>
            + Manage & Edit Testimonials &rarr;
          </Link>
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {testimonials.slice(0, 3).map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  background: 'var(--color-bg-surface, #EDE4D3)',
                  border: '1px solid var(--color-border, #D6C9B0)',
                  borderRadius: '6px',
                }}
              >
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-text, #1A1714)', display: 'block' }}>{item.title}</strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-primary, #6B2D2D)', fontStyle: 'italic', display: 'block', margin: '2px 0 6px', fontFamily: 'var(--font-mono, monospace)' }}>
                  {item.recommender}
                </span>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted, #3D332A)', lineHeight: 1.45, maxHeight: '42px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.quote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section: Articles & Editorial Dispatches ────────────────── */}
      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Articles ({articlesCount})</h2>
            <p className={styles.cardDesc}>
              Long-form written essays and reflections formatted in Markdown.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/admin/articles/new" className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`}>
              + Write New Article
            </Link>
            <Link href="/admin/articles" className={`${styles.btn} ${styles.btnSmall}`}>
              View All Articles &rarr;
            </Link>
          </div>
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#555', margin: 0 }}>
            Articles support full Markdown formatting (headings, bold, italics, quotes, lists, links, images). Readers can seamlessly switch between essays on the dedicated reader page.
          </p>
        </div>
      </div>

      {/* Recent Events Panel */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Recent Events</h2>
            <p className={styles.cardDesc}>Latest created or updated sessions.</p>
          </div>
          <Link href="/admin/events" className={`${styles.btn} ${styles.btnSmall}`}>
            View Full List &rarr;
          </Link>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Format</th>
                <th>Speaker / Venue</th>
                <th>Display Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    No events found. Click "+ Create New Event" to get started.
                  </td>
                </tr>
              ) : (
                recentEvents.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {e.image && (
                          <img
                            src={e.image}
                            alt=""
                            style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border, #D6C9B0)' }}
                          />
                        )}
                        <div>
                          <strong>{e.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #3D332A)', fontFamily: 'var(--font-mono, monospace)' }}>ID: {e.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', textTransform: 'capitalize', color: 'var(--color-text-muted, #3D332A)' }}>
                        {e.category ? e.category.replace(/-/g, ' ') : '—'}
                      </span>
                    </td>
                    <td>
                      <div>{e.speaker || '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #3D332A)' }}>{e.venue || '—'}</div>
                    </td>
                    <td>
                      <div>{e.date}</div>
                      {e.time && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #3D332A)' }}>{e.time}</div>}
                    </td>
                    <td><StatusBadge status={e.archive_status} /></td>
                    <td>
                      <Link href={`/admin/events/${e.id}`} className={`${styles.btn} ${styles.btnSmall}`}>
                        Edit &rarr;
                      </Link>
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
