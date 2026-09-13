'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import styles from './CustomCursor.module.css';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, [role="button"]';
const LABEL_SELECTOR = '[data-cursor-label]';
const DESC_SELECTOR = '[data-cursor-desc]';
const CURSOR_SRC = '/custom-assets/custom-cursor.png';
const CURSOR_HOVER_SRC = '/custom-assets/hover-custom-cursor.png';

/** V2 only, desktop pointers only (see the matchMedia guard) — replaces the
 *  native cursor with the Figma-provided gold arrow PNG, spring-following
 *  the real pointer; swaps to a gold sparkle PNG (and scales up) over
 *  buttons, links (including Nav), inputs and other interactive elements. */
export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 30, stiffness: 500, mass: 0.4 });
  const springY = useSpring(y, { damping: 30, stiffness: 500, mass: 0.4 });
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [desc, setDesc] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;

    document.body.classList.add(styles.cursorNone);
    setVisible(true);

    // Preload so the first hover doesn't flash an unloaded image.
    const preload = new window.Image();
    preload.src = CURSOR_HOVER_SRC;

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setHovering(!!target.closest(INTERACTIVE_SELECTOR));
      const labelEl = target.closest<HTMLElement>(LABEL_SELECTOR);
      setLabel(labelEl?.dataset.cursorLabel ?? null);
      const descEl = target.closest<HTMLElement>(DESC_SELECTOR);
      setDesc(descEl?.dataset.cursorDesc ?? null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);

    return () => {
      document.body.classList.remove(styles.cursorNone);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
    };
  }, [x, y]);

  if (!visible) return null;

  return (
    <>
      <motion.img
        src={hovering ? CURSOR_HOVER_SRC : CURSOR_SRC}
        alt=""
        aria-hidden="true"
        className={styles.cursor}
        style={{ left: springX, top: springY }}
        animate={{ scale: hovering ? 1.7 : 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      />
      <AnimatePresence>
        {label && (
          <motion.div
            className={styles.label}
            style={{ left: springX, top: springY, x: 30, y: 26 }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: 'spring', damping: 20, stiffness: 450 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, delay: 0.1 }}
            >
              {label}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {desc && (
          <motion.div
            className={styles.desc}
            style={{ left: springX, top: springY, x: 26, y: 22 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 22, stiffness: 380 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, delay: 0.1 }}
            >
              {desc}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
