'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatEventPrice } from '../lib/utils/formatPrice';
import { Event } from '../lib/types/event';
import { ALL_FORMATS } from '../lib/constants/formats';
import { EASE } from '../lib/constants/animation';
import { useModalDismiss } from '../lib/hooks/useModalDismiss';
import styles from './AllUpcomingEventsModal.module.css';

interface AllUpcomingEventsModalProps {
  events: Event[];
  onClose: () => void;
  onSelectBooking: (url: string, title: string) => void;
}

export default function AllUpcomingEventsModal({
  events,
  onClose,
  onSelectBooking,
}: AllUpcomingEventsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lock scroll and close on Escape key
  useModalDismiss(true, onClose);

  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'All Formats' },
      ...ALL_FORMATS.map((f) => ({ id: f.id, label: f.badgeLabel })),
    ];
  }, []);

  const filteredEvents = useMemo(() => {
    let list = events;
    if (selectedCategory !== 'all') {
      list = list.filter((e) => e.category === selectedCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.speaker && e.speaker.toLowerCase().includes(q)) ||
          (e.venue && e.venue.toLowerCase().includes(q)) ||
          (e.date && e.date.toLowerCase().includes(q))
      );
    }
    return list;
  }, [events, selectedCategory, searchQuery]);

  return (
    <motion.div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="All Upcoming Gatherings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {/* Header Bar */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>All Upcoming Gatherings</h2>
            <p className={styles.modalSubtitle}>
              Explore upcoming lectures and intimate gatherings across all formats
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.searchBox}>
              <input
                type="search"
                placeholder="Search upcoming lectures, speakers, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search upcoming events"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className={styles.categoryBar}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.catPill} ${selectedCategory === cat.id ? styles.catPillActive : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className={styles.contentWrap}>
          {filteredEvents.length === 0 ? (
            <div className={styles.emptyWrap}>
              <p className={styles.emptyText}>
                No upcoming events found {searchQuery ? `matching "${searchQuery}"` : ''}.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredEvents.map((ev) => (
                <div key={ev.id} className={styles.eventCard}>
                  {ev.image && (
                    <div className={styles.imgWrap}>
                      <Image
                        src={ev.image}
                        alt={ev.title}
                        fill
                        sizes="(max-width: 600px) 100vw, 380px"
                        className={styles.cardImg}
                      />
                      {ev.badge && <span className={styles.cardBadge}>{ev.badge}</span>}
                    </div>
                  )}

                  <div className={styles.cardBody}>
                    <div className={styles.cardDateLine}>
                      <span className={styles.cardDate}>{ev.date}</span>
                      {ev.time && ev.time !== '—' && (
                        <span className={styles.cardTime}>· {ev.time}</span>
                      )}
                    </div>

                    <h3 className={styles.cardTitle}>{ev.title}</h3>

                    {ev.speaker && ev.speaker !== '—' && (
                      <p className={styles.cardSpeaker}>Led by {ev.speaker}</p>
                    )}

                    <div className={styles.cardMetaRow}>
                      {ev.venue && ev.venue !== '—' && (
                        <a
                          href={ev.venueMapUrl || (ev as any).venue_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.cardVenue}
                          title={`View ${ev.venue} on Google Maps`}
                        >
                          📍 {ev.venue}
                        </a>
                      )}
                      {ev.price && (
                        <span className={styles.cardPrice}>{formatEventPrice(ev.price)}</span>
                      )}
                    </div>

                    {ev.description && (
                      <p className={styles.cardDesc}>{ev.description}</p>
                    )}

                    <button
                      type="button"
                      className={styles.bookBtn}
                      onClick={() => onSelectBooking(ev.urbanautUrl, ev.title)}
                    >
                      Book Tickets &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
