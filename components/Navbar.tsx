'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Auth loaded dynamically — isolates next-auth/react so the Navbar
// never crashes if auth env vars are missing or the module has issues.
const NavbarAuth = dynamic(
  () => import('./NavbarAuth').then((m) => ({ default: m.NavbarAuth })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2">
        <div className="w-14 h-6 bg-neo-white/8 animate-pulse" />
        <div className="w-20 h-8 bg-petal-pink/15 animate-pulse border-2 border-neo-black/10" />
      </div>
    ),
  }
);

// ─── PetalNote Logo ───────────────────────────────────────────────────────────
function PetalLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="16" cy="9"  rx="4.5" ry="7.5" fill="#FF85A1" opacity="0.9" transform="rotate(0   16 16)" />
      <ellipse cx="16" cy="9"  rx="4.5" ry="7.5" fill="#FFB3C6" opacity="0.8" transform="rotate(60  16 16)" />
      <ellipse cx="16" cy="9"  rx="4.5" ry="7.5" fill="#C8B6E2" opacity="0.8" transform="rotate(120 16 16)" />
      <ellipse cx="16" cy="9"  rx="4.5" ry="7.5" fill="#FF4D6D" opacity="0.75" transform="rotate(180 16 16)" />
      <ellipse cx="16" cy="9"  rx="4.5" ry="7.5" fill="#DDA0DD" opacity="0.8" transform="rotate(240 16 16)" />
      <ellipse cx="16" cy="9"  rx="4.5" ry="7.5" fill="#FF85A1" opacity="0.8" transform="rotate(300 16 16)" />
      <circle cx="16" cy="16" r="4" fill="#FFD700" />
      <circle cx="16" cy="16" r="2" fill="#FF8C00" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: '/create',        label: 'Create Bouquet' },
  { href: '/#how-it-works', label: 'How It Works'   },
  { href: '/gallery',       label: 'Gallery'         },
  { href: '/dashboard',     label: 'My Cards'        },
];

// ─── Desktop nav link ─────────────────────────────────────────────────────────
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative text-sm font-sub font-medium tracking-wide transition-colors duration-200 group
        ${active ? 'text-petal-pink' : 'text-neo-white/60 hover:text-neo-white'}`}
    >
      {label}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 bg-petal-pink transition-all duration-300
          ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}
      />
    </Link>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-neo-black/60 backdrop-blur-sm"
          />
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0D0D0D] border-l-2 border-neo-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neo-white/10">
              <div className="flex items-center gap-2">
                <PetalLogo size={24} />
                <span className="font-display font-black text-xl shimmer-text">PetalNote</span>
              </div>
              <button
                onClick={onClose}
                className="text-neo-white/50 hover:text-neo-white text-2xl leading-none transition-colors"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-5 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="block px-4 py-3 text-sm font-sub text-neo-white/70 hover:text-petal-pink hover:bg-petal-pink/5 border border-transparent hover:border-petal-pink/20 transition-all duration-150"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Mobile auth */}
            <div className="p-5 border-t border-neo-white/10 space-y-2">
              <Link
                href="/auth/signin"
                onClick={onClose}
                className="block w-full text-center py-2.5 text-sm font-sub border-2 border-neo-white/20 text-neo-white/70 hover:border-petal-pink hover:text-petal-pink transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signin"
                onClick={onClose}
                className="block w-full text-center py-2.5 text-sm font-sub font-bold bg-petal-pink text-neo-black border-2 border-neo-black shadow-neo hover:-translate-y-0.5 transition-all"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled]  = useState(false);
  const [menuOpen, setMenuOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300
          ${scrolled
            ? 'border-b-2 border-neo-white/10 bg-[#0D0D0D]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'border-b-2 border-transparent bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <PetalLogo size={30} />
            </motion.div>
            <span className="font-display font-black text-xl tracking-tight shimmer-text">
              PetalNote
            </span>
          </Link>

          {/* Centre nav — desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                label={l.label}
                active={
                  pathname === l.href ||
                  (l.href !== '/' && l.href !== '/#how-it-works' && pathname?.startsWith(l.href))
                }
              />
            ))}
          </nav>

          {/* Right: Auth — desktop (dynamic, isolated from next-auth) */}
          <div className="hidden md:flex items-center">
            <NavbarAuth />
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex flex-col gap-1.5 p-2 group"
            aria-label="Open navigation menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-5 h-0.5 bg-neo-white/60 group-hover:bg-petal-pink transition-colors"
              />
            ))}
          </button>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
