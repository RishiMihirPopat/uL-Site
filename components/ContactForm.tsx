'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

/*
  ─────────────────────────────────────────────────────────────
  GOOGLE APPS SCRIPT SETUP (Contact Form)
  ─────────────────────────────────────────────────────────────
  1. Go to script.google.com → New project
  2. Paste this Apps Script code:

    function doPost(e) {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      let data = {};
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        const params = new URLSearchParams(e.postData.contents);
        data = {
          name: params.get('name'),
          email: params.get('email'),
          phone: params.get('phone'),
          reaching_out_as: params.get('reaching_out_as'),
          message: params.get('message'),
        };
      }
      sheet.appendRow([
        new Date(),
        data.name || '',
        data.email || '',
        data.phone || '',
        data.reaching_out_as || 'Other',
        data.message || '',
      ]);
      return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
    }

  3. Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone)
  4. Put the URL in .env.local as NEXT_PUBLIC_GOOGLE_SCRIPT_URL or NEXT_PUBLIC_CONTACT_GOOGLE_SHEET_URL
  ─────────────────────────────────────────────────────────────
*/
const CONTACT_SCRIPT_URL =
  process.env.NEXT_PUBLIC_CONTACT_GOOGLE_SHEET_URL ||
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  '';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reachingOutAs, setReachingOutAs] = useState('Speaker');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  function resetError() {
    if (status === 'error') setStatus('idle');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name || !email || !message || status === 'loading') return;

    setStatus('loading');

    const payload = {
      name,
      email,
      phone,
      reaching_out_as: reachingOutAs,
      message,
      timestamp: new Date().toISOString(),
    };

    try {
      if (CONTACT_SCRIPT_URL) {
        await fetch(CONTACT_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
      }

      setStatus('success');
      setName('');
      setEmail('');
      setPhone('');
      setReachingOutAs('Speaker');
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
      {/* Name */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-name">
          Name *
        </label>
        <input
          id="cf-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            resetError();
          }}
          placeholder="Your name"
          required
          disabled={status === 'loading'}
          className={styles.input}
        />
      </div>

      {/* Email */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-email">
          Email *
        </label>
        <input
          id="cf-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            resetError();
          }}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          className={styles.input}
        />
      </div>

      {/* Phone */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-phone">
          Phone
        </label>
        <input
          id="cf-phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            resetError();
          }}
          placeholder="+91 XXXXX XXXXX"
          disabled={status === 'loading'}
          className={styles.input}
        />
      </div>

      {/* Reaching out as (Dropdown) */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-role">
          Reaching out as *
        </label>
        <div className={styles.selectWrap}>
          <select
            id="cf-role"
            value={reachingOutAs}
            onChange={(e) => {
              setReachingOutAs(e.target.value);
              resetError();
            }}
            disabled={status === 'loading'}
            className={styles.select}
          >
            <option value="Speaker">Speaker</option>
            <option value="Venue">Venue</option>
            <option value="Partner">Partner</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Team member">Team member</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-message">
          Message *
        </label>
        <textarea
          id="cf-message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            resetError();
          }}
          placeholder="What's on your mind?"
          required
          disabled={status === 'loading'}
          className={`${styles.input} ${styles.textarea}`}
        />
      </div>

      {status === 'error' && (
        <p className={styles.errorMsg}>
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className={`${styles.btn} ${status === 'loading' ? styles.btnLoading : ''}`}
      >
        {status === 'loading' ? 'Sending...' : 'Send Message \u2197'}
      </button>
    </form>
  );
}
