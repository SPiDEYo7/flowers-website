# 🌸 Flower Assets Setup Guide

## Overview

The PetalNote app now uses **image-based watercolor flower assets** instead of SVG code. This matches the aesthetic shown in your reference images.

## 📁 Required Asset Structure

Create the following folders and add your watercolor images:

```
public/
  assets/
    flowers/          # Individual flower sticker images
      rose.png
      tulip.png
      peony.png
      sunflower.png
      daisy.png
      dahlia.png
      carnation.png
      gerbera.png
      anemone.png
      cherry.png
      lavender.png
      lily.png

    bouquets/         # Pre-made bouquet composition images
      romantic-pink.png
      sunny-garden.png
      purple-elegance.png
      garden-mix.png
      pastel-dreams.png
      bold-blooms.png
```

---

## 🎨 Flower Image Requirements

Each flower image must be:

### Format
- ✅ PNG with transparent background
- ✅ OR SVG illustration file
- ✅ Minimum 500x500px resolution (higher is better)
- ✅ Square aspect ratio

### Style
- ✅ Watercolor sticker aesthetic
- ✅ Soft pastel colors with gradients
- ✅ Organic, hand-drawn appearance
- ✅ Slightly imperfect edges (bleeding effect)
- ✅ Centered flower head (minimal or no stem)
- ✅ Soft shadows and highlights

### Example Prompt (for AI generation)
```
watercolor flower sticker illustration, [flower name], centered,
transparent background, soft pastel colors, hand-painted aesthetic,
organic shapes, delicate shading, die-cut sticker style,
high resolution, professional quality
```

---

## 💐 Bouquet Image Requirements

Each bouquet image must be:

### Format
- ✅ PNG or JPG format
- ✅ 1200x1600px (3:4 portrait ratio)
- ✅ High quality, professionally styled

### Style
- ✅ Pinterest-style bouquet arrangement
- ✅ Natural flower layering and overlap
- ✅ Realistic stems and greenery
- ✅ Soft, romantic lighting
- ✅ Professional florist composition
- ✅ Dense, lush appearance

### Reference Style
Match the aesthetic of images 3 & 4 you provided:
- Natural wrapping paper or ribbons
- Mixed flower types arranged artistically
- Visible depth and dimension
- Warm, inviting photography

---

## 🔍 Where to Source Images

### Option 1: AI Image Generation
**Midjourney / DALL-E / Stable Diffusion**
```
Prompt: "watercolor flower sticker, [flower name], transparent background,
soft pastel, hand-painted, die-cut sticker style, high detail"
```

### Option 2: Stock Asset Libraries
- **Creative Market** — watercolor flower clipart packs
- **Freepik Premium** — botanical watercolor illustrations
- **Adobe Stock** — floral watercolor stickers
- **Etsy Digital Downloads** — watercolor flower PNG sets

### Option 3: Commission an Artist
- **Fiverr** — search "watercolor flower illustration"
- **Upwork** — hire a botanical illustrator
- **Instagram** — find watercolor artists with commission slots

### Option 4: Create Your Own
- **Procreate** (iPad) — watercolor brushes
- **Photoshop** — watercolor effect filters
- **Affinity Designer** — vector watercolor tools

---

## 🚀 Quick Setup (Placeholder Images)

For immediate testing, you can use emoji placeholders:

The app is configured to show a soft gradient + emoji fallback if images are missing.

To switch to real images:
1. Add your PNG/SVG files to `public/assets/flowers/`
2. Add bouquet photos to `public/assets/bouquets/`
3. The app will automatically load them

---

## 🎯 Configuration

Image paths are defined in:
```
lib/flowerAssets.ts
```

To change image paths or add new flowers:
1. Edit `FLOWER_ASSETS` object
2. Update `imageUrl` properties
3. Add new flower types if needed

---

## 💡 Tips

- **Consistency**: Use the same artist/style for all flowers
- **Quality**: Higher resolution = better zoom/scaling
- **Testing**: Check appearance at multiple sizes (64px, 128px, 256px)
- **Performance**: Optimize images with TinyPNG or ImageOptim
- **Format**: PNG for transparency, WebP for smaller file sizes

---

## ✅ Verification

Once you add images, test:
1. Visit `/create` route
2. Check flower picker tiles (should show watercolor images)
3. Select flowers and verify bouquet preview
4. Try pre-made bouquet selector
5. Check animations and hover states

---

## 🆘 Fallback Behavior

If an image fails to load:
- Individual flowers: Shows colored emoji on gradient background
- Bouquets: Shows gradient with flower color dots

This ensures the app never breaks even with missing assets.
