'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../app/page.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;
const MotionLink = motion.create(Link);

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
export default function HowWeGatherSection({ heading, hoverLabel, formats }: HowWeGatherSectionProps) {
  // Maps each card's DOM index to its position in the random reveal order.
  const revealPosition = useMemo(() => {
    const order = shuffledOrder(formats.length);
    const byIndex: number[] = new Array(formats.length);
    order.forEach((cardIndex, position) => { byIndex[cardIndex] = position; });
    return byIndex;
  }, [formats.length]);

  return (
    <section id="formats" className={styles.gatherV2}>
      <motion.img
        src="/main%20images/Wavy%20Shapes/Website/Gather%20Wavy%20Shape.png"
        alt=""
        className={styles.gatherWaveImgV2}
        aria-hidden="true"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
      />

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

        {/* Cards, in random order */}
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

        {/* Doodles last */}
        <motion.img
          src="/main%20images/image%2022.png"
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
          src="/main%20images/image%2021.png"
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
