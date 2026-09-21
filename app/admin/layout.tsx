'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isLoginPage = pathname === '/admin';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Check auth
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.replace('/admin');
        } else {
          setRole(data.role);
          setLoading(false);
        }
      })
      .catch(() => {
        router.replace('/admin');
      });
  }, [pathname, router, isLoginPage]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin';
  };

  if (isLoginPage) {
    return <div className={styles.container}>{children}</div>;
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: '#666', fontFamily: 'sans-serif' }}>Authenticating admin session...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.brandGroup}>
          <Link href="/admin/dashboard" className={styles.brand}>
            unLecture
            <span className={styles.brandBadge}>Admin</span>
          </Link>
          {role && (
            <span className={`${styles.roleBadge} ${role === 'super_admin' ? styles.roleSuper : styles.roleManager}`}>
              {role === 'super_admin' ? 'Super Admin' : 'Event Manager'}
            </span>
          )}
        </div>
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? '✕' : '☰'}
        </button>
        <nav className={`${styles.nav} ${mobileNavOpen ? styles.navOpen : ''}`}>
          <Link
            href="/admin/dashboard"
            className={`${styles.navLink} ${pathname === '/admin/dashboard' ? styles.navLinkActive : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/events"
            className={`${styles.navLink} ${pathname.startsWith('/admin/events') ? styles.navLinkActive : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            Events
          </Link>
          <Link
            href="/admin/articles"
            className={`${styles.navLink} ${pathname.startsWith('/admin/articles') ? styles.navLinkActive : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            Articles
          </Link>
          <Link
            href="/admin/testimonials"
            className={`${styles.navLink} ${pathname.startsWith('/admin/testimonials') ? styles.navLinkActive : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            Testimonials
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.viewSiteLink}>
            View Site ↗
          </a>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
