'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function NavbarAuth() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-7 bg-neo-white/8 animate-pulse" />
        <div className="w-20 h-8 bg-petal-pink/20 animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="border-2 border-petal-pink object-cover"
            style={{ borderRadius: 0, width: 32, height: 32 }}
          />
        ) : (
          <div className="w-8 h-8 bg-petal-pink/20 border-2 border-petal-pink flex items-center justify-center text-petal-pink text-xs font-bold font-sub">
            {(session.user.name || session.user.email || '?').charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name (desktop) */}
        <span className="text-xs font-mono text-neo-white/50 hidden lg:block max-w-[110px] truncate">
          {session.user.name || session.user.email}
        </span>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-xs font-mono text-neo-white/40 hover:text-rose transition-colors ml-1"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Unauthenticated
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/signin"
        className="text-sm font-sub font-medium text-neo-white/65 hover:text-neo-white transition-colors duration-200"
      >
        Sign In
      </Link>
      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
        <Link
          href="/auth/signin"
          className="inline-flex items-center px-4 py-2 text-sm font-sub font-bold
                     bg-petal-pink text-neo-black
                     border-2 border-neo-black shadow-[3px_3px_0px_#0D0D0D]
                     hover:shadow-[4px_4px_0px_#0D0D0D] hover:-translate-y-0.5 hover:-translate-x-0.5
                     transition-all duration-150"
        >
          Sign Up
        </Link>
      </motion.div>
    </div>
  );
}
