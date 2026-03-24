'use client';

/**
 * FlowerSVG — PNG-based watercolor flower renderer
 *
 * Renders watercolor flower PNG images using Next.js Image component.
 * Maintains backward compatibility with existing imports.
 */

import Image from 'next/image';
import React, { memo } from 'react';
import { FLOWER_ASSETS } from '@/lib/flowerAssets';

export type FlowerId =
  | 'rose' | 'tulip' | 'peony' | 'sunflower' | 'daisy'
  | 'dahlia' | 'carnation' | 'gerbera' | 'anemone' | 'cherry'
  | 'lavender' | 'lily';

/**
 * FlowerIllustration — renders a watercolor flower PNG using Next.js Image
 */
export const FlowerIllustration = memo(function FlowerIllustration({
  id,
  size = 80,
  className = '',
}: {
  id: FlowerId;
  size?: number;
  className?: string;
}) {
  const flower = FLOWER_ASSETS[id];
  if (!flower) return null;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Image
        src={flower.imageUrl}
        alt={flower.name}
        width={size}
        height={size}
        className="w-full h-full object-contain"
        draggable={false}
        unoptimized
        style={{
          mixBlendMode: 'multiply',
          filter: 'brightness(1.1) contrast(1.05)',
        }}
      />
    </div>
  );
});

// Legacy export for backward compatibility
export const FLOWER_SVG_MAP: Record<FlowerId, React.FC<{ size?: number }>> = {
  rose: ({ size }) => <FlowerIllustration id="rose" size={size} />,
  tulip: ({ size }) => <FlowerIllustration id="tulip" size={size} />,
  peony: ({ size }) => <FlowerIllustration id="peony" size={size} />,
  sunflower: ({ size }) => <FlowerIllustration id="sunflower" size={size} />,
  daisy: ({ size }) => <FlowerIllustration id="daisy" size={size} />,
  dahlia: ({ size }) => <FlowerIllustration id="dahlia" size={size} />,
  carnation: ({ size }) => <FlowerIllustration id="carnation" size={size} />,
  gerbera: ({ size }) => <FlowerIllustration id="gerbera" size={size} />,
  anemone: ({ size }) => <FlowerIllustration id="anemone" size={size} />,
  cherry: ({ size }) => <FlowerIllustration id="cherry" size={size} />,
  lavender: ({ size }) => <FlowerIllustration id="lavender" size={size} />,
  lily: ({ size }) => <FlowerIllustration id="lily" size={size} />,
};

