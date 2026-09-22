'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { EASE } from '@/lib/constants/animation';
import styles from '../app/page.module.css';

const MOBILE_AUTOPLAY_MS = 15000;

interface FormatItem {
  id?: string;
  name: string;
  shortLabel: string[];
  desc: string;
  imgV2: string;
  alt: string;
}

interface HowWeGatherSectionProps {
  heading: string;
  hoverLabel: string;
  mobileLabel: string;
  formats: FormatItem[];
}

/** Fisher-Yates, run once per mount so the "random card order" reveal is
 *  stable across re-renders rather than re-shuffling on every one. */
function shuffledOrder(count: number) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** How We Gather — node 126:2301. The wave shape peeks into the initial
 *  viewport at page load, so it gets its own mount-based delayed entrance
 *  instead of waiting on a scroll trigger; everything else in the section
 *  (which is fully below the fold) reveals on scroll, in the requested
 *  order: the two texts together, then the cards in random order, then
 *  the doodles last. Kept as its own client component — HomeView is a
 *  server component (direct DB reads) and this needs per-card random
 *  delays that don't fit the generic FadeIn/FadeInItem stagger helper. */
export default function HowWeGatherSection({ heading, hoverLabel, mobileLabel, formats }: HowWeGatherSectionProps) {
  // Maps each card's DOM index to its position in the random reveal order.
  const revealPosition = useMemo(() => {
    const order = shuffledOrder(formats.length);
    const byIndex: number[] = new Array(formats.length);
    order.forEach((cardIndex, position) => { byIndex[cardIndex] = position; });
    return byIndex;
  }, [formats.length]);

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(390);
  const [isMounted, setIsMounted] = useState(false);

  // Responsive card dimensions for mobile carousel
  const getCardDims = useCallback(() => {
    if (typeof window === 'undefined') {
      return { cardW: 232, gap: 16, cardH: 252.6, activeCardW: 260, activeCardH: 283.1 };
    }
    if (window.innerWidth <= 380) {
      return { cardW: 220, gap: 14, cardH: 239.5, activeCardW: 248, activeCardH: 270.0 };
    }
    if (window.innerWidth <= 480) {
      return { cardW: 232, gap: 16, cardH: 252.6, activeCardW: 260, activeCardH: 283.1 };
    }
    return { cardW: 248, gap: 20, cardH: 270.0, activeCardW: 278, activeCardH: 302.7 };
  }, []);

  const router = useRouter();

  const [cardDims, setCardDims] = useState({ cardW: 232, gap: 16, cardH: 252.6, activeCardW: 260, activeCardH: 283.1 });

  // Pure infinite page index
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isMoving) return;
    const timer = setTimeout(() => setIsMoving(false), 420);
    return () => clearTimeout(timer);
  }, [isMoving]);

  // Gesture refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const touchDiffX = useRef(0);
  const isSwiping = useRef(false);
  const isScrolling = useRef(false);
  const didSwipe = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Mouse drag refs
  const mouseStartX = useRef(0);
  const mouseStartTime = useRef(0);
  const mouseDiffX = useRef(0);
  const isMouseDown = useRef(false);
  const isMouseDragging = useRef(false);

  const hasMultiple = formats && formats.length > 1;

  // Measure stage width and window resize
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

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleNext = useCallback(
    (count = 1) => {
      if (!hasMultiple) return;
      setIsMoving(true);
      setPage((prev) => prev + count);
    },
    [hasMultiple]
  );

  const handlePrev = useCallback(
    (count = 1) => {
      if (!hasMultiple) return;
      setIsMoving(true);
      setPage((prev) => prev - count);
    },
    [hasMultiple]
  );

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!hasMultiple || e.touches.length > 1 || isMoving) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      touchDiffX.current = 0;
      isSwiping.current = false;
      isScrolling.current = false;
      didSwipe.current = false;
      setIsPaused(true);
    },
    [hasMultiple, isMoving]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!hasMultiple || e.touches.length > 1 || isScrolling.current) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - touchStartX.current;
      const diffY = currentY - touchStartY.current;

      if (!isSwiping.current) {
        // If vertical scroll detected, let native browser scroll take over
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
          isScrolling.current = true;
          return;
        }
        // If horizontal swipe detected, lock into swiping mode
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
          isSwiping.current = true;
          didSwipe.current = true;
        }
      }

      if (isSwiping.current) {
        touchDiffX.current = diffX;
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            setTouchOffset(touchDiffX.current);
            rafRef.current = null;
          });
        }
      }
    },
    [hasMultiple]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPaused(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (isSwiping.current) {
      const elapsed = Math.max(Date.now() - touchStartTime.current, 1);
      const diffX = touchDiffX.current;
      const velocity = diffX / elapsed;
      const pitch = cardDims.cardW + cardDims.gap;
      const count = Math.max(1, Math.round(Math.abs(diffX) / pitch));

      if (diffX < -40 || velocity < -0.3) {
        setIsMoving(true);
        handleNext(count);
      } else if (diffX > 40 || velocity > 0.3) {
        setIsMoving(true);
        handlePrev(count);
      }

      setTouchOffset(0);
      touchDiffX.current = 0;
      isSwiping.current = false;
      setTimeout(() => {
        didSwipe.current = false;
      }, 400);
    } else {
      setTouchOffset(0);
      touchDiffX.current = 0;
      didSwipe.current = false;
    }
    isScrolling.current = false;
  }, [cardDims.cardW, cardDims.gap, handleNext, handlePrev]);

  const handleTouchCancel = useCallback(() => {
    setIsPaused(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTouchOffset(0);
    touchDiffX.current = 0;
    isSwiping.current = false;
    isScrolling.current = false;
    setTimeout(() => {
      didSwipe.current = false;
    }, 400);
  }, []);

  // Desktop/mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!hasMultiple || e.button !== 0 || isMoving) return;
      isMouseDown.current = true;
      isMouseDragging.current = false;
      mouseStartX.current = e.clientX;
      mouseStartTime.current = Date.now();
      mouseDiffX.current = 0;
      didSwipe.current = false;
      setIsPaused(true);
    },
    [hasMultiple, isMoving]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      const diffX = e.clientX - mouseStartX.current;
      if (!isMouseDragging.current && Math.abs(diffX) > 6) {
        isMouseDragging.current = true;
        didSwipe.current = true;
      }
      if (isMouseDragging.current) {
        mouseDiffX.current = diffX;
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            setTouchOffset(mouseDiffX.current);
            rafRef.current = null;
          });
        }
      }
    };

    const handleMouseUp = () => {
      if (!isMouseDown.current) return;
      isMouseDown.current = false;
      setIsPaused(false);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (isMouseDragging.current) {
        const elapsed = Math.max(Date.now() - mouseStartTime.current, 1);
        const diffX = mouseDiffX.current;
        const velocity = diffX / elapsed;
        const pitch = cardDims.cardW + cardDims.gap;
        const count = Math.max(1, Math.round(Math.abs(diffX) / pitch));

        if (diffX < -40 || velocity < -0.3) {
          setIsMoving(true);
          handleNext(count);
        } else if (diffX > 40 || velocity > 0.3) {
          setIsMoving(true);
          handlePrev(count);
        }

        setTouchOffset(0);
        mouseDiffX.current = 0;
        isMouseDragging.current = false;
        setTimeout(() => {
          didSwipe.current = false;
        }, 400);
      } else {
        setTouchOffset(0);
        mouseDiffX.current = 0;
        didSwipe.current = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cardDims.cardW, cardDims.gap, handleNext, handlePrev]);

  // Autoplay every 15s — restarts interval cleanly on page changes
  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, MOBILE_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [page, handleNext, hasMultiple, isPaused]);

  // Content (heading, cards/mobile carousel, doodles) must only start
  // revealing once the wave background has actually finished appearing —
  // same "wait for the thing behind it" gate AsSeenInSection uses for its
  // own wave, rather than two independent timers that could race if the
  // user scrolls to this section quickly. `whileInView` alone can't
  // express "and also wait for this other condition", so both triggers
  // are tracked explicitly and combined into one `ready` flag that
  // drives a plain `animate` instead.
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const waveImgRef = useRef<HTMLImageElement>(null);
  const [waveLoaded, setWaveLoaded] = useState(false);
  const [waveAnimDone, setWaveAnimDone] = useState(false);

  useEffect(() => {
    if (waveImgRef.current?.complete) setWaveLoaded(true);
  }, []);

  useEffect(() => {
    if (!waveLoaded) return;
    const timer = setTimeout(() => setWaveAnimDone(true), (0.9 + 0.8) * 1000);
    return () => clearTimeout(timer);
  }, [waveLoaded]);

  const ready = inView && waveAnimDone;

  const pitch = cardDims.cardW + cardDims.gap;
  const targetX = stageWidth / 2 - page * pitch - cardDims.cardW / 2;

  const windowOffsets = [-3, -2, -1, 0, 1, 2, 3];
  const activeIndex = ((page % formats.length) + formats.length) % formats.length;
  const activeFormat = formats[activeIndex];

  return (
    <section id="formats" ref={sectionRef} className={styles.gatherV2}>
      <picture className={styles.pictureContentsV2}>
        <source media="(max-width: 900px)" srcSet="/wavy-shapes/mobile/gather-wavy-shape.png" />
        <motion.img
          ref={waveImgRef}
          src="/wavy-shapes/website/gather-wavy-shape.png"
          alt=""
          className={styles.gatherWaveImgV2}
          aria-hidden="true"
          initial={{ opacity: 0, y: 24 }}
          animate={waveLoaded ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
          onLoad={() => setWaveLoaded(true)}
        />
      </picture>

      <motion.div
        className={styles.gatherInnerV2}
        initial="hidden"
        animate={ready ? 'visible' : 'hidden'}
        variants={{ hidden: {}, visible: { transition: { delayChildren: 0.15 } } }}
      >
        {/* Two texts, together, first */}
        <motion.h2
          className={styles.gatherHeadingV2}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          {heading}
        </motion.h2>
        <motion.p
          className={styles.knowEventsV2}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          {hoverLabel}
        </motion.p>
        <motion.p
          className={styles.gatherSubtitleMobileV2}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          {mobileLabel}
        </motion.p>

        {/* Cards, in random order — desktop only, CSS-hidden on mobile.
            Clicking a card routes to /events filtered for that format's upcoming events. */}
        <div className={styles.ticketRowV2}>
          {formats.map((f, i) => (
            <motion.div
              key={f.name}
              className={styles.ticketCardV2}
              data-cursor-desc={f.desc}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.92 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.55, ease: EASE, delay: 0.35 + revealPosition[i] * 0.15 },
                },
              }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 450, damping: 17 }}
            >
              <Link
                href={`/events?type=upcoming&format=${f.id || ''}`}
                className={styles.ticketCardLinkV2}
                aria-label={`${f.name} upcoming events`}
              >
                <div className={styles.ticketPhotoV2}>
                  <Image src={f.imgV2} alt={f.alt} fill sizes="345px" />
                </div>
                <p className={styles.ticketLabelV2}>
                  {f.shortLabel.map((line, li) => (
                    <React.Fragment key={li}>
                      {li > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Multi-card peek carousel — mobile only, CSS-hidden on desktop. */}
        <motion.div
          className={styles.gatherMobileWrapV2}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          {/* Carousel Stage (multi-card peek track) */}
          <div
            ref={stageRef}
            className={styles.gatherMobileStage}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onDragStart={(e) => e.preventDefault()}
            aria-roledescription="carousel"
            aria-label="How We Gather Formats Carousel"
          >
            <motion.div
              className={styles.gatherMobileTrack}
              animate={{ x: isMounted ? targetX + touchOffset : 0 }}
              transition={
                touchOffset !== 0
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 120,
                      damping: 13,
                      mass: 0.7,
                    }
              }
            >
              {windowOffsets.map((offset) => {
                const itemIndex = page + offset;
                const fIndex =
                  ((itemIndex % formats.length) + formats.length) % formats.length;
                const f = formats[fIndex];
                const isCurrent = offset === 0;

                const slideW = isCurrent ? cardDims.activeCardW : cardDims.cardW;
                const slideH = isCurrent ? cardDims.activeCardH : cardDims.cardH;
                const halfExtra = (cardDims.activeCardW - cardDims.cardW) / 2;
                const slideLeft = itemIndex * pitch + (offset <= 0 ? -halfExtra : halfExtra);

                return (
                  <motion.div
                    key={itemIndex}
                    className={styles.gatherMobileSlide}
                    style={{ position: 'absolute' }}
                    initial={{
                      left: slideLeft,
                      width: slideW,
                      height: slideH,
                    }}
                    animate={{ left: slideLeft, width: slideW, height: slideH }}
                    transition={{
                      left: { type: 'spring', stiffness: 120, damping: 13, mass: 0.7 },
                      width: { type: 'spring', stiffness: 120, damping: 13, mass: 0.7 },
                      height: { type: 'spring', stiffness: 120, damping: 13, mass: 0.7 },
                    }}
                  >
                    <motion.div
                      style={{ width: '100%', height: '100%' }}
                      animate={{ scale: tappedIndex === itemIndex ? 0.93 : 1 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 17 }}
                    >
                      <Link
                        href={`/events?type=upcoming&format=${f.id || ''}`}
                        className={`${styles.gatherMobileCardV2} ${
                          isCurrent ? styles.gatherMobileCardActiveV2 : styles.gatherMobileCardInactiveV2
                        }`}
                        onClick={(e) => {
                          if (didSwipe.current) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          e.preventDefault();
                          setTappedIndex(itemIndex);
                          if (offset < 0) {
                            setTimeout(() => {
                              setTappedIndex(null);
                              handlePrev();
                            }, 180);
                          } else if (offset > 0) {
                            setTimeout(() => {
                              setTappedIndex(null);
                              handleNext();
                            }, 180);
                          } else {
                            setTimeout(() => {
                              setTappedIndex(null);
                              router.push(`/events?type=upcoming&format=${f.id || ''}`);
                            }, 180);
                          }
                        }}
                        aria-label={`${f.name} upcoming events`}
                      >
                        <div className={styles.gatherMobileCardPhotoV2}>
                          <Image src={f.imgV2} alt={f.alt} fill sizes="300px" />
                        </div>
                        <p className={styles.gatherMobileCardLabelV2}>
                          {f.shortLabel.map((line, li) => (
                            <React.Fragment key={li}>
                              {li > 0 && <br />}
                              {line}
                            </React.Fragment>
                          ))}
                        </p>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Format description box synced to active card */}
          <div className={styles.gatherMobileContentBoxV2}>
            <AnimatePresence mode="wait">
              <motion.p
                key={activeFormat.id || activeIndex}
                className={styles.gatherMobileContentTextV2}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                {activeFormat.desc}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Prev / Next circular arrow buttons */}
          <div className={styles.gatherMobileArrowsV2}>
            <button
              type="button"
              className={`${styles.gatherMobileArrowBtnV2} ${styles.gatherMobileArrowBtnV2Prev}`}
              onClick={() => handlePrev()}
              aria-label="Previous format"
            >
              <img src="/custom-assets/arrow-prev.svg" alt="" />
            </button>
            <button
              type="button"
              className={styles.gatherMobileArrowBtnV2}
              onClick={() => handleNext()}
              aria-label="Next format"
            >
              <img src="/custom-assets/arrow-next.svg" alt="" />
            </button>
          </div>
        </motion.div>

        {/* Doodles last */}
        <motion.img
          src="/category-covers/papercut-reading.png"
          alt=""
          className={styles.doodleReadingBookV2}
          aria-hidden="true"
          whileHover={{ rotate: 6, transition: { duration: 0.4, ease: 'easeOut' } }}
          variants={{
            hidden: { opacity: 0, scale: 0.7 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE, delay: 1.05 } },
          }}
        />
        <motion.img
          src="/category-covers/papercut-speaker.png"
          alt=""
          className={styles.doodleShoutingV2}
          aria-hidden="true"
          whileHover={{ rotate: -6, transition: { duration: 0.4, ease: 'easeOut' } }}
          variants={{
            hidden: { opacity: 0, scale: 0.7 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE, delay: 1.15 } },
          }}
        />
      </motion.div>
    </section>
  );
}
