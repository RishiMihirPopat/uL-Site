'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Testimonial } from '../lib/types/testimonial';
import styles from './TestimonialsCarousel.module.css';

interface TestimonialsCarouselProps {
  initialTestimonials?: Testimonial[];
}

export default function TestimonialsCarousel({ initialTestimonials = [] }: TestimonialsCarouselProps) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (initialTestimonials.length === 0) {
      fetch('/api/testimonials')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
          }
        })
        .catch(() => {});
    }
  }, [initialTestimonials.length]);

  const pageSize = 3;
  const totalItems = items.length;

  const handleNext = () => {
    if (totalItems <= pageSize) return;
    setStartIndex((prev) => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    if (totalItems <= pageSize) return;
    setStartIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  // Get current 3 visible items with wrap-around
  const visibleItems = [];
  if (totalItems > 0) {
    for (let i = 0; i < Math.min(pageSize, totalItems); i++) {
      const idx = (startIndex + i) % totalItems;
      visibleItems.push(items[idx]);
    }
  }

  if (items.length === 0) return null;

  return (
    <section className={styles.section} id="community-recs" aria-label="Community Recommendations">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.heading}>From the Community</h2>
          </div>

          {totalItems > pageSize && (
            <div className={styles.navControls}>
              <button
                type="button"
                className={styles.arrowBtn}
                onClick={handlePrev}
                aria-label="Previous recommendations"
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
                aria-label="Next recommendations"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 3-Column Recommendations Grid */}
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, i) => (
              <motion.div
                key={`${item.id}-${startIndex}-${i}`}
                className={styles.column}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.recommender}>{item.recommender}</p>
                </div>
                <blockquote className={styles.quoteText}>{item.quote}</blockquote>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
