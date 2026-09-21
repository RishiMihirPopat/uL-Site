'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface ScaleWrapProps {
  children: React.ReactNode;
}

/**
 * Conditionally applies the 1920px Figma scale-to-fit zoom wrapper and background
 * texture to public site routes only. Admin routes are rendered natively at full
 * viewport width without zoom scaling to prevent layout shrinkage and scrolling issues.
 */
export default function ScaleWrap({ children }: ScaleWrapProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="v2-bg-texture" aria-hidden="true">
        <img src="/custom-assets/bg-grid-texture.png" alt="" />
      </div>
      <div className="v2-scale-wrap">
        {children}
      </div>
    </>
  );
}
