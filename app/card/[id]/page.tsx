import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CardExperience } from '@/components/card/CardExperience';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const card = await prisma.card.findUnique({ where: { slug: params.id } });
  if (!card) return { title: 'Card not found — Bloom' };
  return {
    title: `${card.senderName ? card.senderName + "'s" : 'A'} Bouquet for You 🌸 — Bloom`,
    description: card.message.slice(0, 160),
    openGraph: {
      title: `You received a digital bouquet! 🌹`,
      description: card.message.slice(0, 160),
      images: card.mediaUrl ? [card.mediaUrl] : ['/og-image.jpg'],
    },
  };
}

export default async function CardPage({ params }: Props) {
  const card = await prisma.card.findUnique({ where: { slug: params.id } });
  if (!card) notFound();

  // Increment view count
  await prisma.card.update({
    where: { slug: params.id },
    data: { viewCount: { increment: 1 } },
  });

  const cardData = {
    id: card.id,
    slug: card.slug,
    senderName: card.senderName,
    message: card.message,
    flowerStyle: card.flowerStyle,
    colorTheme: card.colorTheme,
    cardTheme: card.cardTheme,
    mediaUrl: card.mediaUrl,
    mediaType: card.mediaType,
    musicTrack: card.musicTrack,
    bouquetData: card.bouquetData as any,
    createdAt: card.createdAt.toISOString(),
  };

  return <CardExperience card={cardData} />;
}
