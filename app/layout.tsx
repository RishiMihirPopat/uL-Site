import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'unLecture',
  description: 'A recurring series of lectures, conversations, and gatherings in unconventional spaces across India.',
  icons: {
    icon: [{ url: '/Favicon.png', sizes: '800x629', type: 'image/png' }],
    apple: [{ url: '/Favicon.png', sizes: '800x629', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
