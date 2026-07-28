'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Check auth
    fetch('/api/admin/settings')
      .then(res => {
        if (!res.ok) {
          router.push('/admin');
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        router.push('/admin');
      });
  }, [pathname, router, isLoginPage]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
  };

  if (loading) return <div>Loading...</div>;

  if (isLoginPage) {
    return <div className={styles.container}>{children}</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <Link href="/admin/dashboard" className={styles.brand}>unLecture Admin</Link>
        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/admin/events" className={styles.navLink}>Events</Link>
          <Link href="/admin/settings" className={styles.navLink}>Settings</Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </nav>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
