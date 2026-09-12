'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Nav.module.css';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetHref: string) => {
    setMenuOpen(false);

    if (targetHref === '#archive' || targetHref === '/#archive') {
      e.preventDefault();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-unlecture-archive'));
        window.location.hash = '#archive';
        if (pathname !== '/') {
          router.push('/#archive');
        }
      }
      return;
    }

    if (targetHref === '#about' || targetHref === '/#about') {
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-unlecture-about'));
        if (pathname !== '/') {
          router.push('/#about');
        }
        return;
      }
    }

    if (targetHref === '/' && pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetHref.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const id = targetHref.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleMobileAboutClick = () => {
    setMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-unlecture-about'));
      if (pathname !== '/') {
        router.push('/#about');
      }
    }
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark} onClick={(e) => handleNavClick(e, '/')}>
        unLecture
      </Link>

      {/* Desktop Navigation */}
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.link} onClick={(e) => handleNavClick(e, '/')}>
          Home
        </Link>
        <Link href="/#formats" className={styles.link} onClick={(e) => handleNavClick(e, '/#formats')}>
          Events
        </Link>
        <Link href="/#about" className={styles.link} onClick={(e) => handleNavClick(e, '/#about')}>
          About Us
        </Link>
        <a
          href="/#archive"
          className={styles.link}
          onClick={(e) => handleNavClick(e, '#archive')}
        >
          Archive
        </a>
        <Link href="/contact" className={styles.link}>
          Contact Us
        </Link>
      </nav>

      {/* Mobile 3-line Hamburger Button */}
      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
      >
        <span className={`${styles.line} ${menuOpen ? styles.line1Open : ''}`} />
        <span className={`${styles.line} ${menuOpen ? styles.line2Open : ''}`} />
        <span className={`${styles.line} ${menuOpen ? styles.line3Open : ''}`} />
      </button>

      {/* Mobile Navigation Drawer */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          <Link
            href="/"
            className={styles.mobileLink}
            onClick={(e) => {
              setMenuOpen(false);
              handleNavClick(e, '/');
            }}
          >
            Home
          </Link>
          <Link
            href="/#formats"
            className={styles.mobileLink}
            onClick={(e) => {
              setMenuOpen(false);
              handleNavClick(e, '/#formats');
            }}
          >
            Events
          </Link>
          <button
            type="button"
            className={styles.mobileLinkBtn}
            onClick={handleMobileAboutClick}
          >
            About Us
          </button>
          <Link
            href="/contact"
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            Contact Us
          </Link>
        </nav>
      </div>
    </header>
  );
}
