'use client';

import { useState } from 'react';
import styles from './NewsletterFormV2.module.css';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_NEWSLETTER_GOOGLE_SHEET_URL ||
  process.env.NEXT_PUBLIC_NEWSLETTER_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzKN8GJ6QvJuRzVSzcDdO8bshY0Cijdta_6y7SCl1i_DUFLaIiEzcINpB0sPtd8wKUIiQ/exec';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterFormV2() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || status === 'loading') return;

    setStatus('loading');

    try {
      const body = new URLSearchParams({
        email,
        timestamp: new Date().toISOString(),
      });

      /* no-cors required for Google Apps Script — response will be opaque */
      await fetch(APPS_SCRIPT_URL || 'https://example.com', {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    body.toString(),
      });

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p className={styles.successMsg}>Thanks — you&apos;re in.</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="yourname@gmail.com"
          required
          disabled={status === 'loading'}
          className={styles.input}
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={styles.btn}
        >
          {status === 'loading' ? (
            'Sending…'
          ) : (
            <span className={styles.btnTextWrap}>
              <span className={styles.btnText}>Subscribe now!</span>
              <span className={styles.btnText}>Pleaseeee!</span>
            </span>
          )}
        </button>
      </div>

      {status === 'error' && (
        <p className={styles.errorMsg} role="alert">
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
