import { NextResponse } from 'next/server';
import { getServerAds, saveServerAds } from '@/lib/serverData';
import { Advertisement } from '@/types/ads';

export async function GET() {
  try {
    const ads = await getServerAds();
    return NextResponse.json(ads, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, slot, title, image_url, target_url, sponsor_name, is_active } = body;

    if (!slot) {
      return NextResponse.json(
        { error: 'Ad slot identifier is required' },
        { status: 400 }
      );
    }

    const currentAds = await getServerAds();
    const adId = id || `ad-${slot}`;

    const updatedAd: Advertisement = {
      id: adId,
      slot,
      title: title?.trim() || `${slot.toUpperCase()} Advertisement`,
      image_url: image_url?.trim() || '',
      target_url: target_url?.trim() || 'https://whatsapp.com',
      sponsor_name: sponsor_name?.trim() || 'DELSU Ad Partner',
      is_active: Boolean(is_active),
      clicks_count: body.clicks_count || 0,
      updated_at: new Date().toISOString(),
    };

    const existingIndex = currentAds.findIndex((a) => a.id === adId || a.slot === slot);
    let nextAds: Advertisement[];

    if (existingIndex >= 0) {
      nextAds = [...currentAds];
      nextAds[existingIndex] = updatedAd;
    } else {
      nextAds = [...currentAds, updatedAd];
    }

    await saveServerAds(nextAds);

    return NextResponse.json(updatedAd, { status: 200 });
  } catch (err: any) {
    console.error('Error saving advertisement:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save advertisement' },
      { status: 500 }
    );
  }
}
