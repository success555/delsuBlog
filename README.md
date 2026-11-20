# Delsu Abraka Blog (Delsu Abraka Update Blog TV)

A production-ready Nigerian digital media and editorial blog web application built for the **Delta State University (DELSU), Abraka** student and alumni community, as well as the broader Nigerian youth demography.

Inspired by top-tier modern African digital publications like *TechCabal* and *Zikoko*, tailored specifically to Delta State University with an authoritative **Red & White** visual identity.

---

## 🎨 Visual Identity & Brand System
- **Colors:** Crisp White (`#FFFFFF`) with bold Crimson Red (`#DC2626` / `#EF4444`), deep Charcoal text (`#111827`), and subtle slate borders.
- **Logo:** Features the official *Delsu Abraka Update Blog TV* broadcast microphone emblem in the navigation bar, mobile drawer, footer, and Open Graph previews.
- **Low-Bandwidth "Lite Mode" (Data Saver):** Designed specifically for Nigerian cellular networks. One-click toggle in the top ticker strips heavy images, suppresses non-essential embeds, and saves up to 80% mobile data for readers in Abraka and across the country.

---

## 🚀 Key Features
1. **Homepage (`/`):**
   - **Top Ticker:** Breaking News live bulletin ticker + West Africa Time (WAT: `Africa/Lagos`) live digital clock + Lite Mode toggle.
   - **Sticky Navigation:** Official logo, search modal with quick hashtag chips (`Ctrl+K`), and navigation links for DELSU and Nigerian categories:
     - *DELSU Updates*
     - *Naija News & Politics*
     - *Tech & Startups*
     - *Afrobeats & Entertainment*
     - *Business & Economy*
     - *Japa & Diaspora*
     - *Super Eagles & Sports*
   - **Hero Grid:** 1 prominent lead cover story with badge, author, and timestamp + 3 secondary trending cards.
   - **Category Card Grids:** High-legibility sections with read times and author credentials.
   - **"Trending in Nigeria & DELSU" Sidebar:** Ranked top 5 most-read articles + DELSU campus emergency hotlines (Security, Health Clinic, Student Affairs).
   - **Ad Slots:** Standard responsive ad containers (`728x90` Leaderboard, In-Article Banner, `300x250` Sidebar).
   - **High-Converting Newsletter:** Instant WhatsApp Channel button + weekly email digest subscription form.

2. **Article Page (`/blog/[slug]`):**
   - High-legibility editorial typography (Georgia/Merriweather serif body with modern sans-serif headings).
   - Reading time estimation (e.g. `4 min read`).
   - WAT publication timestamp with live formatting.
   - **Social Share Bar:** High-priority **WhatsApp** direct share (`api.whatsapp.com/send`), **X (Twitter)**, **Facebook**, and **Copy Link** with instant visual feedback.
   - **In-Article Engagement:** Automatic "READ ALSO" related-post callout injected after the 3rd paragraph.
   - **Author Bio Card:** Accredited press council badge, role, and avatar.
   - **Guest Commenting System:** Real-time nested comments and replies without forced user login.

3. **Admin CMS Dashboard (`/admin`):**
   - Protected behind passcode authentication (Default passcode: `delsu2026`).
   - Post manager: Create, edit, and delete articles with live slug generator, category selector, image presets, rich text editor, featured story toggle, sponsored content toggle, trending flag, and draft/published state.
   - Dynamic metrics: Total articles, published count, drafts count, total page reads.

4. **SEO & Social Cards:**
   - Dynamic Next.js App Router `generateMetadata` for each post with Open Graph tags for WhatsApp and X link previews.
   - Dynamic `sitemap.ts` and `robots.ts`.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL) with transparent local offline mock-data fallback

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Admin CMS Access
Visit [http://localhost:3000/admin](http://localhost:3000/admin) and enter the passcode:
`delsu2026`

---

## 🗄️ Supabase Database Integration (Optional)
The app runs immediately out of the box with realistic seed data and local browser synchronization. When you are ready to connect a live Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and execute the SQL queries from `schema.sql`.
3. In your `.env.local` file, add your project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=delsu2026
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
4. Restart your development server. The application will automatically stream all queries and guest comments to your live PostgreSQL database.

---

## 🚢 Production Build Verification
To test and verify a production build:
```bash
npm run build
npm start
```

