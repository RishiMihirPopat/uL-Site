'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { useModalDismiss } from '@/lib/hooks/useModalDismiss';
import { EASE } from '@/lib/constants/animation';
import styles from './BookingModal.module.css';

interface BookingModalProps {
  booking?: { url: string; title: string } | null;
  url?: string;
  title?: string;
  onClose: () => void;
}

export default function BookingModal({ booking, url, title, onClose }: BookingModalProps) {
  const activeBooking = booking ?? (url ? { url, title: title || '' } : null);
  const isOpen = Boolean(activeBooking && activeBooking.url);
  const [iframeLoading, setIframeLoading] = useState(true);

  useModalDismiss(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setIframeLoading(true);
    }
  }, [activeBooking?.url, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && activeBooking && (
        <motion.div
          key={`booking-modal-${activeBooking.url}`}
          className={styles.overlay}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Book Tickets: ${activeBooking.title}`}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {/* Archival Dossier Top Bar */}
            <div className={styles.modalHeader}>
              <button
                type="button"
                className={styles.modalBackBtn}
                onClick={onClose}
                aria-label="Back to website"
              >
                <span className={styles.backArrow}>←</span>
                <span className={styles.backBtnText}>BACK TO SITE</span>
              </button>

              <div className={styles.headerCenter}>
                <span className={styles.kicker}>SECURE URBANAUT BOOKING</span>
                <span className={styles.modalTitle} title={activeBooking.title}>
                  {activeBooking.title}
                </span>
              </div>

              <div className={styles.modalActions}>
                <a
                  href={activeBooking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalBtn}
                  title="Open booking in external window"
                >
                  <span className={styles.externalBtnText}>OPEN IN URBANAUT</span>
                  <ArrowSquareOut size={13} weight="bold" />
                </a>

                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={onClose}
                  aria-label="Close booking view"
                >
                  <span className={styles.closeText}>CLOSE</span>
                  <span className={styles.closeIcon}>✕</span>
                </button>
              </div>
            </div>

            {/* Scalloped Wave Edge Accent */}
            <div className={styles.waveDivider} aria-hidden="true">
              <svg
                viewBox="0 0 1200 12"
                preserveAspectRatio="none"
                className={styles.waveSvg}
              >
                <path
                  d="M0,3 C100,-2 200,8 300,3 C400,-2 500,8 600,3 C700,-2 800,8 900,3 C1000,-2 1100,8 1200,3 L1200,9 C1100,14 1000,4 900,9 C800,14 700,4 600,9 C500,14 400,4 300,9 C200,14 100,4 0,9 Z"
                  fill="var(--color-primary)"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* Iframe Frame with Loading State */}
            <div className={styles.iframeContainer}>
              {iframeLoading && (
                <div className={styles.loadingSkeleton}>
                  <div className={styles.loadingSpinner} />
                  <p className={styles.loadingText}>CONNECTING TO SECURE BOOKING PORTAL...</p>
                </div>
              )}

              <iframe
                src={activeBooking.url}
                className={styles.iframe}
                title={`Book tickets: ${activeBooking.title}`}
                allow="payment"
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
