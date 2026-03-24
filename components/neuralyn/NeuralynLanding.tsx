'use client';

import { useRef, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';

// ─── Constants ─────────────────────────────────────────────────────────────────

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

const TESTIMONIAL =
  'Neuralyn revolutionized how we handle financial insights using smart analytics. We are now driving better outcomes quicker than we ever imagined! Neuralyn revolutionized how we handle financial insights using smart analytics.';

/** Liquid-glass border effect — scoped to .nl-lg so it never touches PetalNote */
const LIQUID_GLASS_CSS = `
.nl-lg {
  background: rgba(255,255,255,0.01);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.nl-lg::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,.45) 0%,
    rgba(255,255,255,.15) 20%,
    rgba(255,255,255,0)   40%,
    rgba(255,255,255,0)   60%,
    rgba(255,255,255,.15) 80%,
    rgba(255,255,255,.45) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
`;

// ─── Token shorthands (inline style values) ───────────────────────────────────

const NL = {
  sans: 'var(--nl-sans, Inter, system-ui, sans-serif)',
  serif: 'var(--nl-serif, "Instrument Serif", Georgia, serif)',
  fg: '#ffffff',
  bg: '#000000',
  muted: 'hsl(0,0%,65%)',
  heroSub: 'hsl(210,17%,95%)',
  card: 'hsl(0,0%,5%)',
  border: 'hsl(0,0%,20%)',
} as const;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function LogoIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="3" fill="white" />
      <circle cx="24" cy="22" r="3" fill="white" />
      <circle cx="8"  cy="22" r="3" fill="white" />
      <line x1="16" y1="13" x2="22.5" y2="19.5" stroke="white" strokeWidth="1" strokeOpacity=".5" />
      <line x1="16" y1="13" x2="9.5"  y2="19.5" stroke="white" strokeWidth="1" strokeOpacity=".5" />
      <line x1="22" y1="22" x2="10"   y2="22"    stroke="white" strokeWidth="1" strokeOpacity=".5" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <path d="M2.5 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" fill="none" aria-hidden>
      <path
        d="M0 40V24.8C0 18.13 1.6 12.53 4.8 8 8.11 3.47 12.8.53 18.88 0L20.48 3.84c-4.48.85-7.73 2.72-9.76 5.6C8.69 12.32 7.79 15.89 8 20.16H16V40H0ZM32 40V24.8C32 18.13 33.6 12.53 36.8 8c3.31-4.53 8-7.47 14.08-8L52.48 3.84c-4.48.85-7.73 2.72-9.76 5.6C40.69 12.32 39.79 15.89 40 20.16H48V40H32Z"
        fill="white" fillOpacity=".85"
      />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function NlNavbar() {
  const navLinks = ['Home', 'Services', 'Reviews', 'Contact us'] as const;

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        position: 'relative',
        zIndex: 50,
      }}
      className="md:!px-28"
    >
      {/* ── Left: Logo + links ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(48px, 8vw, 80px)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogoIcon />
          <span
            style={{
              fontFamily: NL.sans,
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: NL.fg,
              lineHeight: 1,
            }}
          >
            Neuralyn
          </span>
        </div>

        {/* Nav links — hidden below md */}
        <div
          className="hidden md:flex"
          style={{ alignItems: 'center', gap: '4px' }}
        >
          {navLinks.map((label) => (
            <NlNavLink key={label} label={label} hasArrow={label === 'Services'} />
          ))}
        </div>
      </div>

      {/* ── Right: Sign In ── */}
      <motion.button
        whileHover={{ opacity: 0.88 }}
        whileTap={{ scale: 0.96 }}
        style={{
          fontFamily: NL.sans,
          fontSize: '0.875rem',
          fontWeight: 600,
          color: NL.bg,
          background: NL.fg,
          border: 'none',
          borderRadius: '10px',
          padding: '9px 20px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        Sign In
      </motion.button>
    </nav>
  );
}

function NlNavLink({ label, hasArrow }: { label: string; hasArrow?: boolean }) {
  return (
    <button
      style={{
        fontFamily: NL.sans,
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.68)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'color 0.18s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = NL.fg; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.68)'; }}
    >
      {label}
      {hasArrow && <ChevronDown />}
    </button>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function NlHero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Text group fades and moves up over the first 50 % of scroll through section
  const textY       = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Dashboard image drifts up slightly as user scrolls past section
  const dashY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: NL.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NlNavbar />

      {/* ── Animated text group ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="flex flex-col items-center text-center mt-16 md:mt-20 px-4 relative"
        // z-index via inline since PetalNote has no z-10 conflicts here
      >
        {/* Tag pill — liquid glass */}
        <motion.div
          className="nl-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontFamily: NL.sans,
              fontSize: '0.875rem',
              fontWeight: 500,
              background: NL.fg,
              color: NL.bg,
              borderRadius: '6px',
              padding: '2px 8px',
            }}
          >
            New
          </span>
          <span style={{ fontFamily: NL.sans, fontSize: '0.875rem', fontWeight: 500, color: NL.muted }}>
            Say Hello to Corewave v3.2
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          style={{
            fontFamily: NL.sans,
            fontSize: 'clamp(2.75rem, 7vw, 4.5rem)',
            fontWeight: 500,
            letterSpacing: '-2px',
            lineHeight: 1.1,
            marginBottom: '12px',
            color: NL.fg,
          }}
        >
          Your Insights.
          <br />
          One Clear{' '}
          <span
            style={{
              fontFamily: NL.serif,
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            Overview.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          style={{
            fontFamily: NL.sans,
            fontSize: '1.125rem',
            fontWeight: 400,
            lineHeight: 1.5,
            opacity: 0.9,
            color: NL.heroSub,
            marginBottom: '32px',
          }}
        >
          Neuralyn helps teams track metrics, goals,{' '}
          <br className="hidden md:block" />
          and progress with precision.
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          style={{
            fontFamily: NL.sans,
            fontSize: '1rem',
            fontWeight: 500,
            color: NL.bg,
            background: NL.fg,
            border: 'none',
            borderRadius: '999px',
            padding: '14px 32px',
            cursor: 'pointer',
          }}
        >
          Get Started for Free
        </motion.button>
      </motion.div>

      {/* ── Dashboard + video area ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        style={{
          // Full-bleed: break out of any centered container
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          aspectRatio: '16 / 9',
          position: 'relative',
          marginTop: '48px',
        }}
      >
        {/* Background video */}
        <video
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Dashboard screenshot with parallax */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            y: dashY,
          }}
        >
          <img
            src="/neuralyn/hero-dashboard.png"
            alt="Neuralyn analytics dashboard"
            style={{
              maxWidth: '56rem',
              width: '90%',
              borderRadius: '16px',
              mixBlendMode: 'luminosity',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            // Silently hide if image not yet added by user
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </motion.div>

        {/* Bottom gradient fade into background */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '10rem',
            background: `linear-gradient(to top, ${NL.bg}, transparent)`,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </section>
  );
}

// ─── Word-reveal span ─────────────────────────────────────────────────────────

function WordReveal({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const end   = (index + 1) / total;

  const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
  const color   = useTransform(
    scrollYProgress,
    [start, end],
    ['hsl(0,0%,35%)', 'hsl(0,0%,100%)'],
  );

  return (
    <motion.span
      style={{ opacity, color, marginRight: '0.3em', display: 'inline-block' }}
    >
      {word}
    </motion.span>
  );
}

// ─── Testimonial Section ──────────────────────────────────────────────────────

function NlTestimonial() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end center'],
  });

  const words = TESTIMONIAL.split(' ');
  const total = words.length;

  return (
    <section
      style={{
        minHeight: '100vh',
        backgroundColor: NL.bg,
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(4rem, 8vw, 8rem) 2rem',
      }}
    >
      <div
        ref={containerRef}
        style={{
          maxWidth: '48rem',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '2.5rem',
        }}
        className="md:!px-0 px-0"
      >
        {/* Quote graphic */}
        <QuoteIcon />

        {/* Animated testimonial text */}
        <p
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontFamily: NL.sans,
            fontWeight: 500,
            lineHeight: 1.2,
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            margin: 0,
          }}
        >
          {words.map((word, i) => (
            <WordReveal
              key={`${word}-${i}`}
              word={word}
              index={i}
              total={total}
              scrollYProgress={scrollYProgress}
            />
          ))}
          <motion.span
            style={{ marginLeft: '8px', color: NL.muted, display: 'inline-block' }}
          >
            &ldquo;
          </motion.span>
        </p>

        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NlAvatar />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontFamily: NL.sans,
                fontSize: '1rem',
                fontWeight: 600,
                lineHeight: 1.75,
                color: NL.fg,
              }}
            >
              Brooklyn Simmons
            </span>
            <span
              style={{
                fontFamily: NL.sans,
                fontSize: '0.875rem',
                fontWeight: 400,
                lineHeight: 1.4,
                color: NL.muted,
              }}
            >
              Product Manager
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Avatar with letter fallback if image isn't available yet */
function NlAvatar() {
  return (
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: '3px solid #fff',
        flexShrink: 0,
        overflow: 'hidden',
        background: 'hsl(0,0%,15%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: NL.sans,
        fontSize: '1.25rem',
        fontWeight: 600,
        color: NL.fg,
      }}
    >
      <img
        src="/neuralyn/avatar.png"
        alt="Brooklyn Simmons"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      {/* "B" shows through when img fails (img collapses, div bg + text visible) */}
      B
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function NeuralynLanding() {
  // Inject scoped liquid-glass CSS once on mount
  useEffect(() => {
    const ID = 'nl-liquid-glass-style';
    if (!document.getElementById(ID)) {
      const el = document.createElement('style');
      el.id = ID;
      el.textContent = LIQUID_GLASS_CSS;
      document.head.appendChild(el);
    }
  }, []);

  return (
    // bg-black forces pure black even though PetalNote root body is #0D0D0D
    <div
      style={{
        backgroundColor: NL.bg,
        minHeight: '100vh',
        fontFamily: NL.sans,
        // Contain all z-index stacking to Neuralyn's subtree
        isolation: 'isolate',
      }}
    >
      <NlHero />
      <NlTestimonial />
    </div>
  );
}
