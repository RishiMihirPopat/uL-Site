'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { EASE } from '@/lib/constants/animation';
import type { Testimonial } from '@/lib/types/testimonial';
import styles from '@/app/page.module.css';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia('(max-width: 900px)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.innerWidth <= 900 ? 1 : 3;
}

function getServerSnapshot() {
  return 3;
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const count = testimonials.length;
  const pageSize = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const [page, setPage] = useState(0);

  // Keep page within bounds when pageSize changes
  useEffect(() => {
    setPage(p => (p >= totalPages ? 0 : p));
  }, [totalPages]);

  const goNext = useCallback(() => {
    setPage(p => (p + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage(p => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  /* Auto-advance every 15 seconds, resetting the countdown whenever page changes */
  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(() => {
      setPage(p => (p + 1) % totalPages);
    }, 15000);
    return () => clearInterval(id);
  }, [page, totalPages]);

  const visible = useMemo(() => {
    const start = page * pageSize;
    return testimonials.slice(start, start + pageSize);
  }, [page, pageSize, testimonials]);

  /* Hidden measurer to calculate the maximum slide height so all slides
     have a completely fixed height, preventing the nav buttons from moving. */
  const measurerRef = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState<number | undefined>(undefined);

  const measureTallest = useCallback(() => {
    if (!measurerRef.current) return;
    const cards = Array.from(measurerRef.current.children) as HTMLElement[];
    if (cards.length === 0) return;

    if (pageSize === 1) {
      // Mobile: 1 card per slide. Height is tallest card
      const maxH = Math.max(...cards.map(c => c.offsetHeight));
      if (maxH > 0) setTrackHeight(maxH);
    } else {
      // Desktop: 3 cards per row. Find max row height across pages
      let maxPageH = 0;
      for (let i = 0; i < cards.length; i += pageSize) {
        const pageCards = cards.slice(i, i + pageSize);
        const pageH = Math.max(...pageCards.map(c => c.offsetHeight));
        if (pageH > maxPageH) maxPageH = pageH;
      }
      if (maxPageH > 0) setTrackHeight(maxPageH);
    }
  }, [pageSize]);

  useEffect(() => {
    measureTallest();
    const ro = new ResizeObserver(measureTallest);
    if (measurerRef.current) ro.observe(measurerRef.current);
    window.addEventListener('resize', measureTallest);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureTallest);
    };
  }, [measureTallest]);

  if (count === 0) return null;

  return (
    <motion.section
      className={styles.testimonialsV2}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE, staggerChildren: 0.2, delayChildren: 0.15 },
        },
      }}
    >
      <motion.h2
        className={styles.testimonialsHeadingV2}
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
      >
        Community Testimonials
      </motion.h2>

      <motion.p
        className={styles.testimonialsSubheadingV2}
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
      >
        Books, films, and ideas our community keeps coming back to.
      </motion.p>

      <motion.div
        className={styles.testimonialsCardWrapV2}
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
      >
        <div
          className={styles.testimonialsSlideTrackV2}
          style={trackHeight ? { height: trackHeight } : undefined}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${pageSize}-${page}`}
              className={styles.testimonialsGridV2}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {visible.map(item => (
                <div key={item.id} className={styles.testimonialsCardV2}>
                  <h3 className={styles.testimonialsCardTitleV2}>{item.title}</h3>
                  <blockquote className={styles.testimonialsCardQuoteV2}>
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <p className={styles.testimonialsCardRecommenderV2}>{item.recommender}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className={styles.testimonialsNavV2}>
            <button
              type="button"
              className={`${styles.testimonialsNavBtnV2} ${styles.testimonialsNavBtnV2Prev}`}
              onClick={goPrev}
              aria-label="Previous testimonials"
            >
              <img src="/custom-assets/arrow-prev.svg" alt="" />
            </button>
            <span className={styles.testimonialsNavCounterV2}>
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              className={`${styles.testimonialsNavBtnV2} ${styles.testimonialsNavBtnV2Next}`}
              onClick={goNext}
              aria-label="Next testimonials"
            >
              <img src="/custom-assets/arrow-next.svg" alt="" />
            </button>
          </div>
        )}

        {/* Hidden off-screen measurer to compute exact maximum slide height for uniform buttons */}
        <div
          ref={measurerRef}
          className={`${styles.testimonialsGridV2} ${styles.testimonialsMeasurerV2}`}
          aria-hidden="true"
        >
          {testimonials.map(item => (
            <div key={item.id} className={styles.testimonialsCardV2}>
              <h3 className={styles.testimonialsCardTitleV2}>{item.title}</h3>
              <blockquote className={styles.testimonialsCardQuoteV2}>
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className={styles.testimonialsCardRecommenderV2}>{item.recommender}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}
