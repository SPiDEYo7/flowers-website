/**
 * In-memory card store — fallback when DATABASE_URL is not configured.
 * Cards are attached to `globalThis` so they survive Next.js hot-reload.
 * They are lost on server restart — configure DATABASE_URL for persistence.
 */

export interface StoredCard {
  id: string;
  slug: string;
  senderName: string | null;
  recipientName: string | null;
  message: string;
  flowerStyle: string;
  colorTheme: string;
  cardTheme: string;
  musicTrack: string;
  customMusicUrl?: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  bouquetData: unknown;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Attach to globalThis so the store survives hot-reload in dev
const g = globalThis as Record<string, unknown>;
if (!g.__petalNoteCards) {
  g.__petalNoteCards = new Map<string, StoredCard>();
}

export const cardStore: Map<string, StoredCard> =
  g.__petalNoteCards as Map<string, StoredCard>;
