'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

/*
  ─────────────────────────────────────────────────────────────
  GOOGLE APPS SCRIPT SETUP
  ─────────────────────────────────────────────────────────────
  The deployment URL lives in .env.local as
  NEXT_PUBLIC_GOOGLE_SCRIPT_URL (see repo root). The deployed
  Apps Script expects a JSON body: { name, email, phone, message }
  and appends [name, email, phone, message, timestamp] to the
  "unLecture Contacts" sheet, generating its own timestamp.

  We send the body as Content-Type: text/plain rather than
  application/json — this keeps the request "simple" so no CORS
  preflight is triggered (Apps Script web apps don't support
  preflight OPTIONS requests). The script still JSON.parses the
  raw body regardless of the declared content type.
  ─────────────────────────────────────────────────────────────
*/
const CONTACT_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ?? '';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [message, setMessage] = useState('');
  const [status,  setStatus]  = useState<Status>('idle');

  function resetError() {
    if (status === 'error') setStatus('idle');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email || !message || status === 'loading') return;

    if (!CONTACT_SCRIPT_URL) {
      console.error('NEXT_PUBLIC_GOOGLE_SCRIPT_URL is not set');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      await fetch(CONTACT_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body:    JSON.stringify({ name, email, phone, message }),
      });

      // mode: 'no-cors' means the response is opaque — we can't read
      // status/body, so we optimistically treat the request as sent.
      setStatus('success');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successWrap}>
        <p className={styles.successMsg}>Message received.</p>
        <p className={styles.successSub}>We&apos;ll be in touch soon.</p>
        <button className={styles.resetBtn} onClick={() => setStatus('idle')}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-name">Name</label>
        <input
          id="cf-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); resetError(); }}
          placeholder="Your name"
          required
          disabled={status === 'loading'}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); resetError(); }}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-phone">Phone</label>
        <input
          id="cf-phone"
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); resetError(); }}
          placeholder="+91 XXXXX XXXXX"
          disabled={status === 'loading'}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); resetError(); }}
          placeholder="What's on your mind?"
          required
          rows={5}
          disabled={status === 'loading'}
          className={`${styles.input} ${styles.textarea}`}
        />
      </div>

      {status === 'error' && (
        <p className={styles.errorMsg} role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className={`${styles.btn} ${status === 'loading' ? styles.btnLoading : ''}`}
      >
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>

    </form>
  );
}
