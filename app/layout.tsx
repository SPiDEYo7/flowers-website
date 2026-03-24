import type { Metadata } from 'next';
import { Fraunces, Sora, Manrope, Space_Mono, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { SmoothScroll } from '@/components/animations/SmoothScroll';
import { SessionProvider } from '@/components/providers/SessionProvider';

// ─── Premium Font Stack ────────────────────────────────────────────────────────
// Fraunces  → romantic, editorial serif headings
// Sora      → clean, modern geometric subheadings / UI labels
// Manrope   → highly legible body text
// Space Mono → monospace accents / tags / code
// Playfair Display → elegant serif for bouquet names

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sub',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PetalNote — Send Digital Flower Bouquets',
  description:
    'Create breathtaking 3D digital flower bouquets and cinematic love cards. Share a magical moment with someone special — via a simple link.',
  keywords: ['digital flowers', 'love card', 'bouquet', 'romantic gift', 'animated card', 'PetalNote'],
  openGraph: {
    title: 'PetalNote — Send Digital Flower Bouquets',
    description: 'Create breathtaking 3D flower bouquets and animated love cards.',
    images: ['/og-image.jpg'],
  },
};

const fontVars = [
  fraunces.variable,
  sora.variable,
  manrope.variable,
  spaceMono.variable,
  playfair.variable,
].join(' ');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVars}>
      <head />
      <body className="bg-[#0D0D0D] text-[#FAFAFA] antialiased font-body">
        <SessionProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </SessionProvider>
      </body>
    </html>
  );
}
