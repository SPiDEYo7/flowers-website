'use client';

/**
 * Canvas-based falling petal particle system.
 * Uses requestAnimationFrame — far cheaper than DOM-based petals.
 */

import { useEffect, useRef } from 'react';

export interface PetalCanvasProps {
  /** Hex colors for petals */
  palette?:    string[];
  count?:      number;
  className?:  string;
  opacity?:    number;
}

const DEFAULT_PALETTE = [
  '#FFFFFF', '#FFE0D8', '#FFC8B4', '#FFD6F5',
  '#FFF0C8', '#E8D5FF', '#FFCDD8', '#FFE8CC',
];

interface PetalParticle {
  x:        number;
  y:        number;
  vx:       number;
  vy:       number;
  angle:    number;
  va:       number;
  w:        number;
  h:        number;
  color:    string;
  opacity:  number;
  wobble:   number;
  wobbleV:  number;
  wobbleI:  number;
}

function makePetal(
  w: number,
  h: number,
  palette: string[],
  startY?: number,
): PetalParticle {
  const sz = 6 + Math.random() * 10;
  return {
    x:       Math.random() * w,
    y:       startY ?? Math.random() * h * -0.5,
    vx:      (Math.random() - 0.5) * 1.4,
    vy:      0.5 + Math.random() * 1.6,
    angle:   Math.random() * Math.PI * 2,
    va:      (Math.random() - 0.5) * 0.05,
    w:       sz,
    h:       sz * 0.52,
    color:   palette[Math.floor(Math.random() * palette.length)],
    opacity: 0.35 + Math.random() * 0.45,
    wobble:  Math.random() * Math.PI * 2,
    wobbleV: 0.02 + Math.random() * 0.03,
    wobbleI: 0,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: PetalParticle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle   = p.color;

  // Teardrop / petal shape
  ctx.beginPath();
  ctx.moveTo(0, -p.h / 2);
  ctx.bezierCurveTo(p.w / 2, -p.h / 2, p.w / 2, p.h / 2, 0, p.h / 2);
  ctx.bezierCurveTo(-p.w / 2, p.h / 2, -p.w / 2, -p.h / 2, 0, -p.h / 2);
  ctx.fill();

  // Soft vein line
  ctx.globalAlpha = p.opacity * 0.4;
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth   = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -p.h / 2);
  ctx.lineTo(0, p.h / 2);
  ctx.stroke();

  ctx.restore();
}

export function PetalCanvas({
  palette  = DEFAULT_PALETTE,
  count    = 35,
  className = '',
  opacity  = 1,
}: PetalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petals    = useRef<PetalParticle[]>([]);
  const rafId     = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;

      // Seed petals spread across the screen
      if (petals.current.length === 0) {
        petals.current = Array.from({ length: count }, () =>
          makePetal(w, h, palette, Math.random() * h),
        );
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of petals.current) {
        p.wobbleI += p.wobbleV;
        p.x += p.vx + Math.sin(p.wobbleI) * 0.8;
        p.y += p.vy;
        p.angle += p.va;

        if (p.y > h + 20) {
          // Recycle from top
          const np = makePetal(w, h, palette);
          Object.assign(p, np);
        }

        drawPetal(ctx, p);
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 ${className}`}
      style={{ opacity, zIndex: 1 }}
    />
  );
}
