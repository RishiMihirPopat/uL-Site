'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { brand, footer as footerContent } from '../lib/content';
import styles from './Footer.module.css';

// Figma node 140:545: single row, copyright left, Email/Instagram/Linkedin
// right, no box/border/background — sits directly on the page.
export default function Footer() {
  const socialsV2 = footerContent.socials.filter((s) => s.label !== 'WhatsApp');

  // useInView + a plain `animate`, not bare `whileInView` — this exact
  // section's own reveal-never-fires failure mode is what forced the
  // same switch in HowWeGatherSection/AsSeenInSection earlier; as the
  // last element on the page, a threshold that silently never crosses
  // would leave the footer permanently at opacity: 0, indistinguishable
  // from the page just ending before it.
  const footerRef = useRef<HTMLElement>(null);
  const inView = useInView(footerRef, { once: true, amount: 0.3 });

  return (
    <motion.footer
      ref={footerRef}
      className={styles.footerV2}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.innerV2}>
        <p className={styles.copyV2}>© {new Date().getFullYear()} {brand.name}. All Rights Reserved</p>
        <nav className={styles.linksV2} aria-label="Social links">
          <a href={`mailto:${footerContent.email}`}>Email</a>
          {socialsV2.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
          ))}
        </nav>
      </div>
    </motion.footer>
  );
}
