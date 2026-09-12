'use client';

import React from 'react';
import Link from 'next/link';

/* ── FormatCardLink ─────────────────────────────────
   Standard Next.js Link for format cards with instant prefetching
   and clean navigation without scroll jumps. */
export function FormatCardLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function OverlayManager() {
  return null;
}

/* ── BackButton ─────────────────────────────────────
   Reverse navigation back to the formats section. */
export function BackButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link href="/#formats" className={className}>
      {children}
    </Link>
  );
}
