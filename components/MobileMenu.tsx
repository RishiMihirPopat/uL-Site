'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useModalDismiss } from '@/lib/hooks/useModalDismiss';
import { EASE } from '@/lib/constants/animation';
import { brand, navV2 } from '../lib/content';
import styles from './MobileMenu.module.css';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** Mobile "MENU" overlay (Figma node 188:4447) — dark panel dropping from
 *  the top with the wordmark, all 4 nav links, and a CLOSE pill, over a
 *  57%-black backdrop. Desktop never renders this (Nav.tsx only ever sets
 *  `open` true from the mobile-only MENU button, which is itself
 *  CSS-hidden above 900px), but the panel/overlay also carry their own
 *  <=900px guard in MobileMenu.module.css as a safety net.
 *
 *  Unlike BookingModal (which only ever mounts while actually open), this
 *  component is always mounted — `open` just toggles AnimatePresence.
 *  That ruled out BookingModal's history.pushState/back()-on-cleanup
 *  trick for closing on the mobile back gesture: with an always-mounted
 *  component, that effect re-runs on every re-render where `onClose`'s
 *  identity changes, each time pushing a history entry and then popping
 *  it again on cleanup — which raced against Next's own router (it also
 *  listens for popstate) and could freeze the page. Escape / overlay
 *  click / the CLOSE button / a link click are already enough ways to
 *  close it, so that trick isn't worth the risk here. */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const links = [...navV2.leftLinks, ...navV2.rightLinks];

  /* Close on Escape, lock body scroll while open. */
  useModalDismiss(open, onClose);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.overlay}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          />
          <motion.div
            className={styles.panel}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.4, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            {/* Panel slides down first, then wordmark → links → CLOSE
                reveal in sequence via staggerChildren (each child looks
                up "hidden"/"visible" in its own variants once the parent
                sets those labels — delayChildren waits until the panel's
                own slide is mostly settled before starting). */}
            <motion.div
              className={styles.inner}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
              }}
            >
              <motion.span
                className={styles.wordmark}
                variants={{
                  hidden: { opacity: 0, y: -12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                }}
              >
                {brand.name}
              </motion.span>
              <motion.nav
                className={styles.links}
                aria-label="Mobile navigation"
                variants={{
                  hidden: { opacity: 0, y: -12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                }}
              >
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={onClose}
                    className={`${styles.link} ${isActive(link.href) ? styles.linkActive : ''}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.nav>
              <motion.button
                type="button"
                className={styles.closeBtn}
                onClick={onClose}
                variants={{
                  hidden: { opacity: 0, y: -12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                }}
              >
                CLOSE
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
