'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
  const stageRef = useRef<HTMLDivElement>(null);

  // Responsive dimensions for card and gap
  const getCardDims = useCallback(() => {
    if (typeof window === 'undefined') return { cardW: 360, gap: 20, cardH: 240 };
    if (window.innerWidth <= 480) return { cardW: 260, gap: 14, cardH: 175 };
    if (window.innerWidth <= 768) return { cardW: 300, gap: 16, cardH: 200 };
    return { cardW: 360, gap: 20, cardH: 240 };
  }, []);

  const [cardDims, setCardDims] = useState({ cardW: 360, gap: 20, cardH: 240 });
  const [stageWidth, setStageWidth] = useState(600);
  const [isMounted, setIsMounted] = useState(false);

  // Measure stage and window
  useEffect(() => {
    setIsMounted(true);
    setCardDims(getCardDims());

    const updateDimensions = () => {
      setCardDims(getCardDims());
      if (stageRef.current) {
        setStageWidth(stageRef.current.offsetWidth);
      }
    };

    updateDimensions();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setStageWidth(entry.contentRect.width);
      }
    });

    if (stageRef.current) {
      ro.observe(stageRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [getCardDims]);

  // Default to the soonest upcoming event based on today's date
  const getInitialIndex = useCallback(() => {
    if (displayList.length === 0) return 0;
    const today = new Date().toISOString().slice(0, 10);
    const idx = displayList.findIndex((e) => (e.date || '') >= today);
    return idx >= 0 ? idx : 0;
  }, [displayList]);

  // Pure infinite page index (can increment/decrement infinitely without ever running out)
  const [page, setPage] = useState(getInitialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ url: string; title: string } | null>(null);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);

  const hasMultiple = displayList.length > 1;

  // Active dot index (0 .. displayList.length - 1)
  const activeDotIndex = hasMultiple
    ? ((page % displayList.length) + displayList.length) % displayList.length
    : 0;

  // Reset if list changes
  useEffect(() => {
    setPage(getInitialIndex());
  }, [displayList.length, getInitialIndex]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setPage((prev) => prev + 1);
  }, [hasMultiple]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setPage((prev) => prev - 1);
  }, [hasMultiple]);

  const goTo = useCallback(
    (targetDotIndex: number) => {
      if (!hasMultiple || targetDotIndex === activeDotIndex) return;
      let diff = targetDotIndex - activeDotIndex;
      // Choose the shortest circular path
      const half = displayList.length / 2;
      if (diff > half) diff -= displayList.length;
      if (diff < -half) diff += displayList.length;
      setPage((prev) => prev + diff);
    },
    [activeDotIndex, displayList.length, hasMultiple]
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

  if (displayList.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <p className={styles.emptyText}>No upcoming events found.</p>
      </div>
    );
  }

  const pitch = cardDims.cardW + cardDims.gap;
  // Center the card at page index in the horizontal center of the stage
  const targetX = stageWidth / 2 - page * pitch - cardDims.cardW / 2;

  // Window of offsets rendered around the active page (guarantees infinite seamless loop)
  const windowOffsets = [-3, -2, -1, 0, 1, 2, 3];

  const allActiveEventsList = allEvents && allEvents.length > 0 ? allEvents : displayList;

  return (
    <>
      <div
        className={styles.carouselContainer}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
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

        {/* Carousel Stage (Viewport with soft side edge fade) */}
        <div ref={stageRef} className={styles.stage}>
          {hasMultiple ? (
            <motion.div
              className={styles.track}
              animate={{ x: isMounted ? targetX : 0 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 30,
                mass: 0.8,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                const offset = info.offset.x;
                const velocity = info.velocity.x;
                if (offset < -40 || velocity < -400) {
                  handleNext();
                } else if (offset > 40 || velocity > 400) {
                  handlePrev();
                }
              }}
            >
              {windowOffsets.map((offset) => {
                const itemIndex = page + offset;
                const evIndex =
                  ((itemIndex % displayList.length) + displayList.length) % displayList.length;
                const ev = displayList[evIndex];
                const isCurrent = offset === 0;

                return (
                  <div
                    key={itemIndex}
                    className={styles.slide}
                    style={{
                      position: 'absolute',
                      left: itemIndex * pitch,
                      width: cardDims.cardW,
                      height: cardDims.cardH,
                    }}
                  >
                    <div
                      className={`${styles.card} ${isCurrent ? styles.activeCard : styles.inactiveCard}`}
                      style={{
                        height: cardDims.cardH,
                      }}
                      onClick={() => {
                        if (isCurrent) {
                          setSelectedBooking({ url: ev.urbanautUrl, title: ev.title });
                        } else if (offset < 0) {
                          handlePrev();
                        } else if (offset > 0) {
                          handleNext();
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
                            sizes="(max-width: 600px) 90vw, 420px"
                            className={styles.posterImg}
                            priority={isCurrent}
                          />
                        ) : (
                          <div className={styles.posterPlaceholder}>{ev.title}</div>
                        )}

                        {/* Smooth dark gradient overlay for crystal-clear readability */}
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
                  </div>
                );
              })}
            </motion.div>
          ) : (
            // Single item fallback
            <div className={styles.singleItemWrap}>
              <div
                className={`${styles.card} ${styles.activeCard}`}
                style={{ width: cardDims.cardW, height: cardDims.cardH, margin: '0 auto' }}
                onClick={() =>
                  setSelectedBooking({ url: displayList[0].urbanautUrl, title: displayList[0].title })
                }
                role="button"
                tabIndex={0}
              >
                <div className={styles.posterInner}>
                  {displayList[0].image ? (
                    <Image
                      src={displayList[0].image}
                      alt={displayList[0].title}
                      fill
                      sizes="(max-width: 600px) 90vw, 420px"
                      className={styles.posterImg}
                      priority
                    />
                  ) : (
                    <div className={styles.posterPlaceholder}>{displayList[0].title}</div>
                  )}
                  <div className={styles.posterGradientOverlay} aria-hidden="true" />
                  <div className={styles.posterContent}>
                    <div className={styles.eyebrowRow}>
                      <span className={styles.eyebrow}>
                        {displayList[0].date}
                        {displayList[0].time && displayList[0].time !== '—' && ` · ${displayList[0].time}`}
                      </span>
                      {displayList[0].badge && (
                        <span className={styles.posterBadge}>{displayList[0].badge}</span>
                      )}
                    </div>
                    <h2 className={styles.posterTitle}>{displayList[0].title}</h2>
                    <div className={styles.metaRow}>
                      {displayList[0].venue && displayList[0].venue !== '—' && (
                        <span className={styles.posterVenue}>{displayList[0].venue}</span>
                      )}
                      {displayList[0].price && (
                        <span className={styles.posterPrice}>
                          {formatEventPrice(displayList[0].price)}
                        </span>
                      )}
                    </div>
                    <div className={styles.footerRow}>
                      <span className={styles.formatTag}>unLecture</span>
                      <span className={styles.bookCta}>Book Tickets &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                aria-label={`Go to poster ${i + 1}`}
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
