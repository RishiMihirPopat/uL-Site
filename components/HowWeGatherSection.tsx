'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import styles from '../app/page.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;
const MOBILE_AUTOPLAY_MS = 3000;

interface FormatItem {
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

  // Content (heading, cards/mobile carousel, doodles) must only start
  // revealing once the wave background has actually finished appearing —
  // same "wait for the thing behind it" gate AsSeenInSection uses for its
  // own wave, rather than two independent timers that could race if the
  // user scrolls to this section quickly. `whileInView` alone can't
  // express "and also wait for this other condition", so both triggers
  // are tracked explicitly and combined into one `ready` flag that
  // drives a plain `animate` instead.
  //
  // waveLoaded gates the fade-in itself (animate only starts once the
  // image has real bytes to show — on mobile this file is ~865KB, easily
  // slower than the 1.7s the animation's own timer takes, so gating only
  // on the animation's timer previously let it "complete" and reveal the
  // content while the image itself hadn't visually loaded/painted yet).
  // waveAnimDone then only flips true once that gated fade-in has
  // actually finished animating.
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const waveImgRef = useRef<HTMLImageElement>(null);
  const [waveLoaded, setWaveLoaded] = useState(false);
  const [waveAnimDone, setWaveAnimDone] = useState(false);

  useEffect(() => {
    if (waveImgRef.current?.complete) setWaveLoaded(true);
  }, []);

  // A plain timer tied to the wave's own transition numbers below
  // (0.9s delay + 0.8s duration), started the moment the image is
  // actually ready to animate — not Framer's onAnimationComplete, which
  // proved unreliable here (fired based on internal animate-prop state
  // changes rather than a real 1.7s of wall-clock animation having
  // played, letting the content through early on some loads).
  useEffect(() => {
    if (!waveLoaded) return;
    const timer = setTimeout(() => setWaveAnimDone(true), (0.9 + 0.8) * 1000);
    return () => clearTimeout(timer);
  }, [waveLoaded]);

  const ready = inView && waveAnimDone;

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
            Not clickable — plain divs, not links; the hover description
            (data-cursor-desc) is the only interaction. */}
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
            </motion.div>
          ))}
        </div>

        {/* Auto-advancing single card + content box — mobile only,
            CSS-hidden on desktop. Needs its own variants (not just the
            parent's) — the parent's hidden/visible variants are empty
            objects (`{}`); each reveal element is individually
            responsible for its own opacity animation, so a plain,
            non-motion div here never actually gets hidden and renders
            at full visibility immediately, bypassing the wave-wait gate
            entirely. */}
        <motion.div
          className={styles.gatherMobileWrapV2}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
          }}
        >
          <div className={styles.gatherMobileCardBoxGroupV2}>
            {/* Not clickable — purely presentational, matches the
                desktop cards above. Autoplay + the arrows below are the
                only way to move through the formats. */}
            <div className={styles.gatherMobileCardV2} aria-label={mobileFormat.name}>
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
            </div>
            <div className={styles.gatherMobileContentBoxV2}>
              <p className={styles.gatherMobileContentTextV2}>{mobileFormat.desc}</p>
            </div>
          </div>
          <div className={styles.gatherMobileArrowsV2}>
            <button
              type="button"
              className={`${styles.gatherMobileArrowBtnV2} ${styles.gatherMobileArrowBtnV2Prev}`}
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
