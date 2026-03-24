'use client';

/**
 * LiveBouquetPreview — Tight cluster bouquet with greenery
 *
 * Flowers are tightly clustered together like a real bouquet
 * with greenery/leaves at the bottom center
 */

import { useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/lib/store';
import { FLOWER_ASSETS } from '@/lib/flowerAssets';
import type { FlowerId } from './bouquet/FlowerSVG';

// ─── EXACT pixel positions for tight clustering ───────────────────────────────
// Container center: (190px, 210px)
// Position calculation: left = 190 + offsetX - size/2, top = 210 + offsetY - size/2
const POSITIONS = [
  { offsetX: 0,    offsetY: -80,  size: 110, rotation: 0,   zIndex: 10 },
  { offsetX: -65,  offsetY: -30,  size: 95,  rotation: -15, zIndex: 8  },
  { offsetX: 65,   offsetY: -30,  size: 95,  rotation: 15,  zIndex: 8  },
  { offsetX: -110, offsetY: 30,   size: 85,  rotation: -25, zIndex: 6  },
  { offsetX: 0,    offsetY: 20,   size: 90,  rotation: 5,   zIndex: 9  },
  { offsetX: 110,  offsetY: 30,   size: 85,  rotation: 25,  zIndex: 6  },
  { offsetX: -50,  offsetY: 70,   size: 80,  rotation: -10, zIndex: 7  },
  { offsetX: 50,   offsetY: 70,   size: 80,  rotation: 10,  zIndex: 7  },
];

// Container dimensions
const CONTAINER_WIDTH = 380;
const CONTAINER_HEIGHT = 420;
const CENTER_X = 190; // CONTAINER_WIDTH / 2
const CENTER_Y = 210; // CONTAINER_HEIGHT / 2

// ─── Greenery Layer ────────────────────────────────────────────────────────────
function GreeneryLayer() {
  const greeneryRotations = [0, -25, 25];

  return (
    <>
      {greeneryRotations.map((rotation, index) => (
        <motion.div
          key={`greenery-${index}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{
            delay: index * 0.1,
            duration: 0.5,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            zIndex: 0,
          }}
        >
          <Image
            src="/flowers/greenery.png.jpg"
            alt="Greenery"
            width={280}
            height={280}
            className="object-contain"
            draggable={false}
            unoptimized
            style={{
              mixBlendMode: 'multiply',
              opacity: 0.7 - index * 0.1,
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

// ─── Main LiveBouquetPreview ───────────────────────────────────────────────────
export function LiveBouquetPreview() {
  const { flowers } = useBouquetStore();

  // Get dominant color from first flower
  const dominantColor = useMemo(() => {
    if (flowers.length === 0) return '#f472b6';
    const firstFlower = FLOWER_ASSETS[flowers[0].flowerType as FlowerId];
    return firstFlower?.color || '#f472b6';
  }, [flowers]);

  if (flowers.length === 0) {
    return (
      <div
        className="relative w-full h-full overflow-hidden flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at 30% 60%, rgba(130,45,85,0.55) 0%, rgba(13,0,21,1) 70%)',
        }}
      >
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontStyle: 'italic',
          fontSize: '16px',
          fontWeight: 500,
          textAlign: 'center',
          padding: '0 2rem',
        }}>
          Pick flowers to build your bouquet
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 30% 60%, rgba(130,45,85,0.55) 0%, rgba(13,0,21,1) 70%)',
      }}
    >
      {/* Soft radial glow behind bouquet */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${dominantColor}40 0%, transparent 65%)`,
          filter: 'blur(100px)',
        }}
      />

      {/* Bouquet container with floating animation */}
      <motion.div
        animate={{
          y: [0, -12, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="relative"
          style={{
            width: CONTAINER_WIDTH,
            height: CONTAINER_HEIGHT,
            overflow: 'visible',
          }}
        >
          {/* Greenery at bottom center */}
          <GreeneryLayer />

          {/* Flowers in tight cluster */}
          <AnimatePresence mode="popLayout">
            {flowers.map((flower, index) => {
              const flowerData = FLOWER_ASSETS[flower.flowerType as FlowerId];
              if (!flowerData) return null;

              // Use POSITIONS array cycling
              const pos = POSITIONS[index % POSITIONS.length];

              // Calculate position from center
              const left = CENTER_X + pos.offsetX - pos.size / 2;
              const top = CENTER_Y + pos.offsetY - pos.size / 2;

              return (
                <motion.div
                  key={flower.id}
                  initial={{ opacity: 0, scale: 0, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: -30 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.5,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  style={{
                    position: 'absolute',
                    left: left,
                    top: top,
                    width: pos.size,
                    height: pos.size,
                    zIndex: pos.zIndex,
                  }}
                >
                  {/* Circular cropped flower */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      transform: `rotate(${pos.rotation}deg)`,
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                    }}
                  >
                    <Image
                      src={flowerData.imageUrl}
                      alt={flowerData.name}
                      width={pos.size}
                      height={pos.size}
                      className="w-full h-full object-cover"
                      draggable={false}
                      unoptimized
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
