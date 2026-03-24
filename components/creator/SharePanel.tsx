'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/lib/store';
import { getCardUrl, MUSIC_TRACKS, CARD_THEMES, COLOR_THEMES } from '@/lib/utils';
import axios from 'axios';

export function SharePanel() {
  const store = useBouquetStore();
  const { generatedSlug, setGeneratedSlug, message, flowers } = store;
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [copied, setCopied]   = useState(false);

  const cardUrl = generatedSlug ? getCardUrl(generatedSlug) : null;

  const themeLabel = CARD_THEMES.find((t) => t.id === store.cardTheme)?.label ?? store.cardTheme;
  const musicLabel = MUSIC_TRACKS.find((t) => t.id === store.musicTrack)?.label ?? store.musicTrack;
  const colorTheme = COLOR_THEMES.find((t) => t.id === store.colorTheme);

  const generate = async () => {
    if (!message.trim()) { setError('Please write a message first (Step 3).'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/create-card', {
        senderName:     store.senderName,
        recipientName:  store.recipientName,
        message:        store.message,
        flowerStyle:    store.selectedFlowerType,
        colorTheme:     store.colorTheme,
        cardTheme:      store.cardTheme,
        musicTrack:     store.musicTrack,
        mediaUrl:       store.mediaUrl,
        mediaType:      store.mediaType,
        bouquetData: {
          flowers:      store.flowers,
          bouquetOption: store.bouquetOptionId,
          layout:       'classic',
        },
      });
      setGeneratedSlug(data.slug);

      // Persist card to localStorage for dashboard display
      try {
        const existing: unknown[] = JSON.parse(localStorage.getItem('petalnote_my_cards') || '[]');
        const newCard = {
          id:             data.id,
          slug:           data.slug,
          senderName:     store.senderName || null,
          message:        store.message,
          colorTheme:     store.colorTheme,
          cardTheme:      store.cardTheme,
          musicTrack:     store.musicTrack,
          bouquetOptionId: store.bouquetOptionId,
          createdAt:      new Date().toISOString(),
        };
        localStorage.setItem('petalnote_my_cards', JSON.stringify([newCard, ...existing].slice(0, 50)));
        // Track count for gate
        const prev = parseInt(localStorage.getItem('petalnote_cards_created') || '0', 10);
        localStorage.setItem('petalnote_cards_created', String(prev + 1));
      } catch {
        // ignore localStorage errors
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || 'Failed to generate link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!cardUrl) return;
    await navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl text-neo-white mb-1">Share Your Bouquet</h3>
        <p className="text-neo-white/60 text-sm">Generate your unique card link and send it to someone special.</p>
      </div>

      {/* Card summary */}
      <div className="neo-card-dark p-5 space-y-3 border border-neo-white/10">
        <p className="text-xs font-mono text-neo-white/40 uppercase tracking-widest">Card Summary</p>

        {/* Color theme swatch */}
        {colorTheme && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {colorTheme.colors.map((c) => (
                <div key={c} className="w-4 h-4 rounded-full border border-neo-white/20" style={{ background: c }} />
              ))}
            </div>
            <span className="text-neo-white/60 text-xs font-mono">{colorTheme.label} theme</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-neo-white/40 text-xs">Flowers:</span>{' '}
            <span className="text-petal-pink text-xs">{flowers.length} selected</span>
          </div>
          <div>
            <span className="text-neo-white/40 text-xs">Card:</span>{' '}
            <span className="text-petal-pink text-xs">{themeLabel}</span>
          </div>
          <div>
            <span className="text-neo-white/40 text-xs">Music:</span>{' '}
            <span className="text-petal-pink text-xs">{musicLabel}</span>
          </div>
          <div>
            <span className="text-neo-white/40 text-xs">Media:</span>{' '}
            <span className="text-petal-pink text-xs">{store.mediaUrl ? store.mediaType || 'yes' : 'none'}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-neo-white/10">
          <p className="text-neo-white/40 text-xs mb-1">Message preview:</p>
          <p className="text-neo-white/80 text-sm italic line-clamp-2">"{message || 'No message yet'}"</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose text-sm font-mono">
          ✕ {error}
        </motion.p>
      )}

      {/* Generate / Link display */}
      <AnimatePresence mode="wait">
        {!generatedSlug ? (
          <motion.button
            key="generate"
            onClick={generate}
            disabled={loading}
            className="neo-btn-rose w-full py-4 text-lg font-display"
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                  🌸
                </motion.span>
                Creating magic…
              </span>
            ) : '✨ Generate My Card Link'}
          </motion.button>
        ) : (
          <motion.div
            key="link"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="space-y-4"
          >
            {/* Success banner */}
            <div className="neo-card border-petal-pink bg-petal-pink/10 p-4 flex items-center gap-3">
              <span className="text-3xl animate-bounce-sm">🎉</span>
              <div>
                <p className="font-display font-bold text-neo-black">Your bouquet is ready!</p>
                <p className="text-neo-black/60 text-sm">Share the link below with someone special.</p>
              </div>
            </div>

            {/* Link */}
            <div className="flex gap-2">
              <div className="flex-1 neo-input text-xs font-mono truncate py-3 bg-neo-black border-neo-white/30 text-neo-white/70">
                {cardUrl}
              </div>
              <button
                onClick={copyLink}
                className={`neo-btn text-sm px-4 ${copied ? 'bg-mint border-mint' : ''}`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            {/* Open link */}
            <a
              href={cardUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn-dark w-full text-center py-3 text-sm font-mono block"
            >
              Open Your Card →
            </a>

            {/* Preview cinematic experience */}
            <motion.button
              onClick={() => window.open(`/experience?id=${generatedSlug}`, '_blank')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl text-sm font-display font-semibold
                         flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #FF85A1 0%, #C77DFF 50%, #FF85A1 100%)',
                backgroundSize: '200% 100%',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(255, 133, 161, 0.4)',
              }}
            >
              <span className="text-base">🎬</span>
              Preview Cinematic Experience
            </motion.button>

            {/* Social share */}
            <div className="border border-neo-white/10 p-4 space-y-2">
              <p className="text-xs font-mono text-neo-white/40 uppercase tracking-widest">Share via</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'WhatsApp', prefix: 'https://wa.me/?text=' },
                  { label: 'Telegram', prefix: 'https://t.me/share/url?url=' },
                  { label: 'Twitter',  prefix: 'https://twitter.com/intent/tweet?text=I+made+you+a+bouquet!+%F0%9F%8C%B8&url=' },
                ].map((app) => (
                  <a
                    key={app.label}
                    href={`${app.prefix}${encodeURIComponent(cardUrl!)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neo-tag hover:-translate-y-0.5 hover:shadow-neo-pink transition-all duration-150"
                  >
                    {app.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Create another */}
            <button
              onClick={() => { store.reset(); window.scrollTo(0, 0); }}
              className="w-full py-2.5 text-xs font-mono text-neo-white/30 hover:text-neo-white/60 transition-colors"
            >
              + Create another bouquet
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
