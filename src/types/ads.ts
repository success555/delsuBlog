export type AdSlotType = 'leaderboard' | 'sidebar' | 'in-article';

export interface Advertisement {
  id: string; // e.g. 'ad-leaderboard', 'ad-sidebar', 'ad-in-article'
  slot: AdSlotType;
  title: string;
  image_url: string;
  target_url: string;
  sponsor_name: string;
  is_active: boolean;
  clicks_count?: number;
  updated_at?: string;
}

