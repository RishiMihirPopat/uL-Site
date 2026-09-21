'use client';

import { useEffect } from 'react';
import { lenisRef } from '@/lib/lenis';

/**
 * Custom hook for modals, drawers, and full-screen overlays (SRP & DRY).
 * Locks body scroll and pauses Lenis smooth scroll while active,
 * and triggers `onClose` when the user presses Escape.
 */
export function useModalDismiss(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenisRef.current?.stop();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow || '';
      lenisRef.current?.start();
    };
  }, [active, onClose]);
}
