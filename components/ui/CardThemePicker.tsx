'use client';

import { CARD_THEMES } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { CardTheme } from '@/lib/utils';

interface Props {
  selected: CardTheme;
  onSelect: (t: CardTheme) => void;
}

const BG_STYLES: Record<string, string> = {
  romantic: 'linear-gradient(135deg,#FFB3C6,#C8B6E2)',
  minimal:  '#FFF8F0',
  dark:     'linear-gradient(180deg,#1a0533,#FF85A1)',
  dreamy:   'linear-gradient(135deg,#FFF8F0,#C8B6E2)',
};

export function CardThemePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CARD_THEMES.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`p-4 border-2 text-left transition-all
            ${selected === t.id ? 'border-petal-pink shadow-neo-pink' : 'border-neo-white/20 hover:border-petal-pink/50'}`}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-full h-12 mb-2 rounded-sm" style={{ background: BG_STYLES[t.id] }} />
          <span className="font-mono text-sm text-neo-white/80">{t.label}</span>
          {selected === t.id && <span className="ml-2 text-petal-pink">✓</span>}
        </motion.button>
      ))}
    </div>
  );
}
