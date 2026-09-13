'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../app/page.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;
const MotionLink = motion.create(Link);
const MOBILE_AUTOPLAY_MS = 3000;

interface FormatItem {
  name: string;
  shortLabel: string[];
  href: string;
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

  // Mobile-only auto-advancing carousel (node 174:4263, mobile frame) —
  // a real component state machine, not a CSS-only swap, since it needs
  // to autoplay every 3s and also respond to manual prev/next arrows.
  // Runs unconditionally (even while the desktop layout is showing, i.e.
  // the markup below is just CSS-hidden above the mobile breakpoint) —
  // simpler and safer than gating the whole carousel behind a
  // window-width check, which is exactly the kind of client/server
  // mismatch already fixed once this session in HeroLectureCarousel.
  const [mobileIndex, setMobileIndex] = useState(0);
  const hasMultiple = formats.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setMobileIndex((i) => (i + 1) % formats.length);
    }, MOBILE_AUTOPLAY_MS);
    return () => clearInterval(timer);
    // Restarting the 3s window on every index change (auto or manual) so a
    // manual tap always gets a full 3s before the next auto-advance,
    // instead of an autoplay tick landing right after a manual one.
  }, [mobileIndex, hasMultiple, formats.length]);

  const mobileFormat = formats[mobileIndex];
  const handleMobilePrev = () => {
    setMobileIndex((i) => (i - 1 + formats.length) % formats.length);
  };
  const handleMobileNext = () => {
    setMobileIndex((i) => (i + 1) % formats.length);
  };

  return (
    <section id="formats" className={styles.gatherV2}>
      <picture className={styles.pictureContentsV2}>
        <source media="(max-width: 900px)" srcSet="/wavy-shapes/mobile/ather-wavy-shape.png" />
        <motion.img
          src="/wavy-shapes/website/gather-wavy-shape.png"
          alt=""
          className={styles.gatherWaveImgV2}
          aria-hidden="true"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
        />
      </picture>

      <motion.div
        className={styles.gatherInnerV2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
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

        {/* Cards, in random order — desktop only, CSS-hidden on mobile */}
        <div className={styles.ticketRowV2}>
          {formats.map((f, i) => (
            <MotionLink
              key={f.name}
              href={f.href}
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
            </MotionLink>
          ))}
        </div>

        {/* Auto-advancing single card + content box — mobile only,
            CSS-hidden on desktop. A plain div, not part of the
            random-order reveal stagger above (it's a carousel, not a
            static grid), but still inherits the parent's fade-in. */}
        <div className={styles.gatherMobileWrapV2}>
          <div className={styles.gatherMobileCardBoxGroupV2}>
            <Link
              href={mobileFormat.href}
              className={styles.gatherMobileCardV2}
              aria-label={mobileFormat.name}
            >
              <div className={styles.gatherMobileCardPhotoV2}>
                <Image src={mobileFormat.imgV2} alt={mobileFormat.alt} fill sizes="300px" />
              </div>
              <p className={styles.gatherMobileCardLabelV2}>
                {mobileFormat.shortLabel.map((line, li) => (
                  <React.Fragment key={li}>
                    {li > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </p>
            </Link>
            <div className={styles.gatherMobileContentBoxV2}>
              <p className={styles.gatherMobileContentTextV2}>{mobileFormat.desc}</p>
            </div>
          </div>
          <div className={styles.gatherMobileArrowsV2}>
            <button
              type="button"
              className={styles.gatherMobileArrowBtnV2}
              onClick={handleMobilePrev}
              aria-label="Previous format"
            >
              <img src="/custom-assets/arrow-prev.svg" alt="" />
            </button>
            <button
              type="button"
              className={styles.gatherMobileArrowBtnV2}
              onClick={handleMobileNext}
              aria-label="Next format"
            >
              <img src="/custom-assets/arrow-next.svg" alt="" />
            </button>
          </div>
        </div>

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
