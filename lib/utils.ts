import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

export function generateSlug(): string { return nanoid(); }

export function getCardUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/card/${slug}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Flower types (12) ────────────────────────────────────────────────────────
export const FLOWER_TYPES = [
  { id: 'rose',      label: 'Rose',           meaning: 'Love & passion',      month: 'June',      color: '#FF4D6D', bg: '#FFE8ED' },
  { id: 'tulip',     label: 'Tulip',          meaning: 'Perfect love',        month: 'March',     color: '#FF85A1', bg: '#FFE8F0' },
  { id: 'peony',     label: 'Peony',          meaning: 'Romance & beauty',    month: 'May',       color: '#FFB3C6', bg: '#FFF0F5' },
  { id: 'sunflower', label: 'Sunflower',      meaning: 'Adoration',           month: 'July',      color: '#FFD700', bg: '#FFFCE0' },
  { id: 'dahlia',    label: 'Dahlia',         meaning: 'Elegance',            month: 'August',    color: '#9B59B6', bg: '#F5E8FF' },
  { id: 'carnation', label: 'Carnation',      meaning: 'Devotion',            month: 'January',   color: '#FF6B9D', bg: '#FFE0EE' },
  { id: 'gerbera',   label: 'Gerbera',        meaning: 'Cheerfulness',        month: 'April',     color: '#FF7043', bg: '#FFE8E0' },
  { id: 'anemone',   label: 'Anemone',        meaning: 'Anticipation',        month: 'February',  color: '#7B61FF', bg: '#EEE0FF' },
  { id: 'cherry',    label: 'Cherry Blossom', meaning: 'Renewal',             month: 'March',     color: '#FFB3C6', bg: '#FFF0F8' },
  { id: 'daisy',     label: 'Daisy',          meaning: 'Innocence & joy',     month: 'April',     color: '#FFD700', bg: '#FFFCE0' },
  { id: 'lily',      label: 'Lily',           meaning: 'Purity & rebirth',    month: 'May',       color: '#C8B6E2', bg: '#EEE8FF' },
  { id: 'lavender',  label: 'Lavender',       meaning: 'Devotion & calm',     month: 'July',      color: '#9B59B6', bg: '#EEE0FF' },
] as const;

// ─── Named bouquet collections ─────────────────────────────────────────────────
export const BOUQUET_OPTIONS = [
  {
    id:          'fantasia',
    name:        'Fantasia',
    description: 'Vibrant mixed blooms bursting with colour',
    gradient:    'linear-gradient(135deg, #FF4D6D 0%, #C8B6E2 100%)',
    accent:      '#FF4D6D',
    flowers:     ['rose', 'dahlia', 'lavender', 'lily'],
    emoji:       '💐',
  },
  {
    id:          'spring-sonnet',
    name:        'Spring Sonnet',
    description: 'Soft pastels inspired by garden mornings',
    gradient:    'linear-gradient(135deg, #FFB3C6 0%, #FFF8F0 100%)',
    accent:      '#FFB3C6',
    flowers:     ['lily', 'daisy', 'tulip', 'cherry'],
    emoji:       '🌸',
  },
  {
    id:          'welcome-oasis',
    name:        'Welcome Oasis',
    description: 'Lush tropical greens with warm bursts',
    gradient:    'linear-gradient(135deg, #B5EAD7 0%, #81D8C1 100%)',
    accent:      '#4CAF8A',
    flowers:     ['daisy', 'lily', 'sunflower', 'gerbera'],
    emoji:       '🌿',
  },
  {
    id:          'lavender-sunshine',
    name:        'Lavender Sunshine',
    description: 'Purple petals meeting golden warmth',
    gradient:    'linear-gradient(135deg, #C8B6E2 0%, #FFD700 100%)',
    accent:      '#C8B6E2',
    flowers:     ['lavender', 'sunflower', 'dahlia'],
    emoji:       '💜',
  },
  {
    id:          'rose-harmony',
    name:        'Rose Harmony',
    description: 'Classic roses in a timeless arrangement',
    gradient:    'linear-gradient(135deg, #FF4D6D 0%, #FF85A1 100%)',
    accent:      '#FF4D6D',
    flowers:     ['rose', 'rose', 'rose', 'tulip'],
    emoji:       '🌹',
  },
  {
    id:          'royal-radiance',
    name:        'Royal Radiance',
    description: 'Deep purple petals with golden accents',
    gradient:    'linear-gradient(135deg, #9B59B6 0%, #FFD700 100%)',
    accent:      '#9B59B6',
    flowers:     ['orchid', 'lavender', 'sunflower'],
    emoji:       '👑',
  },
  {
    id:          'pink-petals',
    name:        'Pink Petals',
    description: 'An all-pink dreamy arrangement',
    gradient:    'linear-gradient(135deg, #FFB3C6 0%, #FF85A1 100%)',
    accent:      '#FF85A1',
    flowers:     ['lily', 'tulip', 'cherry', 'carnation'],
    emoji:       '🩷',
  },
  {
    id:          'hot-couture',
    name:        'Hot Couture',
    description: 'Dramatic roses on a dark, passionate backdrop',
    gradient:    'linear-gradient(135deg, #FF4D6D 0%, #1a0533 100%)',
    accent:      '#FF4D6D',
    flowers:     ['rose', 'dahlia', 'cherry'],
    emoji:       '🖤',
  },
  {
    id:          'pink-peonies',
    name:        'Pink Peonies',
    description: 'Soft, full blooms in blush and lavender',
    gradient:    'linear-gradient(135deg, #FFB3C6 0%, #C8B6E2 100%)',
    accent:      '#DDA0DD',
    flowers:     ['lily', 'peony', 'tulip', 'lavender'],
    emoji:       '🌺',
  },
  {
    id:          'all-my-love',
    name:        'All My Love',
    description: 'Red roses — the ultimate declaration',
    gradient:    'linear-gradient(135deg, #FF0000 0%, #FF4D6D 100%)',
    accent:      '#FF0000',
    flowers:     ['rose', 'rose', 'cherry', 'rose'],
    emoji:       '❤️',
  },
] as const;

// ─── Color themes ──────────────────────────────────────────────────────────────
export const COLOR_THEMES = [
  {
    id: 'pink',        label: 'Blush Garden',
    colors: ['#FFCDD8', '#FF8FAB', '#E91E63'] as const,
    gradient: 'linear-gradient(135deg, #FFCDD8 0%, #FF8FAB 50%, #E91E63 100%)',
  },
  {
    id: 'purple',      label: 'Lavender Dream',
    colors: ['#E8D5F5', '#C9A8E8', '#7C4DFF'] as const,
    gradient: 'linear-gradient(135deg, #E8D5F5 0%, #C9A8E8 50%, #7C4DFF 100%)',
  },
  {
    id: 'peach',       label: 'Peach Sunset',
    colors: ['#FFE0CC', '#FFB085', '#FF6D00'] as const,
    gradient: 'linear-gradient(135deg, #FFE0CC 0%, #FFB085 50%, #FF6D00 100%)',
  },
  {
    id: 'mint',        label: 'Mint Breeze',
    colors: ['#C8F5E3', '#7DDEAA', '#00897B'] as const,
    gradient: 'linear-gradient(135deg, #C8F5E3 0%, #7DDEAA 50%, #00897B 100%)',
  },
  {
    id: 'golden',      label: 'Golden Bloom',
    colors: ['#FFF8E1', '#FFD54F', '#F57F17'] as const,
    gradient: 'linear-gradient(135deg, #FFF8E1 0%, #FFD54F 50%, #F57F17 100%)',
  },
  {
    id: 'midnight',    label: 'Midnight Romance',
    colors: ['#9FA8DA', '#5C6BC0', '#1A237E'] as const,
    gradient: 'linear-gradient(135deg, #9FA8DA 0%, #5C6BC0 50%, #1A237E 100%)',
  },
  {
    id: 'candy',       label: 'Candy Pastel',
    colors: ['#FFD6F5', '#BBEEFF', '#FFFAAD'] as const,
    gradient: 'linear-gradient(135deg, #FFD6F5 0%, #BBEEFF 50%, #FFFAAD 100%)',
  },
  {
    id: 'soft_vintage', label: 'Soft Vintage',
    colors: ['#F5E6D3', '#D4A57B', '#8D6E63'] as const,
    gradient: 'linear-gradient(135deg, #F5E6D3 0%, #D4A57B 50%, #8D6E63 100%)',
  },
] as const;

// ─── Card themes (6) ───────────────────────────────────────────────────────────
export const CARD_THEMES = [
  {
    id: 'romantic', label: 'Romantic Rose',
    preview: 'linear-gradient(135deg,#FFB3C6,#C8B6E2)',
    bg:      'linear-gradient(135deg,#FFB3C6 0%,#C8B6E2 100%)',
    text:    '#1a0533', accent: '#FF85A1',
    description: 'Warm pinks and soft lavender',
  },
  {
    id: 'minimal', label: 'Minimal Elegant',
    preview: 'linear-gradient(135deg,#FFF8F0,#F0E8DE)',
    bg:      '#FFF8F0',
    text:    '#1a1a1a', accent: '#FF4D6D',
    description: 'Clean, timeless, understated',
  },
  {
    id: 'dark', label: 'Dark Rose',
    preview: 'linear-gradient(180deg,#1a0533,#FF85A1)',
    bg:      'linear-gradient(180deg,#1a0533 0%,#2d0f4e 60%,#7b2d8b 100%)',
    text:    '#FFF8F0', accent: '#FF85A1',
    description: 'Dramatic and deeply passionate',
  },
  {
    id: 'dreamy', label: 'Dreamy Pastel',
    preview: 'linear-gradient(135deg,#FFF0FA,#E8D5F5)',
    bg:      'linear-gradient(135deg,#FFF0FA 0%,#E8D5F5 100%)',
    text:    '#5A3B6E', accent: '#C8B6E2',
    description: 'Soft lilac haze and fairy light',
  },
  {
    id: 'golden', label: 'Golden Bloom',
    preview: 'linear-gradient(135deg,#FFF9E6,#FFE082)',
    bg:      'linear-gradient(135deg,#FFF9E6 0%,#FFE082 100%)',
    text:    '#7A4500', accent: '#FFAB00',
    description: 'Warm amber glow and sunshine',
  },
  {
    id: 'vintage', label: 'Soft Vintage',
    preview: 'linear-gradient(135deg,#F5E6D3,#D4A57B)',
    bg:      'linear-gradient(135deg,#F5E6D3 0%,#E8C99A 100%)',
    text:    '#3D2B1F', accent: '#A07850',
    description: 'Sepia tones and aged elegance',
  },
] as const;

// ─── Music tracks ──────────────────────────────────────────────────────────────
export const MUSIC_TRACKS = [
  { id: 'none',     label: 'No Music',        url: null },
  { id: 'waltz',    label: 'Romantic Waltz',  url: '/music/waltz.mp3' },
  { id: 'piano',    label: 'Soft Piano',      url: '/music/piano.mp3' },
  { id: 'acoustic', label: 'Acoustic Guitar', url: '/music/acoustic.mp3' },
  { id: 'custom',   label: 'Upload Your Own', url: null },
] as const;

// ─── Derived types ─────────────────────────────────────────────────────────────
export type FlowerType     = typeof FLOWER_TYPES[number]['id'];
export type BouquetOptionId = typeof BOUQUET_OPTIONS[number]['id'];
export type ColorTheme     = typeof COLOR_THEMES[number]['id'];
export type CardTheme      = typeof CARD_THEMES[number]['id'];
export type MusicTrack     = typeof MUSIC_TRACKS[number]['id'];
