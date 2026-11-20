import React from 'react';
import { getAllPosts, getFeaturedPost, getTrendingPosts } from '@/lib/postsStore';
import { getAllCategories } from '@/lib/categoriesStore';
import { HeroGrid } from '@/components/home/HeroGrid';
import { TrendingSidebar } from '@/components/home/TrendingSidebar';
import { CategorySection } from '@/components/home/CategorySection';
import { NewsletterBox } from '@/components/home/NewsletterBox';
import { AdSlot } from '@/components/ads/AdSlot';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [allPosts, allCategories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  const featured = (await getFeaturedPost()) || allPosts[0];
  const trending = await getTrendingPosts(5);

  // Secondary stories for hero (excluding featured)
  const secondary = allPosts.filter((p) => p.id !== featured?.id).slice(0, 3);

  // Categories with published articles
  const categoriesWithPosts = allCategories
    .map((cat) => ({
      category: cat,
      posts: allPosts.filter(
        (p) => p.status === 'published' && p.category.toLowerCase() === cat.slug.toLowerCase()
      ),
    }))
    .filter((group) => group.posts.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 728x90 Leaderboard Ad Slot */}
      <AdSlot type="leaderboard" />

      {/* Main Hero Section: 1 Lead + 3 Secondary */}
      {featured && <HeroGrid leadPost={featured} secondaryPosts={secondary} />}

      {/* Two Column Layout: Dynamic Category Sections on Left (8 cols) + Trending & Hotlines on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-4">
          {categoriesWithPosts.map(({ category, posts }, index) => (
            <React.Fragment key={category.slug}>
              <CategorySection category={category} posts={posts} />

              {/* In-feed ad after the 2nd category section */}
              {index === 1 && (
                <AdSlot
                  type="in-article"
                  adText="Official DELSU SUG Student Market & Campus Services Bulletin"
                />
              )}
            </React.Fragment>
          ))}
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
