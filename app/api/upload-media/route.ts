import { NextRequest, NextResponse } from 'next/server';
import { uploadMedia } from '@/lib/cloudinary';

// App Router route segment config — bodyParser is not used in App Router (formData() works natively)
export const runtime    = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Guard: Cloudinary must be configured
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: 'Media uploads are not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local file.' },
      { status: 503 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 50 MB.' }, { status: 413 });
    }

    const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported. Use JPG, PNG, or MP4.' }, { status: 415 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const isVideo = file.type.startsWith('video/');
    const result  = await uploadMedia(base64, 'bloom-cards', isVideo ? 'video' : 'image');

    return NextResponse.json({
      url:          result.secure_url,
      publicId:     result.public_id,
      resourceType: result.resource_type,
      width:        result.width,
      height:       result.height,
    }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/upload-media]', error);
    const msg = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
