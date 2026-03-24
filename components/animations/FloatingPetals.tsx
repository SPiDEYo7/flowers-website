'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Petal {
  el: HTMLDivElement;
  tl: gsap.core.Timeline;
}

const PETAL_EMOJIS = ['🌸', '🌺', '🌼', '🌹', '🪷', '✿'];
const PETAL_SVGS = [
  `<svg viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="10" rx="6" ry="10" opacity="0.7"/></svg>`,
  `<svg viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="10" rx="10" ry="6" opacity="0.7"/></svg>`,
];

interface Props {
  count?: number;
  colors?: string[];
  className?: string;
}

export function FloatingPetals({ count = 18, colors, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<Petal[]>([]);

  const DEFAULT_COLORS = ['#FFB3C6', '#C8B6E2', '#FF85A1', '#DDA0DD', '#FFD700', '#B5EAD7'];
  const petalColors = colors || DEFAULT_COLORS;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing
    petalsRef.current.forEach((p) => p.tl.kill());
    container.innerHTML = '';
    petalsRef.current = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const color = petalColors[i % petalColors.length];
      const size = gsap.utils.random(8, 20);
      const svgIndex = Math.floor(Math.random() * PETAL_SVGS.length);

      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        color: ${color};
        pointer-events: none;
        user-select: none;
        left: ${gsap.utils.random(0, 100)}%;
        top: -${size}px;
        opacity: 0;
        border-radius: 50% 0 50% 0;
        background: ${color};
        filter: blur(0.5px);
        will-change: transform, opacity;
      `;
      el.innerHTML = PETAL_SVGS[svgIndex];
      container.appendChild(el);

      const duration = gsap.utils.random(6, 14);
      const delay = gsap.utils.random(0, 10);
      const xDrift = gsap.utils.random(-120, 120);
      const rotateAmount = gsap.utils.random(-360, 360);

      const tl = gsap.timeline({ repeat: -1, delay });
      tl.set(el, { opacity: 0, y: -20, x: 0, rotate: 0 })
        .to(el, {
          opacity: gsap.utils.random(0.4, 0.9),
          duration: 0.8,
          ease: 'power2.out',
        })
        .to(
          el,
          {
            y: `${window.innerHeight + 40}px`,
            x: xDrift,
            rotate: rotateAmount,
            duration,
            ease: 'none',
          },
          '<'
        )
        .to(
          el,
          { opacity: 0, duration: 1, ease: 'power2.in' },
          `-=1.5`
        );

      petalsRef.current.push({ el, tl });
    }

    return () => {
      petalsRef.current.forEach((p) => p.tl.kill());
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-10 ${className}`}
      aria-hidden="true"
    />
  );
}
