import React from 'react';
import { getAllPosts, getFeaturedPost, getTrendingPosts } from '@/lib/postsStore';
import { CATEGORIES } from '@/data/categories';
import { HeroGrid } from '@/components/home/HeroGrid';
import { TrendingSidebar } from '@/components/home/TrendingSidebar';
import { CategorySection } from '@/components/home/CategorySection';
import { NewsletterBox } from '@/components/home/NewsletterBox';
import { AdSlot } from '@/components/ads/AdSlot';

export const revalidate = 60; // Refresh data every 60 seconds

export default async function HomePage() {
  const allPosts = await getAllPosts();
  const featured = (await getFeaturedPost()) || allPosts[0];
  const trending = await getTrendingPosts(5);

  // Secondary stories for hero (excluding featured)
  const secondary = allPosts.filter((p) => p.id !== featured?.id).slice(0, 3);

  // Filter posts for major categories to display on homepage
  const campusPosts = allPosts.filter((p) => p.category === 'campus-updates');
  const techPosts = allPosts.filter((p) => p.category === 'tech-startups');
  const entertainmentPosts = allPosts.filter((p) => p.category === 'afrobeats-entertainment');
  const sportsPosts = allPosts.filter((p) => p.category === 'super-eagles-sports');

  const campusCategory = CATEGORIES.find((c) => c.slug === 'campus-updates')!;
  const techCategory = CATEGORIES.find((c) => c.slug === 'tech-startups')!;
  const entertainmentCategory = CATEGORIES.find((c) => c.slug === 'afrobeats-entertainment')!;
  const sportsCategory = CATEGORIES.find((c) => c.slug === 'super-eagles-sports')!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 728x90 Leaderboard Ad Slot */}
      <AdSlot type="leaderboard" />

      {/* Main Hero Section: 1 Lead + 3 Secondary */}
      <HeroGrid leadPost={featured} secondaryPosts={secondary} />

      {/* Two Column Layout: Categories on Left (8 cols) + Trending & Hotlines on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        
        {/* Main Column */}
        <div className="lg:col-span-8">
          
          {/* DELSU Abraka Campus Updates Category Grid */}
          <CategorySection
            category={campusCategory}
            posts={campusPosts}
          />

          {/* In-Article / In-Feed Responsive Ad */}
          <AdSlot
            type="in-article"
            adText="Official DELSU SUG Student Market & Campus Services Bulletin"
          />

          {/* Tech & Startups Category Grid */}
          <CategorySection
            category={techCategory}
            posts={techPosts}
          />

          {/* Afrobeats & Entertainment Category Grid */}
          <CategorySection
            category={entertainmentCategory}
            posts={entertainmentPosts}
          />

          {/* Super Eagles & Sports Category Grid */}
          <CategorySection
            category={sportsCategory}
            posts={sportsPosts}
          />

        </div>

        {/* Right Sidebar: Trending Top 5 + Emergency Hotlines + 300x250 Ad */}
        <div className="lg:col-span-4">
          <div className="sticky top-28">
            <TrendingSidebar trendingPosts={trending} />
          </div>
        </div>

      </div>

      {/* High-Converting WhatsApp Channel & Email Banner */}
      <NewsletterBox />

    </div>
  );
}
