'use client';

/**
 * PremadeBouquets — Horizontal scrollable shelf with illustrated bouquets
 *
 * Design inspired by luxury flower shop displays:
 * - Horizontal scrollable row (snap scroll)
 * - Each card 190×250px with rounded corners (16px)
 * - PNG bouquet images from /public/bouquets/
 * - Elegant Playfair Display font for bouquet names
 * - Soft glowing border on hover matching dominant color
 * - Left/right arrow navigation
 * - Swipe on mobile
 * - Premium, soft, elegant aesthetic
 */

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PREMADE_BOUQUETS, FLOWER_ASSETS, type PremadeBouquet } from '@/lib/flowerAssets';
import { useBouquetStore } from '@/lib/store';
import type { FlowerId } from '../bouquet/FlowerSVG';

interface PremadeBouquetsProps {
  onSelect: (bouquet: PremadeBouquet) => void;
}

export function PremadeBouquets({ onSelect }: PremadeBouquetsProps) {
  const { flowers, clearFlowers, addFlower } = useBouquetStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleSelectBouquet = (bouquet: PremadeBouquet) => {
    // Clear current selection
    clearFlowers();

    // Add flowers from the pre-made bouquet
    bouquet.flowers.forEach((flowerId, index) => {
      const flower = FLOWER_ASSETS[flowerId as FlowerId];
      if (flower) {
        addFlower({
          flowerType: flowerId as never,
          color: flower.color,
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: Math.round((Math.random() - 0.5) * 28),
        });
      }
    });

    // Notify parent
    onSelect(bouquet);
  };

  const checkScrollButtons = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 186; // Card width (160) + gap (24) + padding (2)
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
      // Check scroll buttons after animation
      setTimeout(checkScrollButtons, 400);
    }
  };

  const isSelected = (bouquet: PremadeBouquet) => {
    return flowers.length === bouquet.flowers.length &&
      bouquet.flowers.every((fId) =>
        flowers.some((f) => f.flowerType === fId)
      );
  };

  // Determine dominant color for each bouquet
  const getDominantColor = (bouquet: PremadeBouquet): string => {
    if (bouquet.flowers.length === 0) return '#f472b6';
    const firstFlower = FLOWER_ASSETS[bouquet.flowers[0] as FlowerId];
    return firstFlower?.color || '#f472b6';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🌸</span>
          <h3 className="font-bold" style={{
            fontSize: '2rem',
            color: '#f5d0e0',
            fontWeight: 600,
            fontFamily: 'var(--font-playfair)',
          }}>
            Pre-Made Bouquets
          </h3>
          <span className="text-2xl">🌸</span>
        </div>
        <p className="text-sm font-body mx-auto" style={{
          color: 'rgba(255,255,255,0.45)',
          maxWidth: '32rem'
        }}>
          Pick one or build your own
        </p>
      </div>

      {/* Horizontal scrollable shelf */}
      <div className="relative -mx-4 sm:mx-0">
        {/* Left scroll arrow */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-neo-white/10 backdrop-blur-md border-2 border-neo-white/20 hover:bg-neo-white/20 hover:border-petal-pink/40 transition-all shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right scroll arrow */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-neo-white/10 backdrop-blur-md border-2 border-neo-white/20 hover:bg-neo-white/20 hover:border-petal-pink/40 transition-all shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          onScroll={checkScrollButtons}
          className="flex gap-6 overflow-x-auto pb-4 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {PREMADE_BOUQUETS.map((bouquet, index) => {
            const selected = isSelected(bouquet);
            const dominantColor = getDominantColor(bouquet);

            return (
              <motion.div
                key={bouquet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="flex-shrink-0 snap-center"
              >
                <motion.button
                  onClick={() => handleSelectBouquet(bouquet)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden transition-all duration-300"
                  style={{
                    width: 160,
                    height: 200,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.05)',
                    border: selected
                      ? `2px solid ${dominantColor}ee`
                      : '1px solid transparent',
                    boxShadow: selected
                      ? `0 0 20px ${dominantColor}99, 0 0 8px ${dominantColor}dd`
                      : '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* PNG Bouquet image - fills top 75% */}
                  <div className="absolute inset-x-0 top-0" style={{ height: '75%' }}>
                    <div className="relative w-full h-full p-2">
                      <Image
                        src={bouquet.imageUrl}
                        alt={bouquet.name}
                        fill
                        className="object-contain"
                        draggable={false}
                        unoptimized
                        style={{
                          mixBlendMode: 'normal',
                          filter: 'brightness(1.05) contrast(1.03)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Bouquet name - bottom 25%, centered */}
                  <div className="absolute inset-x-0 bottom-0 px-3 pb-3 z-10 flex items-center justify-center" style={{ height: '25%' }}>
                    <h4
                      className="text-white font-semibold text-center leading-tight"
                      style={{
                        fontFamily: 'var(--font-playfair)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {bouquet.name}
                    </h4>
                  </div>

                  {/* Hover glow effect - subtle */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      borderRadius: 16,
                      border: `2px solid ${dominantColor}66`,
                      boxShadow: `0 0 16px ${dominantColor}44`,
                    }}
                  />

                  {/* Selection glow - pink/gold */}
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: 16,
                        border: `2px solid ${dominantColor}ee`,
                        boxShadow: `0 0 20px ${dominantColor}99`,
                      }}
                    />
                  )}

                  {/* Selection checkmark badge */}
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="absolute top-2 right-2 z-20 flex items-center justify-center shadow-lg"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ffd700, #ff69b4)',
                        color: 'white',
                      }}
                    >
                      <span className="text-sm font-black">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Divider with "or" */}
      <div className="relative flex items-center justify-center py-4">
        <div className="absolute inset-x-0 top-1/2 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)'
        }} />
        <div className="relative px-4 rounded-full text-sm font-mono" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255,255,255,0.5)',
        }}>
          or customize your own below
        </div>
      </div>

      {/* Hide scrollbar globally for this component */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
