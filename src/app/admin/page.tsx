'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Post, CategoryInfo } from '@/types/blog';
import { Advertisement, AdSlotType } from '@/types/ads';
import { getAllPosts, savePost, deletePost } from '@/lib/postsStore';
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/categoriesStore';
import { getAllAds, saveAd } from '@/lib/adsStore';
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
  Upload,
  User,
  ImageIcon,
  Tags,
  FolderPlus,
  ShieldCheck,
  Megaphone,
  MousePointerClick,
  Layers,
  Link2,
} from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Campus / Academic', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tech & Laptop', url: 'https://images.unsplash.com/photo-1556742049-0a67e5574f73?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Music & Stage', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Football & Stadium', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Business & Economy', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Travel & Japa', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80' },
];

const ACCENT_PRESETS = [
  { label: 'Red (Default)', value: 'bg-red-600 text-white' },
  { label: 'Deep Crimson', value: 'bg-red-800 text-white' },
  { label: 'Rose Pink', value: 'bg-rose-600 text-white' },
  { label: 'Charcoal Dark', value: 'bg-zinc-800 text-white' },
  { label: 'Amber Gold', value: 'bg-amber-600 text-white' },
  { label: 'Emerald Green', value: 'bg-emerald-600 text-white' },
  { label: 'Royal Blue', value: 'bg-blue-600 text-white' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'ads'>('articles');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');

  // Article Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingStaff, setIsUploadingStaff] = useState(false);

  // Article Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [category, setCategory] = useState('campus-updates');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('DELSU Editorial Desk');
  const [authorRole, setAuthorRole] = useState('Senior Campus Correspondent');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [catName, setCatName] = useState('');
  const [catShortName, setCatShortName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catAccent, setCatAccent] = useState('bg-red-600 text-white');
  const [isCatSlugManual, setIsCatSlugManual] = useState(false);
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Ad Modal States & Form Fields
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [adSlot, setAdSlot] = useState<AdSlotType>('leaderboard');
  const [adTitle, setAdTitle] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [adSponsorName, setAdSponsorName] = useState('');
  const [adIsActive, setAdIsActive] = useState(false);
  const [isSavingAd, setIsSavingAd] = useState(false);
  const [isUploadingAd, setIsUploadingAd] = useState(false);

  // File Input References
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const staffFileInputRef = useRef<HTMLInputElement>(null);
  const adFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('delsu_admin_session');
    if (token !== 'authenticated') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadAllData();
    }
  }, [router]);

  const loadAllData = async () => {
    const [postsData, catsData, adsData] = await Promise.all([
      getAllPosts(),
      getAllCategories(),
      getAllAds(),
    ]);
    setPosts(postsData);
    setCategories(catsData);
    setAds(adsData);
  };

  const handleLogout = () => {
    localStorage.removeItem('delsu_admin_session');
    router.push('/admin/login');
  };

  // Helper to upload image to server or fallback to Base64
  const processImageUpload = async (file: File, type: 'cover' | 'staff' | 'ad'): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (err) {
      console.warn('API upload failed, using Data URL fallback:', err);
    }

    // Fallback to Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const url = await processImageUpload(file, 'cover');
      setCoverImage(url);
      setStatusMessage('Cover image uploaded successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch {
      alert('Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleStaffAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingStaff(true);
    try {
      const url = await processImageUpload(file, 'staff');
      setAuthorAvatar(url);
      setStatusMessage('Staff portrait uploaded successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch {
      alert('Failed to upload staff photo.');
    } finally {
      setIsUploadingStaff(false);
    }
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
    setCategory(categories[0]?.slug || 'campus-updates');
    setCoverImage(COVER_PRESETS[0].url);
    setExcerpt('');
    setContent('');
    setAuthorName('Blessing Onome Okonjo');
    setAuthorRole('DELSU Campus Editor & SUG Bureau Lead');
    setAuthorAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
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
    setAuthorAvatar(p.author_avatar || '');
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
      author_avatar: authorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
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
      await loadAllData();
      setIsEditorOpen(false);
      setStatusMessage(editingPost ? 'Article updated successfully!' : 'New article published!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string, postTitle: string) => {
    if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      await deletePost(id);
      await loadAllData();
      setStatusMessage('Article deleted.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Category Actions
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatShortName('');
    setCatSlug('');
    setCatDescription('');
    setCatAccent('bg-red-600 text-white');
    setIsCatSlugManual(false);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (c: CategoryInfo) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatShortName(c.shortName || c.name);
    setCatSlug(c.slug);
    setCatDescription(c.description);
    setCatAccent(c.accentColor || 'bg-red-600 text-white');
    setIsCatSlugManual(true);
    setIsCategoryModalOpen(true);
  };

  const handleCatNameChange = (val: string) => {
    setCatName(val);
    if (!isCatSlugManual) {
      setCatSlug(slugify(val));
    }
    if (!catShortName) {
      setCatShortName(val.slice(0, 16));
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setIsSavingCat(true);
    try {
      await saveCategory({
        ...(editingCategory?.id ? { id: editingCategory.id } : {}),
        name: catName.trim(),
        shortName: catShortName.trim() || catName.trim(),
        slug: catSlug.trim() || slugify(catName),
        description: catDescription.trim(),
        accentColor: catAccent,
      });

      await loadAllData();
      setIsCategoryModalOpen(false);
      setStatusMessage(editingCategory ? 'Category updated!' : 'New category created!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCat = async (c: CategoryInfo) => {
    const postCount = posts.filter((p) => p.category === c.slug).length;
    if (
      confirm(
        `Are you sure you want to delete the category "${c.name}"? (${postCount} associated article(s))`
      )
    ) {
      await deleteCategory(c.slug);
      await loadAllData();
      setStatusMessage('Category removed.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Advertisement Handlers
  const openEditAdModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setAdSlot(ad.slot);
    setAdTitle(ad.title);
    setAdImageUrl(ad.image_url);
    setAdTargetUrl(ad.target_url);
    setAdSponsorName(ad.sponsor_name);
    setAdIsActive(ad.is_active);
    setIsAdModalOpen(true);
  };

  const openNewAdModalForSlot = (slotType: AdSlotType) => {
    const existing = ads.find((a) => a.slot === slotType);
    if (existing) {
      openEditAdModal(existing);
      return;
    }
    setEditingAd(null);
    setAdSlot(slotType);
    setAdTitle(
      slotType === 'leaderboard'
        ? 'DELSU Leaderboard 728x90 Banner'
        : slotType === 'sidebar'
        ? 'DELSU Sidebar 300x250 Banner'
        : 'DELSU In-Article Native Banner'
    );
    setAdImageUrl('');
    setAdTargetUrl('https://wa.me/234');
    setAdSponsorName('DELSU Campus Partner');
    setAdIsActive(true);
    setIsAdModalOpen(true);
  };

  const handleAdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAd(true);
    try {
      const url = await processImageUpload(file, 'ad');
      setAdImageUrl(url);
      setStatusMessage('Advertisement banner uploaded successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch {
      alert('Failed to upload ad image banner.');
    } finally {
      setIsUploadingAd(false);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAd(true);

    const adPayload: Advertisement = {
      id: editingAd ? editingAd.id : `ad-${adSlot}`,
      slot: adSlot,
      title: adTitle.trim() || `${adSlot.toUpperCase()} Banner Ad`,
      image_url: adImageUrl.trim(),
      target_url: adTargetUrl.trim() || 'https://wa.me/234',
      sponsor_name: adSponsorName.trim() || 'DELSU Partner',
      is_active: adIsActive,
      clicks_count: editingAd?.clicks_count || 0,
      updated_at: new Date().toISOString(),
    };

    try {
      await saveAd(adPayload);
      await loadAllData();
      setIsAdModalOpen(false);
      setStatusMessage(`Advertisement for ${adSlot} saved successfully!`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Error saving advertisement.');
    } finally {
      setIsSavingAd(false);
    }
  };

  const handleToggleAdActive = async (ad: Advertisement) => {
    try {
      const updated = {
        ...ad,
        is_active: !ad.is_active,
        updated_at: new Date().toISOString(),
      };
      await saveAd(updated);
      await loadAllData();
      setStatusMessage(`Ad "${ad.title}" set to ${!ad.is_active ? 'ACTIVE (Live)' : 'INACTIVE (Off)'}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error(err);
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
        
        {/* Top Header Card */}
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
                Publishing, Categories & Editorial Staff Management
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

            {activeTab === 'articles' ? (
              <button
                onClick={openNewPostEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </button>
            ) : activeTab === 'categories' ? (
              <button
                onClick={openNewCategoryModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            ) : (
              <button
                onClick={() => openNewAdModalForSlot('leaderboard')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload / Edit Ad</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'articles'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Articles ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'categories'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Manage Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'ads'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Ad Banners & Links ({ads.filter((a) => a.is_active).length} Active)</span>
          </button>
        </div>

        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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
              Active Categories
            </span>
            <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
              <Tags className="w-5 h-5 text-blue-500" />
              <span>{categories.length}</span>
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

        {/* ================= ARTICLES TAB ================= */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
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
                  {categories.map((c) => (
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
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status & Flags</th>
                      <th className="py-3 px-4">Published Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400">
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
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-red-100 border border-red-300 relative shrink-0">
                                {post.author_avatar ? (
                                  <Image
                                    src={post.author_avatar}
                                    alt={post.author_name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                                    {post.author_name[0]}
                                  </div>
                                )}
                              </div>
                              <span className="font-semibold text-zinc-800 text-xs">
                                {post.author_name}
                              </span>
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
                                onClick={() => handleDeleteArticle(post.id, post.title)}
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
        )}

        {/* ================= CATEGORIES TAB ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                    Category Management
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Add new categories or edit existing ones. Changes reflect across the navbar, homepage grids, and article tagging.
                  </p>
                </div>
                <button
                  onClick={openNewCategoryModal}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Category</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-500 uppercase font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4">Short Name / Badge</th>
                      <th className="py-3 px-4">URL Slug</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Articles</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {categories.map((c) => {
                      const postCount = posts.filter((p) => p.category === c.slug).length;
                      return (
                        <tr key={c.slug} className="hover:bg-red-50/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-zinc-950">
                            {c.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                              {c.shortName || c.name}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                            /category/{c.slug}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-600 max-w-xs truncate">
                            {c.description}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-zinc-700">
                            {postCount}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/category/${c.slug}`}
                                target="_blank"
                                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded"
                                title="View Category Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => openEditCategoryModal(c)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCat(c)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADS MANAGEMENT TAB ================= */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            {/* Header info banner */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 bg-red-100 text-red-600 rounded">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-black text-zinc-950 uppercase tracking-tight">
                    Campus Ad Placements & Monetization
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
                  Upload custom advertiser banners, configure destination URLs (such as WhatsApp direct message links, phone calls, or brand websites), and toggle live campaigns across DELSU Abraka Blog TV.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openNewAdModalForSlot('leaderboard')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Configure Ad Banner</span>
                </button>
              </div>
            </div>

            {/* Ad Placements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                {
                  slot: 'leaderboard' as AdSlotType,
                  title: 'Header / Top Leaderboard',
                  placement: 'Homepage Top & Category Archive headers',
                  spec: '728 × 90 px (Leaderboard)',
                  aspectClass: 'aspect-[728/90]',
                  description: 'High visibility banner seen immediately when visitors load the blog on desktop and tablet.',
                },
                {
                  slot: 'sidebar' as AdSlotType,
                  title: 'Sidebar Square Banner',
                  placement: 'Right Column beside Trending News',
                  spec: '300 × 250 px (Medium Rectangle)',
                  aspectClass: 'aspect-[300/250] max-w-[300px] mx-auto',
                  description: 'Square ad format running adjacent to the top-ranked articles and campus bulletins.',
                },
                {
                  slot: 'in-article' as AdSlotType,
                  title: 'In-Article Native Banner',
                  placement: 'Inside every published article (after paragraph 3)',
                  spec: 'Responsive (~4:1 Banner)',
                  aspectClass: 'aspect-[21/9] sm:aspect-[4/1]',
                  description: 'Engaging native horizontal banner inserted directly within the reading stream of articles.',
                },
              ].map((item) => {
                const currentAd = ads.find((a) => a.slot === item.slot);
                const isActive = currentAd?.is_active && Boolean(currentAd.image_url);

                return (
                  <div
                    key={item.slot}
                    className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    {/* Card Top */}
                    <div className="p-5 border-b border-zinc-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                          {item.spec}
                        </span>
                        {isActive ? (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Live on Site
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500 rounded-full">
                            Inactive / Fallback
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-zinc-950">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                          {item.placement}
                        </p>
                      </div>

                      {/* Visual Banner Preview */}
                      <div className="pt-1">
                        {currentAd?.image_url ? (
                          <div className={`relative w-full ${item.aspectClass} rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-inner group`}>
                            <Image
                              src={currentAd.image_url}
                              alt={currentAd.title || item.title}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-1.5 right-1.5 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <ExternalLink className="w-2.5 h-2.5 text-red-400" />
                              <span>Active Banner</span>
                            </div>
                          </div>
                        ) : (
                          <div className={`w-full ${item.aspectClass} rounded-xl border border-dashed border-red-200 bg-red-50/40 flex flex-col items-center justify-center p-4 text-center`}>
                            <ImageIcon className="w-6 h-6 text-red-400 mb-1" />
                            <span className="text-xs font-bold text-zinc-800">
                              No Custom Banner Uploaded
                            </span>
                            <span className="text-[10px] text-zinc-400 mt-0.5">
                              Default &apos;Contact Ad Desk&apos; placeholder is shown on site
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ad Details */}
                      <div className="space-y-2 pt-2 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-500 font-medium">Campaign Title:</span>
                          <span className="font-bold text-zinc-900 truncate max-w-[180px]">
                            {currentAd?.title || 'None'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-500 font-medium">Sponsor / Brand:</span>
                          <span className="font-bold text-red-600 truncate max-w-[180px]">
                            {currentAd?.sponsor_name || 'DELSU Partner'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-zinc-50">
                          <span className="text-zinc-500 font-medium">Click Destination:</span>
                          {currentAd?.target_url ? (
                            <a
                              href={currentAd.target_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[11px] text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                              title={currentAd.target_url}
                            >
                              <span className="truncate">{currentAd.target_url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-zinc-400 font-mono text-[11px]">Not set</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 bg-zinc-50 flex items-center justify-between gap-2">
                      {currentAd ? (
                        <button
                          type="button"
                          onClick={() => handleToggleAdActive(currentAd)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            currentAd.is_active
                              ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {currentAd.is_active ? 'Disable Ad' : 'Enable Ad'}
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={() => openNewAdModalForSlot(item.slot)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload & Edit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ================= ARTICLE EDITOR MODAL ================= */}
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
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto flex-1 space-y-6">
              
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
                  placeholder="e.g. DELSU Senate Approves New Academic Calendar..."
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
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image Upload & URL */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-800">
                    Cover Image
                  </label>
                  {isUploadingCover && (
                    <span className="text-xs text-red-600 font-semibold animate-pulse">
                      Uploading cover image...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* File Upload Button */}
                  <div>
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Cover from Device</span>
                    </button>
                  </div>

                  {/* Or URL input */}
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                    />
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">
                    Presets:
                  </span>
                  {COVER_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setCoverImage(p.url)}
                      className="text-[10px] px-2 py-0.5 bg-white hover:bg-red-50 hover:text-red-600 rounded border border-zinc-200 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Cover Preview */}
                {coverImage && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-zinc-200 mt-2 bg-zinc-200">
                    <Image
                      src={coverImage}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Live Cover Preview
                    </span>
                  </div>
                )}
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

              {/* STAFF / AUTHOR SECTION WITH IMAGE UPLOAD */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
                    Staff Author Details & Portrait
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Blessing Onome Okonjo"
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
                      placeholder="e.g. DELSU Campus Editor & SUG Bureau Lead"
                      className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                </div>

                {/* Staff Avatar Upload Component */}
                <div className="pt-2 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center gap-4">
                  {/* Round Avatar Preview with signature red border */}
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-red-600 shadow-md bg-white shrink-0 flex items-center justify-center">
                    {authorAvatar ? (
                      <Image
                        src={authorAvatar}
                        alt="Staff Avatar"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm font-black text-red-600">
                        {authorName ? authorName[0] : 'S'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={staffFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleStaffAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => staffFileInputRef.current?.click()}
                        disabled={isUploadingStaff}
                        className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-red-400" />
                        <span>{isUploadingStaff ? 'Uploading...' : 'Upload Staff Photo'}</span>
                      </button>

                      <span className="text-[11px] text-zinc-400">
                        Upload direct from phone/laptop or enter URL below
                      </span>
                    </div>

                    <input
                      type="text"
                      value={authorAvatar}
                      onChange={(e) => setAuthorAvatar(e.target.value)}
                      placeholder="Staff Photo URL (https://... or uploaded path)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-mono text-[11px]"
                    />
                  </div>
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

      {/* ================= CATEGORY EDITOR MODAL ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 my-8 overflow-hidden">
            
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600 text-white rounded-lg">
                  <Tags className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>

              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Category Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => handleCatNameChange(e.target.value)}
                  placeholder="e.g. Faculty of Law, DELSU SUG, or Student Gist"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Short Name (Navbar / Badge)
                  </label>
                  <input
                    type="text"
                    value={catShortName}
                    onChange={(e) => setCatShortName(e.target.value)}
                    placeholder="e.g. Law News or SUG"
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Slug (URL Path)
                  </label>
                  <input
                    type="text"
                    required
                    value={catSlug}
                    onChange={(e) => {
                      setCatSlug(e.target.value);
                      setIsCatSlugManual(true);
                    }}
                    placeholder="law-news"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 font-mono border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="What stories and updates are covered in this category?"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Accent Color Preset
                </label>
                <select
                  value={catAccent}
                  onChange={(e) => setCatAccent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  {ACCENT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCat}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingCat ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= ADVERTISEMENT EDITOR MODAL ================= */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-zinc-200 my-8 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600 text-white rounded-lg">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 uppercase tracking-tight">
                    {editingAd ? 'Edit Advertisement' : 'Upload New Ad Banner'}
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Placement: {adSlot.toUpperCase()} slot
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAdModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAd} className="p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* Ad Slot Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Ad Slot Position <span className="text-red-600">*</span>
                </label>
                <select
                  value={adSlot}
                  onChange={(e) => setAdSlot(e.target.value as AdSlotType)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-semibold"
                >
                  <option value="leaderboard">Leaderboard Header (728 × 90 px)</option>
                  <option value="sidebar">Sidebar Square (300 × 250 px)</option>
                  <option value="in-article">In-Article Native Banner (~4:1)</option>
                </select>
              </div>

              {/* Campaign Title & Sponsor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Campaign / Ad Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    placeholder="e.g. Abraka Laptop Deals"
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1">
                    Sponsor / Brand Name
                  </label>
                  <input
                    type="text"
                    value={adSponsorName}
                    onChange={(e) => setAdSponsorName(e.target.value)}
                    placeholder="e.g. MTN Nigeria or Campus Cafe"
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Banner Graphic Upload */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-zinc-800">
                    Banner Graphic Image <span className="text-red-600">*</span>
                  </label>
                  {isUploadingAd && (
                    <span className="text-xs text-red-600 font-semibold animate-pulse">
                      Uploading banner graphic...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    ref={adFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAdFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => adFileInputRef.current?.click()}
                    disabled={isUploadingAd}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Banner Image</span>
                  </button>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={adImageUrl}
                      onChange={(e) => setAdImageUrl(e.target.value)}
                      placeholder="Or paste banner image URL (/uploads/... or https://...)"
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                    />
                  </div>
                </div>

                {/* Banner Live Preview in Modal */}
                {adImageUrl ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-zinc-200 mt-2 bg-zinc-100">
                    <Image
                      src={adImageUrl}
                      alt="Ad Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Banner Preview
                    </span>
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-zinc-300 rounded-xl bg-white text-[11px] text-zinc-400">
                    Click &apos;Upload Banner Image&apos; from your computer or paste an image link above.
                  </div>
                )}
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800">
                  Click Destination URL (Target Link) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={adTargetUrl}
                    onChange={(e) => setAdTargetUrl(e.target.value)}
                    placeholder="https://wa.me/2348012345678 or https://yourbrand.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                  />
                </div>

                {/* Quick Destination Helpers */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdTargetUrl('https://wa.me/234')}
                    className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                  >
                    WhatsApp Chat Link (wa.me)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdTargetUrl('https://')}
                    className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                  >
                    Website (https://)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdTargetUrl('mailto:advertise@delsublog.ng')}
                    className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded border border-zinc-200 transition-colors"
                  >
                    Ad Desk Email (mailto:)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdTargetUrl('tel:+234')}
                    className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
                  >
                    Phone Call (tel:)
                  </button>
                </div>
              </div>

              {/* Status Switch */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    Activate Advertisement on Live Site
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    When enabled, this banner replaces the default placeholder on the website.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adIsActive}
                    onChange={(e) => setAdIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAd}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingAd ? 'Saving Banner...' : 'Save & Deploy Advertisement'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
