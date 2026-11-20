import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts, getRelatedPosts, getCommentsForPost } from '@/lib/postsStore';
import { formatWATDate } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { SocialShareBar } from '@/components/blog/SocialShareBar';
import { ReadAlsoBox } from '@/components/blog/ReadAlsoBox';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { CommentsSection } from '@/components/blog/CommentsSection';
import { AdSlot } from '@/components/ads/AdSlot';
import { Clock, Calendar, ChevronRight, Eye } from 'lucide-react';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Article Not Found | Delsu Abraka Blog',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://delsublog.ng';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;

  return {
    title: `${title} | Delsu Abraka Blog TV`,
    description,
    authors: [{ name: post.author_name }],
    openGraph: {
      title,
      description,
      url: postUrl,
      siteName: 'Delsu Abraka Update Blog TV',
      type: 'article',
      publishedTime: post.published_at,
      images: [
        {
          url: post.cover_image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [post.cover_image],
      creator: '@DelsuAbrakaBlog',
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedPosts(post.slug, post.category, 3);
  const comments = await getCommentsForPost(post.slug);

  // Split content into paragraphs for "Read Also" injection after paragraph 3
  const rawParagraphs = post.content.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const readAlsoTarget = related[0] || null;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6 font-medium">
        <Link href="/" className="hover:text-red-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <Link
          href={`/category/${post.category}`}
          className="text-red-600 font-bold uppercase tracking-wider hover:underline"
        >
          {post.category.replace('-', ' ')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="truncate max-w-[200px] sm:max-w-xs text-zinc-400">
          {post.title}
        </span>
      </nav>

      {/* Category & Sponsored Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-md shadow-xs">
          {post.category.replace('-', ' ')}
        </span>
        {post.is_sponsored && (
          <span className="px-2.5 py-1 bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-md">
            Sponsored Content
          </span>
        )}
      </div>

      {/* Main Headline */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-zinc-950 font-sans tracking-tight leading-tight mb-4">
        {post.title}
      </h1>

      {/* Deck / Excerpt */}
      {post.excerpt && (
        <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-sans mb-6 font-medium border-l-4 border-red-500 pl-4 py-0.5">
          {post.excerpt}
        </p>
      )}

      {/* Metadata Bar (Author, WAT Date, Reading Time, Views) */}
      <div className="flex flex-wrap items-center justify-between py-3 border-y border-zinc-200 text-xs text-zinc-600 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-200 border border-red-300 shrink-0">
            <OptimizedImage
              src={post.author_avatar}
              alt={post.author_name}
              width={36}
              height={36}
              className="rounded-full"
            />
          </div>
          <div>
            <span className="font-bold text-zinc-900 block leading-tight">
              By {post.author_name}
            </span>
            <span className="text-[11px] text-zinc-500">
              {post.author_role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-red-600" />
            {formatWATDate(post.published_at, { includeTime: true })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {post.reading_time}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-zinc-700 font-bold">
            <Eye className="w-3.5 h-3.5 text-red-500" />
            {(post.views_count || 1400).toLocaleString()} reads
          </span>
        </div>
      </div>

      {/* Sticky / Floating Social Share Bar */}
      <SocialShareBar title={post.title} slug={post.slug} />

      {/* Article Cover Image with Lite Mode Support */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden my-6 bg-zinc-100 shadow-md">
        <OptimizedImage
          src={post.cover_image}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Article Rich Typography Body with In-Article "Read Also" */}
      <div className="article-prose text-zinc-900 leading-relaxed font-serif text-lg my-8">
        {rawParagraphs.map((para, index) => (
          <React.Fragment key={index}>
            <p>{para}</p>

            {/* Injected "Read Also" related post box after 3rd paragraph (index 2) */}
            {index === 2 && readAlsoTarget && (
              <ReadAlsoBox post={readAlsoTarget} />
            )}

            {/* In-article Ad slot after 5th paragraph */}
            {index === 4 && (
              <AdSlot
                type="in-article"
                adText="Advertise with Delsu Abraka Blog TV: Direct Reach to Over 25,000 Verified Campus Readers"
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Second Social Share Bar */}
      <div className="pt-6 border-t border-zinc-200">
        <SocialShareBar title={post.title} slug={post.slug} />
      </div>

      {/* Author Bio Card */}
      <AuthorBio
        name={post.author_name}
        avatar={post.author_avatar}
        role={post.author_role}
      />

      {/* Related Stories Grid */}
      {related.length > 0 && (
        <section className="my-10 pt-8 border-t-2 border-zinc-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 font-sans">
              More Stories You Might Like
            </h3>
            <Link
              href={`/category/${post.category}`}
              className="text-xs font-bold text-red-600 hover:underline uppercase"
            >
              See all {post.category.replace('-', ' ')} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="group block bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-red-400 hover:shadow-sm transition-all"
              >
                <div className="relative aspect-[16/10] bg-zinc-100 overflow-hidden">
                  <OptimizedImage
                    src={rel.cover_image}
                    alt={rel.title}
                    fill
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5">
                  <span className="text-[10px] font-bold uppercase text-red-600 block mb-1">
                    {rel.reading_time}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comments Section (Guest commenting + nested replies) */}
      <CommentsSection postSlug={post.slug} initialComments={comments} />

    </article>
  );
}
