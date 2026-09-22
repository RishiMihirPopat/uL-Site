'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { EASE } from '@/lib/constants/animation';
import type { Testimonial } from '@/lib/types/testimonial';
import styles from '@/app/page.module.css';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const PAGE_SIZE = 3;

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const count = testimonials.length;
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const [page, setPage] = useState(0);

  const goNext = useCallback(() => {
    setPage(p => (p + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage(p => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  /* Auto-advance every 8 seconds when there are multiple pages */
  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(goNext, 15000);
    return () => clearInterval(id);
  }, [totalPages, goNext]);

  const visible = useMemo(() => {
    const start = page * PAGE_SIZE;
    return testimonials.slice(start, start + PAGE_SIZE);
  }, [page, testimonials]);

  /* Lock wrapper min-height to the tallest page to prevent scrollbar jitter */
  const gridRef = useRef<HTMLDivElement>(null);
  const [minH, setMinH] = useState(0);

  const measureGrid = useCallback(() => {
    if (!gridRef.current) return;
    const h = gridRef.current.offsetHeight;
    setMinH(prev => Math.max(prev, h));
  }, []);

  /* Measure after first render and each page transition */
  useEffect(measureGrid, [page, measureGrid]);

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
        ref={gridRef}
        className={styles.testimonialsCardWrapV2}
        style={minH ? { minHeight: minH } : undefined}
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className={styles.testimonialsGridV2}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: EASE }}
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
      </motion.div>
    </motion.section>
  );
}
