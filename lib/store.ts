import { create } from 'zustand';
import type { FlowerType, BouquetOptionId, ColorTheme, CardTheme, MusicTrack } from './utils';

export interface BouquetItem {
  id: string;
  flowerType: FlowerType;
  color: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface BouquetStore {
  // Step
  currentStep: number;
  setStep: (step: number) => void;

  // Bouquet
  flowers: BouquetItem[];
  addFlower: (flower: Omit<BouquetItem, 'id'>) => void;
  removeFlower: (id: string) => void;
  clearFlowers: () => void;
  updateFlower: (id: string, update: Partial<BouquetItem>) => void;
  selectedFlowerType: FlowerType;
  setSelectedFlowerType: (type: FlowerType) => void;

  // Named bouquet collection
  bouquetOptionId: BouquetOptionId | null;
  setBouquetOptionId: (id: BouquetOptionId | null) => void;

  // Card customisation
  senderName: string;
  setSenderName: (name: string) => void;
  recipientName: string;
  setRecipientName: (name: string) => void;
  message: string;
  setMessage: (msg: string) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  cardTheme: CardTheme;
  setCardTheme: (theme: CardTheme) => void;
  musicTrack: MusicTrack;
  setMusicTrack: (track: MusicTrack) => void;

  // Custom music (client-side blob URL)
  customMusicUrl: string | null;
  setCustomMusicUrl: (url: string | null) => void;

  // Audio trim region (in seconds)
  trimStart: number | null;
  setTrimStart: (t: number | null) => void;
  trimEnd: number | null;
  setTrimEnd: (t: number | null) => void;

  // Media
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  setMedia: (url: string, type: 'image' | 'video') => void;
  clearMedia: () => void;

  // Generated
  generatedSlug: string | null;
  setGeneratedSlug: (slug: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  flowers: [] as BouquetItem[],
  selectedFlowerType: 'rose' as FlowerType,
  bouquetOptionId: null as BouquetOptionId | null,
  senderName: '',
  recipientName: '',
  message: '',
  colorTheme: 'pink' as ColorTheme,
  cardTheme: 'romantic' as CardTheme,
  musicTrack: 'none' as MusicTrack,
  customMusicUrl: null as string | null,
  trimStart: null as number | null,
  trimEnd:   null as number | null,
  mediaUrl: null as string | null,
  mediaType: null as 'image' | 'video' | null,
  generatedSlug: null as string | null,
};

export const useBouquetStore = create<BouquetStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  addFlower: (flower) =>
    set((s) => ({
      flowers: [...s.flowers, { ...flower, id: Math.random().toString(36).slice(2) }],
    })),

  removeFlower: (id) =>
    set((s) => ({ flowers: s.flowers.filter((f) => f.id !== id) })),

  clearFlowers: () =>
    set({ flowers: [] }),

  updateFlower: (id, update) =>
    set((s) => ({
      flowers: s.flowers.map((f) => (f.id === id ? { ...f, ...update } : f)),
    })),

  setSelectedFlowerType: (type) => set({ selectedFlowerType: type }),
  setBouquetOptionId:    (id)   => set({ bouquetOptionId: id }),
  setSenderName:         (senderName) => set({ senderName }),
  setRecipientName:      (recipientName) => set({ recipientName }),
  setMessage:            (message)    => set({ message }),
  setColorTheme:         (colorTheme) => set({ colorTheme }),
  setCardTheme:          (cardTheme)  => set({ cardTheme }),
  setMusicTrack:         (musicTrack) => set({ musicTrack }),
  setCustomMusicUrl:     (url)        => set({ customMusicUrl: url }),
  setTrimStart:          (trimStart)  => set({ trimStart }),
  setTrimEnd:            (trimEnd)    => set({ trimEnd }),
  setMedia:              (mediaUrl, mediaType) => set({ mediaUrl, mediaType }),
  clearMedia:            () => set({ mediaUrl: null, mediaType: null }),
  setGeneratedSlug:      (generatedSlug) => set({ generatedSlug }),
  reset:                 () => set(initialState),
}));
