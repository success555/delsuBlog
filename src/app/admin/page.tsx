'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types/blog';
import { CATEGORIES } from '@/data/categories';
import { getAllPosts, savePost, deletePost } from '@/lib/postsStore';
import { slugify, calculateReadingTime, formatWATDate } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  LogOut,
  Search,
  Sparkles,
  CheckCircle,
  FileText,
  Eye,
  Star,
  X,
  Save,
  Radio,
} from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Campus / Academic', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tech & Laptop', url: 'https://images.unsplash.com/photo-1556742049-0a67e5574f73?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Music & Stage', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Football & Stadium', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Business & Economy', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Travel & Japa', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [category, setCategory] = useState('campus-updates');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('DELSU Editorial Desk');
  const [authorRole, setAuthorRole] = useState('Senior Campus Correspondent');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('delsu_admin_session');
    if (token !== 'authenticated') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, [router]);

  const loadPosts = async () => {
    const data = await getAllPosts();
    setPosts(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('delsu_admin_session');
    router.push('/admin/login');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
    if (!metaTitle) {
      setMetaTitle(val);
    }
  };

  const openNewPostEditor = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setIsSlugManual(false);
    setCategory('campus-updates');
    setCoverImage(COVER_PRESETS[0].url);
    setExcerpt('');
    setContent('');
    setAuthorName('DELSU Editorial Desk');
    setAuthorRole('Senior Campus Correspondent');
    setIsFeatured(false);
    setIsSponsored(false);
    setIsTrending(false);
    setStatus('published');
    setMetaTitle('');
    setMetaDescription('');
    setIsEditorOpen(true);
  };

  const openEditPostEditor = (p: Post) => {
    setEditingPost(p);
    setTitle(p.title);
    setSlug(p.slug);
    setIsSlugManual(true);
    setCategory(p.category);
    setCoverImage(p.cover_image);
    setExcerpt(p.excerpt);
    setContent(p.content);
    setAuthorName(p.author_name);
    setAuthorRole(p.author_role);
    setIsFeatured(p.is_featured);
    setIsSponsored(p.is_sponsored);
    setIsTrending(p.is_trending);
    setStatus(p.status);
    setMetaTitle(p.meta_title || p.title);
    setMetaDescription(p.meta_description || p.excerpt);
    setIsEditorOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    const readingTime = calculateReadingTime(content);

    const postPayload: Partial<Post> = {
      ...(editingPost ? { id: editingPost.id } : {}),
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      category,
      cover_image: coverImage.trim() || COVER_PRESETS[0].url,
      excerpt: excerpt.trim() || content.slice(0, 160) + '...',
      content: content.trim(),
      author_name: authorName.trim(),
      author_role: authorRole.trim(),
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      reading_time: readingTime,
      is_featured: isFeatured,
      is_sponsored: isSponsored,
      is_trending: isTrending,
      status,
      meta_title: metaTitle.trim() || title.trim(),
      meta_description: metaDescription.trim() || excerpt.trim(),
    };

    try {
      await savePost(postPayload);
      await loadPosts();
      setIsEditorOpen(false);
      setStatusMessage(editingPost ? 'Article updated successfully!' : 'New article published!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, postTitle: string) => {
    if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      await deletePost(id);
      await loadPosts();
      setStatusMessage('Article removed.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500 font-mono">Authenticating editorial session...</p>
      </div>
    );
  }

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPublished = posts.filter((p) => p.status === 'published').length;
  const totalDrafts = posts.filter((p) => p.status === 'draft').length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views_count || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">
                DELSU Abraka Newsroom CMS
              </h1>
              <span className="text-xs text-zinc-500 font-medium">
                Publishing & Editorial Management Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </Link>

            <button
              onClick={openNewPostEditor}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Article</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Analytics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">
              Total Articles
            </span>
            <div className="text-2xl font-black text-zinc-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              <span>{posts.length}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">
              Published
            </span>
            <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>{totalPublished}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">
              Drafts
            </span>
            <div className="text-2xl font-black text-amber-600 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{totalDrafts}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block mb-1">
              Total Reads
            </span>
            <div className="text-2xl font-black text-zinc-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-zinc-400" />
              <span>{totalViews.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by title or slug..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0">
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-black tracking-wider">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status & Flags</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      No matching articles found.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-red-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 line-clamp-1 max-w-md">
                          {post.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          /blog/{post.slug}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-semibold text-[10px] uppercase">
                          {post.category.replace('-', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              post.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {post.status}
                          </span>
                          {post.is_featured && (
                            <span className="p-1 bg-red-600 text-white rounded" title="Featured Post">
                              <Star className="w-2.5 h-2.5 fill-white" />
                            </span>
                          )}
                          {post.is_sponsored && (
                            <span className="px-1.5 py-0.5 bg-zinc-800 text-amber-400 text-[9px] font-bold rounded">
                              AD
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 font-mono text-[11px]">
                        {formatWATDate(post.published_at, { format: 'short' })}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded"
                            title="View Live Article"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditPostEditor(post)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Article"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Post Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-zinc-200 my-8 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600 text-white rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight">
                  {editingPost ? 'Edit Article' : 'Create New Article'}
                </h3>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Title & Slug */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Article Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. DELSU Abraka Unveils New ICT Hub..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Slug (URL Identifier)
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugManual(true);
                    }}
                    placeholder="article-slug-format"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 font-mono border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-semibold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 mb-2 font-mono"
                />

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">
                    Presets:
                  </span>
                  {COVER_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setCoverImage(p.url)}
                      className="text-[10px] px-2 py-0.5 bg-zinc-100 hover:bg-red-50 hover:text-red-600 rounded border border-zinc-200 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Excerpt / Deck (Summary)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise summary of the article for social cards and listings..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Content Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-zinc-800">
                    Article Body Content <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Estimated: {calculateReadingTime(content)}
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write or paste the full story text here (separate paragraphs with blank lines)..."
                  className="w-full px-4 py-3 text-xs bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-serif leading-relaxed"
                />
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Author Role / Title
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-zinc-800">Lead Story</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSponsored}
                    onChange={(e) => setIsSponsored(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <span className="text-xs font-bold text-zinc-800">Sponsored Ad</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-zinc-800">Trending Now</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-800">Status:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                    className="text-xs bg-white border border-zinc-300 rounded px-2 py-1 font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* SEO Meta Fields */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                  SEO & Social Share Preview (WhatsApp / X / Google)
                </span>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Custom page title for search engines..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                    Meta Description
                  </label>
                  <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Rich preview snippet for WhatsApp and Twitter..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded"
                  />
                </div>
              </div>

              {/* Submit Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save & Publish Article'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
