'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EASE } from '@/lib/constants/animation';

export function CardTitle({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={className}>
      {children}
    </h3>
  );
}

export function HeaderTitle({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.05,
        ease: EASE,
      }}
    >
      {children}
    </motion.h1>
  );
}
