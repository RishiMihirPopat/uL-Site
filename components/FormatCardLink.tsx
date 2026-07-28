'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/* ── FormatCardLink ─────────────────────────────────
   Wraps a format card with Framer Motion hover & press
   physics for smooth, tactile card interaction. */
export function FormatCardLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    router.push(href);
  }

  return (
    <motion.a
      href={href}
      className={className}
      onClick={handleClick}
      whileHover={{ y: -10, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
}

export function OverlayManager() {
  return null;
}

/* ── BackButton ─────────────────────────────────────
   Reverse navigation button with Framer Motion hover mechanics. */
export function BackButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    router.push('/#formats');
  }

  return (
    <motion.a
      href="/#formats"
      className={className}
      onClick={handleClick}
      whileHover={{ x: -5, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.a>
  );
}
