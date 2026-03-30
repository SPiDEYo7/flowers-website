'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useBouquetStore } from '@/lib/store';
import {
  COLOR_THEMES, CARD_THEMES, MUSIC_TRACKS,
} from '@/lib/utils';
import type { CardTheme, MusicTrack } from '@/lib/utils';
import { MediaUploader } from '@/components/creator/MediaUploader';
import { SharePanel } from '@/components/creator/SharePanel';
import { FlowerPicker } from '@/components/bouquet/FlowerPicker';
import { PremadeBouquets } from '@/components/bouquet/PremadeBouquets';
import { LiveBouquetPreview } from '@/components/bouquet/LiveBouquetPreview';

// AudioTrimmer is browser-only (WaveSurfer requires window)
const AudioTrimmer = dynamic(
  () => import('@/components/creator/AudioTrimmer').then((m) => ({ default: m.AudioTrimmer })),
  { ssr: false },
);

// ─── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Bouquet', icon: '💐' },
  { label: 'Colors',  icon: '🎨' },
  { label: 'Message', icon: '✍️' },
  { label: 'Media',   icon: '📸' },
  { label: 'Theme',   icon: '🎭' },
  { label: 'Share',   icon: '🔗' },
];

const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// Color theme → CSS gradient mapping (for the left panel bg)
const COLOR_GRADIENTS: Record<string, string> = {
  pink:        'linear-gradient(140deg,#FFCDD8 0%,#FF8FAB 50%,#E91E63 100%)',
  purple:      'linear-gradient(140deg,#E8D5F5 0%,#C9A8E8 50%,#7C4DFF 100%)',
  peach:       'linear-gradient(140deg,#FFE0CC 0%,#FFB085 50%,#FF6D00 100%)',
  mint:        'linear-gradient(140deg,#C8F5E3 0%,#7DDEAA 50%,#00897B 100%)',
  golden:      'linear-gradient(140deg,#FFF8E1 0%,#FFD54F 50%,#F57F17 100%)',
  midnight:    'linear-gradient(140deg,#9FA8DA 0%,#5C6BC0 50%,#1A237E 100%)',
  candy:       'linear-gradient(140deg,#FFD6F5 0%,#BBEEFF 50%,#FFFAAD 100%)',
  soft_vintage:'linear-gradient(140deg,#F5E6D3 0%,#D4A57B 50%,#8D6E63 100%)',
};

// ─── Gate Modal ────────────────────────────────────────────────────────────────
function GateModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neo-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="neo-card max-w-sm w-full p-8 text-center space-y-6"
      >
        <div className="text-5xl">🌸</div>
        <div>
          <h2 className="font-display font-black text-2xl text-neo-black mb-2">
            Sign in to continue
          </h2>
          <p className="text-neo-black/60 text-sm font-body">
            You've used your 1 free card. Sign in to create unlimited bouquets.
          </p>
        </div>
        <div className="space-y-3">
          <Link href="/auth/signin" className="neo-btn-rose w-full py-3 text-sm font-sub font-semibold block text-center">
            🔑 Sign in with Google / Email
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-mono text-neo-black/40 hover:text-neo-black/70 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Step 0: Flower Picker ─────────────────────────────────────────────────────
function StepBouquet() {
  return (
    <div className="space-y-8">
      {/* Pre-made bouquet selector */}
      <PremadeBouquets onSelect={() => {}} />

      {/* Custom flower picker */}
      <FlowerPicker />
    </div>
  );
}

// ─── Step 1: Color Theme ───────────────────────────────────────────────────────
function StepColors() {
  const { colorTheme, setColorTheme } = useBouquetStore();
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl text-neo-white mb-1">Pick a Colour Theme</h3>
        <p className="text-neo-white/60 text-sm">Sets the mood — the preview updates instantly.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {COLOR_THEMES.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setColorTheme(t.id)}
            className={`p-3 border-2 text-left transition-all rounded-lg
              ${colorTheme === t.id ? 'border-petal-pink shadow-neo-pink' : 'border-neo-white/15 hover:border-petal-pink/50'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="w-full h-6 rounded-md mb-2" style={{ background: t.gradient }} />
            <div className="flex items-center justify-between">
              <span className="font-sub font-semibold text-xs text-neo-white leading-tight">{t.label}</span>
              {colorTheme === t.id && <span className="text-petal-pink text-sm">✓</span>}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Message ───────────────────────────────────────────────────────────
function StepMessage() {
  const {
    recipientName, setRecipientName,
    senderName, setSenderName,
    message, setMessage,
    cardTheme,
  } = useBouquetStore();

  const theme = CARD_THEMES.find((t) => t.id === cardTheme);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display font-bold text-2xl text-neo-white mb-1">Write Your Message</h3>
        <p className="text-neo-white/60 text-sm">Your words appear inside the animated card.</p>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-neo-white/50 uppercase tracking-widest mb-2">
            Recipient Name
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g. Emma"
            className="neo-input text-neo-black rounded-lg"
            maxLength={40}
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-neo-white/50 uppercase tracking-widest mb-2">
            Message <span className="text-petal-pink">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something from the heart..."
            rows={4}
            className="neo-input text-neo-black resize-none rounded-lg"
            maxLength={500}
          />
          <p className="text-right text-xs text-neo-white/30 mt-1 font-mono">{message.length}/500</p>
        </div>
        <div>
          <label className="block text-xs font-mono text-neo-white/50 uppercase tracking-widest mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g. Alex"
            className="neo-input text-neo-black rounded-lg"
            maxLength={40}
          />
        </div>
      </div>

      {/* Live card preview */}
      <div>
        <p className="text-xs font-mono text-neo-white/40 uppercase tracking-widest mb-2">Live Preview</p>
        <motion.div
          layout
          className="rounded-xl overflow-hidden border border-neo-white/10 shadow-neo-lg p-6 space-y-4"
          style={{ background: theme?.bg ?? 'linear-gradient(135deg,#FFB3C6,#C8B6E2)' }}
        >
          <p className="font-display font-semibold text-sm" style={{ color: theme?.text ?? '#1a0533' }}>
            Dear {recipientName || <span style={{ opacity: 0.35 }}>Recipient</span>},
          </p>
          <p
            className="font-body leading-relaxed text-sm min-h-[3.5rem] italic"
            style={{ color: theme?.text ?? '#1a0533', opacity: message ? 0.9 : 0.4 }}
          >
            {message || 'Your message will appear here…'}
          </p>
          <p className="font-mono text-xs text-right" style={{ color: theme?.accent ?? '#FF85A1', opacity: 0.75 }}>
            Sincerely, {senderName || <span style={{ opacity: 0.5 }}>You</span>}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Step 3: Media ─────────────────────────────────────────────────────────────
function StepMedia() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl text-neo-white mb-1">Add a Photo or Video</h3>
        <p className="text-neo-white/60 text-sm">Optional — include a personal photo or short video clip.</p>
      </div>
      <MediaUploader />
    </div>
  );
}

// ─── Step 4: Theme + Music ─────────────────────────────────────────────────────
function StepTheme({
  audioRef,
}: {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}) {
  const { cardTheme, setCardTheme, musicTrack, setMusicTrack, customMusicUrl, setCustomMusicUrl } =
    useBouquetStore();
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [audioError,  setAudioError]  = useState<string | null>(null);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Stop audio when the user navigates away from this step
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setAudioError(null);
  }, [audioRef]);

  const playTrack = useCallback(
    (id: MusicTrack, customUrl?: string) => {
      stopAudio();
      if (id === 'none') return;

      const url = id === 'custom'
        ? (customUrl || customMusicUrl)
        : MUSIC_TRACKS.find((t) => t.id === id)?.url;

      if (!url) return;

      const audio = new Audio(url);
      audio.loop   = true;
      audio.volume = 0.45;

      audio.onerror = () => {
        setIsPlaying(false);
        setAudioError(
          id === 'custom'
            ? 'Could not load audio file.'
            : `Track not found. Add /public/music/${id}.mp3 to enable this track.`,
        );
        audioRef.current = null;
      };

      audio.play()
        .then(() => { setAudioError(null); setIsPlaying(true); })
        .catch(() => {
          setAudioError('Browser blocked autoplay — click ▶ Play to start the music.');
          audioRef.current = audio;
          setIsPlaying(false);
        });

      audioRef.current = audio;
    },
    [audioRef, customMusicUrl, stopAudio],
  );

  const handleTrackSelect = (id: MusicTrack) => {
    setMusicTrack(id);
    setAudioError(null);
    setShowTrimmer(false);
    if (id === 'none') {
      stopAudio();
    } else if (id !== 'custom') {
      playTrack(id);
    }
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customMusicUrl?.startsWith('blob:')) URL.revokeObjectURL(customMusicUrl);
    const url = URL.createObjectURL(file);
    setCustomMusicUrl(url);
    setMusicTrack('custom');
    setAudioError(null);
    playTrack('custom', url);
    setShowTrimmer(true); // auto-open trimmer for custom uploads
    if (fileRef.current) fileRef.current.value = '';
  };

  const togglePlay = () => {
    if (!audioRef.current) { playTrack(musicTrack); return; }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display font-bold text-2xl text-neo-white mb-1">Card Theme & Ambience</h3>
        <p className="text-neo-white/60 text-sm">Choose the visual style and optional background music.</p>
      </div>

      {/* Card theme grid */}
      <div>
        <label className="block text-xs font-mono text-neo-white/50 uppercase tracking-widest mb-3">Card Theme</label>
        <div className="grid grid-cols-2 gap-3">
          {CARD_THEMES.map((t) => (
            <motion.button
              key={t.id}
              onClick={() => setCardTheme(t.id as CardTheme)}
              className={`p-3 border-2 text-left transition-all
                ${cardTheme === t.id ? 'border-petal-pink shadow-neo-pink' : 'border-neo-white/20 hover:border-petal-pink/50'}`}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-full h-10 mb-2 rounded-sm" style={{ background: t.preview }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sub font-semibold text-xs text-neo-white leading-tight">{t.label}</p>
                  <p className="text-neo-white/40 text-xs mt-0.5 leading-tight">{t.description}</p>
                </div>
                {cardTheme === t.id && <span className="text-petal-pink ml-2">✓</span>}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Music */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono text-neo-white/50 uppercase tracking-widest">Background Music</label>
          {musicTrack !== 'none' && (
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 text-xs font-mono text-petal-pink hover:text-blush transition-colors"
            >
              <motion.span
                animate={isPlaying ? { scale: [1, 1.3, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                {isPlaying ? '⏸' : '▶'}
              </motion.span>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {audioError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 px-3 py-2 rounded-lg border border-rose/30 bg-rose/10"
            >
              <p className="text-xs font-mono text-rose">{audioError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {MUSIC_TRACKS.filter((t) => t.id !== 'custom').map((t) => (
            <button
              key={t.id}
              onClick={() => handleTrackSelect(t.id as MusicTrack)}
              className={`w-full px-4 py-3 flex items-center justify-between border-2 transition-all
                ${musicTrack === t.id ? 'border-petal-pink bg-petal-pink/10 text-petal-pink' : 'border-neo-white/20 text-neo-white/70 hover:border-petal-pink/40'}`}
            >
              <span className="font-mono text-sm">{t.label}</span>
              {musicTrack === t.id ? (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-petal-pink"
                >
                  {isPlaying ? '♪ Playing' : '○ Paused'}
                </motion.span>
              ) : (
                <span className="text-neo-white/30 text-xs">○ Select</span>
              )}
            </button>
          ))}

          {/* Custom upload */}
          <div
            className={`border-2 transition-all overflow-hidden ${musicTrack === 'custom' ? 'border-petal-pink bg-petal-pink/10' : 'border-neo-white/20 border-dashed hover:border-petal-pink/40'}`}
          >
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <span className={`font-mono text-sm block ${musicTrack === 'custom' ? 'text-petal-pink' : 'text-neo-white/70'}`}>
                  Upload Your Own MP3
                </span>
                {customMusicUrl && musicTrack === 'custom' && (
                  <span className="text-xs text-neo-white/40 font-mono mt-0.5 block">Custom file loaded ✓</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {musicTrack === 'custom' && customMusicUrl && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowTrimmer((v) => !v); }}
                    className="text-xs font-mono text-neo-white/40 hover:text-petal-pink transition-colors border border-neo-white/20 px-2 py-1 rounded"
                  >
                    ✂ {showTrimmer ? 'Hide' : 'Trim'}
                  </button>
                )}
                <span className="text-neo-white/50 text-lg">🎵</span>
              </div>
            </button>

            {/* Audio Trimmer panel */}
            <AnimatePresence>
              {showTrimmer && musicTrack === 'custom' && customMusicUrl && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1">
                    <AudioTrimmer
                      src={customMusicUrl}
                      onClose={() => setShowTrimmer(false)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              ref={fileRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/*"
              onChange={handleCustomUpload}
              className="hidden"
            />
          </div>
        </div>

        <p className="text-xs text-neo-white/30 font-mono mt-3">
          ℹ Built-in tracks require /public/music/*.mp3 files. Custom upload works instantly.
        </p>
      </div>
    </div>
  );
}

// ─── Card Preview Modal ────────────────────────────────────────────────────────
function CardPreviewModal({ onClose, onGenerate }: { onClose: () => void; onGenerate: () => void }) {
  const { message, senderName, recipientName, flowers, cardTheme } = useBouquetStore();
  const [phase, setPhase] = useState<'petals' | 'bouquet' | 'message' | 'done'>('petals');
  const [typedText, setTypedText] = useState('');
  const msgRef = useRef(message);

  const theme = CARD_THEMES.find((t) => t.id === cardTheme);

  // Phase sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('bouquet'), 1200);
    const t2 = setTimeout(() => setPhase('message'), 2400);
    const t3 = setTimeout(() => setPhase('done'), 3000 + message.length * 35);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [message.length]);

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'message') return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(msgRef.current.slice(0, i));
      if (i >= msgRef.current.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [phase]);

  const FLOWER_EMOJIS: Record<string, string> = {
    rose: '🌹', tulip: '🌷', peony: '🌸', sunflower: '🌻',
    dahlia: '💐', carnation: '🌺', gerbera: '🌼', anemone: '🪻',
    cherry: '🌸', daisy: '🌼', lily: '🪷', lavender: '💜',
  };
  const flowerEmojis = flowers.slice(0, 7).map((f) => FLOWER_EMOJIS[f.flowerType] ?? '🌸');
  if (flowerEmojis.length === 0) flowerEmojis.push('🌸', '🌹', '🌷');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'rgba(13,13,13,0.97)' }}>

      {/* Floating petals backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ opacity: 0, y: -40, x: `${Math.random() * 100}vw` }}
            animate={{ opacity: [0, 0.7, 0], y: '110vh', rotate: Math.random() * 360 }}
            transition={{ duration: 4 + Math.random() * 4, delay: Math.random() * 2, ease: 'linear' }}
            style={{ left: `${Math.random() * 100}%` }}
          >
            {['🌸', '🌹', '🌷', '🌺', '💐'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full mx-4 space-y-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="font-mono text-xs text-neo-white/40 uppercase tracking-widest mb-2">Preview</p>
          <h2 className="font-display font-black text-3xl shimmer-text">Your Card</h2>
        </motion.div>

        {/* Bouquet */}
        <AnimatePresence>
          {(phase === 'bouquet' || phase === 'message' || phase === 'done') && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex justify-center gap-2"
            >
              {flowerEmojis.map((e, i) => (
                <motion.span
                  key={i}
                  className="text-4xl"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08, type: 'spring' }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card body */}
        <AnimatePresence>
          {(phase === 'message' || phase === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="border-3 border-neo-black shadow-neo-xl p-8 space-y-4 min-h-32"
              style={{ background: theme?.bg || '#FFB3C6' }}
            >
              <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center"
                style={{ color: theme?.text }}>
                A message for you
              </p>
              {recipientName && (
                <p className="font-display font-semibold text-sm" style={{ color: theme?.text }}>
                  Dear {recipientName},
                </p>
              )}
              <blockquote
                className="font-display text-xl font-bold text-center leading-relaxed min-h-12"
                style={{ color: theme?.text }}
              >
                {typedText}
                {phase === 'message' && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block ml-1 w-0.5 h-5 align-middle"
                    style={{ background: theme?.text }}
                  />
                )}
              </blockquote>
              {senderName && (
                <p className="text-right font-mono text-sm opacity-60" style={{ color: theme?.accent }}>
                  Sincerely, {senderName}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                onClick={onGenerate}
                className="neo-btn-rose w-full py-4 text-base font-display"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                ✨ Generate Share Link
              </motion.button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-mono text-neo-white/40 hover:text-neo-white/70 transition-colors"
              >
                Back to editor
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Step 5: Share (with preview trigger) ─────────────────────────────────────
function StepShare() {
  return <SharePanel />;
}

const STEP_COMPONENTS = [StepBouquet, StepColors, StepMessage, StepMedia];

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function CreatePage() {
  const { currentStep, setStep, flowers, message } = useBouquetStore();
  const [direction, setDirection]       = useState(1);
  const [showGate, setShowGate]         = useState(false);
  const [showPreview, setShowPreview]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Gate check — 1 free card without sign-in
  useEffect(() => {
    try {
      const count = parseInt(localStorage.getItem('petalnote_cards_created') || '0', 10);
      if (count >= 1) setShowGate(true);
    } catch {
      // localStorage not available
    }
  }, []);

  // Stop audio on unmount
  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  const goTo = (next: number) => {
    setDirection(next > currentStep ? 1 : -1);
    setStep(next);
  };

  const canNext = () => {
    if (currentStep === 0 && flowers.length < 6) return false;
    if (currentStep === 2 && !message.trim()) return false;
    return true;
  };

  // Step 4 and 5 are handled separately
  const isThemeStep = currentStep === 4;
  const isShareStep = currentStep === 5;
  const isFormStep  = currentStep <= 3;

  const handleContinueFromTheme = () => setShowPreview(true);
  const handlePreviewGenerate   = () => { setShowPreview(false); goTo(5); };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Gate modal */}
      {showGate && <GateModal onClose={() => setShowGate(false)} />}

      {/* Card preview modal */}
      {showPreview && (
        <CardPreviewModal
          onClose={() => setShowPreview(false)}
          onGenerate={handlePreviewGenerate}
        />
      )}

      {/* Top nav */}
      <nav className="p-4 border-b-2 border-neo-white/10 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="font-display font-black text-2xl shimmer-text">PetalNote</Link>
        <div className="hidden md:flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono border-2 transition-all
                ${i === currentStep
                  ? 'border-petal-pink text-petal-pink bg-petal-pink/10'
                  : i < currentStep
                  ? 'border-neo-white/30 text-neo-white/50'
                  : 'border-transparent text-neo-white/25'}`}
            >
              <span>{s.icon}</span>
              <span className="hidden lg:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ── Left: Live Bouquet Preview — sticky, full viewport height ── */}
        <div
          className="border-b-2 lg:border-b-0 lg:border-r-2 border-neo-white/10"
          style={{
            position: 'sticky',
            top: 0,
            width: '50vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            background: 'radial-gradient(ellipse at 30% 60%, rgba(130,45,85,0.55) 0%, #0D0D0D 70%)',
          }}
        >
          {/* Keyframe animations */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-20px) scale(1.05); }
            }
            @keyframes twinkle {
              0%, 100% { opacity: 0.2; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.4); }
            }
          `}</style>

          {/* ── Orb 1: pink ───────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', zIndex: 0,
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,100,150,0.12), transparent)',
            top: '20%', left: '30%',
            animation: 'float 6s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* ── Orb 2: purple ─────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', zIndex: 0,
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(150,100,255,0.10), transparent)',
            top: '50%', left: '20%',
            animation: 'float 8s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }} />

          {/* ── Orb 3: golden ─────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', zIndex: 0,
            width: '250px', height: '250px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,180,100,0.08), transparent)',
            top: '30%', left: '50%',
            animation: 'float 7s ease-in-out infinite 2s',
            pointerEvents: 'none',
          }} />

          {/* ── Sparkle dots ──────────────────────────────────────────── */}
          {[
            { top: '15%', left: '18%', delay: '0s',   opacity: 0.4 },
            { top: '72%', left: '14%', delay: '0.8s', opacity: 0.3 },
            { top: '28%', left: '78%', delay: '1.4s', opacity: 0.5 },
            { top: '60%', left: '72%', delay: '0.4s', opacity: 0.35 },
            { top: '82%', left: '42%', delay: '1.9s', opacity: 0.6 },
            { top: '10%', left: '55%', delay: '1.1s', opacity: 0.3 },
          ].map((s, i) => (
            <div
              key={`spark-${i}`}
              style={{
                position: 'absolute', zIndex: 0,
                width: '4px', height: '4px',
                borderRadius: '50%',
                background: 'white',
                top: s.top, left: s.left,
                opacity: s.opacity,
                animation: `twinkle 3s ease-in-out infinite ${s.delay}`,
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* ── Bouquet preview — above all background effects ────────── */}
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LiveBouquetPreview />
          </div>
        </div>

        {/* ── Right: Step forms ──────────────────────────────────────────── */}
        <div className="lg:w-1/2 flex flex-col">
          {/* Progress bar */}
          <div className="h-1.5 bg-neo-white/10 flex-shrink-0">
            <motion.div
              className="h-full bg-gradient-to-r from-petal-pink to-violet"
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Step indicator */}
          <div className="px-8 pt-5 pb-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{STEPS[currentStep].icon}</span>
              <span className="font-mono text-sm text-neo-white/50 uppercase tracking-widest">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>
            <span className="font-mono text-xs text-neo-white/30">{STEPS[currentStep].label}</span>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-8 py-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
              >
                {isFormStep && (() => {
                  const Comp = STEP_COMPONENTS[currentStep];
                  return <Comp />;
                })()}
                {isThemeStep && <StepTheme audioRef={audioRef} />}
                {isShareStep && <StepShare />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="px-8 py-5 border-t-2 border-neo-white/10 flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => goTo(currentStep - 1)}
              disabled={currentStep === 0}
              className="neo-btn-dark px-6 py-3 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none"
            >
              ← Back
            </button>

            {!isShareStep && (
              <button
                onClick={() => {
                  if (isThemeStep) {
                    handleContinueFromTheme();
                  } else {
                    goTo(currentStep + 1);
                  }
                }}
                disabled={!canNext()}
                className="neo-btn-rose px-8 py-3 flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isThemeStep ? 'Preview Your Card →' : 'Continue →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
