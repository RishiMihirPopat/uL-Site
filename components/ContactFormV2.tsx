'use client';

import { useEffect, useRef, useState } from 'react';
import { contactPageV2 } from '../lib/content';
import styles from './ContactFormV2.module.css';

const ROLE_OPTIONS = ['Speaker', 'Venue', 'Partner', 'Sponsor', 'Volunteer', 'Team member', 'Other'];

const CONTACT_SCRIPT_URL =
  process.env.NEXT_PUBLIC_CONTACT_GOOGLE_SHEET_URL ||
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  '';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactFormV2() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reachingOutAs, setReachingOutAs] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roleOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRoleOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [roleOpen]);

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
      reaching_out_as: reachingOutAs || 'Other',
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
      setReachingOutAs('');
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
        <button type="button" className={styles.resetBtn} onClick={() => setStatus('idle')}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fields}>
        <div className={styles.row}>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); resetError(); }}
            placeholder={contactPageV2.namePlaceholder}
            required
            disabled={status === 'loading'}
            className={styles.input}
            aria-label="Your full name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); resetError(); }}
            placeholder={contactPageV2.emailPlaceholder}
            required
            disabled={status === 'loading'}
            className={styles.input}
            aria-label="Email address"
          />
        </div>

        <div className={styles.row}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); resetError(); }}
            placeholder={contactPageV2.phonePlaceholder}
            disabled={status === 'loading'}
            className={styles.input}
            aria-label="Mobile number"
          />
          <div className={styles.selectWrap} ref={roleRef}>
            <button
              type="button"
              disabled={status === 'loading'}
              className={`${styles.input} ${styles.select} ${reachingOutAs ? styles.selectFilled : ''}`}
              onClick={() => setRoleOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={roleOpen}
            >
              {reachingOutAs || contactPageV2.rolePlaceholder}
            </button>
            <img
              src="/custom-assets/contact-select-arrow.svg"
              alt=""
              className={`${styles.selectArrow} ${roleOpen ? styles.selectArrowOpen : ''}`}
              aria-hidden="true"
            />
            {roleOpen && (
              <ul className={styles.selectMenu} role="listbox">
                {ROLE_OPTIONS.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={reachingOutAs === option}
                      className={styles.selectOption}
                      onClick={() => {
                        setReachingOutAs(option);
                        setRoleOpen(false);
                        resetError();
                      }}
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); resetError(); }}
          placeholder={contactPageV2.messagePlaceholder}
          required
          disabled={status === 'loading'}
          className={styles.textarea}
        />
      </div>

      {status === 'error' && (
        <p className={styles.errorMsg} role="alert">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className={styles.btn}
      >
        {status === 'loading' ? (
          'Sending…'
        ) : (
          <span className={styles.btnTextWrap}>
            <span className={styles.btnText}>{contactPageV2.submitLabel}</span>
            <span className={styles.btnText}>Let&apos;s Goooo!</span>
          </span>
        )}
      </button>
    </form>
  );
}
