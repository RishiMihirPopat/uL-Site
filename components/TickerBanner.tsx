'use client';

import React from 'react';
import styles from './TickerBanner.module.css';

interface TickerBannerProps {
  text?: string;
}

export default function TickerBanner({
  text = 'Next Gathering: Intimate Lectures in Unconventional Spaces • Limited Capacity • Book on Urbanaut • New Sessions Announced Weekly',
}: TickerBannerProps) {
  // Repeat the text block multiple times to create a seamless infinite marquee
  const items = Array.from({ length: 6 }, () => text);

  return (
    <div className={styles.tickerWrap} aria-hidden="true" role="marquee">
      <div className={styles.tickerTrack}>
        {items.map((str, idx) => (
          <span key={idx} className={styles.tickerItem}>
            {str}
          </span>
        ))}
      </div>
    </div>
  );
}
