'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

interface FadeInProps {
  id?: string;
  className?: string;
  children: ReactNode;
  y?: number;
  delay?: number;
  duration?: number;
  /** Gap before the first child starts, and between each subsequent
   *  FadeInItem child — set high enough that the reveal reads as a
   *  deliberate sequence, not everything popping in at once. */
  stagger?: number;
  /** true (default): fade in once scrolled into view (each V2 section
   *  below the hero). false: fade in on mount instead — for above-the-fold
   *  content sequenced as part of the landing entrance (e.g. the hero,
   *  timed to finish after Nav.tsx's own wordmark/links entrance). */
  scroll?: boolean;
}

/** HomeView/Footer are server (or DB-reading) components, so this file is
 *  what actually holds the 'use client' boundary framer-motion needs.
 *
 *  Doubles as a stagger container: direct `FadeInItem` children reveal one
 *  after another in DOM order via Framer's variant propagation (which
 *  works through the React tree regardless of any plain `<div>`s in
 *  between — a section's own inner wrapper divs don't need to be motion
 *  components themselves for this to reach their FadeInItem descendants).
 *  A section with no FadeInItem children just gets the plain single fade
 *  from `initial`/(`animate`|`whileInView`) below. */
export default function FadeIn({ id, className, children, y = 30, delay = 0.15, duration = 0.7, stagger = 0.2, scroll = true }: FadeInProps) {
  const revealProps = scroll
    ? { whileInView: 'visible' as const, viewport: { once: true, amount: 0.2 } }
    : { animate: 'visible' as const };

  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: EASE, staggerChildren: stagger, delayChildren: delay },
        },
      }}
      {...revealProps}
    >
      {children}
    </motion.section>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** A step in a parent FadeIn's reveal sequence. Renders a plain, unstyled
 *  `motion.div` wrapper — leave the wrapped element's own className in
 *  place rather than moving it here, so nothing that relies on that
 *  element's exact position in the DOM (absolute-positioning ancestors,
 *  `:nth-child` rules on a sibling row) has to change. */
export function FadeInItem({ children }: { children: ReactNode }) {
  return <motion.div variants={itemVariants}>{children}</motion.div>;
}
