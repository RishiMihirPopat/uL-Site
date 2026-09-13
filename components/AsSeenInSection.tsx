'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import styles from '../app/page.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

interface PressLogo {
  id: number;
  src: string;
  alt: string;
}

interface AsSeenInSectionProps {
  heading: string;
  logos: PressLogo[];
}

/** As Seen In — node 133:2325. Extracted into its own client component
 *  (HomeView is a server component) so the reveal can wait on the wave
 *  shape's `onLoad` — the heading/marquee are positioned via `top: %` of
 *  the grid row the wave `<img>` defines, so if that row's real height
 *  isn't known yet (image bytes not in), they briefly resolve against a
 *  ~0px-tall row and visibly jump to centered once the image loads. Content
 *  only starts revealing once BOTH the scroll trigger and the image load
 *  have happened — whichever is later — so nothing is ever shown mid-jump. */
export default function AsSeenInSection({ heading, logos }: AsSeenInSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const imgRef = useRef<HTMLImageElement>(null);
  const [waveLoaded, setWaveLoaded] = useState(false);

  // A cached image can already be `.complete` before onLoad has a chance
  // to attach, so check once on mount rather than relying on onLoad alone.
  useEffect(() => {
    if (imgRef.current?.complete) setWaveLoaded(true);
  }, []);

  const ready = inView && waveLoaded;

  // `ready` only means the image's bytes are in and the browser knows its
  // aspect ratio — it doesn't guarantee a layout/paint pass has actually
  // run with that final size yet. Wait two animation frames (the standard
  // way to guarantee at least one full layout+paint has completed) before
  // ever moving opacity off 0, so nothing is ever shown mid-reflow.
  const [revealArmed, setRevealArmed] = useState(false);
  useEffect(() => {
    if (!ready) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRevealArmed(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [ready]);

  return (
    <motion.section
      ref={sectionRef}
      className={styles.pressV2}
      initial={{ opacity: 0, y: 30 }}
      animate={revealArmed ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <picture className={styles.pictureContentsV2}>
        <source media="(max-width: 900px)" srcSet="/wavy-shapes/mobile/seen-wavy-shape.png" />
        <img
          ref={imgRef}
          src="/wavy-shapes/website/seen-wavy-shape.png"
          alt=""
          className={styles.pressWaveImgV2}
          aria-hidden="true"
          onLoad={() => setWaveLoaded(true)}
        />
      </picture>
      {/* Desktop layout — heading/marquee absolute-positioned against the
          wide, short desktop wave band. CSS-hidden on mobile. */}
      <motion.div
        className={styles.pressInnerV2}
        initial="hidden"
        animate={revealArmed ? 'visible' : 'hidden'}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } } }}
      >
        <motion.h2
          className={styles.pressHeadingV2}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          {heading}
        </motion.h2>
        <motion.div
          className={styles.pressMarqueeWrapV2}
          variants={{
            hidden: { opacity: 0, y: 16 },
            // Reveal target matches .pressMarqueeWrapV2's own static 0.5
            // opacity (the deliberate dimmed-marquee look) — 1 would win
            // over that CSS rule since Framer always writes opacity as an
            // inline style.
            visible: { opacity: 0.5, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          <div className={styles.pressRowV2}>
            {logos.map((l) => (
              <div key={l.id} className={styles.pressLogoV2}>
                <Image src={l.src} alt={l.alt} fill sizes="111px" />
              </div>
            ))}
            {logos.map((l) => (
              <div key={`d-${l.id}`} className={styles.pressLogoV2}>
                <Image src={l.src} alt={l.alt} fill sizes="111px" />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile layout (node 197:4560) — dedicated markup, not the
          desktop one repositioned, since the mobile wave's proportions
          are completely different. CSS-hidden on desktop. */}
      <motion.div
        className={styles.pressInnerMobileV2}
        initial="hidden"
        animate={revealArmed ? 'visible' : 'hidden'}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18, delayChildren: 0.05 } } }}
      >
        <motion.h2
          className={styles.pressHeadingMobileV2}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          {heading}
        </motion.h2>
        <motion.div
          className={styles.pressMarqueeWrapMobileV2}
          variants={{
            hidden: { opacity: 0, y: 16 },
            // See the desktop instance above — matches .pressMarqueeWrapMobileV2's
            // own static 0.5 opacity.
            visible: { opacity: 0.5, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          <div className={styles.pressRowMobileV2}>
            {logos.map((l) => (
              <div key={l.id} className={styles.pressLogoMobileV2}>
                <Image src={l.src} alt={l.alt} fill sizes="106px" />
              </div>
            ))}
            {logos.map((l) => (
              <div key={`d-${l.id}`} className={styles.pressLogoMobileV2}>
                <Image src={l.src} alt={l.alt} fill sizes="106px" />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
