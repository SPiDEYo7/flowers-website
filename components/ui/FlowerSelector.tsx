'use client';

// FlowerSelector is implemented inline in the creator page.
// This file exports a re-usable version for other contexts.
import { FLOWER_TYPES } from '@/lib/utils';
import { motion } from 'framer-motion';

const FLOWER_EMOJIS: Record<string, string> = {
  rose: '🌹', tulip: '🌷', peony: '🌸', sunflower: '🌻',
  dahlia: '💐', carnation: '🌺', gerbera: '🌼', anemone: '🪻',
  cherry: '🌸', daisy: '🌼', lily: '🪷', lavender: '💜',
};

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function FlowerSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {FLOWER_TYPES.map((f) => (
        <motion.button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`p-3 border-2 flex flex-col items-center gap-1 transition-all
            ${selected === f.id ? 'border-petal-pink bg-petal-pink/10' : 'border-neo-white/20 hover:border-petal-pink/50'}`}
          whileTap={{ scale: 0.93 }}
        >
          <span className="text-3xl">{FLOWER_EMOJIS[f.id] ?? '🌸'}</span>
          <span className="text-xs font-mono text-neo-white/80">{f.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
