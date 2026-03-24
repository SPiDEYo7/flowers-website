import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for one special moment.',
    features: [
      '1 bouquet & card',
      'All flower types',
      'All colour themes',
      'Shareable link',
      'No account required',
    ],
    cta: 'Get Started Free',
    href: '/create',
    accent: false,
  },
  {
    name: 'Bloom',
    price: '$4',
    period: 'per month',
    desc: 'For the hopeless romantic.',
    features: [
      'Unlimited bouquets',
      'Custom card themes',
      'Photo & video uploads',
      'Background music',
      'Card analytics',
      'Priority support',
    ],
    cta: 'Start Blooming',
    href: '/api/auth/signin',
    accent: true,
  },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0D0D0D] pt-24 px-6">
        <div className="max-w-4xl mx-auto py-20">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase border-2 border-petal-pink text-petal-pink mb-5">
              Pricing
            </span>
            <h1 className="font-display font-black text-6xl md:text-7xl text-neo-white leading-tight">
              Simple &amp; <span className="shimmer-text italic">Beautiful</span>
            </h1>
            <p className="text-neo-white/50 text-lg font-body mt-5 max-w-xl mx-auto">
              Send love freely. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`border-2 p-8 relative ${
                  plan.accent
                    ? 'border-petal-pink shadow-[6px_6px_0px_#FF4D6D]'
                    : 'border-neo-white/20'
                }`}
              >
                {plan.accent && (
                  <div className="absolute -top-3.5 left-6 px-3 py-1 bg-petal-pink text-neo-black text-xs font-mono font-bold border-2 border-neo-black">
                    Most Popular
                  </div>
                )}

                <p className="font-mono text-sm text-neo-white/50 uppercase tracking-widest mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display font-black text-5xl text-neo-white">{plan.price}</span>
                  <span className="text-neo-white/40 font-mono text-sm">/{plan.period}</span>
                </div>
                <p className="text-neo-white/50 text-sm font-body mb-7">{plan.desc}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm font-body text-neo-white/80">
                      <span className="text-petal-pink flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <button
                    className={`w-full py-3.5 font-sub font-bold text-sm border-2 border-neo-black shadow-neo hover:-translate-y-0.5 hover:shadow-neo-lg transition-all ${
                      plan.accent
                        ? 'bg-petal-pink text-neo-black'
                        : 'bg-neo-white text-neo-black'
                    }`}
                  >
                    {plan.cta} →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
