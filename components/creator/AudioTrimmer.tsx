'use client';

/**
 * AudioTrimmer — WaveSurfer.js audio waveform with draggable trim markers.
 *
 * Features:
 * • Waveform display (WaveSurfer)
 * • Draggable start / end region handles (WaveSurfer Regions plugin)
 * • Preview trimmed segment
 * • Exposes trimStart / trimEnd (seconds) via Zustand store
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useBouquetStore } from '@/lib/store';

interface AudioTrimmerProps {
  /** Source audio URL — blob: or remote */
  src: string;
  onClose?: () => void;
}

export function AudioTrimmer({ src, onClose }: AudioTrimmerProps) {
  const { setTrimStart, setTrimEnd, trimStart, trimEnd } = useBouquetStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef        = useRef<import('wavesurfer.js').default | null>(null);
  const regionRef    = useRef<{ start: number; end: number; remove: () => void } | null>(null);

  const [loading,     setLoading]     = useState(true);
  const [playing,     setPlaying]     = useState(false);
  const [duration,    setDuration]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error,       setError]       = useState<string | null>(null);

  // Format seconds → mm:ss
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // Initialise WaveSurfer + Regions
  useEffect(() => {
    if (!containerRef.current) return;
    let ws: import('wavesurfer.js').default;
    let destroyed = false;

    (async () => {
      try {
        const WaveSurfer = (await import('wavesurfer.js')).default;
        const RegionsPlugin = (await import('wavesurfer.js/dist/plugins/regions.esm.js')).default;

        if (destroyed) return;

        const regions = RegionsPlugin.create();

        ws = WaveSurfer.create({
          container:       containerRef.current!,
          waveColor:       'rgba(255,133,161,0.55)',
          progressColor:   'rgba(255,133,161,0.90)',
          cursorColor:     '#FF4D6D',
          barWidth:        2,
          barGap:          1,
          barRadius:       2,
          height:          72,
          normalize:       true,
          plugins:         [regions],
        });

        ws.load(src);

        ws.on('ready', () => {
          if (destroyed) return;
          const dur = ws.getDuration();
          setDuration(dur);
          setLoading(false);

          // Create trim region
          const initStart = trimStart ?? 0;
          const initEnd   = trimEnd   ?? Math.min(dur, dur); // full track by default

          const region = regions.addRegion({
            start:   initStart,
            end:     initEnd,
            color:   'rgba(255,133,161,0.18)',
            drag:    true,
            resize:  true,
          }) as unknown as { start: number; end: number; remove: () => void };

          regionRef.current = region;
          setTrimStart(region.start);
          setTrimEnd(region.end);

          // Update store when region is moved/resized
          regions.on('region-updated', (r: { start: number; end: number }) => {
            setTrimStart(r.start);
            setTrimEnd(r.end);
          });
        });

        ws.on('audioprocess', (t: number) => { if (!destroyed) setCurrentTime(t); });
        ws.on('play',  () => { if (!destroyed) setPlaying(true); });
        ws.on('pause', () => { if (!destroyed) setPlaying(false); });
        ws.on('finish',() => { if (!destroyed) setPlaying(false); });
        ws.on('error', () => { if (!destroyed) setError('Failed to load audio.'); setLoading(false); });

        wsRef.current = ws;
      } catch {
        if (!destroyed) { setError('WaveSurfer failed to initialise.'); setLoading(false); }
      }
    })();

    return () => {
      destroyed = true;
      wsRef.current?.destroy();
      wsRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Preview: play only the trimmed region
  const previewTrim = useCallback(() => {
    const ws  = wsRef.current;
    const reg = regionRef.current;
    if (!ws || !reg) return;

    if (playing) {
      ws.pause();
      return;
    }

    const start = reg.start;
    const end   = reg.end;
    ws.setTime(start);
    ws.play();

    // Stop at end of trim region
    const checkInterval = setInterval(() => {
      if (!wsRef.current) { clearInterval(checkInterval); return; }
      const t = wsRef.current.getCurrentTime();
      if (t >= end) {
        wsRef.current.pause();
        clearInterval(checkInterval);
      }
    }, 100);
  }, [playing]);

  const tStart = trimStart ?? 0;
  const tEnd   = trimEnd   ?? duration;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-neo-white/50 uppercase tracking-widest">Trim Audio</p>
        {onClose && (
          <button onClick={onClose} className="text-neo-white/40 hover:text-neo-white/70 text-lg leading-none">×</button>
        )}
      </div>

      {/* Waveform container */}
      <div
        className="rounded-xl overflow-hidden border border-neo-white/10 relative"
        style={{ background: 'rgba(255,255,255,0.04)', minHeight: 88, padding: '8px 12px' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              className="w-6 h-6 rounded-full border-2 border-petal-pink/40 border-t-petal-pink"
            />
          </div>
        )}
        {error && (
          <p className="text-xs text-rose font-mono py-6 text-center">{error}</p>
        )}
        <div ref={containerRef} style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }} />
      </div>

      {/* Time display */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-neo-white/40">{fmt(currentTime)}</span>
          <span className="text-petal-pink font-semibold">
            Trim: {fmt(tStart)} → {fmt(tEnd)}
            <span className="text-neo-white/30 ml-1">({fmt(tEnd - tStart)})</span>
          </span>
          <span className="text-neo-white/40">{fmt(duration)}</span>
        </div>
      )}

      {/* Controls */}
      {!loading && !error && (
        <div className="flex gap-3">
          <motion.button
            onClick={previewTrim}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-lg text-sm font-mono flex items-center justify-center gap-2
                       border border-petal-pink/30 text-petal-pink hover:bg-petal-pink/10 transition-colors"
          >
            {playing
              ? <><span>⏸</span> Pause</>
              : <><span>▶</span> Preview Trim</>
            }
          </motion.button>

          <motion.button
            onClick={() => {
              // Reset to full track
              setTrimStart(0);
              setTrimEnd(duration);
              if (regionRef.current) {
                regionRef.current.remove();
              }
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2.5 rounded-lg text-xs font-mono border border-neo-white/15
                       text-neo-white/40 hover:text-neo-white/70 hover:border-neo-white/30 transition-colors"
          >
            Reset
          </motion.button>
        </div>
      )}

      <p className="text-xs text-neo-white/25 font-mono">
        ↔ Drag the pink region or its handles to set trim points
      </p>
    </div>
  );
}
