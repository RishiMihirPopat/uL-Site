'use client';

import { motion } from 'framer-motion';
import { brand, footer as footerContent } from '../lib/content';
import styles from './Footer.module.css';

// Figma node 140:545: single row, copyright left, Email/Instagram/Linkedin
// right, no box/border/background — sits directly on the page.
export default function Footer() {
  const socialsV2 = footerContent.socials.filter((s) => s.label !== 'WhatsApp');

  return (
    <motion.footer
      className={styles.footerV2}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
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
