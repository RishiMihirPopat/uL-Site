'use client';

import { useState } from 'react';
import styles from './NewsletterForm.module.css';

/*
  ─────────────────────────────────────────────────────────────
  GOOGLE APPS SCRIPT SETUP
  ─────────────────────────────────────────────────────────────
  1. Go to script.google.com → New project
  2. Paste this code into the editor:

    function doPost(e) {
      const sheet = SpreadsheetApp
        .getActiveSpreadsheet()
        .getActiveSheet();
      const params = new URLSearchParams(e.postData.contents);
      sheet.appendRow([
        params.get('email'),
        params.get('timestamp'),
      ]);
      return ContentService
        .createTextOutput('ok')
        .setMimeType(ContentService.MimeType.TEXT);
    }

  3. Deploy → New deployment
       - Type: Web app
       - Execute as: Me
       - Who has access: Anyone
  4. Copy the deployment URL
  5. Paste it below as APPS_SCRIPT_URL
  ─────────────────────────────────────────────────────────────
*/
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKN8GJ6QvJuRzVSzcDdO8bshY0Cijdta_6y7SCl1i_DUFLaIiEzcINpB0sPtd8wKUIiQ/exec';
// ↑ PASTE YOUR GOOGLE APPS SCRIPT URL HERE

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterForm() {
  const [email, setEmail]   = useState('');
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

  return (
    <section className={styles.section}>
      <div className={styles.inner}>

        <p className={styles.eyebrow}>Newsletter</p>
        <h2 className={styles.heading}>Sign up to our newsletter</h2>

        {status === 'success' ? (
          <p className={styles.successMsg}>Thanks — you&apos;re in.</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.row}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
                className={styles.input}
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`${styles.btn} ${status === 'loading' ? styles.btnLoading : ''}`}
              >
                {status === 'loading' ? 'Sending…' : 'Subscribe'}
              </button>
            </div>

            {status === 'error' && (
              <p className={styles.errorMsg} role="alert">
                Something went wrong. Try again.
              </p>
            )}
          </form>
        )}

      </div>
    </section>
  );
}
