import { cardStore } from '@/lib/cardStore';
import { CinematicExperience } from '@/components/experience/CinematicExperience';
import type { CinematicCardData } from '@/components/experience/CinematicExperience';
import type { Metadata } from 'next';

// Force dynamic so searchParams is always fresh
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { id?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const slug = searchParams.id;
  if (!slug) return { title: 'Experience — PetalNote' };

  const card = await getCard(slug);
  if (!card) return { title: 'Experience — PetalNote' };

  return {
    title: `${card.senderName ? card.senderName + "'s" : 'A'} Bouquet for You 🌸`,
    description: card.message.slice(0, 160),
  };
}

async function getCard(slug: string): Promise<CinematicCardData | null> {
  // 1. Try in-memory store first (no-DB mode)
  const stored = cardStore.get(slug);
  if (stored) {
    return {
      id:             stored.id,
      slug:           stored.slug,
      senderName:     stored.senderName,
      recipientName:  stored.recipientName,
      message:        stored.message,
      colorTheme:     stored.colorTheme,
      cardTheme:      stored.cardTheme,
      mediaUrl:       stored.mediaUrl,
      mediaType:      stored.mediaType,
      musicTrack:     stored.musicTrack,
      customMusicUrl: stored.customMusicUrl,
      bouquetData:    stored.bouquetData,
    };
  }

  // 2. Fall back to Prisma (DB mode)
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import('@/lib/prisma');
      const card = await prisma.card.findUnique({ where: { slug } });
      if (card) {
        return {
          id:             card.id,
          slug:           card.slug,
          senderName:     card.senderName,
          recipientName:  null,
          message:        card.message,
          colorTheme:     card.colorTheme,
          cardTheme:      card.cardTheme,
          mediaUrl:       card.mediaUrl,
          mediaType:      card.mediaType,
          musicTrack:     card.musicTrack,
          bouquetData:    card.bouquetData,
        };
      }
    } catch {
      // Prisma not available — silently fall through
    }
  }

  return null;
}

export default async function ExperiencePage({ searchParams }: Props) {
  const slug = searchParams.id;

  if (!slug) {
    return <ErrorScreen message="No card ID provided." hint="Generate your card first and click Preview Experience." />;
  }

  const card = await getCard(slug);

  if (!card) {
    return <ErrorScreen message="Card not found." hint="This card may have expired or the link is invalid." />;
  }

  return (
    <main className="fixed inset-0 overflow-hidden">
      <CinematicExperience card={card} />
    </main>
  );
}

// ── Minimal error screen ────────────────────────────────────────────────────────
function ErrorScreen({ message, hint }: { message: string; hint: string }) {
  return (
    <main
      className="fixed inset-0 flex flex-col items-center justify-center text-center px-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #2E0E30 0%, #0E0814 60%, #060408 100%)',
      }}
    >
      <div className="space-y-4 max-w-sm">
        <p className="text-5xl">🌸</p>
        <h1 className="font-display font-bold text-2xl text-white">{message}</h1>
        <p className="text-white/50 text-sm font-mono">{hint}</p>
        <a
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-full border border-white/20 text-white/70
                     hover:text-white hover:border-white/50 transition-all duration-200 text-sm font-mono"
        >
          ← Back to PetalNote
        </a>
      </div>
    </main>
  );
}
