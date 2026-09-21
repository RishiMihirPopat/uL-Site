import type { Metadata, Viewport } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import ScaleWrap from '@/components/ScaleWrap';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

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
        <ScaleWrap>
          <Nav />
          {children}
          <Footer />
        </ScaleWrap>
      </body>
    </html>
  );
}
