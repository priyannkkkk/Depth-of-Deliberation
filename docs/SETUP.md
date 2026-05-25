# Depths of Deliberation — Complete Setup & Deployment Guide

## Project Structure

```
depths-of-deliberation/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← Root layout, fonts, metadata
│   │   ├── page.tsx                      ← Homepage (SSG, revalidate 60s)
│   │   ├── story/[slug]/page.tsx         ← Story page (ISR, revalidate 300s)
│   │   ├── auth/
│   │   │   ├── page.tsx                  ← Google + Email + Magic link auth
│   │   │   └── callback/route.ts         ← OAuth callback handler
│   │   ├── admin/
│   │   │   ├── layout.tsx                ← Admin guard (server-side)
│   │   │   ├── page.tsx                  ← Dashboard with analytics
│   │   │   ├── stories/page.tsx          ← Story list
│   │   │   ├── stories/new/page.tsx      ← Create story
│   │   │   ├── stories/[id]/edit/page.tsx← Edit story
│   │   │   ├── comments/page.tsx         ← Moderate comments
│   │   │   └── subscribers/page.tsx      ← View subscribers
│   │   └── api/
│   │       ├── admin/stories/route.ts    ← GET, POST stories
│   │       ├── admin/stories/[id]/route.ts← PATCH, DELETE story
│   │       ├── contact/route.ts          ← Contact form email
│   │       ├── email/
│   │       │   └── subscribe-confirm/route.ts ← Confirm + send email
│   │       └── og/route.tsx              ← Dynamic OG image
│   ├── components/
│   │   ├── layout/   Nav, Footer, Providers
│   │   ├── home/     Hero, FeaturedGrid, MoreStories, Sections
│   │   ├── reader/   StoryReader, CommentsSection, RelatedStories
│   │   ├── admin/    StoryEditor, AdminNav, AdminSidebar
│   │   └── ui/       SearchModal, CursorGlow, ToastContainer
│   ├── lib/
│   │   ├── supabase.ts      ← Browser / Server / Admin clients
│   │   ├── store.ts         ← Zustand global state
│   │   ├── utils.ts         ← Helpers
│   │   └── queries/
│   │       ├── stories.ts   ← All story DB queries
│   │       └── interactions.ts ← Comments, reactions, ratings, bookmarks
│   ├── types/index.ts        ← All TypeScript types
│   └── styles/globals.css    ← Global CSS + Tailwind
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  ← Complete DB schema
├── middleware.ts              ← Auth session refresh + route guards
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## Step 1 — Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a name: `depths-of-deliberation`
3. Set a strong database password — save it
4. Choose region closest to your users

### 1.2 Run Database Migration
1. In Supabase dashboard → **SQL Editor**
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click **Run**
4. You should see all tables created successfully

### 1.3 Configure Google OAuth
1. Supabase Dashboard → **Authentication** → **Providers** → Google
2. Toggle **Enable**
3. Go to [console.cloud.google.com](https://console.cloud.google.com)
4. Create a new project → **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID** → Web application
6. Authorized redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret back into Supabase

### 1.4 Configure Email Auth
1. Supabase → **Authentication** → **Email Templates**
2. Customize the confirm signup email with your brand styling
3. For production, connect a custom SMTP (Resend, Postmark, etc.)

### 1.5 Set Admin Email
Run this SQL after creating your account:
```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'priyankpateliya2004@gmail.com'
);
```

### 1.6 Get API Keys
Supabase → **Settings** → **API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Resend Email Setup

1. Go to [resend.com](https://resend.com) → Sign up (free tier: 3,000 emails/month)
2. **Add a domain** (or use their test domain for development)
3. **API Keys** → Create API Key → Copy it
4. Set `RESEND_API_KEY` in your environment
5. Set `RESEND_FROM_EMAIL` to your verified sending email

---

## Step 3 — Local Development

```bash
# Clone / setup
git init
npm install

# Copy env file
cp .env.example .env.local
# Fill in all values in .env.local

# Run dev server
npm run dev

# Open http://localhost:3000
```

### First Steps After Running Locally
1. Visit `http://localhost:3000/auth` → Sign in with Google or email
2. Run the SQL above to make yourself admin
3. Visit `http://localhost:3000/admin` → Create your first story
4. Set the story status to **Published**
5. Return to homepage — your story appears automatically

---

## Step 4 — Deploy to Vercel

### 4.1 Push to GitHub
```bash
git add .
git commit -m "Initial commit — Depths of Deliberation"
git remote add origin https://github.com/yourusername/depths-of-deliberation.git
git push -u origin main
```

### 4.2 Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** → Add all from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL          = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJxxx...
SUPABASE_SERVICE_ROLE_KEY         = eyJxxx...
NEXT_PUBLIC_SITE_URL              = https://yourdomain.com
RESEND_API_KEY                    = re_xxx...
RESEND_FROM_EMAIL                 = hello@yourdomain.com
RESEND_FROM_NAME                  = Depths of Deliberation
ADMIN_EMAILS                      = priyankpateliya2004@gmail.com
```

5. Click **Deploy**

### 4.3 Custom Domain (Optional)
1. Vercel → Your project → **Domains**
2. Add your domain (e.g., `depthsofdeliberation.com`)
3. Update DNS records as shown
4. Update `NEXT_PUBLIC_SITE_URL` to your domain
5. Add your domain to Supabase → **Authentication** → **URL Configuration**

### 4.4 Update Supabase Auth URLs
Supabase → **Authentication** → **URL Configuration**:
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/auth/callback`

---

## Step 5 — Add Your Stories

### Via Admin Dashboard
1. Go to `yourdomain.com/admin`
2. Click **New Story**
3. Fill in:
   - **Title** → slug auto-generates
   - **Lesson** → the thematic subtitle
   - **Excerpt** → shown on cards (2 sentences)
   - **Body** → write in the rich text editor
   - **Tags** → pick from suggestions
   - **Featured** → toggle on for top 3 (pick Large, Medium, or Medium2)
4. Click **Publish**

### Migrating Existing Stories
You can bulk-insert stories via SQL:
```sql
INSERT INTO public.stories (slug, title, lesson, body_html, excerpt, tags, status, featured, featured_size, featured_order, accent_color, read_time)
VALUES
  ('peaceful-darkness', 'Peaceful Darkness', 'Lesson on Overcoming Fear', '...html...', '...excerpt...', ARRAY['fear','healing','darkness'], 'published', true, 'large', 1, '#1a0e0a', 7),
  ('the-desire-that-became-free', 'The Desire That Became Free', 'Lesson on Letting Go', '...html...', '...excerpt...', ARRAY['freedom','self-discovery'], 'published', true, 'medium', 2, '#0e1208', 5);
```

---

## Step 6 — SEO Strategy

### What's Already Built
- ✅ Dynamic `generateMetadata()` per story page
- ✅ OpenGraph images via `/api/og`
- ✅ JSON-LD structured data (Article schema)
- ✅ Canonical URLs
- ✅ Sitemap (add `next-sitemap` package)
- ✅ Static generation (ISR) — stories cached and fast
- ✅ Semantic HTML (`<article>`, `<main>`, `aria-label`)

### Add Sitemap
```bash
npm install next-sitemap
```

Create `next-sitemap.config.js`:
```js
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*'],
}
```

Add to `package.json` scripts:
```json
"postbuild": "next-sitemap"
```

### SEO Tips for Stories
- Write excerpts of 140-160 characters (ideal for meta descriptions)
- Use descriptive, emotional titles (they rank for long-tail searches)
- Tag stories thoroughly — tags become filterable pages
- Publish consistently — Supabase revalidation ensures Google sees new content fast

---

## Step 7 — Development Roadmap

### Phase 1 — Foundation ✅ (What we built)
- [x] Homepage with hero, featured 3, story grid
- [x] Individual story pages with ISR
- [x] Auth (Google + Email + Magic link)
- [x] Admin dashboard with story editor
- [x] Comments, reactions, ratings, bookmarks
- [x] Newsletter subscription with confirmation email
- [x] Search modal
- [x] Reading progress tracking
- [x] Dynamic OG images
- [x] Full database schema with RLS

### Phase 2 — Polish (Next steps)
- [ ] Image upload for story covers (Supabase Storage)
- [ ] Tag filter pages (`/tag/[tag]`)
- [ ] User bookmarks page
- [ ] Story collections
- [ ] Admin comment moderation page
- [ ] Admin subscriber list + newsletter send
- [ ] Reading stats charts in admin

### Phase 3 — Growth
- [ ] Related stories algorithm (improve with embeddings)
- [ ] Email newsletter when new story published
- [ ] Reader profile pages
- [ ] Story series (link stories sequentially)
- [ ] Dark/light mode toggle (already using CSS variables)

### Phase 4 — AI Features (Future-ready)
- [ ] `pgvector` extension in Supabase for embeddings
- [ ] Story similarity search (semantic)
- [ ] Mood-based recommendations
- [ ] AI-generated story summaries (OpenAI API)
- [ ] Emotion detection from reading patterns

---

## Useful Commands

```bash
# Dev
npm run dev

# Type check
npm run type-check

# Build
npm run build

# Generate Supabase types
npm run db:generate

# Lint
npm run lint
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role (server only) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your production URL |
| `RESEND_API_KEY` | ✅ | For sending emails |
| `RESEND_FROM_EMAIL` | ✅ | Verified sender email |
| `RESEND_FROM_NAME` | ✅ | Display name for emails |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin emails |

---

## Architecture Decisions

**Why Supabase?**
- Postgres + Auth + Storage + Realtime in one place
- Row Level Security means the DB enforces permissions
- Free tier is generous for a new platform

**Why Next.js App Router?**
- Server Components = pages load fast, no client JS bloat
- ISR = stories are cached as static but revalidate automatically
- Streaming = large pages render progressively

**Why Zustand?**
- Simple and tiny (1kb)
- Works perfectly for client-side state (reactions, bookmarks, toast)
- No boilerplate vs Redux

**Why TipTap?**
- Beautiful editor with full prose-mirror control
- Easy to match the dark editorial aesthetic
- Extensible for future features (mentions, custom embeds)
