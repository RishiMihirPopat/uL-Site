'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './BookingModal.module.css';

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

export default function BookingModal({ url, title, onClose }: Props) {
  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Book: ${title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >

        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <div className={styles.modalActions}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              Open on Urbanaut ↗
            </a>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close booking modal">
              ✕
            </button>
          </div>
        </div>

        <iframe
          src={url}
          className={styles.iframe}
          title={`Book tickets: ${title}`}
          allow="payment"
        />

      </motion.div>
    </motion.div>
  );
}
