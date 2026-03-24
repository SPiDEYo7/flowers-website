'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FloatingPetals } from '@/components/animations/FloatingPetals';
import { Navbar } from '@/components/Navbar';

const FlowerField = dynamic(
  () => import('@/components/three/FlowerField').then((m) => ({ default: m.FlowerField })),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-gradient-dusk" /> }
);

const FEATURES = [
  { icon: '🌹', title: 'Choose Your Flowers',   desc: 'Roses, lilies, sunflowers, orchids and more. Mix and match for the perfect bouquet.' },
  { icon: '🎨', title: 'Customise Everything',  desc: 'Pick colour themes, card backgrounds, and crafted messages. Make it truly yours.' },
  { icon: '🎵', title: 'Add Music & Media',     desc: 'Attach a photo, video, and ambient music to create a full sensory experience.' },
  { icon: '🔗', title: 'Share a Magic Link',    desc: 'Generate a unique URL. The recipient gets a cinematic animated reveal.' },
];

const STEPS = [
  { num: '01', title: 'Build Your Bouquet',    desc: 'Pick flowers and colours in the 3D creator.' },
  { num: '02', title: 'Write Your Message',    desc: 'Personalise with words, photos, or a video.' },
  { num: '03', title: 'Send the Link',         desc: 'Share your card URL — no account needed.' },
  { num: '04', title: 'They Experience Magic', desc: 'A cinematic animated reveal awaits them.' },
];

// ─── Framer-Motion variants (viewport-triggered, avoids GSAP immediateRender) ──
const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const stepVariants = {
  hidden:  { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0"><FlowerField /></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0D0D0D]/70 via-transparent to-[#0D0D0D]/85" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-neo-black/90 border-2 border-petal-pink shadow-neo-pink backdrop-blur-sm"
        >
          <span className="text-petal-pink text-sm font-mono font-bold tracking-widest uppercase">
            ✦ Send something beautiful
          </span>
        </motion.div>

        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-black text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] mb-8"
        >
          <span className="block text-neo-white drop-shadow-lg">Create a</span>
          <span className="block shimmer-text">Digital Bouquet</span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-neo-white/80 max-w-2xl mx-auto mb-12 font-body leading-relaxed"
        >
          Send an animated 3D flower experience with a personal love card —
          via a simple shareable link. No app needed.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/create" className="neo-btn neo-btn-rose text-lg px-10 py-4 font-display">
            🌸 Make Your Bouquet
          </Link>
          <a href="#how-it-works" className="neo-btn-dark text-lg px-10 py-4 font-display">
            See How It Works →
          </a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <span className="text-xs text-neo-white/40 uppercase tracking-[0.3em] font-mono">scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-petal-pink/80 to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
// Uses Framer Motion viewport instead of GSAP — elements are always visible in HTML
// and animate in on scroll; no risk of permanent opacity:0 state.
function Features() {
  return (
    <section className="section-padding bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as any }}
        >
          <span className="neo-tag mb-4 inline-block">Features</span>
          <h2 className="font-display font-black text-5xl md:text-7xl text-neo-white mt-4 leading-tight">
            Everything you need<br />
            <span className="shimmer-text">to say it beautifully</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.icon}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -8, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="group neo-card-dark p-7 cursor-default overflow-hidden relative"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,179,198,0.08) 0%, transparent 70%)' }}
              />
              <div className="text-5xl mb-5 group-hover:scale-125 transition-transform duration-300 origin-left">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-petal-pink mb-2 leading-snug">{f.title}</h3>
              <p className="text-neo-white/65 text-sm leading-relaxed font-body">{f.desc}</p>
              {/* Bottom slide-in accent */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-petal-pink to-violet transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const router = useRouter();

  return (
    <section id="how-it-works" className="section-padding bg-[#0D0D0D] border-t border-neo-white/10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as any }}
        >
          <h2 className="font-display font-black text-5xl md:text-7xl text-neo-white leading-tight">
            How It <span className="shimmer-text">Works</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              custom={i}
              variants={stepVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ borderColor: '#FF4D6D' }}
              className="group flex gap-5 items-start p-7 border-2 border-neo-white/10 transition-colors duration-300 cursor-default"
            >
              <span className="font-mono text-5xl font-black text-petal-pink/25 group-hover:text-petal-pink transition-colors duration-300 leading-none select-none">
                {s.num}
              </span>
              <div>
                <h3 className="font-display font-bold text-xl text-neo-white mb-2">{s.title}</h3>
                <p className="text-neo-white/55 text-sm leading-relaxed font-body">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA — plain motion.button with router.push (avoids Link + button HTML nesting issue) */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            onClick={() => router.push('/create')}
            className="neo-btn-rose text-xl px-12 py-5 font-display inline-flex gap-3 items-center"
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            🌹 Start Creating Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Ticker strip ─────────────────────────────────────────────────────────────
function TickerStrip() {
  const items = ['Roses 🌹', 'Lilies 🌸', 'Sunflowers 🌻', 'Orchids 🪷', 'Share Love 💌', 'PetalNote ✦', 'Tulips 🌷', 'Daisies 🌼'];
  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div className="border-y border-petal-pink/20 py-4 overflow-hidden bg-[#0D0D0D]">
      <motion.div
        className="flex gap-10 items-center w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((t, i) => (
          <span key={i} className="font-display font-black text-2xl md:text-3xl text-neo-white/15 whitespace-nowrap">
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-neo-white/10 py-14 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display text-3xl font-black shimmer-text mb-1">PetalNote</p>
          <p className="text-neo-white/35 text-sm font-mono">Send love, digitally. 🌸</p>
        </div>
        <nav className="flex gap-6 text-sm font-mono text-neo-white/40">
          <Link href="/create" className="hover:text-petal-pink transition-colors">Create</Link>
          <a href="#how-it-works" className="hover:text-petal-pink transition-colors">How It Works</a>
        </nav>
        <p className="text-neo-white/25 text-xs font-mono">© {new Date().getFullYear()} PetalNote</p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <FloatingPetals count={14} />
        <Hero />
        <Features />
        <TickerStrip />
        <HowItWorks />
        <Footer />
      </main>
    </>
  );
}
