'use client';

import { useCallback, useEffect, useRef } from 'react';

export type OutsideCloseRef<T extends HTMLElement = HTMLDivElement> = {
  (node: T | null): void;
  current: T | null;
};

/**
 * Custom hook for dropdowns and popovers.
 * Closes the target element when clicking outside or pressing Escape (SRP & DRY).
 * Supports components that render both desktop and mobile variants in the DOM simultaneously.
 */
export function useOutsideClose<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void
): OutsideCloseRef<T> {
  const elementsRef = useRef<Set<T>>(new Set());

  const refCallback = useCallback((node: T | null) => {
    if (node) {
      elementsRef.current.add(node);
    } else {
      elementsRef.current = new Set(
        Array.from(elementsRef.current).filter((el) => el.isConnected)
      );
    }
  }, []) as OutsideCloseRef<T>;

  Object.defineProperty(refCallback, 'current', {
    get: () => Array.from(elementsRef.current)[0] ?? null,
    configurable: true,
  });

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      for (const el of elementsRef.current) {
        if (el.isConnected && el.contains(target)) {
          return;
        }
      }
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  return refCallback;
}
