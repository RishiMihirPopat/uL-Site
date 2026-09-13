'use client';

import { useEffect, useState } from 'react';

/** TEMP — viewport resolution readout for checking the 1401–1919px
 *  scale-to-fit range. Remove once responsiveness checks are done. */
export default function ResolutionDebug() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!size) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 2147483647,
        background: '#000',
        color: '#0f0',
        font: '12px/1.4 monospace',
        padding: '4px 8px',
        borderRadius: 4,
        pointerEvents: 'none',
      }}
    >
      {size.w} × {size.h}
    </div>
  );
}
