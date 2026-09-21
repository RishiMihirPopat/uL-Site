'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import styles from './CustomCursor.module.css';

const LABEL_SELECTOR = '[data-cursor-label]';
const DESC_SELECTOR = '[data-cursor-desc]';

// Matches the site's mobile breakpoint (app/page.module.css and friends
// all switch to mobile layouts at max-width: 900px).
const DESKTOP_MEDIA = '(pointer: fine) and (min-width: 901px)';

/** Desktop fine-pointer hover tooltips: displays dynamic contextual floating
 *  pills and description cards on elements opting in via `data-cursor-label`
 *  (e.g. Hero carousel active card, Article cards) or `data-cursor-desc`
 *  (How We Gather cards), tracking smoothly near the native cursor. */
export default function CustomCursor() {
  const pathname = usePathname();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 30, stiffness: 500, mass: 0.4 });
  const springY = useSpring(y, { damping: 30, stiffness: 500, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [desc, setDesc] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

  // Tracks the media query itself (both directions — narrowing below
  // 900px AND growing back past it, e.g. rotating a device or resizing a
  // desktop window), separate from the listener-setup effect below.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MEDIA);
    setVisible(mql.matches);
    const handleChange = (e: MediaQueryListEvent) => setVisible(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const labelEl = target.closest<HTMLElement>(LABEL_SELECTOR);
      setLabel(labelEl?.dataset.cursorLabel ?? null);
      const descEl = target.closest<HTMLElement>(DESC_SELECTOR);
      setDesc(descEl?.dataset.cursorDesc ?? null);
    };
    const handleMouseLeave = () => {
      setLabel(null);
      setDesc(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <>
      <AnimatePresence>
        {label && (
          <motion.div
            className={styles.label}
            style={{ left: springX, top: springY, x: 20, y: 20 }}
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
            style={{ left: springX, top: springY, x: 20, y: 20 }}
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
