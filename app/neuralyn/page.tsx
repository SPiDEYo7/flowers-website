/**
 * Neuralyn Landing Page
 * Route: /neuralyn
 *
 * This is a completely standalone marketing page — it does NOT modify any
 * PetalNote components, themes, CSS variables, or global styles.
 * PetalNote's root layout still wraps this page (providing the html/body tags)
 * but all Neuralyn styles are scoped via `nl-` prefixed classes and CSS variables
 * injected directly into the component.
 */

import { Inter, Instrument_Serif } from 'next/font/google';
import NeuralynLanding from '@/components/neuralyn/NeuralynLanding';

// Neuralyn-specific fonts — loaded as CSS variables so they only apply
// on elements that explicitly reference them (won't affect PetalNote)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--nl-sans',
  display: 'swap',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--nl-serif',
  display: 'swap',
});

export const metadata = {
  title: 'Neuralyn — Analytics Dashboard',
  description:
    'Neuralyn helps teams track metrics, goals, and progress with precision.',
};

export default function NeuralynPage() {
  return (
    // Font variables are scoped to this subtree — PetalNote pages are unaffected
    <div className={`${inter.variable} ${serif.variable}`}>
      <NeuralynLanding />
    </div>
  );
}
