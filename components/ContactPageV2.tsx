'use client';

import { motion } from 'framer-motion';
import ContactFormV2 from './ContactFormV2';
import { contactPageV2 } from '../lib/content';
import styles from '../app/contact/page.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;
// Sequenced to land after Nav's own wordmark/links entrance finishes
// (~0.35s + its own transition) — same base delay the homepage's Hero
// carousel uses (see HeroLectureCarousel.tsx's ENTRANCE_BASE_DELAY).
const NAV_ENTRANCE_DELAY = 0.5;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: NAV_ENTRANCE_DELAY + 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** V2 Contact page — node 152:756. Mount-based entrance (the whole page is
 *  above the fold, unlike the homepage's scroll-revealed sections): the
 *  wave shape fades in first, then the heading+sub together, then the
 *  form. Split out from app/contact/page.tsx so that file can keep its
 *  server-only `metadata` export (Next disallows that alongside
 *  'use client', which this animation needs). */
export default function ContactPageV2() {
  return (
    <main className={styles.mainV2}>
      <motion.img
        src="/wavy-shapes/website/contact-wavy-shape.png"
        alt=""
        className={styles.waveImgV2}
        aria-hidden="true"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: NAV_ENTRANCE_DELAY, ease: EASE }}
      />
      <motion.div
        className={styles.innerV2}
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <motion.div className={styles.headerV2} variants={item}>
          <h1 className={styles.headingV2}>{contactPageV2.heading}</h1>
          <p className={styles.subV2}>{contactPageV2.sub}</p>
        </motion.div>
        <motion.div variants={item} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <ContactFormV2 />
        </motion.div>
      </motion.div>
    </main>
  );
}
