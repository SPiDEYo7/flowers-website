'use client';

/**
 * BouquetRenderer — Layered image composit of flowers
 *
 * Renders a natural-looking bouquet with:
 * - Overlapping flower layers
 * - Natural rotation and positioning
 * - Depth through z-index and scale
 * - Soft stem/leaf base layer
 * - Smooth fade-in animations
 */

import { motion } from 'framer-motion';
import { FlowerIllustration } from './FlowerSVG';
import type { FlowerId } from './FlowerSVG';
import { FLOWER_ASSETS } from '@/lib/flowerAssets';

export interface BouquetFlower {
  id: string;
  flowerType: FlowerId;
  color: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface BouquetRendererProps {
  flowers: BouquetFlower[];
  size?: number;
  animated?: boolean;
}

/**
 * Natural bouquet arrangement positions
 * Maps flowers to natural-looking positions in a bouquet composition
 */
function calculateBouquetLayout(flowers: BouquetFlower[], containerSize: number) {
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;

  return flowers.map((flower, index) => {
    // Create a natural cluster arrangement
    const total = flowers.length;
    const angleStep = (Math.PI * 2) / total;
    const angle = angleStep * index + (Math.random() - 0.5) * 0.5;

    // Vary the radius for depth
    const radiusBase = containerSize * 0.25;
    const radiusVariation = (Math.random() - 0.5) * radiusBase * 0.4;
    const radius = radiusBase + radiusVariation;

    // Calculate position
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.8; // Slightly flattened

    // Scale based on position (back flowers smaller)
    const depth = Math.sin(angle) * 0.5 + 0.5; // 0 to 1
    const scale = 0.85 + depth * 0.3 + (Math.random() - 0.5) * 0.15;

    // Natural rotation
    const rotation = (Math.random() - 0.5) * 40;

    // Z-index for layering (flowers higher up appear behind)
    const zIndex = Math.floor(y);

    return {
      ...flower,
      layoutX: x,
      layoutY: y,
      layoutScale: scale,
      layoutRotation: rotation,
      zIndex,
    };
  });
}

export function BouquetRenderer({ flowers, size = 400, animated = true }: BouquetRendererProps) {
  const layout = calculateBouquetLayout(flowers, size);

  if (flowers.length === 0) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-400 text-sm font-body italic">
          Your bouquet will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Soft base layer (stem/leaf suggestion) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: size * 0.4,
          height: size * 0.3,
          background: 'linear-gradient(180deg, transparent 0%, rgba(139, 195, 74, 0.15) 50%, rgba(76, 175, 80, 0.25) 100%)',
          filter: 'blur(24px)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      {/* Flowers layer */}
      {layout.map((flower, index) => {
        const asset = FLOWER_ASSETS[flower.flowerType];
        const flowerSize = (size * 0.35) * flower.layoutScale;

        const Container = animated ? motion.div : 'div';
        const animationProps = animated ? {
          initial: { opacity: 0, scale: 0.5, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: {
            delay: index * 0.08,
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1],
          },
        } : {};

        return (
          <Container
            key={flower.id}
            {...animationProps}
            className="absolute"
            style={{
              left: flower.layoutX,
              top: flower.layoutY,
              transform: `translate(-50%, -50%) rotate(${flower.layoutRotation}deg)`,
              zIndex: flower.zIndex,
              filter: `drop-shadow(0 4px 12px ${asset.glowColor})`,
            }}
          >
            {/* Soft glow behind flower */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: asset.glowColor,
                filter: 'blur(20px)',
                transform: 'scale(1.3)',
                zIndex: -1,
              }}
            />

            {/* Flower image */}
            <FlowerIllustration id={flower.flowerType} size={flowerSize} />
          </Container>
        );
      })}

      {/* Floating animation overlay */}
      {animated && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {layout.slice(0, 3).map((flower, i) => (
            <motion.div
              key={`float-${flower.id}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: flower.layoutX + (i - 1) * 40,
                top: flower.layoutY - 60,
                background: FLOWER_ASSETS[flower.flowerType].glowColor,
                filter: 'blur(4px)',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
