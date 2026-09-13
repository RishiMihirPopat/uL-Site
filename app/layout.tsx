import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import ResolutionDebug from '@/components/ResolutionDebug';
import './globals.css';

export const metadata: Metadata = {
  title: 'unLecture',
  description: 'A recurring series of lectures, conversations, and gatherings in unconventional spaces across India.',
  icons: {
    icon: [{ url: '/custom-assets/favicon.png', sizes: '800x629', type: 'image/png' }],
    apple: [{ url: '/custom-assets/favicon.png', sizes: '800x629', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        <CustomCursor />
        <ResolutionDebug />
        <div className="v2-bg-texture" aria-hidden="true">
          <img src="/custom-assets/bg-grid-texture.png" alt="" />
        </div>
        <div className="v2-scale-wrap">
          <Nav />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
