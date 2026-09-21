'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import BookingModal from './BookingModal';
import { formatEventPrice } from '../lib/utils/formatPrice';
import { EASE } from '@/lib/constants/animation';
import type { Event } from '../lib/db';
import styles from './EventCard.module.css';

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export default function EventCard({ event, index = 0 }: { event: Event; index?: number }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.55,
          delay: index * 0.08 + 0.1,
          ease: EASE,
        }}
      >
        {/* Tape strip */}
        <div className={styles.tape} aria-hidden="true" />

        {/* Cover image */}
        {event.image && (
          <div className={styles.imgWrap}>
            <Image
              src={event.image}
              alt={`${event.title} — ${event.venue}`}
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
              className={styles.img}
            />
          </div>
        )}

        <div className={styles.cardBody}>
          <div className={styles.bodyTop}>
            {/* Header line: Date & Time + Special Badge */}
            <div className={styles.dateLine}>
              <span className={styles.dateText}>{event.date}</span>
              {event.time && event.time !== '—' && (
                <>
                  <span className={styles.dateDivider} aria-hidden="true">·</span>
                  <span className={styles.dateTime}>{event.time}</span>
                </>
              )}
              {event.badge && (
                <span className={styles.cardBadge}>{event.badge}</span>
              )}
            </div>

            {/* Event Title */}
            <h2 className={styles.cardTitle}>{event.title}</h2>

            {/* Speaker */}
            {event.speaker && event.speaker !== '—' && (
              <p className={styles.cardSpeaker}>{event.speaker}</p>
            )}
          </div>

          <div className={styles.bodyBottom}>
            {/* Consolidated Venue, Price & Action Row */}
            <div className={styles.cardMeta}>
              {event.venue && event.venue !== '—' ? (
                <a
                  href={event.venueMapUrl || event.venue_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardVenueLink}
                  title={`View ${event.venue} on Google Maps`}
                >
                  <span className={styles.venueText}>{event.venue}</span>
                  <ArrowUpRight className={styles.arrowIcon} />
                </a>
              ) : (
                <span />
              )}
              <div className={styles.actionWrap}>
                <span className={styles.cardPrice}>{formatEventPrice(event.price)}</span>
                <button
                  className={styles.bookBtn}
                  onClick={() => setModalOpen(true)}
                >
                  <span>Book Now</span>
                  <ArrowUpRight className={styles.btnArrowIcon} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      {modalOpen && (
        <BookingModal
          url={event.urbanautUrl}
          title={event.title}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
