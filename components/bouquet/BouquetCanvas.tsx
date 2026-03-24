'use client';

/**
 * BouquetCanvas — Live bouquet preview with layered PNG flowers in dome shape
 *
 * Updated layout:
 * - Layers individual PNG flower images in dome shape (center higher, sides lower)
 * - Simple kraft paper wrap cone at bottom
 * - Gentle floating animation (3s loop, up-down bob)
 * - Radial glow behind bouquet matching dominant flower color
 * - Dark starfield theme background preserved
 * - Floating petal particles for ambiance
 * - Live card preview strip at bottom
 * - Bloom count badge at top-left
 */

import { useMemo, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/lib/store';
import { COLOR_THEMES, CARD_THEMES } from '@/lib/utils';
import { FLOWER_ASSETS } from '@/lib/flowerAssets';
import type { FlowerId } from './FlowerSVG';

// ─── Floating petals (background ambiance) ───────────────────────────────────
const PETAL_COLORS = ['#ffb7c5', '#ffd4e0', '#ffe4b5', '#f9a8d4'];

function FloatingPetals() {
  const petals = useMemo(() => Array.from({ length: 10 }, (_, i) => {
    const r = (n: number) => Math.sin(i * 29.7 + n) * 0.5 + 0.5;
    return {
      id: i,
      leftPercent: 10 + r(1) * 80, // 10% to 90%
      color: PETAL_COLORS[Math.floor(r(2) * PETAL_COLORS.length)],
      size: 6,
      delay: r(3) * 4,
      duration: 4 + r(4) * 4, // 4s to 8s
      driftX: (r(5) - 0.5) * 30, // slight horizontal drift
    };
  }), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {petals.map((p) => (
        <motion.div
          key={p.id}
          initial={{ bottom: 0, left: `${p.leftPercent}%`, opacity: 0 }}
          animate={{
            bottom: ['0%', '110%'],
            left: [`${p.leftPercent}%`, `${p.leftPercent + p.driftX}%`],
            opacity: [0, 0.5, 0.5, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50% 0 50% 0',
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

// ─── Kraft Paper Wrap (simple cone shape) ────────────────────────────────────
function KraftWrap({ size }: { size: number }) {
  const wrapHeight = size * 0.35;
  const wrapWidth = size * 0.40;

  return (
    <svg
      width={wrapWidth}
      height={wrapHeight}
      viewBox="0 0 160 140"
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
      }}
    >
      <defs>
        <linearGradient id="wrap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5e6c8" />
          <stop offset="50%" stopColor="#e0c99a" />
          <stop offset="100%" stopColor="#c9a96e" />
        </linearGradient>
      </defs>

      {/* Main wrap shape - trapezoid cone */}
      <path
        d="M 30 20 L 130 20 L 160 140 L 0 140 Z"
        fill="url(#wrap-grad)"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
      />

      {/* Fold lines */}
      <path d="M 35 30 Q 80 35 125 30" stroke="rgba(160,120,70,0.25)" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 30 50 Q 80 58 130 50" stroke="rgba(160,120,70,0.25)" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M 25 80 L 135 80" stroke="rgba(200,160,110,0.15)" strokeWidth="2" opacity="0.4" />
    </svg>
  );
}

// ─── Calculate dome layout positions ─────────────────────────────────────────
function calculateDomePositions(count: number, size: number) {
  if (count === 0) return [];

  const positions = [];
  const centerX = size / 2;
  const baseY = size * 0.54; // Flowers sit above the wrap

  for (let i = 0; i < count; i++) {
    // Arc arrangement - taller in center, shorter on sides
    const t = count > 1 ? i / (count - 1) : 0.5; // 0 to 1
    const angle = (t - 0.5) * 70; // -35deg to +35deg

    // Position along arc (dome shape)
    const x = centerX + Math.sin(angle * Math.PI / 180) * (size * 0.32);
    const y = baseY - Math.cos(angle * Math.PI / 180) * (size * 0.26) - (Math.cos(angle * Math.PI / 180) * size * 0.10);

    // Scale - center flowers slightly larger
    const scale = 0.90 + (0.25 * (1 - Math.abs(angle) / 35));

    // Rotation - natural tilt
    const rotation = angle * 0.4 + (Math.random() - 0.5) * 12;

    // Z-index - center in front
    const z = Math.round(10 - Math.abs(i - count / 2));

    positions.push({ x, y, scale, rotation, z });
  }

  return positions;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyBouquet() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        style={{ fontSize: '60px' }}
      >
        💐
      </motion.div>
      <p style={{
        color: 'rgba(255,255,255,0.25)',
        fontStyle: 'italic',
        fontSize: '14px'
      }}>
        Your illustrated bouquet will appear here
      </p>
    </div>
  );
}

// ─── Live card overlay ────────────────────────────────────────────────────────
function LiveCardOverlay() {
  const { cardTheme, colorTheme, message, senderName, recipientName, musicTrack } = useBouquetStore();
  const theme     = CARD_THEMES.find((t) => t.id === cardTheme);
  const colorData = COLOR_THEMES.find((t) => t.id === colorTheme);

  return (
    <motion.div
      layout
      className="absolute bottom-0 inset-x-0 z-20 mx-3 mb-3 border-2 border-neo-white/20 overflow-hidden shadow-neo-lg rounded-lg"
      style={{ background: theme?.bg ?? '#FFB3C6' }}
    >
      {colorData && (
        <div className="px-2.5 pt-1.5 flex gap-1 items-center">
          {colorData.colors.map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full border border-neo-black/20" style={{ background: c }} />
          ))}
          {musicTrack !== 'none' && (
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className="ml-auto text-xs"
              style={{ color: theme?.accent }}
            >♪</motion.span>
          )}
        </div>
      )}
      <div className="px-2.5 pt-0.5 pb-2 border-t mt-1" style={{ borderColor: (theme?.accent ?? '#FF85A1') + '33' }}>
        {recipientName && (
          <p className="font-display text-xs font-semibold opacity-70 mb-0.5" style={{ color: theme?.text }}>
            Dear {recipientName},
          </p>
        )}
        <p className="font-display text-xs italic line-clamp-2 opacity-80" style={{ color: theme?.text }}>
          {message ? `"${message}"` : 'Your message here…'}
        </p>
        {senderName && (
          <p className="text-right text-xs font-mono opacity-50 mt-0.5" style={{ color: theme?.accent }}>
            Sincerely, {senderName}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main BouquetCanvas ───────────────────────────────────────────────────────
export function BouquetCanvas({ compactPreview = false }: { compactPreview?: boolean }) {
  const { flowers, colorTheme } = useBouquetStore();
  const [seed, setSeed] = useState(42);
  const containerRef = useRef<HTMLDivElement>(null);

  const shuffle = useCallback(() => setSeed((s) => s + 1), []);

  const colorData = COLOR_THEMES.find((t) => t.id === colorTheme);
  const bgGradient = 'radial-gradient(ellipse at 30% 60%, rgba(130,45,85,0.55) 0%, rgba(25,8,18,1) 70%)';

  const bouquetSize = compactPreview ? 300 : 380;

  // Calculate flower positions in dome layout
  const flowerPositions = useMemo(() => {
    return calculateDomePositions(flowers.length, bouquetSize);
  }, [flowers.length, bouquetSize, seed]);

  // Determine dominant color for radial glow
  const dominantColor = useMemo(() => {
    if (flowers.length === 0) return '#f472b6';
    const firstFlower = FLOWER_ASSETS[flowers[0].flowerType as FlowerId];
    return firstFlower?.color || '#f472b6';
  }, [flowers]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: bgGradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Floating petals in background */}
      <FloatingPetals />

      {flowers.length === 0 ? (
        <EmptyBouquet />
      ) : (
        <>
          {/* Soft radial glow behind bouquet matching dominant flower color */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${dominantColor}30 0%, transparent 60%)`,
              filter: 'blur(80px)',
            }}
          />

          {/* Layered bouquet with gentle float animation */}
          <motion.div
            className="relative z-10"
            style={{ width: bouquetSize, height: bouquetSize }}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 0.6, type: 'spring' },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            {/* Kraft paper wrap */}
            <KraftWrap size={bouquetSize} />

            {/* Layer each flower PNG in dome arrangement */}
            {flowers.map((flower, index) => {
              const pos = flowerPositions[index];
              if (!pos) return null;

              const flowerData = FLOWER_ASSETS[flower.flowerType as FlowerId];
              if (!flowerData) return null;

              const flowerSize = bouquetSize * 0.20 * pos.scale;

              return (
                <motion.div
                  key={flower.id}
                  initial={{ opacity: 0, scale: 0.3, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: index * 0.12,
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                    zIndex: pos.z + 3,
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
                  }}
                >
                  {/* Soft glow behind flower */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: flower.color,
                      filter: 'blur(16px)',
                      transform: 'scale(1.5)',
                      opacity: 0.25,
                      zIndex: -1,
                    }}
                  />

                  {/* Flower PNG */}
                  <div style={{ width: flowerSize, height: flowerSize, position: 'relative' }}>
                    <Image
                      src={flowerData.imageUrl}
                      alt={flowerData.name}
                      width={flowerSize}
                      height={flowerSize}
                      className="w-full h-full object-contain"
                      draggable={false}
                      unoptimized
                      style={{
                        mixBlendMode: 'multiply',
                        filter: 'brightness(1.1) contrast(1.05)',
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}

            {/* Drop shadow under bouquet */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: bouquetSize * 0.6,
                height: bouquetSize * 0.08,
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
                filter: 'blur(12px)',
                zIndex: 0,
              }}
            />
          </motion.div>

          {/* Shuffle button */}
          {flowers.length >= 3 && !compactPreview && (
            <motion.button
              onClick={shuffle}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="absolute z-30 neo-btn-dark px-3 py-2 text-xs font-mono flex items-center gap-1.5"
              style={{ bottom: 110, right: 12 }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="inline-block"
              >↺</motion.span>
              Shuffle
            </motion.button>
          )}
        </>
      )}

      {/* Live card preview strip */}
      {!compactPreview && flowers.length >= 1 && <LiveCardOverlay />}

      {/* Bloom count badge */}
      <div className="absolute top-3 left-3" style={{ zIndex: 30 }}>
        <motion.span
          key={flowers.length}
          initial={{ scale: 1.4, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="inline-flex items-center justify-center rounded-full text-white font-bold text-sm shadow-2xl"
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #ff6b9d, #f472b6)',
            border: '2px solid white',
          }}
        >
          {flowers.length}
        </motion.span>
      </div>
    </div>
  );
}
