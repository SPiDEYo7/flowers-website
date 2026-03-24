# 🌸 Bloom — Digital Flower Bouquets & Love Cards

> Awwwards-level full-stack web application for sending animated 3D flower bouquets and cinematic love cards via shareable links.

---

## Features

- **3D Interactive Flower Field** — Three.js scene on landing page with mouse-reactive flowers
- **Bouquet Creator** — Multi-step builder with real-time 3D preview (React Three Fiber)
- **Animated Love Card** — GSAP + Framer Motion reveal sequence on the card page
- **Floating Petal System** — GPU-accelerated GSAP particle petals
- **Media Upload** — Images & videos via Cloudinary
- **Shareable Links** — Unique short slugs (`/card/abc123`)
- **Neo-Brutalism × Romantic Design** — Bold borders, offset shadows, pastel glows
- **Buttery Smooth Scroll** — Lenis + GSAP ScrollTrigger integration
- **Bloom Postprocessing** — Three.js glow on all 3D scenes

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Framework  | Next.js 14 (App Router) |
| UI         | React + TailwindCSS |
| Animation  | Framer Motion + GSAP + ScrollTrigger |
| 3D         | Three.js + React Three Fiber + Drei |
| Scroll     | Lenis |
| State      | Zustand |
| Backend    | Next.js API Routes |
| ORM        | Prisma |
| Database   | PostgreSQL (Supabase) |
| Storage    | Cloudinary |
| Deployment | Vercel |

---

## Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout (Lenis smooth scroll)
│   ├── page.tsx                # Landing page (Three.js flower field)
│   ├── create/
│   │   └── page.tsx            # Multi-step bouquet creator
│   ├── card/
│   │   └── [id]/
│   │       └── page.tsx        # Card experience page (SSR)
│   └── api/
│       ├── create-card/route.ts
│       ├── upload-media/route.ts
│       ├── card/[id]/route.ts
│       └── generate-link/route.ts
├── components/
│   ├── three/
│   │   ├── FlowerField.tsx     # Landing page 3D scene
│   │   ├── BouquetScene.tsx    # Creator 3D preview
│   │   └── RotatingCard.tsx    # Card page 3D card
│   ├── animations/
│   │   ├── SmoothScroll.tsx    # Lenis provider
│   │   └── FloatingPetals.tsx  # GSAP petal particles
│   ├── card/
│   │   └── CardExperience.tsx  # Full card viewing experience
│   ├── creator/
│   │   ├── MediaUploader.tsx   # Drag-drop upload with progress
│   │   └── SharePanel.tsx      # Link generation + sharing
│   └── ui/
│       ├── FlowerSelector.tsx
│       ├── ColorThemePicker.tsx
│       └── CardThemePicker.tsx
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── cloudinary.ts           # Cloudinary upload helper
│   ├── store.ts                # Zustand bouquet store
│   └── utils.ts                # Constants + helpers
├── prisma/
│   └── schema.prisma           # Database schema
├── styles/
│   └── globals.css             # Tailwind + custom CSS
├── .env.example
└── README.md
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd bloom-love
npm install
```

### 2. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
# Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Cloudinary (get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings → Database → Connection string → URI**
3. Copy the connection string and paste as `DATABASE_URL` in `.env.local`
4. Run `npm run db:push` to create the tables

### Schema

```prisma
model Card {
  id          String   @id @default(cuid())
  slug        String   @unique           // shareable ID (e.g. "abc1234xyz")
  senderName  String?
  message     String   @db.Text
  flowerStyle String   @default("rose")
  colorTheme  String   @default("pink")
  cardTheme   String   @default("romantic")
  mediaUrl    String?
  mediaType   String?                    // "image" | "video"
  musicTrack  String?  @default("none")
  bouquetData Json?                      // full bouquet config
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add each to `.env.local`
4. Create a folder called `bloom-cards` (or let the API create it automatically)

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add the following **Environment Variables** in the Vercel project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same cloud name |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `.next`
5. Click **Deploy**

### 3. Run database migration on Vercel

Add to Vercel build command (optional):

```
prisma generate && prisma db push && next build
```

Or run manually via the Vercel CLI:

```bash
npx vercel env pull .env.production.local
npx prisma db push
```

---

## API Reference

### `POST /api/create-card`

Create a new card and bouquet.

**Request body:**
```json
{
  "senderName": "Alex",
  "message": "You make every day brighter 🌸",
  "flowerStyle": "rose",
  "colorTheme": "pink",
  "cardTheme": "romantic",
  "musicTrack": "piano",
  "mediaUrl": "https://res.cloudinary.com/...",
  "mediaType": "image",
  "bouquetData": { "flowers": [...], "layout": "classic" }
}
```

**Response:**
```json
{ "slug": "abc1234xyz", "id": "clxxxxxxx" }
```

---

### `POST /api/upload-media`

Upload image or video to Cloudinary.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "bloom-cards/...",
  "resourceType": "image"
}
```

---

### `GET /api/card/[id]`

Fetch card data by slug.

**Response:** Full card object

---

### `POST /api/generate-link`

Generate shareable URL for a slug.

**Request:** `{ "slug": "abc1234xyz" }`
**Response:** `{ "url": "https://yoursite.com/card/abc1234xyz" }`

---

## Performance Notes

- Three.js scenes use `dpr={[1, 2]}` for retina without performance penalty
- All 3D components are `dynamic()` imported with `ssr: false` to avoid hydration issues
- Lenis + GSAP ticker synced for zero-drift smooth scroll
- Bloom postprocessing uses `mipmapBlur` for GPU-friendly glow
- Images automatically optimised via Cloudinary's `quality: auto, fetch_format: auto`
- Zustand store avoids unnecessary re-renders in the creator

---

## Customisation

### Adding Flower Types

Edit `lib/utils.ts → FLOWER_TYPES`:

```ts
{ id: 'peony', emoji: '🌷', label: 'Peony', color: '#FFB7C5' },
```

Then update the Three.js `BouquetScene` color map.

### Adding Card Themes

Edit `lib/utils.ts → CARD_THEMES` and update the gradient maps in `CardExperience.tsx`.

### Adding Music Tracks

1. Add `.mp3` files to `/public/music/`
2. Add entries to `lib/utils.ts → MUSIC_TRACKS`

---

## License

MIT — feel free to use for personal or commercial projects.

---

Made with 🌸 by Bloom
