'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import BookingModal from './BookingModal';
import type { Event } from '../lib/db';
import styles from './EventCard.module.css';

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
          ease: [0.16, 1, 0.3, 1],
        }}
      >

        {/* Tape strip */}
        <div className={styles.tape} aria-hidden="true" />

        {/* Cover image — only rendered when image path is provided */}
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

          <div className={styles.dateLine}>
            <span className={styles.dateText}>{event.date}</span>
            {event.time !== '—' && (
              <>
                <span className={styles.dateDivider} aria-hidden="true">·</span>
                <span className={styles.dateTime}>{event.time}</span>
              </>
            )}
          </div>

          <h2 className={styles.cardTitle}>{event.title}</h2>

          {event.speaker !== '—' && (
            <p className={styles.cardSpeaker}>{event.speaker}</p>
          )}

          <div className={styles.cardMeta}>
            {event.venue !== '—' && (
              <span className={styles.cardVenue}>{event.venue}</span>
            )}
            <span className={styles.cardPrice}>{event.price}</span>
          </div>

          {event.description && (
            <p className={styles.cardDesc}>{event.description}</p>
          )}

          <button
            className={styles.bookBtn}
            onClick={() => setModalOpen(true)}
          >
            Book Now
          </button>

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
