'use client';

import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useBouquetStore } from '@/lib/store';
import axios from 'axios';

export function MediaUploader() {
  const { setMedia, mediaUrl, mediaType, clearMedia } = useBouquetStore();
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [progress, setProgress]       = useState(0);
  const localBlobRef                  = useRef<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const type    = isVideo ? 'video' : 'image';

    // ── Instant local preview ────────────────────────────────────────────────
    const localUrl = URL.createObjectURL(file);
    if (localBlobRef.current) URL.revokeObjectURL(localBlobRef.current);
    localBlobRef.current = localUrl;
    setMedia(localUrl, type);
    setError(null);
    setProgress(0);
    setUploading(true);

    // ── Upload to CDN in background ──────────────────────────────────────────
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post('/api/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      // Replace local blob with the CDN URL
      URL.revokeObjectURL(localUrl);
      localBlobRef.current = null;
      setMedia(data.url, data.resourceType === 'video' ? 'video' : 'image');
    } catch (err: unknown) {
      const serverMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(
        serverMsg ??
          'CDN upload failed. Preview is shown locally — media may not appear for the recipient.',
      );
    } finally {
      setUploading(false);
    }
  }, [setMedia]);

  const handleRemove = () => {
    if (localBlobRef.current) {
      URL.revokeObjectURL(localBlobRef.current);
      localBlobRef.current = null;
    }
    clearMedia();
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png':  [],
      'video/mp4':  [],
    },
    maxSize:  50 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      {/* Drop zone — shown only when no media is loaded */}
      {!mediaUrl && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
            ${isDragActive
              ? 'border-petal-pink bg-petal-pink/10 scale-[1.02]'
              : 'border-neo-white/20 hover:border-petal-pink/60 hover:bg-neo-white/5'}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="text-5xl">{isDragActive ? '📥' : '📸'}</div>
            <div>
              <p className="font-display font-bold text-neo-white">
                {isDragActive ? 'Drop it here!' : 'Add a Photo or Video'}
              </p>
              <p className="text-neo-white/40 text-sm mt-1">
                JPG, PNG or MP4 · up to 50 MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-amber-400 text-xs font-mono px-1"
        >
          ⚠ {error}
        </motion.p>
      )}

      {/* Instant preview + upload progress overlay */}
      <AnimatePresence>
        {mediaUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative border-2 border-petal-pink/60 overflow-hidden rounded-xl shadow-neo-pink"
          >
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls className="w-full max-h-52 object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="Preview" className="w-full max-h-52 object-cover" />
            )}

            {/* CDN upload progress */}
            {uploading && (
              <div className="absolute inset-0 bg-neo-black/65 flex flex-col items-center justify-center gap-3">
                <div className="w-2/3 h-1.5 bg-neo-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-petal-pink to-violet rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs font-mono text-petal-pink">Uploading to CDN {progress}%…</span>
              </div>
            )}

            {/* Actions */}
            {!uploading && (
              <>
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 neo-btn-dark text-xs px-2 py-1 rounded"
                >
                  Remove ×
                </button>
                {/* Replace button for uploading a different file */}
                <div
                  {...getRootProps()}
                  className="absolute top-2 left-2 neo-btn text-xs px-2 py-1 rounded cursor-pointer"
                >
                  <input {...getInputProps()} />
                  Replace
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-neo-black/70 px-3 py-1">
                  <span className="text-xs font-mono text-petal-pink">
                    ✓ {mediaType} ready
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-neo-white/30 font-mono">
        This media will appear inside the card when the recipient opens it.
      </p>
    </div>
  );
}
