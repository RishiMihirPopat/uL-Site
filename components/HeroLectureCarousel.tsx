'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import BookingModal from './BookingModal';
import AllUpcomingEventsModal from './AllUpcomingEventsModal';
import { Event } from '../lib/types/event';
import { allUpcomingEventsLabel, checkThemOutLabel } from '../lib/content';
import styles from './HeroLectureCarousel.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;
// Landing entrance: center card first, then its neighbors — sequenced to
// land after Nav's own wordmark/links entrance (see Nav.tsx).
const ENTRANCE_BASE_DELAY = 0.5;
const ENTRANCE_PER_OFFSET_DELAY = 0.15;

interface HeroLectureCarouselProps {
  events: Event[];
  allEvents?: Event[];
}

export default function HeroLectureCarousel({ events, allEvents }: HeroLectureCarouselProps) {
  const displayList = events && events.length > 0 ? events : [];
  const stageRef = useRef<HTMLDivElement>(null);

  // Responsive dimensions for card and gap — renders the active/center card
  // larger than its peeking neighbors; numbers match the Figma frame exactly
  // at full desktop width (side 640.5x449.6, center 750.7x527, ~62px gap),
  // scaled down proportionally at narrower breakpoints (all tiers x0.9 from
  // the exact Figma numbers), keeping the same aspect/size ratio throughout.
  const getCardDims = useCallback(() => {
    if (typeof window === 'undefined') {
      return { cardW: 576, gap: 55.8, cardH: 405, activeCardW: 675, activeCardH: 474.3 };
    }
    if (window.innerWidth <= 480) {
      return { cardW: 198, gap: 18.9, cardH: 139.5, activeCardW: 232.2, activeCardH: 162.9 };
    }
    if (window.innerWidth <= 768) {
      return { cardW: 315, gap: 30.6, cardH: 221.4, activeCardW: 369, activeCardH: 259.2 };
    }
    if (window.innerWidth <= 1400) {
      return { cardW: 414, gap: 40.5, cardH: 290.7, activeCardW: 486, activeCardH: 341.1 };
    }
    return { cardW: 576, gap: 55.8, cardH: 405, activeCardW: 675, activeCardH: 474.3 };
  }, []);

  // Initialized to the same SSR-safe default `getCardDims` returns for
  // `typeof window === 'undefined'` (not `getCardDims()` itself, which
  // would read the real `window.innerWidth` during hydration and mismatch
  // whatever width the server assumed) — the mount effect below corrects
  // it to the real viewport-based value immediately after hydration.
  const [cardDims, setCardDims] = useState({ cardW: 576, gap: 55.8, cardH: 405, activeCardW: 675, activeCardH: 474.3 });
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
  const [isMoving, setIsMoving] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ url: string; title: string } | null>(null);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  // Once the landing entrance has finished, cards mounted later by regular
  // navigation (the infinite window's edges) should appear instantly —
  // only the very first paint gets the staggered reveal.
  const [entranceDone, setEntranceDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setEntranceDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const hasMultiple = displayList.length > 1;

  // Reset if list changes
  useEffect(() => {
    setPage(getInitialIndex());
  }, [displayList.length, getInitialIndex]);

  // Arrows re-appear on a short fixed timer rather than waiting for the
  // (deliberately slow, bouncy) card spring to fully settle — that physics
  // settle can take much longer than the movement actually reads as done.
  useEffect(() => {
    const timer = setTimeout(() => setIsMoving(false), 420);
    return () => clearTimeout(timer);
  }, [page]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setIsMoving(true);
    setPage((prev) => prev + 1);
  }, [hasMultiple]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setIsMoving(true);
    setPage((prev) => prev - 1);
  }, [hasMultiple]);

  // Auto-slideshow every 3 seconds
  useEffect(() => {
    if (!hasMultiple || isPaused || selectedBooking !== null || showAllEventsModal) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3000);

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
  // Slides are laid out on a uniform side-card pitch. The active card is
  // wider, so it (and everything past it) needs a constant offset so the
  // gap to its neighbors stays exactly `gap` on both sides — see slideLeft
  // below. That same offset has to be undone here so the active card's
  // actual (wider) center lands in the middle of the stage, not its
  // hypothetical side-card-width slot.
  const targetX = stageWidth / 2 - page * pitch - cardDims.cardW / 2;

  // Window of offsets rendered around the active page (guarantees infinite seamless loop)
  const windowOffsets = [-3, -2, -1, 0, 1, 2, 3];

  const allActiveEventsList = allEvents && allEvents.length > 0 ? allEvents : displayList;

  return (
    <>
      <div
        className={`${styles.carouselContainer} ${styles.carouselContainerV2}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-roledescription="carousel"
        aria-label="Upcoming Lectures Poster Carousel"
      >
        {/* Carousel Stage (Viewport with soft side edge fade) */}
        <div ref={stageRef} className={`${styles.stage} ${styles.stageV2}`}>
          {hasMultiple ? (
            <motion.div
              className={`${styles.track} ${styles.trackV2}`}
              animate={{ x: isMounted ? targetX : 0 }}
              transition={{
                type: 'spring',
                stiffness: 120,
                damping: 13,
                mass: 0.7,
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

                const slideW = isCurrent ? cardDims.activeCardW : cardDims.cardW;
                const slideH = isCurrent ? cardDims.activeCardH : cardDims.cardH;
                // Active card is centered on its slot, which makes it extend
                // (activeCardW - cardW) / 2 further both left and right than
                // a side card would. Everything at or before the active card
                // must shift left by that same amount, and everything after
                // it must shift right by it, so the gap to the active card's
                // edges stays exactly `gap` — not just for its immediate
                // neighbors, but for slides further out too (they inherit
                // the same constant shift, so their spacing to each other,
                // which never involves the wider card, is untouched).
                const halfExtra = (cardDims.activeCardW - cardDims.cardW) / 2;
                const slideLeft = itemIndex * pitch + (offset <= 0 ? -halfExtra : halfExtra);

                const entranceDelay = entranceDone
                  ? 0
                  : ENTRANCE_BASE_DELAY + Math.abs(offset) * ENTRANCE_PER_OFFSET_DELAY;

                return (
                  <motion.div
                    key={itemIndex}
                    className={styles.slide}
                    style={{ position: 'absolute' }}
                    initial={{ opacity: entranceDone ? 1 : 0, scale: entranceDone ? 1 : 0.85 }}
                    animate={{ left: slideLeft, width: slideW, height: slideH, opacity: 1, scale: 1 }}
                    transition={{
                      left: { type: 'spring', stiffness: 120, damping: 13, mass: 0.7 },
                      width: { type: 'spring', stiffness: 120, damping: 13, mass: 0.7 },
                      height: { type: 'spring', stiffness: 120, damping: 13, mass: 0.7 },
                      opacity: { duration: 0.55, delay: entranceDelay, ease: EASE },
                      scale: { duration: 0.55, delay: entranceDelay, ease: EASE },
                    }}
                  >
                    <div
                      className={`${styles.card} ${isCurrent ? styles.activeCard : styles.inactiveCard} ${styles.cardV2}`}
                      onClick={() => {
                        if (isCurrent) {
                          window.open(ev.urbanautUrl, '_blank', 'noopener,noreferrer');
                        } else if (offset < 0) {
                          handlePrev();
                        } else if (offset > 0) {
                          handleNext();
                        }
                      }}
                      role="button"
                      tabIndex={isCurrent ? 0 : -1}
                      aria-label={`${ev.title} — ${ev.date}`}
                      data-cursor-label={isCurrent ? 'Click to Book!' : undefined}
                    >
                      <div className={styles.posterInner}>
                        {/* Poster Image */}
                        {ev.image ? (
                          <Image
                            src={ev.image}
                            alt={ev.title}
                            fill
                            sizes="(max-width: 600px) 90vw, 560px"
                            className={styles.posterImg}
                            priority={isCurrent}
                          />
                        ) : (
                          <div className={styles.posterPlaceholder}>{ev.title}</div>
                        )}

                        {/* Location + date/time ONLY, no title, no wordmark,
                            no badge/price/CTA — active card only. */}
                        {isCurrent && (
                          <>
                            <div className={styles.posterGradientOverlayV2} aria-hidden="true" />
                            <div className={styles.posterContentV2}>
                              {ev.venue && ev.venue !== '—' && (
                                <p className={styles.posterMetaV2}>{ev.venue}</p>
                              )}
                              {(ev.date || (ev.time && ev.time !== '—')) && (
                                <p className={styles.posterMetaV2}>
                                  {ev.date}
                                  {ev.time && ev.time !== '—' && ` @ ${ev.time}`}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            // Single item fallback
            <div className={styles.singleItemWrap}>
              <motion.div
                className={`${styles.card} ${styles.activeCard} ${styles.cardV2}`}
                style={{ width: cardDims.activeCardW, height: cardDims.activeCardH, margin: '0 auto' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, delay: ENTRANCE_BASE_DELAY, ease: EASE }}
                onClick={() =>
                  window.open(displayList[0].urbanautUrl, '_blank', 'noopener,noreferrer')
                }
                role="button"
                tabIndex={0}
                data-cursor-label="Click to Book!"
              >
                <div className={styles.posterInner}>
                  {displayList[0].image ? (
                    <Image
                      src={displayList[0].image}
                      alt={displayList[0].title}
                      fill
                      sizes="(max-width: 600px) 90vw, 560px"
                      className={styles.posterImg}
                      priority
                    />
                  ) : (
                    <div className={styles.posterPlaceholder}>{displayList[0].title}</div>
                  )}
                  <div className={styles.posterGradientOverlayV2} aria-hidden="true" />
                  <div className={styles.posterContentV2}>
                    {displayList[0].venue && displayList[0].venue !== '—' && (
                      <p className={styles.posterMetaV2}>{displayList[0].venue}</p>
                    )}
                    {(displayList[0].date || (displayList[0].time && displayList[0].time !== '—')) && (
                      <p className={styles.posterMetaV2}>
                        {displayList[0].date}
                        {displayList[0].time && displayList[0].time !== '—' && ` @ ${displayList[0].time}`}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Arrow buttons — anchored to the active card's constant on-screen
              slot (it never moves — the track always centers it), not to any
              individual slide, so they can fade out/in around a page turn
              without racing the per-slide remounts of the infinite window.
              Figma node 124:2229 exact offsets (see .arrowBtnV2* below). */}
          {hasMultiple && (
            <div
              className={styles.arrowsAnchorV2}
              style={{
                left: stageWidth / 2 - cardDims.activeCardW / 2,
                width: cardDims.activeCardW,
                height: cardDims.activeCardH,
              }}
            >
              <AnimatePresence>
                {!isMoving && entranceDone && (
                  <>
                    <motion.button
                      key="prev"
                      type="button"
                      className={`${styles.arrowBtnV2} ${styles.arrowBtnV2Prev}`}
                      onClick={handlePrev}
                      aria-label="Previous lecture poster"
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      transition={{ type: 'spring', stiffness: 1100, damping: 30, mass: 0.15 }}
                    >
                      <img src="/custom-assets/arrow-prev.svg" alt="" />
                    </motion.button>
                    <motion.button
                      key="next"
                      type="button"
                      className={`${styles.arrowBtnV2} ${styles.arrowBtnV2Next}`}
                      onClick={handleNext}
                      aria-label="Next lecture poster"
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      transition={{ type: 'spring', stiffness: 1100, damping: 30, mass: 0.15 }}
                    >
                      <img src="/custom-assets/arrow-next.svg" alt="" />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* 'All Upcoming Events' Button */}
        <motion.div
          className={styles.allEventsBtnWrapV2}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5, ease: EASE }}
        >
          <button
            type="button"
            className={styles.allEventsBtnV2}
            onClick={() => setShowAllEventsModal(true)}
          >
            <span className={styles.allEventsBtnTextWrapV2}>
              <span className={styles.allEventsBtnTextV2}>{allUpcomingEventsLabel}</span>
              <span className={styles.allEventsBtnTextV2}>{checkThemOutLabel}</span>
            </span>
          </button>
        </motion.div>
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
