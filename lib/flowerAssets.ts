/**
 * FlowerAssets — Watercolor PNG-based flower system
 *
 * Each flower uses actual watercolor PNG illustrations from /public/flowers/
 * These are high-quality illustrated images for premium look.
 */

export type FlowerId =
  | 'rose' | 'tulip' | 'peony' | 'sunflower' | 'daisy'
  | 'dahlia' | 'carnation' | 'gerbera' | 'anemone' | 'cherry'
  | 'lavender' | 'lily';

export interface FlowerAsset {
  id: FlowerId;
  name: string;
  imageUrl: string; // Path to PNG in /public/flowers/
  color: string;
  bgGradient: string;
  glowColor: string;
}

/**
 * Illustrated watercolor flower assets
 * Each flower points to an actual PNG file in /public/flowers/
 */
export const FLOWER_ASSETS: Record<FlowerId, FlowerAsset> = {
  rose: {
    id: 'rose',
    name: 'Rose',
    imageUrl: '/flowers/rose.png.jpg',
    color: '#f472b6',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fce7f3, #fbcfe8)',
    glowColor: 'rgba(244, 114, 182, 0.4)',
  },
  tulip: {
    id: 'tulip',
    name: 'Tulip',
    imageUrl: '/flowers/tulip.png.jpg',
    color: '#ec4899',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fdf2f8, #fce7f3)',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  peony: {
    id: 'peony',
    name: 'Peony',
    imageUrl: '/flowers/peony.png.jpg',
    color: '#f9a8d4',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fdf2f8, #fce7f3)',
    glowColor: 'rgba(249, 168, 212, 0.4)',
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    imageUrl: '/flowers/sunflower.png.jpg',
    color: '#fbbf24',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fefce8, #fef3c7)',
    glowColor: 'rgba(251, 191, 36, 0.4)',
  },
  daisy: {
    id: 'daisy',
    name: 'Daisy',
    imageUrl: '/flowers/daisy.png.jpg',
    color: '#facc15',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fefce8, #fef3c7)',
    glowColor: 'rgba(250, 204, 21, 0.4)',
  },
  dahlia: {
    id: 'dahlia',
    name: 'Dahlia',
    imageUrl: '/flowers/dahlia.png.jpg',
    color: '#c026d3',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fae8ff, #f5d0fe)',
    glowColor: 'rgba(192, 38, 211, 0.4)',
  },
  carnation: {
    id: 'carnation',
    name: 'Carnation',
    imageUrl: '/flowers/carnation.png.png',
    color: '#fb7185',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fff1f2, #ffe4e6)',
    glowColor: 'rgba(251, 113, 133, 0.4)',
  },
  gerbera: {
    id: 'gerbera',
    name: 'Gerbera',
    imageUrl: '/flowers/gerbera.png.jpg',
    color: '#f97316',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fff7ed, #ffedd5)',
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  anemone: {
    id: 'anemone',
    name: 'Anemone',
    imageUrl: '/flowers/anemone.png.jpg',
    color: '#7c3aed',
    bgGradient: 'radial-gradient(circle at 30% 30%, #f5f3ff, #ede9fe)',
    glowColor: 'rgba(124, 58, 237, 0.4)',
  },
  cherry: {
    id: 'cherry',
    name: 'Cherry Blossom',
    imageUrl: '/flowers/cherry-blossom.png.jpg',
    color: '#fbcfe8',
    bgGradient: 'radial-gradient(circle at 30% 30%, #fdf2f8, #fce7f3)',
    glowColor: 'rgba(251, 207, 232, 0.4)',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    imageUrl: '/flowers/lavender.png.jpg',
    color: '#a78bfa',
    bgGradient: 'radial-gradient(circle at 30% 30%, #f5f3ff, #ede9fe)',
    glowColor: 'rgba(167, 139, 250, 0.4)',
  },
  lily: {
    id: 'lily',
    name: 'Lily',
    imageUrl: '/flowers/lily.png.jpg',
    color: '#e9d5ff',
    bgGradient: 'radial-gradient(circle at 30% 30%, #faf5ff, #f3e8ff)',
    glowColor: 'rgba(233, 213, 255, 0.4)',
  },
};

export interface PremadeBouquet {
  id: string;
  name: string;
  imageUrl: string; // Path to PNG in /public/bouquets/
  flowers: FlowerId[];
  description: string;
  dotColors?: string[];
  bgGradient?: string;
}

/**
 * Pre-made bouquet compositions
 * Each bouquet points to an actual PNG file in /public/bouquets/
 */
export const PREMADE_BOUQUETS: PremadeBouquet[] = [
  {
    id: 'romantic-pink',
    name: 'Romantic Blush',
    imageUrl: '/bouquets/romantic-blush.png.jpg',
    flowers: ['rose', 'rose', 'peony', 'carnation', 'cherry', 'rose'],
    description: 'Soft pink roses & peonies wrapped in kraft',
  },
  {
    id: 'sunny-garden',
    name: 'Sunny Garden',
    imageUrl: '/bouquets/sunny-garden.png.jpg',
    flowers: ['sunflower', 'sunflower', 'gerbera', 'daisy', 'sunflower', 'daisy'],
    description: 'Bright sunflowers & daisies in paper wrap',
  },
  {
    id: 'purple-elegance',
    name: 'Lavender Dreams',
    imageUrl: '/bouquets/purple-elegance.png.jpg',
    flowers: ['lily', 'lavender', 'anemone', 'dahlia', 'lily', 'lavender'],
    description: 'Elegant purple lilies & lavender sprigs',
  },
  {
    id: 'garden-mix',
    name: 'Garden Mix',
    imageUrl: '/bouquets/garden-mix.png.jpg',
    flowers: ['rose', 'tulip', 'dahlia', 'gerbera', 'daisy', 'lavender', 'carnation'],
    description: 'A vibrant mix of garden favorites',
  },
  {
    id: 'pastel-dreams',
    name: 'Pastel Dreams',
    imageUrl: '/bouquets/pastel-dreams.png.jpg',
    flowers: ['peony', 'peony', 'tulip', 'cherry', 'rose', 'peony'],
    description: 'Soft pastel peonies & tulips wrapped gently',
  },
  {
    id: 'bold-blooms',
    name: 'Bold Blooms',
    imageUrl: '/bouquets/bold-blooms.png.jpg',
    flowers: ['dahlia', 'dahlia', 'gerbera', 'carnation', 'anemone', 'dahlia'],
    description: 'Vibrant dahlias & gerberas with ribbon',
  },
];

/**
 * Get all available flowers as an array
 */
export function getAllFlowers(): FlowerAsset[] {
  return Object.values(FLOWER_ASSETS);
}

/**
 * Get flower asset by ID
 */
export function getFlowerAsset(id: FlowerId): FlowerAsset | undefined {
  return FLOWER_ASSETS[id];
}

/**
 * Get bouquet by ID
 */
export function getBouquet(id: string): PremadeBouquet | undefined {
  return PREMADE_BOUQUETS.find(b => b.id === id);
}
