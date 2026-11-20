import { Advertisement, AdSlotType } from '@/types/ads';

const DEFAULT_ADS: Advertisement[] = [
  {
    id: 'ad-leaderboard',
    slot: 'leaderboard',
    title: 'Promote Your Campus Brand, Product or Event on Delsu Abraka Blog TV',
    image_url: '',
    target_url: 'https://wa.me/message/J3ZOIRSKCSMZM1',
    sponsor_name: 'DELSU Media Partner',
    is_active: false,
    clicks_count: 0,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad-sidebar',
    slot: 'sidebar',
    title: 'Target 25,000+ DELSU Students and Nigerian Readers',
    image_url: '',
    target_url: 'https://wa.me/message/J3ZOIRSKCSMZM1',
    sponsor_name: 'Campus Ad Partner',
    is_active: false,
    clicks_count: 0,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ad-in-article',
    slot: 'in-article',
    title: 'Need Fast Off-Campus Accommodation in Abraka or Student Deals?',
    image_url: '',
    target_url: 'https://wa.me/message/J3ZOIRSKCSMZM1',
    sponsor_name: 'Abraka Student Housing',
    is_active: false,
    clicks_count: 0,
    updated_at: new Date().toISOString(),
  },
];

export async function getAllAds(): Promise<Advertisement[]> {
  try {
    // 1. In browser, fetch via /api/ads
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/ads', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : DEFAULT_ADS;
      }
    } else {
      // 2. Server-side, read from serverData
      const { getServerAds } = await import('@/lib/serverData');
      const data = await getServerAds();
      return Array.isArray(data) && data.length > 0 ? data : DEFAULT_ADS;
    }
  } catch (err) {
    console.warn('Error reading ads:', err);
  }
  return DEFAULT_ADS;
}

export async function getAdBySlot(slot: AdSlotType): Promise<Advertisement | null> {
  const ads = await getAllAds();
  return ads.find((a) => a.slot === slot) || null;
}

export async function saveAd(ad: Advertisement): Promise<Advertisement> {
  const res = await fetch('/api/ads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ad),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save advertisement');
  }

  const saved = await res.json();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('delsu_ads_updated', { detail: saved }));
  }

  return saved;
}

