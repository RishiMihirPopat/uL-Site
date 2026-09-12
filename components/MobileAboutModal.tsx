'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import TestimonialsCarousel from './TestimonialsCarousel';
import type { Testimonial } from '../lib/db';
import styles from './MobileAboutModal.module.css';

interface PressLogo {
  id: number;
  src: string;
  alt: string;
  href: string;
}

interface MobileAboutModalProps {
  testimonials: Testimonial[];
  pressLogos: PressLogo[];
}

export default function MobileAboutModal({ testimonials, pressLogos }: MobileAboutModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === '#about') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const onOpenEvent = () => handleOpen();
    window.addEventListener('open-unlecture-about', onOpenEvent);

    // If opened directly with #about on phone screen
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && window.location.hash === '#about') {
      setIsOpen(true);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('open-unlecture-about', onOpenEvent);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleOpen, handleClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="About unLecture">
      {/* Sticky Top Bar with Close button */}
      <header className={styles.topBar}>
        <span className={styles.wordmark}>unLecture</span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close About Us"
        >
          ✕ Close
        </button>
      </header>

      {/* Scrollable Content */}
      <div className={styles.scrollBody}>
        {/* 1. The Manifesto */}
        <section className={styles.manifestoSection}>
          <p className={styles.sectionLabel}>The Manifesto</p>
          <div className={styles.quoteBlock}>
            <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
            <blockquote className={styles.quoteText}>
              Curiosity should not be confined to institutions.
            </blockquote>
            <p className={styles.quoteAttr}>— unLecture</p>
          </div>
        </section>

        {/* 2. About Body Copy */}
        <section className={styles.copySection}>
          <h2 className={styles.copyHeading}>ABOUT UNLECTURE</h2>

          <p className={styles.copyLead}>
            unLecture was created with the intention of having somewhere in the city centred around curiosity, conversation and meaningful (sometimes very niche) ideas.
          </p>

          <p className={styles.copyParagraph}>
            Delhi has a real appetite for this. You could always chance upon people who felt the same way, but there was nothing stable or recurring to return to, no place to take an interest further and expand on what you already knew. Discourse around certain subjects felt locked up behind institutions, jargon and qualifications.
          </p>

          <p className={styles.copyParagraph}>
            With unLecture we try to break the binary of those rigid ideals and make interesting ideas speakable again. As the name suggests, it&apos;s an unconventional take on a lecture. By moving important discussions out of ivory towers and into the casual settings we already frequent, we&apos;re exploring what can actually be achieved when very different people sit in the same room, a different kind of community building.
          </p>

          <p className={styles.copyParagraph}>
            What started as a passion project by three friends from college has grown much bigger than that, because it came to mean a lot more to a lot of people. unLecture now runs not just lectures but several kinds of events every week. We raise real questions, get people out of the house, and put a few like-minded strangers around you along the way.
          </p>

          <p className={styles.copyParagraph}>
            The idea is to keep this space warm and intimate. Somewhere you&apos;re encouraged to (un)learn and one you&apos;ll want to come back to. The door&apos;s open :]
          </p>
        </section>

        {/* 3. From the Community */}
        <section className={styles.communitySection}>
          <p className={styles.sectionLabel}>From the community</p>
          <TestimonialsCarousel initialTestimonials={testimonials} />
        </section>

        {/* 4. As Seen In */}
        <section className={styles.pressSection}>
          <p className={styles.sectionLabel}>As seen in</p>
          <div className={styles.pressGrid}>
            {pressLogos.map((logo) => (
              <div key={logo.id} className={styles.pressLogoWrap}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={110}
                  height={34}
                  className={styles.pressLogo}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Close / Return Button */}
        <div className={styles.bottomBar}>
          <button type="button" className={styles.bottomCloseBtn} onClick={handleClose}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
