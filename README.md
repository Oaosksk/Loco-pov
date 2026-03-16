# Loco — Personal Productivity App

> Notes · Goals · Google Drive · AI Assistant — all free, all in one place.

## ✨ Features

| Module | What it does |
|--------|-------------|
| **Notes** | Create, tag, search, share notes. AI summarise per note. |
| **Goals** | Track goals with progress bars, due dates, status. AI next-steps. |
| **Drive** | Browse your Google Drive (read-only, no extra key needed). |
| **AI** | Multi-turn chat (Groq — free), context-aware via your notes & goals. |

---

## 🚀 Quick Start

### 1. Clone / open the project

```bash
cd "O:\Personal POV\Progress Tracker"
npm install
```

### 2. Set up Supabase (free tier)

1. Go to [supabase.com](https://supabase.com) → New project
2. In **SQL Editor**, paste and run the contents of `supabase_schema.sql`
3. In **Authentication → Providers**, enable **Google** and add your OAuth credentials  
4. Add your Vercel/localhost URL to **Auth → URL Configuration → Redirect URLs**

### 3. Configure environment variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Add Groq API key (in-app)

1. Get a **free** key at [console.groq.com](https://console.groq.com)
2. Open the app → **AI** tab → paste your key

### 5. Run locally

```bash
npm run dev
```

---

## 🔑 Google OAuth + Drive Setup

In Google Cloud Console:
1. Create a project → OAuth 2.0 Client ID
2. Authorised redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:5173`
3. Enable **Google Drive API**
4. Add Client ID + Secret to Supabase → Authentication → Google provider

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase Postgres |
| AI | Groq API (llama-3.3-70b-versatile) — free |
| Drive | Google Drive REST API v3 |
| PWA | manifest.json + service worker |
| Fonts | Lora + Nunito — Google Fonts |

---

## 🌐 Deploy to Vercel

```bash
npm run build
npx vercel
```

Add env vars in Vercel dashboard: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 🗺️ Build Roadmap

- [x] **Phase 1** — Scaffold · Auth · Layout · Notes · Goals
- [ ] **Phase 2** — Drive · full AI chat · Groq integration
- [ ] **Phase 3** — PWA · Offline · Push reminders · Share links · Vercel deploy

---

## 🆓 Free Tier Limits

| Service | Free allowance |
|---------|---------------|
| Supabase | 500MB DB, 2GB bandwidth |
| Groq | ~14,400 req/day on llama-3.3-70b-versatile |
| Google Drive API | 1B requests/day |
| Vercel | 100GB bandwidth, unlimited deployments |
