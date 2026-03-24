import { NextRequest, NextResponse } from 'next/server';
import { getCardUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    return NextResponse.json({ url: getCardUrl(slug) });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
