'use client';

/**
 * Cinematic 6-scene card reveal experience.
 * Matches the DigiBouquet reference style:
 *   • Rich warm-cream gradient backgrounds
 *   • CSS 3D envelope flap open
 *   • Petal burst on envelope open
 *   • Auto-play music on load
 *   • Realistic paper-card reveal
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CARD_THEMES, COLOR_THEMES } from '@/lib/utils';

const FlowerIllustration = dynamic(
  () => import('@/components/bouquet/FlowerSVG').then((m) => ({ default: m.FlowerIllustration })),
  { ssr: false },
);

// ── Types ─────────────────────────────────────────────────────────────────────
interface CardData {
  id: string;
  slug: string;
  senderName: string | null;
  recipientName?: string | null;
  message: string;
  flowerStyle: string;
  colorTheme: string;
  cardTheme: string;
  mediaUrl: string | null;
  mediaType: string | null;
  musicTrack: string | null;
  bouquetData: unknown;
  createdAt: string;
}

type Scene =
  | 'greeting'
  | 'bouquet-grow'
  | 'bouquet-done'
  | 'envelope'
  | 'card-reveal'
  | 'card-open';

// ── Design tokens (warm romantic palette) ─────────────────────────────────────
// Each scene gets its own warm gradient so transitions feel like turning pages.
const BG_GREETING   = 'linear-gradient(155deg, #1A0C08 0%, #2E1612 40%, #1A0C08 100%)';
const BG_BOUQUET    = 'linear-gradient(155deg, #FDF4EC 0%, #FAE6D0 40%, #F7D4B4 70%, #F5C89C 100%)';
const BG_ENVELOPE   = 'linear-gradient(155deg, #FBF0E6 0%, #F7E0CC 40%, #F2CEAA 100%)';
const BG_CARD       = 'linear-gradient(155deg, #FDF8F2 0%, #FAF0E4 40%, #F7E8D4 100%)';

function cardBg(scene: Scene) {
  if (scene === 'greeting')                              return BG_GREETING;
  if (scene === 'bouquet-grow' || scene === 'bouquet-done') return BG_BOUQUET;
  if (scene === 'envelope')                              return BG_ENVELOPE;
  return BG_CARD;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCardStyle(id: string) {
  const t = CARD_THEMES.find((t) => t.id === id);
  return t
    ? { bg: t.bg, text: t.text, accent: t.accent }
    : { bg: '#FFF5EC', text: '#3D1A0C', accent: '#C0674A' };
}

// ── Auto-play music hook ──────────────────────────────────────────────────────
function useAutoMusic(track: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying]   = useState(false);
  const [canPlay, setCanPlay]   = useState(false);

  const URLS: Record<string, string> = {
    waltz:    '/music/waltz.mp3',
    piano:    '/music/piano.mp3',
    acoustic: '/music/acoustic.mp3',
  };
  const url = track && URLS[track] ? URLS[track] : null;

  // Try auto-start after first user interaction
  useEffect(() => {
    if (!url) return;
    const start = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.loop   = true;
        audioRef.current.volume = 0.28;
      }
      audioRef.current.play().then(() => {
        setPlaying(true);
        setCanPlay(true);
      }).catch(() => { setCanPlay(true); });
      window.removeEventListener('click', start);
    };
    window.addEventListener('click', start, { once: true });
    return () => {
      window.removeEventListener('click', start);
      audioRef.current?.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current || !canPlay) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  }, [playing, canPlay]);

  return { playing, toggle, hasTrack: !!url };
}

// ── Music pill ────────────────────────────────────────────────────────────────
function MusicPill({
  playing,
  onToggle,
  dark,
}: {
  playing: boolean;
  onToggle: () => void;
  dark: boolean;
}) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full
                 backdrop-blur-sm border text-xs font-mono transition-colors"
      style={dark
        ? { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.65)' }
        : { background: 'rgba(90,30,10,0.08)',    borderColor: 'rgba(90,30,10,0.14)',    color: 'rgba(90,30,10,0.70)' }
      }
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.span
        animate={playing ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ repeat: Infinity, duration: 0.75 }}
        style={{ color: '#C0674A' }}
      >
        {playing ? '♪' : '♩'}
      </motion.span>
      {playing ? 'Pause' : 'Play'}
    </motion.button>
  );
}

// ── Floating petals ───────────────────────────────────────────────────────────
const WARM_PETALS = ['#FFFFFF', '#FFF0E5', '#FFCDB0', '#FFE0D0', '#F5C0A8'];

function FloatingPetals({ dark = false }: { dark?: boolean }) {
  const petals = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => {
      const s = (n: number) => Math.sin(i * 37.3 + n) * 0.5 + 0.5;
      return {
        id:    i,
        x:     s(1) * 100,
        color: dark
          ? WARM_PETALS[i % WARM_PETALS.length]
          : WARM_PETALS[i % WARM_PETALS.length],
        size:  4 + s(3) * 9,
        delay: s(4) * 8,
        dur:   7 + s(5) * 9,
        drift: (s(6) - 0.5) * 90,
        rx:    1 + s(7) * 0.7,   // border-radius x ratio
      };
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [dark]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {petals.map((p) => (
        <motion.div
          key={p.id}
          animate={{
            y:       ['-6%', '108%'],
            x:       [`${p.x}%`, `${p.x + p.drift}%`],
            rotate:  [0, 280 + p.drift],
            opacity: dark ? [0, 0.55, 0.40, 0] : [0, 0.45, 0.30, 0],
          }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position:     'absolute',
            width:        p.size,
            height:       p.size * 0.65,
            borderRadius: `${p.rx * 50}% ${p.rx * 50}% ${(1 - p.rx) * 50 + 20}% 20%`,
            background:   p.color,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1: Greeting
// ─────────────────────────────────────────────────────────────────────────────
function GreetingScene({
  sender,
  accent,
  onNext,
}: {
  sender: string | null;
  accent: string;
  onNext: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onNext, 3500);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <motion.div
      key="greeting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0 }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 cursor-pointer select-none"
      onClick={onNext}
    >
      {/* Soft radial bloom */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ repeat: Infinity, duration: 4 }}
        style={{ background: `radial-gradient(ellipse at 50% 46%, ${accent}55 0%, transparent 60%)` }}
      />

      {/* Petal cascade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 relative z-10"
      >
        {['🌸', '🌹', '🌺', '🌷', '💐'].map((e, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 380, damping: 22 }}
            className="text-3xl md:text-4xl"
          >
            {e}
          </motion.span>
        ))}
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 font-display font-black text-4xl md:text-6xl lg:text-7xl
                   text-white text-center px-8 md:px-12 leading-tight"
        style={{ textShadow: `0 2px 40px ${accent}88, 0 0 80px rgba(0,0,0,0.5)` }}
      >
        I made something<br className="hidden md:block" /> for you.
      </motion.h1>

      {/* Sender */}
      {sender && (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="relative z-10 text-white/45 font-display italic text-base md:text-lg tracking-wide"
        >
          — with love, {sender}
        </motion.p>
      )}

      {/* Skip hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/22 text-xs font-mono tracking-widest"
      >
        tap anywhere to continue
      </motion.p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 + 3: Bouquet Growth
// ─────────────────────────────────────────────────────────────────────────────
const LAYOUT = [
  { cx: 50, cy: 15, scale: 1.14, rotation:  0  },
  { cx: 28, cy: 26, scale: 1.06, rotation: -20 },
  { cx: 72, cy: 26, scale: 1.06, rotation:  20 },
  { cx: 14, cy: 40, scale: 0.96, rotation: -30 },
  { cx: 50, cy: 36, scale: 1.02, rotation:   4 },
  { cx: 86, cy: 40, scale: 0.96, rotation:  30 },
  { cx: 32, cy: 52, scale: 0.90, rotation: -14 },
  { cx: 68, cy: 52, scale: 0.90, rotation:  14 },
  { cx: 18, cy: 63, scale: 0.82, rotation: -34 },
  { cx: 50, cy: 65, scale: 0.86, rotation:   0 },
];

interface BouquetFlower {
  type: string;
  slot: typeof LAYOUT[number];
}

function GrowingBouquet({
  bouquetData,
  accent,
  onAllBloomed,
}: {
  bouquetData: unknown;
  accent:       string;
  onAllBloomed: () => void;
}) {
  const [bloomed, setBloomed] = useState(0);

  const flowers: BouquetFlower[] = useMemo(() => {
    let raw: { flowerType?: string }[] = [];
    try { if (Array.isArray(bouquetData)) raw = bouquetData as typeof raw; } catch { /**/ }
    if (raw.length === 0) {
      // Fallback demo bouquet
      raw = ['rose','tulip','peony','sunflower','dahlia','cherry','daisy','lily'].map((t) => ({ flowerType: t }));
    }
    return raw.slice(0, 10).map((f, i) => ({
      type: f.flowerType ?? 'rose',
      slot: LAYOUT[i % LAYOUT.length],
    }));
  }, [bouquetData]);

  const total = flowers.length;

  useEffect(() => {
    if (total === 0) { onAllBloomed(); return; }
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setBloomed(i);
      if (i >= total) { clearInterval(iv); setTimeout(onAllBloomed, 700); }
    }, 380);
    return () => clearInterval(iv);
  }, [total, onAllBloomed]);

  const visible = flowers.slice(0, bloomed);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto" style={{ height: 360 }}>
      {/* Stems */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
        <defs>
          <linearGradient id="stem-g-cine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#66BB8A" />
            <stop offset="100%" stopColor="#2D6A50" />
          </linearGradient>
        </defs>
        {visible.map((f, i) => (
          <motion.line
            key={i}
            x1={`${f.slot.cx}%`} y1={`${f.slot.cy + 5}%`}
            x2="50%"             y2="92%"
            stroke="url(#stem-g-cine)"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.70 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Greenery leaves */}
      {visible.length >= 3 && (
        <>
          {[[-22, 68, -38], [122, 68, 38], [-10, 55, -52], [110, 55, 52]].map(([x, y, rot], i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: i * 0.08 }}
              style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, zIndex: 3 }}
            >
              <svg width="34" height="48" viewBox="0 0 40 60"
                style={{ transform: `translate(-50%,-50%) rotate(${rot}deg)` }}>
                <defs>
                  <linearGradient id={`lv${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#76C893" />
                    <stop offset="100%" stopColor="#2D6A4F" />
                  </linearGradient>
                </defs>
                <path d="M20 56 Q4 40 4 18 Q4 4 20 4 Q36 4 36 18 Q36 40 20 56Z" fill={`url(#lv${i})`} opacity="0.88" />
                <path d="M20 56 Q20 30 20 4" stroke="#1B5E20" strokeWidth="1" fill="none" opacity="0.40" />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {/* Flowers — back to front */}
      <AnimatePresence>
        {[...visible].sort((a, b) => LAYOUT.indexOf(a.slot) - LAYOUT.indexOf(b.slot)).map((f, i) => {
          const size = Math.round(f.slot.scale * 74);
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0, y: -20, rotate: f.slot.rotation - 15 }}
              animate={{ scale: 1, opacity: 1, y: 0,  rotate: f.slot.rotation }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              style={{
                position: 'absolute',
                left:  `${f.slot.cx}%`,
                top:   `${f.slot.cy}%`,
                zIndex: 10 + i,
                transform: `translate(-50%, -50%) rotate(${f.slot.rotation}deg)`,
              }}
            >
              {/* Bloom light glow */}
              <div style={{
                position: 'absolute', inset: -4,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${accent}44 0%, transparent 70%)`,
                filter: 'blur(6px)',
              }} />
              <FlowerIllustration id={f.type as import('@/components/bouquet/FlowerSVG').FlowerId} size={size} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Paper wrap */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ zIndex: 5 }}
      >
        <svg width="140" height="90" viewBox="0 0 140 90">
          <defs>
            <linearGradient id="wrap-cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFF8F0" />
              <stop offset="100%" stopColor="#EDD5B8" />
            </linearGradient>
          </defs>
          <path d="M20 0 L70 90 L120 0 Z" fill="url(#wrap-cg)" stroke="#C9A07A" strokeWidth="1.2" />
          <path d="M38 14 L70 86 L80 86 L52 14 Z" fill="rgba(255,155,120,0.35)" />
          <path d="M22 0 L30 0 L70 80 L67 80 Z" fill="rgba(255,255,255,0.38)" />
        </svg>
      </motion.div>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 38%, ${accent}28 0%, transparent 60%)`,
      }} />
    </div>
  );
}

function BouquetScene({
  bouquetData,
  accent,
  phase,
  onAllBloomed,
  onContinue,
}: {
  bouquetData:  unknown;
  accent:       string;
  phase:        'bouquet-grow' | 'bouquet-done';
  onAllBloomed: () => void;
  onContinue:   () => void;
}) {
  return (
    <motion.div
      key="bouquet"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-4"
    >
      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="font-display font-semibold text-sm tracking-widest uppercase"
           style={{ color: '#8B4A2A' }}>
          Your bouquet
        </p>
      </motion.div>

      <GrowingBouquet bouquetData={bouquetData} accent={accent} onAllBloomed={onAllBloomed} />

      {/* Continue button */}
      <AnimatePresence>
        {phase === 'bouquet-done' && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.88 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            onClick={onContinue}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="relative overflow-hidden px-12 py-4 rounded-full
                       font-display font-bold text-lg text-white shadow-xl"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)` }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 -skew-x-12"
              animate={{ x: ['-110%', '110%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)' }}
            />
            <span className="relative z-10">Continue →</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4: Envelope  (CSS 3D flap)
// ─────────────────────────────────────────────────────────────────────────────
function PetalBurst({ trigger, accent }: { trigger: boolean; accent: string }) {
  const BURST_COLORS = ['#FFFFFF', '#FFCDB0', '#FFE4D0', '#F5B0A8', '#FFEEDD', accent + 'CC'];
  const specs = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id:    i,
      angle: (i / 24) * 360,
      dist:  80 + (Math.sin(i * 17.3) * 0.5 + 0.5) * 160,
      size:  5 + (Math.sin(i * 11.7) * 0.5 + 0.5) * 9,
      color: BURST_COLORS[i % BURST_COLORS.length],
      delay: (Math.sin(i * 7.1) * 0.5 + 0.5) * 0.15,
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  return (
    <AnimatePresence>
      {trigger && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 20 }}>
          {specs.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: Math.cos(rad) * p.dist,
                  y: Math.sin(rad) * p.dist,
                  opacity: 0,
                  scale: 1,
                  rotate: p.angle * 2,
                }}
                transition={{ duration: 0.9, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position:     'absolute',
                  top:  '48%', left: '50%',
                  width:  p.size,
                  height: p.size * 0.6,
                  borderRadius: '50% 50% 50% 0',
                  background:   p.color,
                  transformOrigin: 'center',
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

function EnvelopeScene({
  accent,
  onOpen,
}: {
  accent: string;
  onOpen: () => void;
}) {
  const [flapOpen, setFlapOpen] = useState(false);
  const [burst,    setBurst]    = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const handleClick = useCallback(() => {
    if (flapOpen) return;
    setFlapOpen(true);
    setBurst(true);
    setTimeout(onOpen, 1200);
  }, [flapOpen, onOpen]);

  // Envelope dimensions (scaled for display)
  const W = 300;
  const H = 200;

  return (
    <motion.div
      key="envelope"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-10"
    >
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-display text-sm font-medium tracking-widest"
        style={{ color: '#7A3820' }}
      >
        You have a message
      </motion.p>

      {/* Envelope wrapper with 3D perspective */}
      <div style={{ perspective: 900, perspectiveOrigin: '50% 30%', position: 'relative' }}>
        <PetalBurst trigger={burst} accent={accent} />

        <motion.div
          animate={!flapOpen ? { y: [0, -8, 0] } : { y: 0 }}
          transition={{ repeat: flapOpen ? 0 : Infinity, duration: 2.8, ease: 'easeInOut' }}
          onClick={handleClick}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={()  => setHovered(false)}
          style={{ cursor: flapOpen ? 'default' : 'pointer', position: 'relative', width: W, height: H }}
        >
          {/* Drop shadow */}
          <div style={{
            position: 'absolute', bottom: -16, left: '10%', right: '10%', height: 20,
            borderRadius: '50%',
            background: 'rgba(60,20,5,0.18)',
            filter: 'blur(10px)',
          }} />

          {/* Envelope body */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg,#FFF8F2 0%,#FFF0E6 60%,#FAE8D8 100%)',
            borderRadius: 12,
            border: '1.5px solid rgba(180,100,60,0.15)',
            boxShadow: '0 8px 40px rgba(120,50,20,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
            overflow: 'hidden',
          }}>
            {/* Inside back face — chevron folds you see when flap lifts */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              {/* Bottom-left fold */}
              <line x1="0"   y1={H}   x2={W/2} y2={H/2} stroke="rgba(160,80,40,0.12)" strokeWidth="1.2" />
              {/* Bottom-right fold */}
              <line x1={W}   y1={H}   x2={W/2} y2={H/2} stroke="rgba(160,80,40,0.12)" strokeWidth="1.2" />
              {/* Left fold */}
              <line x1="0"   y1="0"   x2={W/2} y2={H/2} stroke="rgba(160,80,40,0.10)" strokeWidth="1" />
              {/* Right fold */}
              <line x1={W}   y1="0"   x2={W/2} y2={H/2} stroke="rgba(160,80,40,0.10)" strokeWidth="1" />
            </svg>

            {/* Side-triangle left */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d={`M0,0 L${W/2},${H/2} L0,${H}Z`} fill="rgba(255,230,210,0.40)" />
              <path d={`M${W},0 L${W/2},${H/2} L${W},${H}Z`} fill="rgba(255,224,200,0.35)" />
            </svg>

            {/* Wax-seal style dot */}
            <motion.div
              animate={{ scale: hovered && !flapOpen ? 1.12 : 1 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute', left: '50%', top: '55%',
                transform: 'translate(-50%,-50%)',
                width: 44, height: 44, borderRadius: '50%',
                background: `radial-gradient(circle at 38% 36%, ${accent}EE 0%, ${accent} 55%, ${accent}99 100%)`,
                boxShadow: `0 3px 12px ${accent}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: 'white',
              }}
            >
              ♡
            </motion.div>
          </div>

          {/* ── FLAP (CSS 3D) ── */}
          <motion.div
            animate={{ rotateX: flapOpen ? -168 : (hovered ? -18 : 0) }}
            transition={flapOpen
              ? { duration: 0.90, ease: [0.76, 0, 0.24, 1] }
              : { duration: 0.35 }
            }
            style={{
              position:        'absolute',
              top:             0,
              left:            0,
              right:           0,
              height:          H * 0.55,
              transformOrigin: 'top center',
              transformStyle:  'preserve-3d',
              zIndex:          10,
            }}
          >
            {/* Flap front face */}
            <div
              style={{
                position:         'absolute',
                inset:            0,
                background:       'linear-gradient(170deg,#FFF4EC 0%,#FAE6D4 60%,#F5D8C0 100%)',
                clipPath:         'polygon(0% 0%, 50% 100%, 100% 0%)',
                borderRadius:     '12px 12px 0 0',
                backfaceVisibility: 'hidden',
                boxShadow:        'inset 0 -3px 10px rgba(120,60,20,0.06)',
              }}
            />
            {/* Flap back face (shows when open) */}
            <div
              style={{
                position:         'absolute',
                inset:            0,
                background:       'linear-gradient(10deg,#FFF8F4 0%,#FFF0E8 100%)',
                clipPath:         'polygon(0% 0%, 50% 100%, 100% 0%)',
                borderRadius:     '12px 12px 0 0',
                transform:        'rotateX(180deg)',
                backfaceVisibility: 'hidden',
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {!flapOpen && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.8 }}
            className="font-mono text-xs tracking-widest"
            style={{ color: 'rgba(120,50,20,0.45)' }}
          >
            ↑ click to open
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5 + 6: Card reveal → card open
// ─────────────────────────────────────────────────────────────────────────────
function CardRevealScene({
  card,
  accent,
}: {
  card:   CardData;
  accent: string;
}) {
  const [isOpen,     setIsOpen]     = useState(false);
  const [showInside, setShowInside] = useState(false);
  const { bg, text, accent: cardAccent } = getCardStyle(card.cardTheme);

  const openCard = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
    setTimeout(() => setShowInside(true), 900);
  }, [isOpen]);

  return (
    <motion.div
      key="card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed inset-0 flex flex-col items-center justify-start
                 pt-16 px-4 pb-8 overflow-y-auto"
    >
      <div className="w-full max-w-sm md:max-w-md space-y-6">

        {/* Card container — 3D perspective */}
        <div style={{ perspective: 1200 }}>

          {/* ── Front cover (closed state) ── */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                key="cover"
                exit={{ rotateY: -180, opacity: 0 }}
                transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  transformOrigin:   'left center',
                  transformStyle:    'preserve-3d',
                  backfaceVisibility:'hidden',
                }}
                className="w-full cursor-pointer"
                onClick={openCard}
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="w-full rounded-2xl overflow-hidden border"
                  style={{
                    background:  bg,
                    minHeight:   280,
                    boxShadow:   `0 20px 60px rgba(80,30,10,0.20), 0 4px 12px rgba(80,30,10,0.10)`,
                    borderColor: 'rgba(180,100,50,0.15)',
                    display:     'flex',
                    flexDirection: 'column',
                    alignItems:  'center',
                    justifyContent: 'center',
                    gap:         20,
                    padding:     48,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    className="text-6xl"
                  >
                    💌
                  </motion.div>
                  <div className="text-center space-y-1">
                    <p className="font-display font-black text-2xl" style={{ color: text }}>
                      {card.recipientName ? `For ${card.recipientName}` : 'For You'}
                    </p>
                    <p className="font-mono text-xs opacity-40" style={{ color: text }}>
                      tap to open your card
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Inside (open state) ── */}
          <AnimatePresence>
            {showInside && (
              <motion.div
                key="inside"
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1,    y: 0 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-full rounded-2xl overflow-hidden border"
                style={{
                  background:  bg,
                  boxShadow:   `0 20px 60px rgba(80,30,10,0.18), 0 4px 12px rgba(80,30,10,0.08)`,
                  borderColor: 'rgba(180,100,50,0.15)',
                }}
              >
                {/* Paper texture overlay */}
                <div className="p-8 space-y-6 relative">
                  {/* Decorative floral header */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="text-center space-y-2"
                  >
                    <p className="text-3xl">🌸</p>
                    <div style={{
                      height: 1, width: 80, margin: '0 auto',
                      background: `linear-gradient(90deg,transparent,${cardAccent}88,transparent)`,
                    }} />
                  </motion.div>

                  {/* Salutation */}
                  {card.recipientName && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="font-display font-semibold text-base"
                      style={{ color: text }}
                    >
                      Dear {card.recipientName},
                    </motion.p>
                  )}

                  {/* Message */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.30 }}
                    className="font-display text-lg md:text-xl text-center leading-relaxed italic"
                    style={{ color: text }}
                  >
                    "{card.message}"
                  </motion.p>

                  {/* Media */}
                  {card.mediaUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.48 }}
                      className="rounded-xl overflow-hidden"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(180,100,50,0.12)' }}
                    >
                      {card.mediaType === 'video' ? (
                        <video src={card.mediaUrl} controls autoPlay muted loop
                          className="w-full max-h-60 object-cover" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.mediaUrl} alt="From the sender"
                          className="w-full max-h-60 object-cover" />
                      )}
                    </motion.div>
                  )}

                  {/* Sender */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.60 }}
                    className="text-center pt-3"
                    style={{ borderTop: `1px solid ${cardAccent}25` }}
                  >
                    <p className="font-display italic text-sm opacity-60 mt-4" style={{ color: text }}>
                      Love,
                    </p>
                    <p className="font-display font-bold text-xl mt-0.5" style={{ color: text }}>
                      {card.senderName || ''}
                    </p>
                  </motion.div>

                  {/* PetalNote stamp */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75 }}
                    className="text-center text-xs font-mono"
                    style={{ color: `${cardAccent}55` }}
                  >
                    ✦ Sent with PetalNote ✦
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <AnimatePresence>
          {showInside && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-center space-y-3 pb-8"
            >
              <p className="text-xs font-mono" style={{ color: 'rgba(120,50,20,0.40)' }}>
                Want to create one for someone special?
              </p>
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-9 py-3.5 rounded-full font-display font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}BB 100%)` }}
                >
                  🌹 Create a Bouquet
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function CardExperience({ card }: { card: CardData }) {
  const [scene, setScene] = useState<Scene>('greeting');

  const themeColors = COLOR_THEMES.find((t) => t.id === card.colorTheme);
  const accent      = themeColors?.colors[1] ?? '#C0674A';
  const isDark      = scene === 'greeting';

  const { playing, toggle, hasTrack } = useAutoMusic(card.musicTrack);
  const goTo = useCallback((s: Scene) => setScene(s), []);

  // Animate background between scenes
  const bg = cardBg(scene);

  return (
    <main
      className="min-h-screen relative overflow-hidden transition-all duration-1000"
      style={{ background: bg }}
    >
      {/* Floating petals */}
      <FloatingPetals dark={isDark} />

      {/* Music control */}
      {hasTrack && <MusicPill playing={playing} onToggle={toggle} dark={isDark} />}

      {/* Minimal nav — hidden on greeting */}
      <AnimatePresence>
        {!isDark && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-40 px-5 py-3
                       flex items-center"
            style={{ background: 'rgba(253,240,230,0.75)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(180,100,50,0.10)' }}
          >
            <Link href="/" className="font-display font-black text-base hover:opacity-70 transition-opacity"
              style={{ color: '#6B3220' }}>
              PetalNote 🌸
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Scenes */}
      <AnimatePresence mode="wait">
        {scene === 'greeting' && (
          <GreetingScene
            key="greeting"
            sender={card.senderName}
            accent={accent}
            onNext={() => goTo('bouquet-grow')}
          />
        )}

        {(scene === 'bouquet-grow' || scene === 'bouquet-done') && (
          <BouquetScene
            key="bouquet"
            bouquetData={card.bouquetData}
            accent={accent}
            phase={scene as 'bouquet-grow' | 'bouquet-done'}
            onAllBloomed={() => goTo('bouquet-done')}
            onContinue={() => goTo('envelope')}
          />
        )}

        {scene === 'envelope' && (
          <EnvelopeScene
            key="envelope"
            accent={accent}
            onOpen={() => goTo('card-reveal')}
          />
        )}

        {(scene === 'card-reveal' || scene === 'card-open') && (
          <CardRevealScene
            key="card"
            card={card}
            accent={accent}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
