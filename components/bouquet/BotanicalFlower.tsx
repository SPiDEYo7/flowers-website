'use client';

/**
 * BotanicalFlower — clean watercolour-sticker style SVG flower heads.
 *
 * Design rules:
 *  • Pure SVG bezier paths — no heavy feTurbulence filter (blurs at small sizes)
 *  • Each flower fills ~80 % of the 100×100 viewBox
 *  • Organic cubic-bezier petal shapes with slight asymmetry
 *  • Layered gradients: shadow base → main colour → highlight
 *  • Thin ink outlines (0.8–1.2 px): stroke = darker version of fill
 *  • Sticker halo: soft white ellipse underneath for die-cut sticker feel
 *
 * Usage:
 *   <BotanicalFlower id="rose" size={72} />
 */

import React, { memo } from 'react';

export type FlowerId =
  | 'rose' | 'tulip' | 'peony' | 'sunflower' | 'dahlia'
  | 'carnation' | 'gerbera' | 'anemone' | 'cherry' | 'daisy'
  | 'lily' | 'lavender';

// Shared white halo makes every flower look like a die-cut sticker
function Halo({ cx = 50, cy = 50, rx = 44, ry = 42 }: { cx?: number; cy?: number; rx?: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="white" opacity={0.18} />;
}

// ─── ROSE ────────────────────────────────────────────────────────────────────
// Spiral wound petals: 3 rings, wide outer to tight inner
export const RoseFlower = memo(function RoseFlower() {
  // Petal shape: teardrop from center (50,50) up to tip and back
  // Rotated 5 times for outer ring
  const outerPetal = 'M50 50 C34 42 24 22 50 4 C76 22 66 42 50 50';
  const midPetal   = 'M50 50 C36 44 30 28 50 14 C70 28 64 44 50 50';
  const innerPetal = 'M50 50 C40 46 36 34 50 24 C64 34 60 46 50 50';

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="r-out" cx="38%" cy="30%" r="68%">
          <stop offset="0%"  stopColor="#fecdd3" />
          <stop offset="55%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
        <radialGradient id="r-mid" cx="40%" cy="35%" r="62%">
          <stop offset="0%"  stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#9d174d" />
        </radialGradient>
        <radialGradient id="r-inn" cx="44%" cy="40%" r="58%">
          <stop offset="0%"  stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#831843" />
        </radialGradient>
      </defs>
      <Halo />
      {/* Outer 5 petals */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <path key={i} d={outerPetal}
          fill="url(#r-out)" stroke="#be185d" strokeWidth="0.7"
          transform={`rotate(${deg} 50 50)`} opacity={0.82 + (i % 3) * 0.04} />
      ))}
      {/* Mid 5 petals at 36° offset */}
      {[36, 108, 180, 252, 324].map((deg, i) => (
        <path key={i} d={midPetal}
          fill="url(#r-mid)" stroke="#9d174d" strokeWidth="0.6"
          transform={`rotate(${deg} 50 50)`} opacity={0.86} />
      ))}
      {/* Inner tight petals */}
      {[20, 110, 200, 290].map((deg, i) => (
        <path key={i} d={innerPetal}
          fill="url(#r-inn)" transform={`rotate(${deg} 50 50)`} opacity={0.90} />
      ))}
      {/* Center button */}
      <circle cx="50" cy="50" r="10" fill="#881337" />
      <circle cx="50" cy="50" r="6"  fill="#4a0520" />
      {/* Specular */}
      <ellipse cx="44" cy="42" rx="5" ry="2.5" fill="white" opacity="0.30" transform="rotate(-20 44 42)" />
    </svg>
  );
});

// ─── TULIP ───────────────────────────────────────────────────────────────────
// Distinctive cup / chalice — three main petals forming an egg shape
export const TulipFlower = memo(function TulipFlower() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="t-side" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"  stopColor="#fce7f3" />
          <stop offset="45%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
        <linearGradient id="t-front" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"  stopColor="#fbcfe8" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#9d174d" />
        </linearGradient>
      </defs>
      <Halo cy={48} ry={40} />
      {/* Left outer petal */}
      <path d="M50 78 C28 66 22 40 30 18 C35 7 50 6 56 18 C60 28 58 56 50 78"
        fill="url(#t-side)" stroke="#be185d" strokeWidth="0.8" opacity="0.88" />
      {/* Right outer petal */}
      <path d="M50 78 C72 66 78 40 70 18 C65 7 50 6 44 18 C40 28 42 56 50 78"
        fill="url(#t-side)" stroke="#be185d" strokeWidth="0.8" opacity="0.88" />
      {/* Centre front petal — lightest, shows the opening cup */}
      <path d="M50 80 C36 68 34 44 38 24 C42 10 58 10 62 24 C66 44 64 68 50 80"
        fill="url(#t-front)" stroke="#be185d" strokeWidth="0.9" opacity="0.94" />
      {/* Interior highlight stripe */}
      <path d="M50 72 C48 54 47 34 48 18 Q50 12 52 18 C53 34 52 54 50 72"
        fill="rgba(255,255,255,0.22)" />
      {/* Vein lines */}
      <path d="M50 72 L50 18" stroke="rgba(190,24,93,0.20)" strokeWidth="0.6" fill="none" />
    </svg>
  );
});

// ─── PEONY ───────────────────────────────────────────────────────────────────
// Full and round — many ruffled layers of petals
export const PeonyFlower = memo(function PeonyFlower() {
  const petal  = 'M50 50 C32 40 22 18 50 2 C78 18 68 40 50 50';
  const petal2 = 'M50 50 C34 42 28 24 50 10 C72 24 66 42 50 50';
  const petal3 = 'M50 50 C38 46 34 34 50 22 C66 34 62 46 50 50';
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="p-out" cx="36%" cy="28%" r="72%">
          <stop offset="0%"  stopColor="#fce7f3" />
          <stop offset="50%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </radialGradient>
        <radialGradient id="p-mid" cx="40%" cy="34%" r="66%">
          <stop offset="0%"  stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#db2777" />
        </radialGradient>
        <radialGradient id="p-inn" cx="44%" cy="40%" r="60%">
          <stop offset="0%"  stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
      </defs>
      <Halo rx={46} ry={44} />
      {/* Outer 6 */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <path key={i} d={petal}
          fill="url(#p-out)" stroke="#ec4899" strokeWidth="0.6"
          transform={`rotate(${deg} 50 50)`} opacity={0.78 + (i % 3) * 0.04} />
      ))}
      {/* Mid 6 at 30° */}
      {[30, 90, 150, 210, 270, 330].map((deg, i) => (
        <path key={i} d={petal2}
          fill="url(#p-mid)" stroke="#db2777" strokeWidth="0.5"
          transform={`rotate(${deg} 50 50)`} opacity={0.84} />
      ))}
      {/* Inner 5 */}
      {[18, 90, 162, 234, 306].map((deg, i) => (
        <path key={i} d={petal3}
          fill="url(#p-inn)" transform={`rotate(${deg} 50 50)`} opacity={0.90} />
      ))}
      {/* Centre */}
      <circle cx="50" cy="50" r="12" fill="#9d174d" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 7} cy={50 + Math.sin(a) * 7} r="1.3" fill="#fde68a" />;
      })}
      <ellipse cx="44" cy="38" rx="11" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-15 44 38)" />
    </svg>
  );
});

// ─── SUNFLOWER ───────────────────────────────────────────────────────────────
// Long narrow petals, large dark‑brown disc with Fibonacci seeds
export const SunflowerFlower = memo(function SunflowerFlower() {
  // Elongated narrow petal
  const petal = 'M50 50 C46 36 45 18 50 6 C55 18 54 36 50 50';
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sf-p" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%"  stopColor="#fef08a" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <radialGradient id="sf-d" cx="36%" cy="32%" r="66%">
          <stop offset="0%"  stopColor="#78350f" />
          <stop offset="55%" stopColor="#431407" />
          <stop offset="100%" stopColor="#1c0a03" />
        </radialGradient>
      </defs>
      <Halo />
      {/* 15 outer petals */}
      {Array.from({ length: 15 }).map((_, i) => (
        <path key={i} d={petal}
          fill="url(#sf-p)" stroke="#a16207" strokeWidth="0.5"
          transform={`rotate(${i * 24} 50 50)`} opacity={0.86 + (i % 2) * 0.06} />
      ))}
      {/* Short inner petal ring */}
      {Array.from({ length: 15 }).map((_, i) => (
        <path key={i} d="M50 50 C47 40 47 28 50 20 C53 28 53 40 50 50"
          fill="#f59e0b" transform={`rotate(${12 + i * 24} 50 50)`} opacity={0.5} />
      ))}
      {/* Dark disc */}
      <circle cx="50" cy="50" r="22" fill="url(#sf-d)" />
      <circle cx="50" cy="50" r="16" fill="#220800" />
      {/* Fibonacci seed dots */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = i * 2.4;
        const r = Math.sqrt(i + 1) * 1.85;
        if (r > 14) return null;
        return <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r="0.75" fill="#fbbf24" opacity="0.55" />;
      })}
      <ellipse cx="43" cy="43" rx="7" ry="3.5" fill="rgba(255,220,80,0.14)" transform="rotate(-20 43 43)" />
    </svg>
  );
});

// ─── DAISY ───────────────────────────────────────────────────────────────────
// 16 slender white petals around a bright yellow disc
export const DaisyFlower = memo(function DaisyFlower() {
  const petal = 'M50 50 C47 36 47 18 50 8 C53 18 53 36 50 50';
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="d-disc" cx="38%" cy="34%" r="60%">
          <stop offset="0%"  stopColor="#fef08a" />
          <stop offset="55%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#a16207" />
        </radialGradient>
      </defs>
      <Halo rx={46} ry={44} />
      {/* 16 white petals */}
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d={petal}
          fill="white" stroke="#d1c96e" strokeWidth="0.5"
          transform={`rotate(${i * 22.5} 50 50)`} opacity={0.92} />
      ))}
      {/* Golden disc */}
      <circle cx="50" cy="50" r="19" fill="url(#d-disc)" />
      <circle cx="50" cy="50" r="13" fill="#eab308" />
      {Array.from({ length: 28 }).map((_, i) => {
        const a = i * 2.24; const r = Math.sqrt(i + 1) * 1.7;
        if (r > 11) return null;
        return <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r="0.7" fill="#713f12" opacity="0.35" />;
      })}
    </svg>
  );
});

// ─── DAHLIA ──────────────────────────────────────────────────────────────────
// Tight geometric rings of pointed petals — deep purple / magenta
export const DahliaFlower = memo(function DahliaFlower() {
  const p1 = 'M50 50 C45 36 46 18 50 8 C54 18 55 36 50 50';
  const p2 = 'M50 50 C46 38 47 24 50 16 C53 24 54 38 50 50';
  const p3 = 'M50 50 C47 42 48 32 50 24 C52 32 53 42 50 50';
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dh-1" cx="36%" cy="30%" r="70%">
          <stop offset="0%"  stopColor="#f5d0fe" />
          <stop offset="55%" stopColor="#c026d3" />
          <stop offset="100%" stopColor="#701a75" />
        </radialGradient>
        <radialGradient id="dh-2" cx="40%" cy="36%" r="64%">
          <stop offset="0%"  stopColor="#e879f9" />
          <stop offset="100%" stopColor="#7e22ce" />
        </radialGradient>
      </defs>
      <Halo rx={44} ry={42} />
      {Array.from({ length: 12 }).map((_, i) => (
        <path key={i} d={p1} fill="url(#dh-1)" stroke="#701a75" strokeWidth="0.55"
          transform={`rotate(${i * 30} 50 50)`} opacity={0.82 + (i % 3) * 0.04} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={p2} fill="url(#dh-2)"
          transform={`rotate(${18 + i * 36} 50 50)`} opacity={0.86} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={p3} fill="#a855f7"
          transform={`rotate(${i * 45} 50 50)`} opacity={0.92} />
      ))}
      <circle cx="50" cy="50" r="10" fill="#4a044e" />
      <circle cx="50" cy="50" r="5.5" fill="#fde68a" />
      <circle cx="50" cy="50" r="2.5" fill="white" opacity="0.70" />
    </svg>
  );
});

// ─── CARNATION ───────────────────────────────────────────────────────────────
// Very ruffled ball of petals — high dispScale‑equivalent via many layers
export const CarnationFlower = memo(function CarnationFlower() {
  const p1 = 'M50 50 C32 40 22 16 50 2 C78 16 68 40 50 50';
  const p2 = 'M50 50 C34 42 26 22 50 8 C74 22 66 42 50 50';
  const p3 = 'M50 50 C38 46 32 30 50 18 C68 30 62 46 50 50';
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="c-p" cx="36%" cy="28%" r="72%">
          <stop offset="0%"  stopColor="#fce7f3" />
          <stop offset="50%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
        <radialGradient id="c-m" cx="40%" cy="34%" r="66%">
          <stop offset="0%"  stopColor="#fecdd3" />
          <stop offset="100%" stopColor="#9f1239" />
        </radialGradient>
      </defs>
      <Halo rx={46} ry={44} />
      {/* 9 outer */}
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={p1} fill="url(#c-p)" stroke="#be123c" strokeWidth="0.6"
          transform={`rotate(${i * 40} 50 50)`} opacity={0.76 + (i % 3) * 0.06} />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={p2} fill="url(#c-m)"
          transform={`rotate(${20 + i * 40} 50 50)`} opacity={0.82} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={p3} fill="#f43f5e"
          transform={`rotate(${i * (360 / 7)} 50 50)`} opacity={0.88} />
      ))}
      <circle cx="50" cy="50" r="9" fill="#881337" />
    </svg>
  );
});

// ─── GERBERA ──────────────────────────────────────────────────────────────────
// 22 thin vivid orange petals + concentric yellow-orange disc rings
export const GerberaFlower = memo(function GerberaFlower() {
  const petal = 'M50 50 C47 34 47 16 50 6 C53 16 53 34 50 50';
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g-p" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%"  stopColor="#fdba74" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <radialGradient id="g-d" cx="38%" cy="34%" r="62%">
          <stop offset="0%"  stopColor="#fef08a" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <Halo />
      {Array.from({ length: 22 }).map((_, i) => (
        <path key={i} d={petal} fill="url(#g-p)" stroke="#c2410c" strokeWidth="0.3"
          transform={`rotate(${i * (360 / 22)} 50 50)`}
          opacity={0.86 + (i % 4) * 0.02} />
      ))}
      {Array.from({ length: 22 }).map((_, i) => (
        <path key={i} d="M50 50 C48 38 48 24 50 16 C52 24 52 38 50 50"
          fill="#fb923c" transform={`rotate(${8.2 + i * (360 / 22)} 50 50)`} opacity={0.50} />
      ))}
      <circle cx="50" cy="50" r="20" fill="url(#g-d)" />
      <circle cx="50" cy="50" r="14" fill="#d97706" />
      <circle cx="50" cy="50" r="9"  fill="#92400e" />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 6} cy={50 + Math.sin(a) * 6} r="1.1" fill="#fef3c7" />;
      })}
    </svg>
  );
});

// ─── ANEMONE ──────────────────────────────────────────────────────────────────
// 6 broad petals + jet‑black velvety centre + bright white stamen ring
export const AnemoneFlower = memo(function AnemoneFlower() {
  const petal = 'M50 50 C28 42 14 20 50 4 C86 20 72 42 50 50';
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="an-p" cx="34%" cy="28%" r="72%">
          <stop offset="0%"  stopColor="#ede9fe" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b0764" />
        </radialGradient>
      </defs>
      <Halo rx={46} ry={44} />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <path key={i} d={petal} fill="url(#an-p)" stroke="#3b0764" strokeWidth="0.8"
          transform={`rotate(${deg} 50 50)`} opacity={0.84 + i * 0.02} />
      ))}
      {/* Black velvety centre */}
      <circle cx="50" cy="50" r="20" fill="#0f0520" />
      <circle cx="50" cy="50" r="14" fill="#050010" />
      {/* White stamen ring */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <circle key={i}
          cx={50 + Math.cos(a) * 10.5} cy={50 + Math.sin(a) * 10.5}
          r="1.5" fill="white" opacity="0.92" />;
      })}
      <circle cx="50" cy="50" r="4" fill="#312e81" opacity="0.6" />
    </svg>
  );
});

// ─── CHERRY BLOSSOM ───────────────────────────────────────────────────────────
// 5 notched petals (each has two lobes) — very delicate blush pink
export const CherryFlower = memo(function CherryFlower() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ch-p" cx="38%" cy="32%" r="66%">
          <stop offset="0%"  stopColor="#fdf2f8" />
          <stop offset="50%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </radialGradient>
      </defs>
      <Halo rx={44} ry={42} />
      {Array.from({ length: 5 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 72} 50 50)`}>
          {/* Left lobe */}
          <path d="M50 50 C36 42 26 22 34 8 C38 2 50 2 50 14 C50 22 48 36 50 50"
            fill="url(#ch-p)" stroke="#fbcfe8" strokeWidth="0.6" opacity="0.92" />
          {/* Right lobe */}
          <path d="M50 50 C64 42 74 22 66 8 C62 2 50 2 50 14 C50 22 52 36 50 50"
            fill="url(#ch-p)" stroke="#fbcfe8" strokeWidth="0.6" opacity="0.92" />
        </g>
      ))}
      {/* Pink centre + long stamens */}
      <circle cx="50" cy="50" r="10" fill="#f9a8d4" />
      <circle cx="50" cy="50" r="6"  fill="#ec4899" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <g key={i}>
            <line x1={50 + Math.cos(a) * 6} y1={50 + Math.sin(a) * 6}
                  x2={50 + Math.cos(a) * 18} y2={50 + Math.sin(a) * 18}
              stroke="#f9a8d4" strokeWidth="0.6" />
            <circle cx={50 + Math.cos(a) * 18} cy={50 + Math.sin(a) * 18} r="1.5" fill="#fbbf24" />
          </g>
        );
      })}
    </svg>
  );
});

// ─── LILY ────────────────────────────────────────────────────────────────────
// 6 elongated reflexed petals + 6 prominent stamens with anther heads
export const LilyFlower = memo(function LilyFlower() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ly-p" x1="0.4" y1="1" x2="0.6" y2="0">
          <stop offset="0%"  stopColor="#fdf4ff" />
          <stop offset="45%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#d8b4fe" />
        </linearGradient>
      </defs>
      <Halo rx={46} ry={44} />
      {/* 3 outer reflexed petals */}
      {[0, 120, 240].map((deg, i) => (
        <path key={i}
          d="M50 54 C32 46 18 26 28 10 C34 1 50 2 62 12 C72 22 70 44 50 54"
          fill="url(#ly-p)" stroke="#c084fc" strokeWidth="0.8" opacity="0.88"
          transform={`rotate(${deg} 50 52)`} />
      ))}
      {/* 3 inner offset 60° */}
      {[60, 180, 300].map((deg, i) => (
        <path key={i}
          d="M50 54 C33 47 20 28 29 12 C35 3 50 3 61 13 C71 23 68 45 50 54"
          fill="url(#ly-p)" stroke="#c084fc" strokeWidth="0.8" opacity="0.84"
          transform={`rotate(${deg} 50 52)`} />
      ))}
      {/* Freckle spots */}
      {Array.from({ length: 16 }).map((_, i) => (
        <circle key={i}
          cx={50 + Math.cos(i * 1.8) * (10 + (i % 3) * 4)}
          cy={46 + Math.sin(i * 1.8) * (6 + (i % 2) * 3)}
          r="1.8" fill="#7c3aed" opacity="0.25" />
      ))}
      {/* 6 arching stamens */}
      {[-10, -5, 0, 5, 10, 0].map((dx, i) => {
        const tipX = 50 + dx * 0.9; const tipY = 34 - i;
        return (
          <g key={i}>
            <path d={`M50 54 Q${50 + dx * 0.4} 48 ${tipX} ${tipY}`}
              stroke="#4d7c0f" strokeWidth="0.9" fill="none" />
            <ellipse cx={tipX} cy={tipY} rx="2.5" ry="1.2" fill="#ea580c"
              transform={`rotate(${dx * 5} ${tipX} ${tipY})`} />
          </g>
        );
      })}
    </svg>
  );
});

// ─── LAVENDER ────────────────────────────────────────────────────────────────
// Vertical botanical spike — very different from all radial flowers
export const LavenderFlower = memo(function LavenderFlower() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lv-s" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#4d7c3a" />
          <stop offset="100%" stopColor="#6aad5a" />
        </linearGradient>
      </defs>
      {/* Main spike stem */}
      <path d="M50 96 C49 78 50 50 50 14" stroke="url(#lv-s)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      {/* Side branch stems */}
      {[[43, 34], [46, 26], [48, 20]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M50 ${y + 8} Q${x} ${y + 2} ${x - 1} ${y}`} stroke="url(#lv-s)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d={`M50 ${y + 8} Q${100 - x} ${y + 2} ${101 - x} ${y}`} stroke="url(#lv-s)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      ))}
      {/* Main spike florets — 16 alternating */}
      {Array.from({ length: 16 }).map((_, i) => {
        const cy = 88 - i * 4.8;
        const cx = 50 + (i % 2 === 0 ? -4 : 4);
        const h = 270 - i * 1.5;
        return <ellipse key={i} cx={cx} cy={cy} rx="6" ry="4.2"
          fill={`hsl(${h},65%,${56 + i}%)`} opacity="0.92" />;
      })}
      {/* Branch florets */}
      {[[43, 34], [46, 26], [48, 20]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x - 1} cy={y}     rx="5.5" ry="3.8" fill="hsl(268,62%,62%)" opacity="0.90" />
          <ellipse cx={101 - x} cy={y}   rx="5.5" ry="3.8" fill="hsl(268,62%,62%)" opacity="0.90" />
          <ellipse cx={x - 3}   cy={y - 5} rx="4.5" ry="3" fill="hsl(270,62%,68%)" opacity="0.80" />
          <ellipse cx={103 - x} cy={y - 5} rx="4.5" ry="3" fill="hsl(270,62%,68%)" opacity="0.80" />
        </g>
      ))}
      {/* Small leaf pairs */}
      {[62, 50, 40].map((y, i) => (
        <g key={i}>
          <path d={`M50 ${y} Q44 ${y - 5} 41 ${y - 7}`} stroke="#4d7c3a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d={`M50 ${y} Q56 ${y - 5} 59 ${y - 7}`} stroke="#4d7c3a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
});

// ─── Registry ─────────────────────────────────────────────────────────────────
export const BOTANICAL_MAP: Record<FlowerId, React.FC> = {
  rose:      RoseFlower,
  tulip:     TulipFlower,
  peony:     PeonyFlower,
  sunflower: SunflowerFlower,
  dahlia:    DahliaFlower,
  carnation: CarnationFlower,
  gerbera:   GerberaFlower,
  anemone:   AnemoneFlower,
  cherry:    CherryFlower,
  daisy:     DaisyFlower,
  lily:      LilyFlower,
  lavender:  LavenderFlower,
};

export const BotanicalFlower = memo(function BotanicalFlower({
  id,
  size = 80,
}: {
  id:    FlowerId;
  size?: number;
}) {
  const Comp = BOTANICAL_MAP[id];
  if (!Comp) return null;
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <Comp />
    </div>
  );
});
