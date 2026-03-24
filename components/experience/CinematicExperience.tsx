'use client';

/**
 * CinematicExperience — 7-scene interactive animated love story.
 *
 * Scene flow:
 *  1 Greeting        — dark romantic, click to plant the seed
 *  2 SeedDrop        — seed falls, lands in soil (auto 3 s)
 *  3 Watering        — drag watering can, water droplets fall
 *  4 BouquetGrowth   — sprout → stems → leaves → flowers (GSAP-timed)
 *  5 EnvelopeArrival — cream envelope drops in
 *  6 CardReveal      — CSS 3D flap opens, petal burst
 *  7 CardOpen        — card unfolds, message inside
 */

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, animate,
} from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CARD_THEMES, COLOR_THEMES } from '@/lib/utils';
import { PetalCanvas } from './PetalCanvas';

const FlowerIllustration = dynamic(
  () => import('@/components/bouquet/FlowerSVG').then((m) => ({ default: m.FlowerIllustration })),
  { ssr: false },
);

// ── Types ──────────────────────────────────────────────────────────────────────
export interface CinematicCardData {
  id?:            string;
  slug:           string;
  senderName:     string | null;
  recipientName?: string | null;
  message:        string;
  colorTheme:     string;
  cardTheme:      string;
  mediaUrl:       string | null;
  mediaType:      string | null;
  musicTrack:     string | null;
  customMusicUrl?: string | null;
  bouquetData:    unknown;
}

type SceneId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ── Constants ──────────────────────────────────────────────────────────────────
const SCENE_BG: Record<SceneId, string> = {
  1: 'radial-gradient(ellipse at 50% 40%, #2E0E30 0%, #0E0814 60%, #060408 100%)',
  2: 'linear-gradient(170deg, #100C04 0%, #1C1608 50%, #100C04 100%)',
  3: 'linear-gradient(170deg, #041408 0%, #082010 50%, #041408 100%)',
  4: 'linear-gradient(155deg, #F8F0E0 0%, #F2E4C8 40%, #ECE0B8 70%, #F8F0E0 100%)',
  5: 'linear-gradient(155deg, #FDF4EC 0%, #FAE8D8 50%, #F7DEC8 100%)',
  6: 'linear-gradient(155deg, #FFFAF4 0%, #FDF4EA 50%, #FAF0E4 100%)',
  7: 'linear-gradient(155deg, #FFFAF4 0%, #FDF4EA 50%, #FAF0E4 100%)',
};

const MUSIC_URLS: Record<string, string> = {
  waltz:    '/music/waltz.mp3',
  piano:    '/music/piano.mp3',
  acoustic: '/music/acoustic.mp3',
};

const BOUQUET_LAYOUT = [
  { cx: 50, cy: 14, scale: 1.15, r: 0   },
  { cx: 28, cy: 25, scale: 1.06, r: -20 },
  { cx: 72, cy: 25, scale: 1.06, r:  20 },
  { cx: 13, cy: 39, scale: 0.96, r: -30 },
  { cx: 50, cy: 35, scale: 1.02, r:   4 },
  { cx: 87, cy: 39, scale: 0.96, r:  30 },
  { cx: 32, cy: 51, scale: 0.90, r: -14 },
  { cx: 68, cy: 51, scale: 0.90, r:  14 },
  { cx: 18, cy: 62, scale: 0.82, r: -34 },
  { cx: 50, cy: 64, scale: 0.86, r:   0 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function extractFlowers(bouquetData: unknown): string[] {
  const fallback = ['rose', 'tulip', 'peony', 'daisy', 'cherry', 'lily', 'lavender'];
  if (!bouquetData) return fallback;
  try {
    const d = bouquetData as Record<string, unknown>;
    if (Array.isArray(d.flowers))
      return (d.flowers as { flowerType?: string }[]).map((f) => f.flowerType ?? 'rose');
    if (Array.isArray(bouquetData))
      return (bouquetData as { flowerType?: string }[]).map((f) => f.flowerType ?? 'rose');
  } catch { /* */ }
  return fallback;
}

function getTheme(id: string) {
  return CARD_THEMES.find((t) => t.id === id)
    ?? { bg: '#FFF5EC', text: '#3D1A0C', accent: '#C0674A' };
}

// ── Howler music hook ──────────────────────────────────────────────────────────
function useHowler(src: string | null) {
  const ref = useRef<import('howler').Howl | null>(null);

  useEffect(() => {
    if (!src) return;
    let mounted = true;
    let howl: import('howler').Howl;

    import('howler').then(({ Howl }) => {
      if (!mounted) return;
      howl = new Howl({ src: [src], loop: true, volume: 0, html5: true });
      howl.once('load', () => {
        if (!mounted) return;
        howl.play();
        howl.fade(0, 0.28, 2000);
      });
      ref.current = howl;
    });

    return () => {
      mounted = false;
      if (ref.current) {
        try { ref.current.fade(ref.current.volume() as number, 0, 800); }
        catch { /* */ }
        setTimeout(() => { try { ref.current?.stop(); ref.current?.unload(); } catch { /* */ } }, 900);
        ref.current = null;
      }
    };
  }, [src]);

  return ref;
}

// ── SVG assets ─────────────────────────────────────────────────────────────────
function SeedSVG() {
  return (
    <svg width="22" height="32" viewBox="0 0 22 32">
      <ellipse cx="11" cy="15" rx="8" ry="12" fill="#6B4A1C" stroke="#3D2810" strokeWidth="1.2" />
      <path d="M11 27 Q10.5 30 11 31 Q11.5 30 11 27Z" fill="#3D2810" />
      <ellipse cx="8" cy="11" rx="3.5" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-20 8 11)" />
    </svg>
  );
}

function SoilPatch({ width = 320 }: { width?: number }) {
  return (
    <svg width={width} height={80} viewBox="0 0 320 80" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="soil-rg" cx="50%" cy="30%" r="55%">
          <stop offset="0%"   stopColor="#6B4A24" />
          <stop offset="100%" stopColor="#3A2410" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="55" rx="155" ry="30" fill="url(#soil-rg)" />
      <ellipse cx="160" cy="42" rx="130" ry="18" fill="#7A5A30" opacity="0.6" />
      {/* surface pebbles */}
      {[[60,38],[100,34],[145,32],[190,31],[230,35],[265,39]].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="3" fill="#5A3A18" opacity="0.5" />
      ))}
    </svg>
  );
}

function WateringCanSVG({ tilt = 0 }: { tilt?: number }) {
  return (
    <svg
      width="160" height="150" viewBox="0 0 160 150"
      style={{ transform: `rotate(${tilt}deg)`, transformOrigin: '80px 140px' }}
    >
      <defs>
        <linearGradient id="can-g" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%"   stopColor="#7AAF8A" />
          <stop offset="100%" stopColor="#4A7A5C" />
        </linearGradient>
      </defs>
      {/* Body */}
      <ellipse cx="90" cy="80" rx="55" ry="44" fill="url(#can-g)" stroke="#3D6B4E" strokeWidth="2.5" />
      {/* Lid */}
      <ellipse cx="90" cy="38" rx="28" ry="10" fill="#3D6B4E" stroke="#2D5A3E" strokeWidth="1.5" />
      {/* Shine */}
      <ellipse cx="70" cy="66" rx="16" ry="11" fill="rgba(255,255,255,0.20)" transform="rotate(-10 70 66)" />
      {/* Handle */}
      <path d="M138 55 Q162 55 162 80 Q162 108 138 108" fill="none" stroke="#3D6B4E" strokeWidth="11" strokeLinecap="round" />
      {/* Spout arm */}
      <path d="M44 80 Q18 74 8 54" fill="none" stroke="#3D6B4E" strokeWidth="11" strokeLinecap="round" />
      {/* Nozzle head */}
      <ellipse cx="8" cy="52" rx="13" ry="8" fill="#3D6B4E" transform="rotate(-18 8 52)" />
      {/* Holes */}
      {[0,1,2,3,4,5].map((i) => (
        <circle key={i} cx={3 + (i % 3) * 6} cy={47 + Math.floor(i / 3) * 8} r="1.4" fill="#7AAF8A" />
      ))}
    </svg>
  );
}

// ── Particle Burst (soil hit) ──────────────────────────────────────────────────
function SoilBurst({ active }: { active: boolean }) {
  const specs = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      angle: (i / 14) * 360,
      dist:  30 + Math.sin(i * 7.3) * 20,
      size:  3 + Math.sin(i * 11.1) * 2,
    })),
  []);

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute" style={{ left: '50%', top: '50%' }}>
          {specs.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: Math.cos(rad) * p.dist,
                  y: Math.sin(rad) * p.dist - 10,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  width:  p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: ['#6B4A24', '#8B6A3C', '#A08050', '#5A3A18'][p.id % 4],
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Petal burst (envelope) ─────────────────────────────────────────────────────
const BURST_COLS = ['#FFFFFF', '#FFD6E0', '#FFE4CC', '#F5C0C8', '#FFF0D8'];
function PetalBurst({ trigger }: { trigger: boolean }) {
  const specs = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    angle: (i / 28) * 360,
    dist:  80 + Math.sin(i * 13) * 100,
    size:  5 + Math.sin(i * 7.7) * 6,
    color: BURST_COLS[i % BURST_COLS.length],
    delay: Math.sin(i * 5.3) * 0.12,
  })), []);

  return (
    <AnimatePresence>
      {trigger && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 30 }}>
          {specs.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x: Math.cos(rad)*p.dist, y: Math.sin(rad)*p.dist, opacity: 0, scale: 1, rotate: p.angle * 3 }}
                transition={{ duration: 1.0, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: p.size, height: p.size * 0.55,
                  borderRadius: '50% 50% 50% 0',
                  background: p.color,
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Greeting
// ══════════════════════════════════════════════════════════════════════════════
function S1Greeting({ sender, accent, onNext }: { sender: string | null; accent: string; onNext: () => void }) {
  return (
    <motion.div
      key="s1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0 }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-8 cursor-pointer select-none"
      onClick={onNext}
    >
      {/* Radial bloom glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ repeat: Infinity, duration: 4 }}
        style={{ background: `radial-gradient(ellipse at 50% 45%, ${accent}60 0%, transparent 58%)` }}
      />

      {/* Sparkles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white pointer-events-none"
          style={{
            left:  `${15 + (i * 37.3) % 70}%`,
            top:   `${10 + (i * 19.7) % 70}%`,
            fontSize: `${10 + (i * 7.3) % 12}px`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2 + (i % 3), delay: i * 0.22 }}
        >
          ✦
        </motion.div>
      ))}

      {/* Flower icons */}
      <div className="flex gap-4 relative z-10">
        {['🌸', '🌹', '🌺', '🌷', '💐'].map((e, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.13, type: 'spring', stiffness: 360, damping: 22 }}
            className="text-3xl md:text-4xl"
          >
            {e}
          </motion.span>
        ))}
      </div>

      {/* Headline */}
      <motion.h1
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 font-display font-black text-4xl md:text-6xl lg:text-7xl
                   text-white text-center px-8 leading-tight"
        style={{ textShadow: `0 2px 50px ${accent}AA, 0 0 100px rgba(0,0,0,0.6)` }}
      >
        I made something<br className="hidden sm:block" /> special for you.
      </motion.h1>

      {sender && (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.9 }}
          className="relative z-10 text-white/45 font-display italic text-lg"
        >
          — with love, {sender}
        </motion.p>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-2 mt-2"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/80 text-sm font-mono tracking-widest border border-white/20
                     rounded-full px-5 py-2.5 backdrop-blur-sm"
        >
          🌱 Click to plant the seed
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — Seed Drop
// ══════════════════════════════════════════════════════════════════════════════
function S2SeedDrop({ onNext }: { onNext: () => void }) {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLanded(true), 1600);
    const t2 = setTimeout(onNext, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onNext]);

  return (
    <motion.div
      key="s2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 flex items-end justify-center pb-24 overflow-hidden"
    >
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-16 font-mono text-sm tracking-widest"
        style={{ color: 'rgba(200,180,120,0.60)' }}
      >
        Planting your bouquet...
      </motion.p>

      {/* Falling seed */}
      <motion.div
        className="absolute"
        style={{ left: '50%', top: 0, x: '-50%' }}
        initial={{ y: -40 }}
        animate={landed
          ? { y: 'calc(100vh - 200px)' }
          : { y: -40 }
        }
        transition={landed
          ? { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }
          : {}
        }
      >
        <motion.div
          animate={landed ? { rotate: [0, 8, -6, 0] } : {}}
          transition={{ delay: 1.5, duration: 0.3 }}
        >
          <SeedSVG />
        </motion.div>
      </motion.div>

      {/* Soil burst */}
      <div className="absolute" style={{ bottom: 90 }}>
        <SoilBurst active={landed} />
      </div>

      {/* Soil patch */}
      <div className="absolute bottom-8 flex justify-center w-full">
        <SoilPatch width={360} />
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — Watering Interaction
// ══════════════════════════════════════════════════════════════════════════════
const WATER_DROPS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  delay: i * 0.09,
  xOff: (Math.sin(i * 7.3) - 0.5) * 28,
}));

function S3Watering({ onNext }: { onNext: () => void }) {
  const [watering, setWatering]   = useState(false);
  const [progress, setProgress]   = useState(0);
  const [done, setDone]           = useState(false);
  const dragX = useMotionValue(-80);
  const tilt  = useTransform(dragX, [-80, 120], [0, -50]);

  // When x crosses threshold, auto-start watering
  useEffect(() => {
    const unsub = dragX.on('change', (v) => {
      if (v > 100 && !watering && !done) {
        setWatering(true);
      }
    });
    return unsub;
  }, [dragX, watering, done]);

  // Progress timer when watering
  useEffect(() => {
    if (!watering || done) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 2.2;
        if (next >= 100) {
          clearInterval(interval);
          setDone(true);
          setTimeout(onNext, 700);
          return 100;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [watering, done, onNext]);

  return (
    <motion.div
      key="s3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 flex items-end justify-center pb-8 select-none"
    >
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute top-16 font-mono text-sm tracking-widest"
        style={{ color: 'rgba(120,200,140,0.70)' }}
      >
        Drag the watering can →
      </motion.p>

      {/* Progress ring */}
      <div className="absolute top-28 flex flex-col items-center gap-2">
        <div className="w-48 h-2.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #4A9E6A, #7ADF9A)',
            }}
          />
        </div>
        <p className="text-xs font-mono" style={{ color: 'rgba(120,200,140,0.55)' }}>
          {Math.round(progress)}% watered
        </p>
      </div>

      {/* Water droplets (when watering) */}
      <AnimatePresence>
        {watering && !done && (
          <div className="pointer-events-none absolute" style={{ left: 'calc(50% - 40px)', top: '40%' }}>
            {WATER_DROPS.map((d) => (
              <motion.div
                key={d.id}
                initial={{ y: 0, opacity: 0.9, scaleY: 0.5 }}
                animate={{ y: 180, opacity: 0, scaleY: 1, x: d.xOff }}
                transition={{
                  duration: 0.9,
                  delay: d.delay,
                  repeat: Infinity,
                  repeatDelay: 0.3,
                  ease: 'easeIn',
                }}
                style={{
                  position: 'absolute',
                  width: 5, height: 9,
                  borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                  background: 'rgba(130,210,255,0.85)',
                  boxShadow: '0 0 4px rgba(130,210,255,0.6)',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Draggable watering can */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 180 }}
        dragElastic={0.1}
        style={{ x: dragX, cursor: done ? 'default' : 'grab', position: 'absolute', bottom: 130, left: 'calc(50% - 160px)' }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <motion.div style={{ rotate: tilt }}>
          <WateringCanSVG />
        </motion.div>
      </motion.div>

      {/* Seed in soil */}
      <div className="absolute" style={{ bottom: 102 }}>
        <div style={{ position: 'absolute', left: '50%', top: -8, transform: 'translateX(-50%)' }}>
          <SeedSVG />
        </div>
        <SoilPatch width={360} />
      </div>

      {/* Done flash */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute text-center"
            style={{ bottom: 250 }}
          >
            <p className="font-display font-bold text-2xl" style={{ color: 'rgba(120,220,140,0.90)' }}>
              🌱 Growing…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — Bouquet Growth
// ══════════════════════════════════════════════════════════════════════════════
function S4BouquetGrowth({
  flowers,
  accent,
  onDone,
}: {
  flowers: string[];
  accent:  string;
  onDone:  () => void;
}) {
  const [phase, setPhase] = useState<
    'soil' | 'sprout' | 'stems' | 'leaves' | 'blooming' | 'done'
  >('soil');
  const [bloomCount, setBloomCount] = useState(0);
  const [zoom, setZoom]             = useState(false);

  useEffect(() => {
    const total = Math.min(flowers.length, 10);
    const timers: ReturnType<typeof setTimeout>[] = [];

    const add = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    add(400,  () => setPhase('sprout'));
    add(1200, () => setPhase('stems'));
    add(2100, () => setPhase('leaves'));
    add(2700, () => setPhase('blooming'));

    // Bloom flowers one by one at 360ms intervals
    for (let i = 0; i < total; i++) {
      add(2700 + i * 360, () => setBloomCount(i + 1));
    }

    const finishMs = 2700 + total * 360 + 800;
    add(finishMs,      () => setZoom(true));
    add(finishMs + 2200, () => onDone());

    return () => timers.forEach(clearTimeout);
  }, [flowers.length, onDone]);

  const visible = phase !== 'soil';

  return (
    <motion.div
      key="s4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 1.0 }}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-16 font-display text-sm font-semibold tracking-widest uppercase"
        style={{ color: '#8B5A2C' }}
      >
        Your bouquet is blooming
      </motion.p>

      {/* Camera zoom container */}
      <motion.div
        animate={zoom ? { scale: 1.09, y: -16 } : { scale: 1, y: 0 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
        style={{ height: 380 }}
      >
        {/* Stem SVG layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 3 }}>
          <defs>
            <linearGradient id="s4-stem" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6DBF8A" />
              <stop offset="100%" stopColor="#2D7A50" />
            </linearGradient>
          </defs>
          {/* Sprout: tiny Y-sprout */}
          <AnimatePresence>
            {(phase !== 'soil') && (
              <motion.g key="sprout">
                <motion.line
                  x1="50%" y1="90%"
                  x2="50%" y2="65%"
                  stroke="#4A9A6A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
                {phase !== 'sprout' && (
                  <>
                    <motion.line x1="50%" y1="65%" x2="37%" y2="55%" stroke="#4A9A6A" strokeWidth="2.5" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
                    <motion.line x1="50%" y1="65%" x2="63%" y2="55%" stroke="#4A9A6A" strokeWidth="2.5" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
                  </>
                )}
              </motion.g>
            )}
          </AnimatePresence>

          {/* Main stems from base to each flower slot */}
          {phase !== 'soil' && phase !== 'sprout' && flowers.slice(0, 10).map((_, i) => (
            <motion.line
              key={i}
              x1={`${BOUQUET_LAYOUT[i % BOUQUET_LAYOUT.length].cx}%`}
              y1={`${BOUQUET_LAYOUT[i % BOUQUET_LAYOUT.length].cy + 6}%`}
              x2="50%" y2="90%"
              stroke="url(#s4-stem)"
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.72 }}
              transition={{ duration: 0.65, delay: i * 0.06 }}
            />
          ))}
        </svg>

        {/* Leaves */}
        <AnimatePresence>
          {(phase === 'leaves' || phase === 'blooming' || phase === 'done') &&
            [[-22,68,-38,38],[120,68,38,34],[-10,55,-52,30],[112,55,52,28]].map(([x,y,rot,sz],i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.92 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.1 }}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, zIndex: 4 }}
              >
                <svg width={sz} height={sz * 1.4} viewBox="0 0 40 60"
                  style={{ transform: `translate(-50%,-50%) rotate(${rot}deg)` }}>
                  <defs><linearGradient id={`lf${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#76C893"/><stop offset="100%" stopColor="#2D6A4F"/>
                  </linearGradient></defs>
                  <path d="M20 56 Q4 40 4 18 Q4 4 20 4 Q36 4 36 18 Q36 40 20 56Z" fill={`url(#lf${i})`}/>
                  <path d="M20 56 Q20 30 20 4" stroke="#1B5E20" strokeWidth="1" fill="none" opacity="0.4"/>
                </svg>
              </motion.div>
            ))
          }
        </AnimatePresence>

        {/* Flowers blooming one by one */}
        <AnimatePresence>
          {flowers.slice(0, bloomCount).map((type, i) => {
            const slot = BOUQUET_LAYOUT[i % BOUQUET_LAYOUT.length];
            const size = Math.round(slot.scale * 74);
            return (
              <motion.div
                key={`${type}-${i}`}
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                style={{
                  position: 'absolute',
                  left: `${slot.cx}%`,
                  top:  `${slot.cy}%`,
                  zIndex: 10 + i,
                  transform: `translate(-50%,-50%) rotate(${slot.r}deg)`,
                }}
              >
                {/* Bloom glow */}
                <div style={{
                  position: 'absolute', inset: -6,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
                  filter: 'blur(5px)',
                }}/>
                {/* Wind sway */}
                <motion.div
                  animate={{ rotate: [slot.r - 4, slot.r + 4, slot.r - 4] }}
                  transition={{ repeat: Infinity, duration: 3.2 + (i % 3) * 0.7, ease: 'easeInOut', delay: i * 0.15 }}
                  style={{ transformOrigin: '50% 100%' }}
                >
                  <FlowerIllustration id={type as import('@/components/bouquet/FlowerSVG').FlowerId} size={size} />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Bouquet wrap */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ zIndex: 6 }}
        >
          <svg width="140" height="90" viewBox="0 0 140 90">
            <defs>
              <linearGradient id="wrap-s4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF8F0"/><stop offset="100%" stopColor="#EDD5B8"/>
              </linearGradient>
            </defs>
            <path d="M20 0 L70 90 L120 0 Z" fill="url(#wrap-s4)" stroke="#C9A07A" strokeWidth="1.2"/>
            <path d="M38 14 L70 86 L80 86 L52 14 Z" fill="rgba(255,155,120,0.35)"/>
            <path d="M22 0 L30 0 L70 80 L67 80 Z" fill="rgba(255,255,255,0.38)"/>
          </svg>
        </motion.div>

        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at 50% 38%, ${accent}28 0%, transparent 62%)`,
        }}/>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — Envelope Arrival
// ══════════════════════════════════════════════════════════════════════════════
function S5Envelope({ accent, onOpen }: { accent: string; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      key="s5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-10"
    >
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="font-display text-sm font-semibold tracking-widest"
        style={{ color: '#7A3820' }}
      >
        You have a message ✉
      </motion.p>

      {/* Envelope with 3D depth */}
      <div style={{ perspective: 900, perspectiveOrigin: '50% 30%' }}>
        <motion.button
          onClick={onOpen}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: [null, 0], opacity: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.3 }}
          whileHover={{ scale: 1.04, y: -6 }}
          whileTap={{ scale: 0.97 }}
          className="relative cursor-pointer"
          aria-label="Open envelope"
          style={{
            background: 'none', border: 'none', padding: 0,
            display: 'block',
          }}
        >
          {/* Gentle float */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3.0, ease: 'easeInOut' }}
          >
            <div style={{ position: 'relative', width: 300, height: 200 }}>
              {/* Drop shadow */}
              <div style={{
                position: 'absolute', bottom: -18, left: '12%', right: '12%', height: 22,
                borderRadius: '50%', background: `rgba(60,20,5,0.20)`, filter: 'blur(12px)',
              }}/>

              {/* Envelope body */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(160deg, #FFF8F2 0%, #FFF0E6 55%, #FAE8D8 100%)',
                borderRadius: 14, border: '1.5px solid rgba(180,100,60,0.18)',
                boxShadow: '0 8px 40px rgba(120,50,20,0.14), inset 0 1px 0 rgba(255,255,255,0.8)',
                overflow: 'hidden',
              }}>
                {/* Inside fold lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <line x1="0"   y1="0"   x2="150" y2="100" stroke="rgba(160,80,40,0.10)" strokeWidth="1.2"/>
                  <line x1="300" y1="0"   x2="150" y2="100" stroke="rgba(160,80,40,0.10)" strokeWidth="1.2"/>
                  <line x1="0"   y1="200" x2="150" y2="100" stroke="rgba(160,80,40,0.12)" strokeWidth="1.2"/>
                  <line x1="300" y1="200" x2="150" y2="100" stroke="rgba(160,80,40,0.12)" strokeWidth="1.2"/>
                  {/* Side triangles */}
                  <path d="M0,0 L150,100 L0,200Z" fill="rgba(255,225,200,0.30)"/>
                  <path d="M300,0 L150,100 L300,200Z" fill="rgba(255,225,200,0.25)"/>
                </svg>

                {/* Wax seal */}
                <motion.div
                  animate={{ scale: hovered ? 1.14 : 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: 'absolute', left: '50%', top: '56%',
                    transform: 'translate(-50%,-50%)',
                    width: 48, height: 48, borderRadius: '50%',
                    background: `radial-gradient(circle at 38% 36%, ${accent}EE, ${accent})`,
                    boxShadow: `0 3px 14px ${accent}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: 'white',
                  }}
                >
                  ♡
                </motion.div>
              </div>

              {/* CSS 3D flap */}
              <motion.div
                animate={{ rotateX: hovered ? -22 : 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 115,
                  transformOrigin: 'top center', transformStyle: 'preserve-3d', zIndex: 10,
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(170deg, #FFF4EC 0%, #FAE6D4 60%, #F5D8C0 100%)',
                  clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
                  borderRadius: '14px 14px 0 0',
                  backfaceVisibility: 'hidden',
                }}/>
              </motion.div>
            </div>
          </motion.div>
        </motion.button>
      </div>

      {/* Hint */}
      <motion.p
        animate={{ opacity: [0.35, 0.75, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="font-mono text-xs tracking-widest"
        style={{ color: 'rgba(120,50,20,0.50)' }}
      >
        ↑ Click to open
      </motion.p>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — Card Reveal  (flap opens fully + petal burst)
// ══════════════════════════════════════════════════════════════════════════════
function S6CardReveal({ accent, onDone }: { accent: string; onDone: () => void }) {
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setBurst(true), 400);
    const t2 = setTimeout(onDone, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <motion.div
      key="s6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 flex items-center justify-center"
    >
      <div style={{ position: 'relative', width: 300, height: 200 }}>
        <PetalBurst trigger={burst} />

        {/* Envelope body stays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, #FFF8F2 0%, #FFF0E6 55%, #FAE8D8 100%)',
          borderRadius: 14, border: '1.5px solid rgba(180,100,60,0.18)',
          boxShadow: '0 8px 40px rgba(120,50,20,0.14)',
          overflow: 'hidden',
        }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <line x1="0" y1="0" x2="150" y2="100" stroke="rgba(160,80,40,0.10)" strokeWidth="1.2"/>
            <line x1="300" y1="0" x2="150" y2="100" stroke="rgba(160,80,40,0.10)" strokeWidth="1.2"/>
            <line x1="0" y1="200" x2="150" y2="100" stroke="rgba(160,80,40,0.12)" strokeWidth="1.2"/>
            <line x1="300" y1="200" x2="150" y2="100" stroke="rgba(160,80,40,0.12)" strokeWidth="1.2"/>
          </svg>
        </div>

        {/* Flap opening */}
        <motion.div
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -170 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 115,
            transformOrigin: 'top center', transformStyle: 'preserve-3d', zIndex: 10,
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(170deg, #FFF4EC 0%, #FAE6D4 55%, #F5D8C0 100%)',
            clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
            borderRadius: '14px 14px 0 0', backfaceVisibility: 'hidden',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: '#FFF8F4',
            clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)',
            transform: 'rotateX(180deg)', backfaceVisibility: 'hidden',
          }}/>
        </motion.div>

        {/* Card peeking out */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: -40, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            position: 'absolute', left: 16, right: 16, top: 30,
            background: 'linear-gradient(135deg, #FFF5EC 0%, #FAE8D8 100%)',
            borderRadius: 8, height: 100,
            boxShadow: '0 4px 20px rgba(80,30,10,0.14)',
            border: `1px solid ${accent}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, zIndex: 5,
          }}
        >
          💌
        </motion.div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 7 — Card Open
// ══════════════════════════════════════════════════════════════════════════════
function S7CardOpen({ card, accent }: { card: CinematicCardData; accent: string }) {
  const [open, setOpen]       = useState(false);
  const [inside, setInside]   = useState(false);
  const { bg, text, accent: cardAccent } = getTheme(card.cardTheme) as { bg: string; text: string; accent: string };

  const handleOpen = useCallback(() => {
    if (open) return;
    setOpen(true);
    setTimeout(() => setInside(true), 900);
  }, [open]);

  return (
    <motion.div
      key="s7"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.85, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed inset-0 flex flex-col items-center justify-start pt-14 px-4 pb-8 overflow-y-auto"
    >
      <div className="w-full max-w-sm space-y-6">
        {/* 3D card */}
        <div style={{ perspective: 1200 }}>
          {/* Front cover */}
          <AnimatePresence>
            {!open && (
              <motion.div
                key="cover"
                exit={{ rotateY: -180, opacity: 0 }}
                transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                className="w-full cursor-pointer"
                onClick={handleOpen}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  className="w-full rounded-2xl overflow-hidden"
                  style={{
                    background: bg, minHeight: 260,
                    boxShadow: `0 20px 60px rgba(80,30,10,0.22)`,
                    border: `1.5px solid ${cardAccent}22`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 18, padding: '44px 36px',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 8, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5 }}
                    className="text-6xl"
                  >
                    💌
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="font-display font-black text-2xl" style={{ color: text }}>
                      {card.recipientName ? `For ${card.recipientName}` : 'For You'}
                    </p>
                    <p className="font-mono text-xs opacity-40" style={{ color: text }}>
                      tap to open →
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inside content */}
          <AnimatePresence>
            {inside && (
              <motion.div
                key="inside"
                initial={{ opacity: 0, scale: 0.92, y: 22 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.80, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  background: bg,
                  boxShadow: `0 20px 60px rgba(80,30,10,0.18)`,
                  border: `1.5px solid ${cardAccent}20`,
                }}
              >
                <div className="p-8 space-y-5">
                  {/* Floral header */}
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-center space-y-2">
                    <p className="text-3xl">🌸</p>
                    <div style={{ height: 1, width: 72, margin: '0 auto', background: `linear-gradient(90deg,transparent,${cardAccent}88,transparent)` }}/>
                  </motion.div>

                  {/* Dear */}
                  {card.recipientName && (
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                      className="font-display font-semibold text-base" style={{ color: text }}>
                      Dear {card.recipientName},
                    </motion.p>
                  )}

                  {/* Message */}
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                    className="font-display text-lg text-center leading-relaxed italic" style={{ color: text }}>
                    "{card.message}"
                  </motion.p>

                  {/* Media */}
                  {card.mediaUrl && (
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
                      className="rounded-xl overflow-hidden"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${cardAccent}18` }}>
                      {card.mediaType === 'video'
                        ? <video src={card.mediaUrl} controls autoPlay muted loop className="w-full max-h-56 object-cover"/>
                        // eslint-disable-next-line @next/next/no-img-element
                        : <img src={card.mediaUrl} alt="From the sender" className="w-full max-h-56 object-cover"/>
                      }
                    </motion.div>
                  )}

                  {/* Sender sign-off */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.58 }}
                    className="text-center pt-3" style={{ borderTop: `1px solid ${cardAccent}22` }}>
                    <p className="font-display italic text-sm opacity-55 mt-4" style={{ color: text }}>Love,</p>
                    <p className="font-display font-bold text-xl mt-0.5" style={{ color: text }}>{card.senderName || ''}</p>
                  </motion.div>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }}
                    className="text-center text-xs font-mono" style={{ color: `${cardAccent}50` }}>
                    ✦ Sent with PetalNote ✦
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <AnimatePresence>
          {inside && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
              className="text-center space-y-3 pb-10">
              <p className="text-xs font-mono" style={{ color: 'rgba(120,50,20,0.40)' }}>
                Create one for someone special?
              </p>
              <Link href="/create">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                  className="px-9 py-3.5 rounded-full font-display font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}BB)` }}>
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

// ══════════════════════════════════════════════════════════════════════════════
// ROOT: CinematicExperience
// ══════════════════════════════════════════════════════════════════════════════
export function CinematicExperience({ card }: { card: CinematicCardData }) {
  const [scene, setScene] = useState<SceneId>(1);

  const themeColors = COLOR_THEMES.find((t) => t.id === card.colorTheme);
  const accent      = themeColors?.colors[1] ?? '#C0674A';
  const flowers     = useMemo(() => extractFlowers(card.bouquetData), [card.bouquetData]);

  // Music
  const musicSrc = useMemo(() => {
    if (card.customMusicUrl) return card.customMusicUrl;
    if (card.musicTrack && MUSIC_URLS[card.musicTrack]) return MUSIC_URLS[card.musicTrack];
    return null;
  }, [card.customMusicUrl, card.musicTrack]);
  useHowler(musicSrc);

  const go = useCallback((s: SceneId) => setScene(s), []);

  const isDark = scene <= 3;

  return (
    <main
      className="min-h-screen relative overflow-hidden transition-all duration-1000"
      style={{ background: SCENE_BG[scene] }}
    >
      {/* Canvas petals — always on */}
      <PetalCanvas
        palette={isDark
          ? ['#FFFFFF', '#FFD0E8', '#F5B0C0', '#FFE8F0']
          : ['#FFFFFF', '#FFE0CC', '#FFD0B8', '#FFF0D8', '#FFE8C8']
        }
        count={isDark ? 28 : 22}
        opacity={isDark ? 0.75 : 0.50}
      />

      {/* Scenes */}
      <AnimatePresence mode="wait">
        {scene === 1 && <S1Greeting key="s1" sender={card.senderName} accent={accent} onNext={() => go(2)} />}
        {scene === 2 && <S2SeedDrop key="s2" onNext={() => go(3)} />}
        {scene === 3 && <S3Watering key="s3" onNext={() => go(4)} />}
        {scene === 4 && <S4BouquetGrowth key="s4" flowers={flowers} accent={accent} onDone={() => go(5)} />}
        {scene === 5 && <S5Envelope key="s5" accent={accent} onOpen={() => go(6)} />}
        {scene === 6 && <S6CardReveal key="s6" accent={accent} onDone={() => go(7)} />}
        {scene === 7 && <S7CardOpen key="s7" card={card} accent={accent} />}
      </AnimatePresence>

      {/* Scene progress dots */}
      {scene > 1 && scene < 7 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {([2,3,4,5,6] as SceneId[]).map((s) => (
            <div
              key={s}
              className="rounded-full transition-all duration-300"
              style={{
                width:      scene >= s ? 8 : 5,
                height:     scene >= s ? 8 : 5,
                background: scene >= s
                  ? isDark ? 'rgba(255,255,255,0.7)' : accent
                  : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(120,50,20,0.25)',
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
