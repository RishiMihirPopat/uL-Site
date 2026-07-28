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

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className={styles.card} style={{ width: '400px' }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h1>
        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
        <form onSubmit={handleLogin} className={styles.form}>
          <div>
            <label>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Login</button>
        </form>
      </div>
    </div>
  );
}
