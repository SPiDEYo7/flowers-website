import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6 animate-float">🥀</div>
      <h1 className="font-display font-black text-6xl text-neo-white mb-4">
        Card Not Found
      </h1>
      <p className="text-neo-white/50 text-lg font-mono mb-8 max-w-md">
        This bouquet link has expired or doesn't exist. Make your own!
      </p>
      <Link href="/create">
        <button className="neo-btn-rose px-8 py-4 text-lg font-display">
          🌸 Create a Bouquet
        </button>
      </Link>
    </div>
  );
}
