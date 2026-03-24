'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FloatingPetals } from '@/components/animations/FloatingPetals';
import { Navbar } from '@/components/Navbar';

// ─── Provider Icons ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m2 7 10 7 10-7"/>
  </svg>
);

const PROVIDER_META: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  google: {
    label:  'Continue with Google',
    icon:   <GoogleIcon />,
    bg:     'bg-neo-white',
    text:   'text-neo-black',
    border: 'border-neo-black',
  },
  github: {
    label:  'Continue with GitHub',
    icon:   <GithubIcon />,
    bg:     'bg-[#24292E]',
    text:   'text-neo-white',
    border: 'border-neo-black',
  },
  email: {
    label:  'Continue with Email',
    icon:   <EmailIcon />,
    bg:     'bg-petal-pink',
    text:   'text-neo-black',
    border: 'border-neo-black',
  },
};

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const error       = searchParams?.get('error');

  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: string) => {
    setLoading(provider);
    await signIn(provider, { callbackUrl });
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading('email');
    await signIn('email', { email, callbackUrl, redirect: false });
    setLoading(null);
    setSent(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 pt-16 relative overflow-hidden">
        <FloatingPetals count={10} />

        {/* Glow bg */}
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,179,198,0.08) 0%, transparent 65%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Card */}
          <div className="bg-[#111] border-2 border-neo-white/10 shadow-[8px_8px_0px_rgba(255,179,198,0.15)]">
            {/* Header */}
            <div className="p-8 border-b border-neo-white/10 text-center">
              <div className="text-5xl mb-4">🌸</div>
              <h1 className="font-display font-black text-3xl text-neo-white mb-2">Welcome back</h1>
              <p className="text-neo-white/50 text-sm font-body">Sign in to save your bouquets and send more cards.</p>
            </div>

            <div className="p-8 space-y-4">
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 bg-rose/10 border border-rose text-rose text-sm font-mono"
                >
                  {error === 'OAuthAccountNotLinked'
                    ? 'This email is already used with a different sign-in method.'
                    : 'Sign-in failed. Please try again.'}
                </motion.div>
              )}

              {/* OAuth buttons */}
              {['google', 'github'].map((provider) => {
                const meta = PROVIDER_META[provider];
                return (
                  <motion.button
                    key={provider}
                    onClick={() => handleOAuth(provider)}
                    disabled={!!loading}
                    className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 border-2 ${meta.border} ${meta.bg} ${meta.text} font-sub font-semibold text-sm shadow-neo transition-all hover:-translate-y-0.5 hover:shadow-neo-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading === provider ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                        🌸
                      </motion.span>
                    ) : meta.icon}
                    {meta.label}
                  </motion.button>
                );
              })}

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-neo-white/10" />
                <span className="text-xs font-mono text-neo-white/30 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-neo-white/10" />
              </div>

              {/* Email form */}
              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form
                    key="form"
                    onSubmit={handleEmail}
                    className="space-y-3"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="neo-input text-neo-black bg-cream placeholder:text-neo-black/40 text-sm"
                    />
                    <motion.button
                      type="submit"
                      disabled={!!loading || !email.trim()}
                      className="w-full py-3.5 bg-petal-pink text-neo-black font-sub font-bold text-sm border-2 border-neo-black shadow-neo hover:-translate-y-0.5 hover:shadow-neo-lg disabled:opacity-40 transition-all"
                      whileTap={{ scale: 0.97 }}
                    >
                      {loading === 'email' ? 'Sending link…' : 'Continue with Email →'}
                    </motion.button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-3"
                  >
                    <div className="text-4xl">📬</div>
                    <p className="font-display font-bold text-neo-white text-lg">Check your inbox!</p>
                    <p className="text-neo-white/50 text-sm font-body">We sent a magic sign-in link to <span className="text-petal-pink">{email}</span></p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-neo-white/10 text-center">
              <p className="text-xs text-neo-white/30 font-mono">
                By signing in you agree to our{' '}
                <span className="text-petal-pink cursor-pointer hover:underline">Terms</span>
                {' & '}
                <span className="text-petal-pink cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>
          </div>

          <p className="text-center mt-4 text-sm text-neo-white/40 font-mono">
            Don&apos;t have an account?{' '}
            <Link href="/api/auth/signin" className="text-petal-pink hover:underline">
              Sign up free →
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}

// ─── Suspense wrapper required for useSearchParams in Next.js 14 ──────────────
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
          <span className="text-5xl animate-bounce-sm">🌸</span>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
