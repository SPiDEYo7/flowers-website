import { NextRequest, NextResponse } from 'next/server';
import { generateSlug } from '@/lib/utils';
import { cardStore, StoredCard } from '@/lib/cardStore';

const hasDB = Boolean(process.env.DATABASE_URL);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderName, recipientName, message, flowerStyle, colorTheme, cardTheme,
      musicTrack, customMusicUrl, mediaUrl, mediaType, bouquetData,
    } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const slug = generateSlug();
    const now  = new Date();

    if (hasDB) {
      const { prisma } = await import('@/lib/prisma');
      const card = await prisma.card.create({
        data: {
          slug,
          senderName: senderName?.toString().trim() || null,
          message:    message.trim().slice(0, 500),
          flowerStyle: flowerStyle  || 'rose',
          colorTheme:  colorTheme   || 'pink',
          cardTheme:   cardTheme    || 'romantic',
          musicTrack:  musicTrack   || 'none',
          mediaUrl:    mediaUrl     || null,
          mediaType:   mediaType    || null,
          bouquetData: bouquetData  || null,
        },
      });
      return NextResponse.json({ slug: card.slug, id: card.id }, { status: 201 });
    }

    // ── No DB — persist in process-level memory store ──
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);

    const card: StoredCard = {
      id,
      slug,
      senderName:     senderName?.toString().trim() || null,
      recipientName:  recipientName?.toString().trim() || null,
      message:        message.trim().slice(0, 500),
      flowerStyle:    flowerStyle  || 'rose',
      colorTheme:     colorTheme   || 'pink',
      cardTheme:      cardTheme    || 'romantic',
      musicTrack:     musicTrack   || 'none',
      customMusicUrl: customMusicUrl || null,
      mediaUrl:       mediaUrl     || null,
      mediaType:      mediaType    || null,
      bouquetData:    bouquetData  || null,
      viewCount:      0,
      createdAt:      now,
      updatedAt:      now,
    };

    cardStore.set(slug, card);
    return NextResponse.json({ slug, id }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/create-card]', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
