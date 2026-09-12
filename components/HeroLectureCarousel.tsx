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

  // Extended list with clones at each end for smooth, seamless infinite sliding
  // If displayList = [A, B, C, D, E], extendedList = [E, A, B, C, D, E, A]
  const hasMultiple = displayList.length > 1;
  const extendedList = hasMultiple
    ? [displayList[displayList.length - 1], ...displayList, displayList[0]]
    : displayList;

  // trackIndex: index 1 maps to real index 0 in displayList
  const [trackIndex, setTrackIndex] = useState(() => (hasMultiple ? getInitialIndex() + 1 : 0));
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ url: string; title: string } | null>(null);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);

  // Drag / swipe state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const deltaXRef = useRef(0);
  const isAnimatingRef = useRef(false);

  // Active dot index (0 .. displayList.length - 1)
  const activeDotIndex = hasMultiple
    ? (trackIndex - 1 + displayList.length) % displayList.length
    : 0;

  // Reset trackIndex if displayList changes
  useEffect(() => {
    if (hasMultiple) {
      setTrackIndex(getInitialIndex() + 1);
    } else {
      setTrackIndex(0);
    }
  }, [displayList.length, getInitialIndex, hasMultiple]);

  // Re-enable CSS transition on next animation frames after silent snap
  useEffect(() => {
    if (!isTransitioning) {
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(id2);
      });
      return () => cancelAnimationFrame(id1);
    }
  }, [isTransitioning]);

  // Handle transition end for seamless infinite looping
  const handleTransitionEnd = useCallback(() => {
    isAnimatingRef.current = false;
    if (!hasMultiple) return;

    if (trackIndex >= displayList.length + 1) {
      // Reached end clone (clone of index 0) -> jump silently to real index 0 (slot 1)
      setIsTransitioning(false);
      setTrackIndex(1);
    } else if (trackIndex <= 0) {
      // Reached start clone (clone of last index) -> jump silently to real last index
      setIsTransitioning(false);
      setTrackIndex(displayList.length);
    }
  }, [displayList.length, hasMultiple, trackIndex]);

  // Safety timer in case onTransitionEnd doesn't fire
  useEffect(() => {
    if (isAnimatingRef.current) {
      const timer = setTimeout(() => {
        isAnimatingRef.current = false;
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [trackIndex]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev + 1);
  }, [hasMultiple]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev - 1);
  }, [hasMultiple]);

  const goTo = useCallback(
    (realIndex: number) => {
      if (!hasMultiple || isAnimatingRef.current || realIndex === activeDotIndex) return;
      isAnimatingRef.current = true;
      setIsTransitioning(true);
      setTrackIndex(realIndex + 1);
    },
    [activeDotIndex, hasMultiple]
  );

  // Auto-slideshow every 8 seconds
  useEffect(() => {
    if (!hasMultiple || isPaused || selectedBooking !== null || showAllEventsModal) return;

    const timer = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(timer);
  }, [handleNext, hasMultiple, isPaused, selectedBooking, showAllEventsModal]);

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

  // Swipe / Drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    deltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    deltaXRef.current = e.touches[0].clientX - startXRef.current;
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dx = deltaXRef.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
    deltaXRef.current = 0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    deltaXRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    deltaXRef.current = e.clientX - startXRef.current;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const dx = deltaXRef.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
    deltaXRef.current = 0;
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
        {/* Top Nav: Label + Counter + Arrow Controls */}
        <div className={styles.topNav}>
          <span className={styles.topLabel}>Upcoming Lectures</span>
          <div className={styles.navRight}>
            {hasMultiple && (
              <span className={styles.slideCounter}>
                {String(activeDotIndex + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(displayList.length).padStart(2, '0')}
              </span>
            )}
            {hasMultiple && (
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
            )}
          </div>
        </div>

        {/* Carousel Stage & Flat Sliding Track */}
        <div
          className={styles.stage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className={`${styles.track} ${isTransitioning ? styles.trackAnimated : ''}`}
            style={{
              transform: hasMultiple ? `translateX(-${trackIndex * 100}%)` : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedList.map((ev, index) => {
              const isCurrent = hasMultiple ? index === trackIndex : true;
              return (
                <div key={`${ev.id}-${index}`} className={styles.slide}>
                  <div
                    className={styles.card}
                    onClick={() => {
                      if (Math.abs(deltaXRef.current) > 10) return;
                      setSelectedBooking({ url: ev.urbanautUrl, title: ev.title });
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
                          sizes="(max-width: 600px) 100vw, 520px"
                          className={styles.posterImg}
                          priority={index === 1}
                        />
                      ) : (
                        <div className={styles.posterPlaceholder}>{ev.title}</div>
                      )}

                      {/* Smooth dark gradient overlay for effortless readability */}
                      <div className={styles.posterGradientOverlay} aria-hidden="true" />

                      {/* Poster Content */}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots Indicator */}
        {hasMultiple && (
          <div className={styles.dotsWrap}>
            {displayList.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === activeDotIndex ? styles.dotActive : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* 'All Upcoming Events' Button */}
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

      {/* Booking Modal */}
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
