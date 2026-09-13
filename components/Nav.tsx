'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { brand, navV2 } from '../lib/content';
import { lenisRef } from '../lib/lenis';
import styles from './Nav.module.css';

const EASE = [0.16, 1, 0.3, 1] as const;

// Figma nodes 123:2057 / 123:2058 — 1120px-wide content group, Chivo Mono
// 16px, no letter-spacing, active link solid #2A2420, inactive at 54%
// opacity. No box/border — nav sits directly on the page's own background.
export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/articles') return pathname.startsWith('/articles');
    if (href === '/events') return pathname.startsWith('/events');
    if (href === '/contact') return pathname === '/contact';
    return false;
  };

  // Clicking Home while already on it scrolls to top instead of no-op navigating.
  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return;
    e.preventDefault();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderLink = (link: { label: string; href: string }) => {
    const className = `${styles.linkV2} ${isActive(link.href) ? styles.linkV2Active : ''}`;
    return (
      <Link key={link.label} href={link.href} className={className}>
        {link.label}
      </Link>
    );
  };

  return (
    <header className={styles.headerV2}>
      <nav className={styles.navV2} aria-label="Main navigation">
        <motion.div
          className={styles.navV2GroupLeft}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
        >
          {navV2.leftLinks.map(renderLink)}
        </motion.div>
        <motion.span
          style={{ display: 'inline-block' }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
        >
          <Link href="/" className={styles.wordmarkV2} onClick={handleHomeClick}>
            {brand.name}
          </Link>
        </motion.span>
        <motion.div
          className={styles.navV2GroupRight}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
        >
          {navV2.rightLinks.map(renderLink)}
        </motion.div>
      </nav>
    </header>
  );
}
