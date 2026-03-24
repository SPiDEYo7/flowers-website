'use client';

/**
 * IllustratedBouquet — Full wrapped bouquet illustration
 *
 * Renders a complete bouquet with:
 * - Kraft paper or tissue paper wrap at base (cone shape with fold lines)
 * - Satin ribbon bow tied at the wrap point
 * - Flower heads arranged naturally (taller in center, shorter on sides)
 * - Green leaves peeking from sides
 * - Soft drop shadow for depth
 * - Gentle floating animation
 *
 * Uses BotanicalFlower SVGs for illustrated watercolor-style flowers
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BotanicalFlower, type FlowerId } from './BotanicalFlower';

export interface BouquetFlowerItem {
  id: string;
  flowerType: FlowerId;
  color: string;
}

interface IllustratedBouquetProps {
  flowers: BouquetFlowerItem[];
  size?: number;
  animated?: boolean;
  wrapColor?: 'kraft' | 'white' | 'pink' | 'lavender';
  ribbonColor?: string;
}

// ─── Wrap Styles ────────────────────────────────────────────────────────────
const WRAP_STYLES = {
  kraft: {
    gradient: 'linear-gradient(165deg, #f5e6c8 0%, #e0c99a 45%, #c9a96e 100%)',
    fold: 'rgba(160, 120, 70, 0.25)',
    crinkle: 'rgba(200, 160, 110, 0.15)',
  },
  white: {
    gradient: 'linear-gradient(165deg, #ffffff 0%, #f5f5f5 45%, #e8e8e8 100%)',
    fold: 'rgba(0, 0, 0, 0.08)',
    crinkle: 'rgba(0, 0, 0, 0.05)',
  },
  pink: {
    gradient: 'linear-gradient(165deg, #ffe4f0 0%, #ffcce0 45%, #ffb3d4 100%)',
    fold: 'rgba(255, 100, 150, 0.15)',
    crinkle: 'rgba(255, 150, 200, 0.12)',
  },
  lavender: {
    gradient: 'linear-gradient(165deg, #f3e8ff 0%, #e9d5ff 45%, #d8b4fe 100%)',
    fold: 'rgba(150, 100, 200, 0.15)',
    crinkle: 'rgba(180, 150, 220, 0.12)',
  },
};

// ─── Kraft Paper Wrap ───────────────────────────────────────────────────────
function KraftWrap({ style, size }: { style: keyof typeof WRAP_STYLES; size: number }) {
  const wrapStyle = WRAP_STYLES[style];
  const wrapHeight = size * 0.45;
  const wrapWidth = size * 0.50;

  return (
    <svg
      width={wrapWidth}
      height={wrapHeight}
      viewBox="0 0 180 180"
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
          <stop offset="0%" stopColor={wrapStyle.gradient.match(/#[a-f0-9]{6}/gi)?.[0] || '#f5e6c8'} />
          <stop offset="50%" stopColor={wrapStyle.gradient.match(/#[a-f0-9]{6}/gi)?.[1] || '#e0c99a'} />
          <stop offset="100%" stopColor={wrapStyle.gradient.match(/#[a-f0-9]{6}/gi)?.[2] || '#c9a96e'} />
        </linearGradient>
      </defs>

      {/* Main wrap shape - trapezoid cone */}
      <path
        d="M 30 20 L 150 20 L 180 180 L 0 180 Z"
        fill="url(#wrap-grad)"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
      />

      {/* Fold lines for crinkle effect */}
      <path d="M 40 30 Q 90 35 140 30" stroke={wrapStyle.fold} strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M 35 50 Q 90 58 145 50" stroke={wrapStyle.fold} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M 30 70 Q 90 80 150 70" stroke={wrapStyle.fold} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M 25 100 L 155 100" stroke={wrapStyle.crinkle} strokeWidth="2" opacity="0.4" />
      <path d="M 20 130 L 160 130" stroke={wrapStyle.crinkle} strokeWidth="1.5" opacity="0.3" />

      {/* Shadow at bottom */}
      <path d="M 0 180 L 180 180 L 180 160 L 0 160 Z" fill="rgba(0,0,0,0.12)" />
    </svg>
  );
}

// ─── Ribbon Bow ─────────────────────────────────────────────────────────────
function RibbonBow({ color, size }: { color: string; size: number }) {
  const ribbonSize = size * 0.14;
  const ribbonY = size * 0.48;

  return (
    <svg
      width={ribbonSize}
      height={ribbonSize * 0.7}
      viewBox="0 0 80 56"
      style={{
        position: 'absolute',
        bottom: ribbonY,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
      }}
    >
      <defs>
        <linearGradient id="ribbon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Left bow loop */}
      <ellipse cx="20" cy="28" rx="18" ry="22" fill="url(#ribbon-grad)" stroke={color} strokeWidth="1.5" opacity="0.95" />

      {/* Right bow loop */}
      <ellipse cx="60" cy="28" rx="18" ry="22" fill="url(#ribbon-grad)" stroke={color} strokeWidth="1.5" opacity="0.95" />

      {/* Center knot */}
      <ellipse cx="40" cy="28" rx="10" ry="14" fill={color} stroke={color} strokeWidth="1" />

      {/* Left ribbon tail */}
      <path d="M 32 38 L 18 52 L 22 56 L 35 42 Z" fill="url(#ribbon-grad)" stroke={color} strokeWidth="1" opacity="0.9" />

      {/* Right ribbon tail */}
      <path d="M 48 38 L 62 52 L 58 56 L 45 42 Z" fill="url(#ribbon-grad)" stroke={color} strokeWidth="1" opacity="0.9" />

      {/* Highlights */}
      <ellipse cx="16" cy="22" rx="5" ry="7" fill="white" opacity="0.3" />
      <ellipse cx="64" cy="22" rx="5" ry="7" fill="white" opacity="0.3" />
    </svg>
  );
}

// ─── Greenery Leaves ────────────────────────────────────────────────────────
function GreeneryLeaves({ size }: { size: number }) {
  const leafSize = size * 0.15;

  return (
    <>
      {/* Left leaves */}
      <svg
        width={leafSize}
        height={leafSize * 1.4}
        viewBox="0 0 40 56"
        style={{
          position: 'absolute',
          bottom: size * 0.35,
          left: size * 0.18,
          zIndex: 1,
          transform: 'rotate(-25deg)',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      >
        <path d="M 20 6 Q 8 20 12 40 Q 20 30 20 6 Z" fill="#4d7c3a" opacity="0.85" />
        <path d="M 20 6 Q 32 20 28 40 Q 20 30 20 6 Z" fill="#5a904a" opacity="0.9" />
        <path d="M 20 10 L 20 38" stroke="#6aad5a" strokeWidth="1.5" opacity="0.6" />
      </svg>

      {/* Right leaves */}
      <svg
        width={leafSize}
        height={leafSize * 1.4}
        viewBox="0 0 40 56"
        style={{
          position: 'absolute',
          bottom: size * 0.38,
          right: size * 0.16,
          zIndex: 1,
          transform: 'rotate(30deg)',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      >
        <path d="M 20 6 Q 8 20 12 40 Q 20 30 20 6 Z" fill="#5a904a" opacity="0.9" />
        <path d="M 20 6 Q 32 20 28 40 Q 20 30 20 6 Z" fill="#6aad5a" opacity="0.85" />
        <path d="M 20 10 L 20 38" stroke="#7bc569" strokeWidth="1.5" opacity="0.5" />
      </svg>

      {/* Back center leaves */}
      <svg
        width={leafSize * 0.8}
        height={leafSize * 1.2}
        viewBox="0 0 40 56"
        style={{
          position: 'absolute',
          bottom: size * 0.42,
          left: '50%',
          transform: 'translateX(-50%) rotate(5deg)',
          zIndex: 0,
          opacity: 0.7,
        }}
      >
        <path d="M 20 6 Q 8 20 12 40 Q 20 30 20 6 Z" fill="#4d7c3a" />
      </svg>
    </>
  );
}

// ─── Flower Layout Calculator ──────────────────────────────────────────────
function calculateFlowerPositions(count: number, size: number) {
  if (count === 0) return [];

  const positions = [];
  const centerX = size / 2;
  const baseY = size * 0.52; // Flowers sit above the ribbon

  for (let i = 0; i < count; i++) {
    // Arc arrangement - taller in center, shorter on sides
    const t = count > 1 ? i / (count - 1) : 0.5; // 0 to 1
    const angle = (t - 0.5) * 70; // -35deg to +35deg

    // Position along arc
    const x = centerX + Math.sin(angle * Math.PI / 180) * (size * 0.32);
    const y = baseY - Math.cos(angle * Math.PI / 180) * (size * 0.28) - (Math.cos(angle * Math.PI / 180) * size * 0.12);

    // Scale - center flowers slightly larger
    const scale = 0.85 + (0.3 * (1 - Math.abs(angle) / 35));

    // Rotation - follow arc naturally
    const rotation = angle * 0.5 + (Math.random() - 0.5) * 15;

    // Z-index - center in front
    const z = Math.round(10 - Math.abs(i - count / 2));

    positions.push({ x, y, scale, rotation, z });
  }

  return positions;
}

// ─── Main IllustratedBouquet Component ─────────────────────────────────────
export const IllustratedBouquet = memo(function IllustratedBouquet({
  flowers,
  size = 400,
  animated = true,
  wrapColor = 'kraft',
  ribbonColor = '#f472b6',
}: IllustratedBouquetProps) {
  const positions = useMemo(() => calculateFlowerPositions(flowers.length, size), [flowers.length, size]);

  if (flowers.length === 0) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <p className="text-neo-white/25 text-sm font-body italic text-center px-8">
          Your illustrated bouquet will appear here
        </p>
      </div>
    );
  }

  const Container = animated ? motion.div : 'div';
  const floatProps = animated ? {
    animate: { y: [0, -8, 0] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  } : {};

  return (
    <Container
      className="relative"
      style={{ width: size, height: size }}
      {...floatProps}
    >
      {/* Soft radial glow behind bouquet */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${ribbonColor}20 0%, transparent 60%)`,
          filter: 'blur(40px)',
          transform: 'scale(0.9)',
        }}
      />

      {/* Greenery leaves */}
      <GreeneryLeaves size={size} />

      {/* Kraft paper wrap */}
      <KraftWrap style={wrapColor} size={size} />

      {/* Ribbon bow */}
      <RibbonBow color={ribbonColor} size={size} />

      {/* Flowers arranged in arc */}
      {flowers.map((flower, index) => {
        const pos = positions[index];
        if (!pos) return null;

        const flowerSize = size * 0.22 * pos.scale;

        const FlowerContainer = animated ? motion.div : 'div';
        const flowerAnimProps = animated ? {
          initial: { opacity: 0, scale: 0.3, y: 30 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: {
            delay: index * 0.1,
            duration: 0.6,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          },
        } : {};

        return (
          <FlowerContainer
            key={flower.id}
            {...flowerAnimProps}
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
              className="absolute inset-0 rounded-full"
              style={{
                background: flower.color,
                filter: 'blur(16px)',
                transform: 'scale(1.5)',
                opacity: 0.25,
                zIndex: -1,
              }}
            />

            {/* Flower illustration */}
            <BotanicalFlower id={flower.flowerType} size={flowerSize} />
          </FlowerContainer>
        );
      })}

      {/* Drop shadow under entire bouquet */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: size * 0.6,
          height: size * 0.08,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
          filter: 'blur(12px)',
          zIndex: 0,
        }}
      />
    </Container>
  );
});
