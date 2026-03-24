import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0D0D0D] pt-24 px-6">
        <div className="max-w-5xl mx-auto text-center py-24">
          <div className="text-7xl mb-6">🌷</div>
          <h1 className="font-display font-black text-6xl md:text-7xl text-neo-white mb-4">
            Gallery
          </h1>
          <p className="text-neo-white/50 text-lg font-body mb-10 max-w-xl mx-auto leading-relaxed">
            Public bouquets and love cards created with PetalNote.<br/>
            <span className="text-petal-pink">Coming soon</span> — be the first to share yours!
          </p>
          <Link href="/create">
            <button className="neo-btn-rose px-10 py-4 font-display text-lg">
              🌸 Create the First Bouquet
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
