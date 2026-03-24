'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { getCardUrl, CARD_THEMES, COLOR_THEMES, BOUQUET_OPTIONS } from '@/lib/utils';

interface SavedCard {
  id: string;
  slug: string;
  senderName: string | null;
  message: string;
  colorTheme: string;
  cardTheme: string;
  musicTrack: string;
  bouquetOptionId?: string;
  createdAt: string;
  flowers?: { flowerType: string }[];
}

export default function DashboardPage() {
  const [cards, setCards]       = useState<SavedCard[]>([]);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState<string | null>(null);

  useEffect(() => {
    // Load cards from localStorage (unauth users)
    try {
      const stored = localStorage.getItem('petalnote_my_cards');
      if (stored) {
        setCards(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const copyLink = async (slug: string) => {
    const url = getCardUrl(slug);
    await navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteCard = (slug: string) => {
    const updated = cards.filter((c) => c.slug !== slug);
    setCards(updated);
    try {
      localStorage.setItem('petalnote_my_cards', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const cardVariants = {
    hidden:  { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0D0D0D] pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="font-display font-black text-4xl md:text-5xl shimmer-text mb-3">
              My Cards
            </h1>
            <p className="text-neo-white/50 font-body">
              All the bouquets you've created. Sign in to sync across devices.
            </p>
          </motion.div>

          {/* Sign-in prompt for guests */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="neo-card-dark border border-petal-pink/30 p-4 mb-8 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-sub font-semibold text-neo-white text-sm">💡 Cards only save in this browser</p>
              <p className="text-neo-white/40 text-xs font-mono mt-0.5">Sign in to save cards forever and sync across devices.</p>
            </div>
            <Link href="/auth/signin" className="neo-btn text-sm px-5 py-2.5 whitespace-nowrap flex-shrink-0">
              Sign In
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="text-5xl"
              >
                🌸
              </motion.span>
            </div>
          ) : cards.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 space-y-6"
            >
              <div className="text-7xl">💐</div>
              <h2 className="font-display font-bold text-2xl text-neo-white">No cards yet</h2>
              <p className="text-neo-white/40 font-body max-w-sm mx-auto">
                Create your first digital bouquet and share it with someone you love.
              </p>
              <Link href="/create" className="neo-btn-rose px-8 py-3 inline-block font-display">
                🌹 Create a Bouquet
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence>
                {cards.map((card, i) => {
                  const theme     = CARD_THEMES.find((t) => t.id === card.cardTheme);
                  const colorData = COLOR_THEMES.find((t) => t.id === card.colorTheme);
                  const bouquet   = BOUQUET_OPTIONS.find((b) => b.id === card.bouquetOptionId);
                  const cardUrl   = getCardUrl(card.slug);

                  return (
                    <motion.div
                      key={card.slug}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="neo-card-dark border border-neo-white/10 overflow-hidden group"
                    >
                      {/* Color theme header */}
                      <div className="h-16 relative" style={{ background: colorData?.gradient ?? theme?.preview }}>
                        <div className="absolute inset-0 bg-neo-black/20" />
                        <div className="absolute bottom-2 left-3 flex items-center gap-2">
                          {colorData?.colors.map((c) => (
                            <div key={c} className="w-3 h-3 rounded-full border border-white/40" style={{ background: c }} />
                          ))}
                        </div>
                        {bouquet && (
                          <div className="absolute bottom-2 right-3 text-xl">{bouquet.emoji}</div>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="font-mono text-xs text-neo-white/40 uppercase tracking-wider mb-1">
                            {new Date(card.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </p>
                          {card.senderName && (
                            <p className="text-petal-pink font-sub font-semibold text-sm">From: {card.senderName}</p>
                          )}
                          <p className="text-neo-white/70 text-sm font-body line-clamp-2 mt-1 italic">
                            "{card.message}"
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {theme && (
                            <span className="neo-tag text-xs py-0.5">{theme.label}</span>
                          )}
                          {bouquet && (
                            <span className="neo-tag text-xs py-0.5">{bouquet.name}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <a
                            href={cardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="neo-btn-dark text-xs px-3 py-2 flex-1 text-center"
                          >
                            Open →
                          </a>
                          <button
                            onClick={() => copyLink(card.slug)}
                            className={`neo-btn text-xs px-3 py-2 flex-1 transition-colors ${copied === card.slug ? 'bg-mint border-mint' : ''}`}
                          >
                            {copied === card.slug ? '✓ Copied!' : 'Copy Link'}
                          </button>
                          <button
                            onClick={() => deleteCard(card.slug)}
                            className="px-3 py-2 text-xs font-mono text-neo-white/30 hover:text-rose border-2 border-transparent hover:border-rose/30 transition-all"
                            title="Delete card"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {cards.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/create" className="neo-btn-rose px-8 py-3 inline-block font-display">
                + Create Another Bouquet
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
