'use client';

import { COLOR_THEMES } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ColorTheme } from '@/lib/utils';

interface Props {
  selected: ColorTheme;
  onSelect: (t: ColorTheme) => void;
}

export function ColorThemePicker({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {COLOR_THEMES.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`p-4 border-2 text-left transition-all
            ${selected === t.id ? 'border-petal-pink shadow-neo-pink' : 'border-neo-white/20 hover:border-petal-pink/50'}`}
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex gap-2 mb-2">
            {t.colors.map((c) => (
              <div key={c} className="w-8 h-8 rounded-full border-2 border-neo-black" style={{ background: c }} />
            ))}
          </div>
          <span className="font-mono text-sm text-neo-white/80">{t.label}</span>
          {selected === t.id && <span className="ml-2 text-petal-pink">✓</span>}
        </motion.button>
      ))}
    </div>
  );
}
