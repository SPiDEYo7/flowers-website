import { NextRequest, NextResponse } from 'next/server';
import { cardStore } from '@/lib/cardStore';

const hasDB = Boolean(process.env.DATABASE_URL);

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    if (hasDB) {
      const { prisma } = await import('@/lib/prisma');
      const card = await prisma.card.findUnique({ where: { slug: params.id } });
      if (!card) return NextResponse.json({ error: 'Card not found.' }, { status: 404 });
      return NextResponse.json({
        id:          card.id,
        slug:        card.slug,
        senderName:  card.senderName,
        message:     card.message,
        flowerStyle: card.flowerStyle,
        colorTheme:  card.colorTheme,
        cardTheme:   card.cardTheme,
        mediaUrl:    card.mediaUrl,
        mediaType:   card.mediaType,
        musicTrack:  card.musicTrack,
        bouquetData: card.bouquetData,
        viewCount:   card.viewCount,
        createdAt:   card.createdAt,
      });
    }

    // ── No DB — read from in-memory store ──
    const card = cardStore.get(params.id);
    if (!card) return NextResponse.json({ error: 'Card not found.' }, { status: 404 });
    return NextResponse.json(card);
  } catch (error) {
    console.error('[GET /api/card/:id]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
