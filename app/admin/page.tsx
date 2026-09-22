'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      window.location.href = '/admin/dashboard';
    } else {
      setError(data?.error || 'Invalid password. Please try again.');
    }
  };

  return (
    <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1.5rem 1rem' }}>
      <div className={styles.card} style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', border: '1px solid var(--color-border, #D6C9B0)', boxShadow: '0 4px 24px rgba(42, 36, 32, 0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'var(--font-brand, Atelier, serif)', fontSize: '2.2rem', color: 'var(--color-primary, #6B2D2D)', display: 'block', letterSpacing: '0.02em', lineHeight: 1.1 }}>
            unLecture
          </span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted, #3D332A)', marginTop: '6px', display: 'block' }}>
            Portal Administration
          </span>
        </div>
        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter administrator password..."
              required
            />
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%', marginTop: '0.5rem' }}>
            Enter Portal &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
