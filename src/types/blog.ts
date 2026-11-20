export type CategorySlug =
  | 'campus-updates'
  | 'naija-news'
  | 'tech-startups'
  | 'afrobeats-entertainment'
  | 'business-economy'
  | 'japa-diaspora'
  | 'super-eagles-sports';

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  accentColor: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: CategorySlug | string;
  cover_image: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  reading_time: string;
  is_featured: boolean;
  is_sponsored: boolean;
  is_trending: boolean;
  views_count: number;
  published_at: string;
  created_at?: string;
  meta_title?: string;
  meta_description?: string;
  status: 'published' | 'draft';
}

export interface Comment {
  id: string;
  post_slug: string;
  parent_id?: string | null;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
  is_approved?: boolean;
  replies?: Comment[];
}

export interface NewsletterSubscription {
  email?: string;
  phone?: string;
  type: 'email' | 'whatsapp';
  subscribed_at: string;
}
