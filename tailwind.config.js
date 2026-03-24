/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neo-Brutalist palette
        'neo-black': '#0D0D0D',
        'neo-white': '#FAFAFA',
        // Romantic soft palette
        'petal-pink': '#FFB3C6',
        'blush': '#FF85A1',
        'rose': '#FF4D6D',
        'lavender': '#C8B6E2',
        'lilac': '#DDA0DD',
        'violet': '#9B59B6',
        'cream': '#FFF8F0',
        'champagne': '#F7E7CE',
        'mint': '#B5EAD7',
        // Accent
        'neon-pink': '#FF2D78',
        'neon-purple': '#BF5AF2',
        'gold': '#FFD700',
      },
      fontFamily: {
        // Fraunces — romantic editorial serif (headings)
        display: ['var(--font-display)', 'Georgia', 'serif'],
        // Sora — modern geometric (subheadings / labels / nav)
        sub:     ['var(--font-sub)', 'system-ui', 'sans-serif'],
        // Manrope — legible (body text / paragraphs)
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        // Space Mono — monospace (tags / code / badges)
        mono:    ['var(--font-mono)', 'monospace'],
        // Playfair Display — elegant serif (bouquet names)
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'neo': '4px 4px 0px #0D0D0D',
        'neo-lg': '6px 6px 0px #0D0D0D',
        'neo-xl': '8px 8px 0px #0D0D0D',
        'neo-pink': '4px 4px 0px #FF4D6D',
        'neo-purple': '4px 4px 0px #9B59B6',
        'glow-pink': '0 0 30px rgba(255, 77, 109, 0.4)',
        'glow-purple': '0 0 30px rgba(155, 89, 182, 0.4)',
        'glow-soft': '0 0 60px rgba(255, 179, 198, 0.3)',
      },
      backgroundImage: {
        'gradient-romantic': 'linear-gradient(135deg, #FFB3C6 0%, #C8B6E2 50%, #B5EAD7 100%)',
        'gradient-dusk': 'linear-gradient(180deg, #1a0533 0%, #3d1266 40%, #7b2d8b 70%, #FFB3C6 100%)',
        'gradient-bloom': 'linear-gradient(135deg, #FFF8F0 0%, #FFB3C6 50%, #C8B6E2 100%)',
        'gradient-card': 'linear-gradient(135deg, #fff5f8 0%, #fce4ec 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'petal-fall': 'petalFall 8s linear infinite',
        'bloom': 'bloom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-sm': 'bounceSm 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(2deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-2deg)' },
        },
        petalFall: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        bloom: {
          '0%': { transform: 'scale(0) rotate(-30deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 77, 109, 0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(255, 77, 109, 0.8), 0 0 100px rgba(155, 89, 182, 0.4)' },
        },
        bounceSm: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
