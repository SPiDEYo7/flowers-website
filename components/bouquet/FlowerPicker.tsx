'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useBouquetStore } from '@/lib/store';
import { FLOWER_ASSETS, getAllFlowers } from '@/lib/flowerAssets';
import type { FlowerId } from './FlowerSVG';

const MIN = 6;
const MAX = 10;

// Flower meanings mapping
const FLOWER_MEANINGS: Record<FlowerId, { meaning: string; month: string }> = {
  rose:      { meaning: 'Love & passion',     month: 'June' },
  tulip:     { meaning: 'Perfect love',       month: 'March' },
  peony:     { meaning: 'Romance & beauty',   month: 'May' },
  sunflower: { meaning: 'Adoration',          month: 'July' },
  dahlia:    { meaning: 'Elegance',           month: 'August' },
  carnation: { meaning: 'Devotion',           month: 'January' },
  gerbera:   { meaning: 'Cheerfulness',       month: 'April' },
  anemone:   { meaning: 'Anticipation',       month: 'February' },
  cherry:    { meaning: 'Renewal',            month: 'March' },
  daisy:     { meaning: 'Innocence & joy',    month: 'April' },
  lily:      { meaning: 'Purity & rebirth',   month: 'May' },
  lavender:  { meaning: 'Devotion & calm',    month: 'July' },
};

// ─── Tooltip ───────────────────────────────────────────────────────────────────
const Tooltip = memo(function Tooltip({ flowerId }: { flowerId: FlowerId }) {
  const flower = FLOWER_ASSETS[flowerId];
  const info = FLOWER_MEANINGS[flowerId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.90 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.90 }}
      transition={{ duration: 0.13 }}
      className="absolute bottom-full mb-3 z-50 pointer-events-none left-1/2 -translate-x-1/2 whitespace-nowrap"
    >
      <div className="backdrop-blur-xl bg-white/95 border border-white/40 rounded-2xl px-4 py-3 text-center shadow-2xl"
        style={{
          boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${flower.glowColor}`
        }}
      >
        <p className="font-sub font-bold text-sm text-gray-800">{flower.name}</p>
        <p className="text-xs text-gray-500 mt-1">{info.meaning}</p>
        <p className="text-xs mt-1.5 font-medium" style={{ color: flower.color }}>
          ✦ {info.month}
        </p>
      </div>
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
                      border-l-[6px] border-r-[6px] border-t-[6px]
                      border-l-transparent border-r-transparent border-t-white/95" />
    </motion.div>
  );
});

// ─── Single flower tile — Digibouquet style: round image, NO CARD ─────────────
const FlowerTile = memo(function FlowerTile({
  flowerId,
  count,
  total,
  onAdd,
  onRemove,
}: {
  flowerId: FlowerId;
  count:    number;
  total:    number;
  onAdd:    () => void;
  onRemove: () => void;
}) {
  const [showTip, setShowTip] = useState(false);
  const flower   = FLOWER_ASSETS[flowerId];
  const atMax    = total >= MAX;
  const selected = count > 0;
  const disabled = atMax && !selected;

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {/* Tooltip */}
      <AnimatePresence>
        {showTip && <Tooltip flowerId={flowerId} />}
      </AnimatePresence>

      {/* Count badge - black circle top-right */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 24 }}
            className="absolute -top-1 -right-1 z-20 rounded-full
                       flex items-center justify-center
                       text-xs font-mono font-bold text-white shadow-lg"
            style={{
              width: 24,
              height: 24,
              background: '#000',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round flower image — NO card wrapper */}
      <motion.button
        onClick={() => { if (!disabled) onAdd(); }}
        onHoverStart={() => setShowTip(true)}
        onHoverEnd={()   => setShowTip(false)}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled   ? { scale: 0.95 } : {}}
        disabled={disabled}
        aria-label={`Add ${flower.name}`}
        className="relative group"
        style={{
          width: 120,
          height: 120,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Round image */}
        <div
          className="relative overflow-hidden"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
          }}
        >
          <Image
            src={flower.imageUrl}
            alt={flower.name}
            width={120}
            height={120}
            className="w-full h-full object-cover"
            draggable={false}
            unoptimized
            style={{
              filter: disabled ? 'grayscale(50%)' : 'none',
            }}
          />
        </div>
      </motion.button>
    </div>
  );
});

// ─── Selected blooms pill tags at bottom ──────────────────────────────────────
function SelectedStrip({ selectedIds, total }: { selectedIds: FlowerId[]; total: number }) {
  const pct   = (total / MAX) * 100;
  const ready = total >= MIN;

  // Count occurrences of each flower type
  const countMap = selectedIds.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  // Get unique flower IDs
  const uniqueIds = Object.keys(countMap) as FlowerId[];

  return (
    <div className="space-y-4 p-6 rounded-2xl shadow-xl" style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-mono uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Selected Blooms
        </p>
        <motion.p
          key={total}
          initial={{ scale: 1.45 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={`text-sm font-mono font-black transition-colors ${
            ready ? 'text-pink-400' : 'text-gray-500'
          }`}
        >
          {total} / {MAX}
        </motion.p>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #f472b6, #c084fc, #fb7185)',
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
        />
        {/* Min marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
          style={{ left: `${(MIN / MAX) * 100}%`, background: 'rgba(255,255,255,0.5)' }}
        />
        <p
          className="absolute text-[10px] font-mono -top-5"
          style={{ left: `${(MIN / MAX) * 100}%`, transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)' }}
        >
          min
        </p>
      </div>

      {/* Pill tags — "FLOWERNAME x1" format */}
      {uniqueIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {uniqueIds.map((id) => {
              const flower = FLOWER_ASSETS[id];
              const count = countMap[id];
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 26 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255,255,255,0.95)',
                  }}
                >
                  {flower.name.toUpperCase()} x{count}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-sm text-center py-2" style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
          Click flowers above to add them to your bouquet
        </p>
      )}

      {/* Status message */}
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div
            key="need"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1,  y:  0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl
                       border-2 border-dashed shadow-sm"
            style={{
              borderColor: 'rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)'
            }}
          >
            <span className="text-2xl">🌱</span>
            <p className="text-sm font-body" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Add{' '}
              <span className="text-pink-400 font-bold">{MIN - total}</span>
              {' '}more bloom{MIN - total !== 1 ? 's' : ''} to continue
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.94, y: -5 }}
            animate={{ opacity: 1,  scale: 1,    y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl
                       border-2 shadow-lg"
            style={{
              borderColor: 'rgba(244, 114, 182, 0.5)',
              background: 'rgba(244, 114, 182, 0.15)',
              boxShadow: '0 0 24px rgba(244, 114, 182, 0.3)'
            }}
          >
            <motion.span
              animate={{ rotate: [0, 16, -10, 14, 0] }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="text-2xl"
            >
              🌸
            </motion.span>
            <p className="text-sm font-body font-semibold" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Beautiful bouquet! Click <strong>Continue →</strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main FlowerPicker ─────────────────────────────────────────────────────────
export function FlowerPicker() {
  const { flowers, addFlower, removeFlower } = useBouquetStore();

  const allFlowers = getAllFlowers();

  const countMap = flowers.reduce<Record<string, number>>((acc, f) => {
    acc[f.flowerType] = (acc[f.flowerType] || 0) + 1;
    return acc;
  }, {});

  const total       = flowers.length;
  const selectedIds = flowers.map((f) => f.flowerType as FlowerId);

  const handleAdd = (flowerId: FlowerId) => {
    if (total >= MAX) return;
    const flower = FLOWER_ASSETS[flowerId];
    if (!flower) return;
    addFlower({
      flowerType: flowerId as never,
      color:      flower.color,
      position:   { x: 50, y: 50 },
      scale:      1,
      rotation:   Math.round((Math.random() - 0.5) * 28),
    });
  };

  const handleRemove = (flowerId: FlowerId) => {
    const lastIdx = [...flowers].reverse().findIndex((f) => f.flowerType === flowerId);
    if (lastIdx === -1) return;
    removeFlower(flowers[flowers.length - 1 - lastIdx].id);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-display font-bold mb-2" style={{
          fontSize: '2rem',
          color: '#f5d0e0',
          fontWeight: 600
        }}>
          Choose Your Blooms
        </h3>
        <p className="text-sm font-body mx-auto" style={{
          color: 'rgba(255,255,255,0.45)',
          maxWidth: '32rem'
        }}>
          Pick 6–10 flowers. Hover to see meanings.
        </p>
      </div>

      {/* 4-column grid for round flower images */}
      <div className="grid grid-cols-4 gap-6 justify-items-center">
        {allFlowers.map((flower) => (
          <FlowerTile
            key={flower.id}
            flowerId={flower.id}
            count={countMap[flower.id] || 0}
            total={total}
            onAdd={() => handleAdd(flower.id)}
            onRemove={() => handleRemove(flower.id)}
          />
        ))}
      </div>

      {/* Selected blooms pill strip at bottom */}
      <SelectedStrip selectedIds={selectedIds} total={total} />
    </div>
  );
}
