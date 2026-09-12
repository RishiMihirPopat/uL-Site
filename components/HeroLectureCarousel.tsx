'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import BookingModal from './BookingModal';
import AllUpcomingEventsModal from './AllUpcomingEventsModal';
import { formatEventPrice } from '../lib/utils/formatPrice';
import { Event } from '../lib/types/event';
import styles from './HeroLectureCarousel.module.css';

interface HeroLectureCarouselProps {
  events: Event[];
  allEvents?: Event[];
}

export default function HeroLectureCarousel({ events, allEvents }: HeroLectureCarouselProps) {
  const displayList = events && events.length > 0 ? events : [];

  // Default to the soonest upcoming event based on today's date
  const getInitialIndex = useCallback(() => {
    if (displayList.length === 0) return 0;
    const today = new Date().toISOString().slice(0, 10);
    const idx = displayList.findIndex((e) => (e.date || '') >= today);
    return idx >= 0 ? idx : 0;
  }, [displayList]);

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ url: string; title: string } | null>(null);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);

  // Drag / swipe state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentDeltaXRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  // Auto-slideshow every 8 seconds (continuous circular scroll)
  useEffect(() => {
    if (displayList.length <= 1 || isPaused || selectedBooking !== null || showAllEventsModal) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [displayList.length, isPaused, selectedBooking, showAllEventsModal]);

  const goTo = useCallback(
    (index: number) => {
      if (displayList.length === 0) return;
      const normalized = ((index % displayList.length) + displayList.length) % displayList.length;
      setCurrentIndex(normalized);
    },
    [displayList.length]
  );

  const handleNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const handlePrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedBooking !== null || showAllEventsModal) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, selectedBooking, showAllEventsModal]);

  // Mouse drag & touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    currentDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    currentDeltaXRef.current = e.touches[0].clientX - startXRef.current;
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dx = currentDeltaXRef.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
    currentDeltaXRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    currentDeltaXRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    currentDeltaXRef.current = e.clientX - startXRef.current;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dx = currentDeltaXRef.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
    currentDeltaXRef.current = 0;
  };

  if (displayList.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <p className={styles.emptyText}>No upcoming events found.</p>
      </div>
    );
  }

  const allActiveEventsList = allEvents && allEvents.length > 0 ? allEvents : displayList;

  return (
    <>
      <div
        className={styles.carouselContainer}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          isDraggingRef.current = false;
        }}
        aria-roledescription="carousel"
        aria-label="Upcoming Lectures Poster Carousel"
      >
        {/* Top bar with Label and Arrow buttons */}
        <div className={styles.topNav}>
          <span className={styles.topLabel}>Upcoming Lectures</span>
          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={handlePrev}
              aria-label="Previous lecture poster"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={handleNext}
              aria-label="Next lecture poster"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* 3D Peeking Carousel Stage */}
        <div
          ref={stageRef}
          className={styles.stage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {displayList.map((ev, index) => {
            // Circular shortest distance from currentIndex
            let dist = index - currentIndex;
            const half = displayList.length / 2;
            if (dist > half) dist -= displayList.length;
            if (dist < -half) dist += displayList.length;

            const isCurrent = dist === 0;
            const isNeighbor = Math.abs(dist) === 1;

            let cardStateClass = styles.hiddenCard;
            if (isCurrent) cardStateClass = styles.activeCard;
            else if (dist === 1) cardStateClass = styles.rightNeighborCard;
            else if (dist === -1) cardStateClass = styles.leftNeighborCard;

            return (
              <div
                key={ev.id}
                className={`${styles.posterCard} ${cardStateClass}`}
                onClick={() => {
                  if (Math.abs(currentDeltaXRef.current) > 10) return; // ignore click if dragged
                  if (isCurrent) {
                    setSelectedBooking({ url: ev.urbanautUrl, title: ev.title });
                  } else {
                    goTo(index);
                  }
                }}
                role="button"
                tabIndex={isCurrent ? 0 : -1}
                aria-label={`${ev.title} — ${ev.date}`}
              >
                <div className={styles.posterInner}>
                  {/* Poster Image */}
                  {ev.image ? (
                    <Image
                      src={ev.image}
                      alt={ev.title}
                      fill
                      sizes="(max-width: 600px) 90vw, 460px"
                      className={styles.posterImg}
                      priority={isCurrent}
                    />
                  ) : (
                    <div className={styles.posterPlaceholder}>{ev.title}</div>
                  )}

                  {/* Gradient shadow overlay for crystal-clear readability */}
                  <div className={styles.posterGradientOverlay} aria-hidden="true" />

                  {/* Poster Content Overlay */}
                  <div className={styles.posterContent}>
                    <div className={styles.eyebrowRow}>
                      <span className={styles.eyebrow}>
                        {ev.date}
                        {ev.time && ev.time !== '—' && ` · ${ev.time}`}
                      </span>
                      {ev.badge && <span className={styles.posterBadge}>{ev.badge}</span>}
                    </div>

                    <h2 className={styles.posterTitle}>{ev.title}</h2>

                    <div className={styles.metaRow}>
                      {ev.venue && ev.venue !== '—' && (
                        <span className={styles.posterVenue}>{ev.venue}</span>
                      )}
                      {ev.price && (
                        <span className={styles.posterPrice}>{formatEventPrice(ev.price)}</span>
                      )}
                    </div>

                    <div className={styles.footerRow}>
                      <span className={styles.formatTag}>
                        {ev.category === 'grounds-for-thought'
                          ? 'Grounds for Thought'
                          : ev.category === 'unlecture-series'
                          ? 'unLecture Series'
                          : ev.category === 'community'
                          ? 'Community'
                          : 'unLecture'}
                      </span>
                      <span className={styles.bookCta}>Book Tickets &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Dot indicators */}
        <div className={styles.dotsWrap}>
          {displayList.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to poster ${i + 1}`}
            />
          ))}
        </div>

        {/* Constant 'All Upcoming Events' Button centered below posters */}
        <div className={styles.allEventsBtnWrap}>
          <button
            type="button"
            className={styles.allEventsBtn}
            onClick={() => setShowAllEventsModal(true)}
          >
            All Upcoming Events &rarr;
          </button>
        </div>
      </div>

      {/* Booking Modal iframe view */}
      {selectedBooking && (
        <BookingModal
          url={selectedBooking.url}
          title={selectedBooking.title}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* All Upcoming Events Modal */}
      {showAllEventsModal && (
        <AllUpcomingEventsModal
          events={allActiveEventsList}
          onClose={() => setShowAllEventsModal(false)}
          onSelectBooking={(url, title) => {
            setShowAllEventsModal(false);
            setSelectedBooking({ url, title });
          }}
        />
      )}
    </>
  );
}
