# Loco — Complete Project Documentation

> Version: 0.0.0 | Stack: React 19 + Vite + Tailwind CSS v3 + Supabase + Groq AI

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Architecture](#5-architecture)
6. [Pages](#6-pages)
7. [Components](#7-components)
8. [Hooks](#8-hooks)
9. [Lib / Services](#9-lib--services)
10. [Theming & Styling](#10-theming--styling)
11. [Database Schema](#11-database-schema)
12. [PWA Support](#12-pwa-support)
13. [Routing](#13-routing)
14. [Auth Flow](#14-auth-flow)
15. [AI Integration](#15-ai-integration)
16. [Build & Deploy](#16-build--deploy)
17. [Free Tier Limits](#17-free-tier-limits)

---

## 1. Project Overview

**Loco** is a free personal productivity web app that combines:

| Feature | Description |
|---------|-------------|
| Notes | Create, tag, search, share notes with AI summarisation |
| Goals | Track goals with progress bars, due dates, AI next-steps |
| Dashboard | Weekly goals table, reminders, expense overview |
| Expenses | Monthly expense tracking (in progress) |
| Health | Health tracking module (in progress) |
| AI Chat | Multi-turn chat powered by Groq (llama-3.3-70b-versatile) |
| Drive | Google Drive browser (read-only) |

All features are **100% free** — no paid APIs required.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | 3.x |
| Auth | Supabase Auth (Google OAuth) | 2.x |
| Database | Supabase Postgres | — |
| AI | Groq API (llama-3.3-70b-versatile) | free |
| Drive | Google Drive REST API v3 | free |
| PDF Export | jsPDF + jspdf-autotable | 2.x |
| Excel Export | SheetJS (xlsx) | 0.18.x |
| Icons | Lucide React | 0.577.x |
| Router | React Router DOM | 7.x |
| PWA | manifest.json + service worker | — |
| Fonts | Lora (serif) + Nunito (sans) | Google Fonts |

---

## 3. Project Structure

```
Progress Tracker/
├── public/
│   ├── icons/
│   │   ├── icon-192.png          # PWA icon
│   │   └── icon-512.png          # PWA icon
│   ├── favicon.svg
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
│
├── src/
│   ├── assets/                   # Static images
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx        # Reusable button component
│   │   │   ├── Card.jsx          # Card wrapper
│   │   │   ├── SearchBar.jsx     # Search input
│   │   │   └── Sheet.jsx         # Bottom sheet / modal
│   │   ├── AuthScreen.jsx        # Login page UI
│   │   └── Layout.jsx            # App shell (top bar + bottom nav)
│   │
│   ├── hooks/
│   │   ├── useAuth.js            # Auth state + Google sign-in
│   │   ├── useDarkMode.js        # Dark/light mode toggle
│   │   ├── useExpenses.js        # Expense CRUD
│   │   ├── useGoals.js           # Goals CRUD + progress
│   │   ├── useNotes.js           # Notes CRUD + sharing
│   │   ├── useReminders.js       # Reminders CRUD
│   │   └── useWeeklyGoals.js     # Weekly goals table data
│   │
│   ├── lib/
│   │   ├── groq.js               # Groq AI API calls
│   │   └── supabase.js           # Supabase client init
│   │
│   ├── pages/
│   │   ├── AI.jsx                # AI chat page
│   │   ├── Dashboard.jsx         # Dashboard (expenses, reminders, weekly goals)
│   │   ├── Drive.jsx             # Google Drive browser
│   │   ├── Expenses.jsx          # Expenses page (stub)
│   │   ├── Goals.jsx             # Goals tracker
│   │   ├── Health.jsx            # Health tracker (stub)
│   │   └── Notes.jsx             # Notes page
│   │
│   ├── App.jsx                   # Root component + routing
│   ├── index.css                 # Tailwind base + component classes
│   └── main.jsx                  # React DOM entry point
│
├── .env.local                    # Environment variables (not committed)
├── supabase_schema.sql           # Database schema to run in Supabase
├── tailwind.config.js            # Theme tokens + dark mode config
├── vite.config.js                # Vite + polling watcher config
└── package.json
```

---

## 4. Environment Setup

### Required `.env.local`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Groq API Key (in-app)

The Groq key is **not** stored in `.env`. Users paste it inside the app:
- Navigate to **AI** tab → paste key → saved to `localStorage` as `loco_groq_key`
- Never sent to any server other than Groq directly

### Google OAuth

Set up in Google Cloud Console:
1. Create OAuth 2.0 Client ID
2. Authorised redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:5173`
3. Enable **Google Drive API**
4. Add Client ID + Secret to Supabase → Authentication → Google provider

---

## 5. Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│  ┌──────────┐    ┌────────────────────────┐  │
│  │ AuthScreen│    │       App Shell        │  │
│  │ (login)  │    │  Layout (TopBar +       │  │
│  └──────────┘    │   BottomNav)            │  │
│                  │                         │  │
│                  │  ┌─────────────────┐    │  │
│                  │  │     Pages       │    │  │
│                  │  │ Dashboard       │    │  │
│                  │  │ Notes           │    │  │
│                  │  │ Goals           │    │  │
│                  │  │ AI              │    │  │
│                  │  │ Drive           │    │  │
│                  │  └─────────────────┘    │  │
│                  └────────────────────────┘  │
└─────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
  ┌─────────────┐      ┌─────────────┐
  │  Supabase   │      │  Groq API   │
  │  - Auth     │      │  - Chat     │
  │  - Postgres │      │  - Summarise│
  │  - RLS      │      │  - Steps    │
  └─────────────┘      └─────────────┘
```

### Data Flow

1. App loads → `useAuth` checks Supabase session
2. No session → `AuthScreen` shown → Google OAuth redirect
3. Session found → `AppInner` renders with `Layout`
4. Each page uses its own hook (e.g. `useNotes`) to fetch/mutate Supabase data
5. AI features call Groq directly from the browser using the user's key

---

## 6. Pages

### `/dashboard` — Dashboard
- Monthly expense summary card
- Reminders card (day / week / month filter)
- Weekly goals table with day-by-day progress inputs
- Export to Excel (xlsx) or PDF (jsPDF)
- Toggle between weekly goals and reminders list

### `/notes` — Notes
- Grid layout (1 col mobile → 2 col tablet → 3 col desktop)
- Tag filter: personal, work, ideas, learning, health
- Search by title or body
- Per-note: AI summarise, share (public link), delete
- Add note via bottom sheet

### `/goals` — Goals
- Stats row: total, completed, avg progress %
- Status filter: all, active, done, paused
- Per-goal: progress bar, update input, AI next-steps, pause/resume, delete
- Add goal via bottom sheet

### `/ai` — AI Assistant
- Requires Groq API key (stored in localStorage)
- Multi-turn chat with full context of user's notes + goals
- Quick action buttons for common prompts
- Settings icon to change API key
- Clear chat button

### `/drive` — Google Drive
- Read-only browser of user's Google Drive files
- Uses Google Drive REST API v3 with OAuth token from Supabase session

### `/expenses` — Expenses *(stub)*
- Placeholder — coming soon

### `/health` — Health *(stub)*
- Placeholder — coming soon

---

## 7. Components

### `Layout.jsx`
The app shell rendered for all authenticated pages.

- **TopBar** — Logo, dark mode toggle, sign out, avatar
- **BottomNav** — Fixed bottom bar with pill-style active tabs
  - Main items: Dashboard, Notes, Goals, Expenses
  - More menu (⋮): Health
  - Avatar button → sign out
- **FloatingSidebar** (commented out) — toggleable left sidebar

### `AuthScreen.jsx`
Two-panel login screen:
- Left: branding, feature list, gradient background
- Right: Google sign-in button

### `Sheet.jsx`
Bottom sheet / modal used for all add/edit forms.
- Slides up from bottom on mobile
- Centered modal on desktop (`sm:items-center`)
- Closes on backdrop click or Escape key
- Locks body scroll when open

### `Button.jsx`
Variants: `primary`, `ghost`, `accent`

### `SearchBar.jsx`
Controlled search input with magnifier icon.

### `Card.jsx`
Wrapper applying `.card` class (border, shadow, rounded).

---

## 8. Hooks

### `useAuth.js`
```
Returns: { user, session, loading, isDemoMode, signInWithGoogle, signOut, enterDemoMode }
```
- Auto-detects missing Supabase config → enters demo mode
- Listens to `onAuthStateChange` for real-time session updates
- Proper error handling on `getSession()`

### `useDarkMode.js`
```
Returns: { isDark, toggle }
```
- Persists to `localStorage` as `loco_dark_mode`
- Defaults to **dark mode**
- Adds/removes `dark` class on `document.documentElement`

### `useNotes.js`
```
Returns: { notes, loading, addNote, deleteNote, shareNote, unshareNote }
```
- Fetches from `notes` table filtered by `user_id`
- Share generates a `share_token` UUID and sets `is_public = true`

### `useGoals.js`
```
Returns: { goals, loading, addGoal, updateGoalProgress, updateGoalStatus, deleteGoal }
```
- Auto-marks goal as `done` when `progress >= target`

### `useExpenses.js`
```
Returns: { expenses, addExpense, deleteExpense, getMonthTotal }
```
- Stored in `localStorage` (no Supabase table yet)

### `useReminders.js`
```
Returns: { reminders, addReminder, toggleDone, deleteReminder }
```
- Stored in `localStorage`

### `useWeeklyGoals.js`
```
Returns: { weeklyGoals, addWeeklyGoal, updateProgress, deleteWeeklyGoal, getWeekDates }
```
- Stored in `localStorage`
- `getWeekDates()` returns array of 7 ISO date strings for current Mon–Sun

---

## 9. Lib / Services

### `supabase.js`
Initialises Supabase client from env vars. Falls back to placeholder values (triggers demo mode).

### `groq.js`

| Function | Description |
|----------|-------------|
| `chat({ apiKey, systemPrompt, messages })` | Core multi-turn chat |
| `summariseNote({ apiKey, note })` | 2–3 sentence note summary |
| `suggestGoalSteps({ apiKey, goal })` | 3–5 numbered next steps |
| `buildSystemPrompt({ user, notes, goals })` | Builds context-aware system prompt |

Model: `llama-3.3-70b-versatile` | Max tokens: `1024` | Endpoint: `https://api.groq.com/openai/v1/chat/completions`

---

## 10. Theming & Styling

### Current Theme: Grok Dark

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#FF3B3B` | Buttons, active states, highlights |
| `accent` | `#FF3B3B` | Secondary accent |
| `bg.dark` | `#000000` | Page background |
| `surface.dark` | `#0D0D0D` | Cards, panels |
| `border.dark` | `#1A1A1A` | Borders |
| `text.dark` | `#FFFFFF` | Body text |
| `muted.dark` | `#666666` | Secondary text |

### Dark Mode
- Controlled via `dark` class on `<html>`
- All components use `dark:` variants
- Default: **dark mode on**

### Fonts
- **Serif** (headings): Lora
- **Sans** (body): Nunito

### Component Classes (index.css)
```
.card          — surface card with border + shadow
.btn-primary   — filled primary button
.btn-ghost     — outlined ghost button
.btn-accent    — accent coloured button
.btn-icon      — square icon button
.input         — text input
.textarea      — multiline input
.tag           — pill badge
.sidebar-link  — sidebar nav item
.progress-track / .progress-fill — progress bar
.typing-dot    — AI typing animation dot
```

---

## 11. Database Schema

Run `supabase_schema.sql` in Supabase SQL Editor.

### Tables

#### `notes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| user_id | uuid FK | auth.users |
| title | text | required |
| body | text | optional |
| tag | text | personal/work/ideas/learning/health |
| is_public | boolean | default false |
| share_token | uuid | generated on share |
| created_at | timestamptz | auto |
| updated_at | timestamptz | auto |

#### `goals`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| user_id | uuid FK | auth.users |
| title | text | required |
| target | numeric | required |
| progress | numeric | default 0 |
| unit | text | %, km, books… |
| status | text | active/done/paused |
| due | date | optional |
| created_at | timestamptz | auto |

### Row Level Security (RLS)
All tables have RLS enabled — users can only read/write their own rows.

---

## 12. PWA Support

| File | Purpose |
|------|---------|
| `public/manifest.json` | App name, icons, theme colour, display mode |
| `public/sw.js` | Service worker for offline caching |
| `public/icons/icon-192.png` | Home screen icon (192×192) |
| `public/icons/icon-512.png` | Splash screen icon (512×512) |

Install prompt appears automatically on mobile browsers that support PWA.

---

## 13. Routing

| Path | Component | Description |
|------|-----------|-------------|
| `/` | → `/dashboard` | Redirect |
| `/dashboard` | `Dashboard` | Main dashboard |
| `/notes` | `Notes` | Notes page |
| `/goals` | `Goals` | Goals tracker |
| `/expenses` | `Expenses` | Expenses (stub) |
| `/health` | `Health` | Health (stub) |
| `*` | → `/dashboard` | 404 fallback |

Router: React Router DOM v7 (`BrowserRouter`)

---

## 14. Auth Flow

```
App loads
   │
   ├─ loading = true → LoadingScreen
   │
   ├─ No Supabase config → Demo mode (DEMO_USER)
   │
   ├─ No session → AuthScreen
   │      │
   │      └─ Click "Continue with Google"
   │             │
   │             └─ supabase.auth.signInWithOAuth({ provider: 'google' })
   │                    │
   │                    └─ Redirect → Google → Supabase callback → App
   │
   └─ Session found → AppInner renders
          │
          └─ onAuthStateChange keeps session in sync
```

Google OAuth scopes requested:
- `https://www.googleapis.com/auth/drive.readonly` (for Drive page)

---

## 15. AI Integration

### How it works

1. User pastes Groq API key in the AI tab
2. Key saved to `localStorage` as `loco_groq_key`
3. On each message, `buildSystemPrompt()` injects:
   - User's name
   - Last 20 notes (title + 120 char preview)
   - All goals (title, progress, status, due date)
4. Last 10 messages sent as context window
5. Response streamed back and displayed

### AI Features by Page

| Page | Feature | Function |
|------|---------|----------|
| AI tab | Multi-turn chat | `chat()` |
| Notes | Summarise note | `summariseNote()` |
| Goals | Suggest next steps | `suggestGoalSteps()` |

---

## 16. Build & Deploy

### Local Development
```bash
npm install
npm run dev
# → http://localhost:5173
```

### Production Build
```bash
npm run build
# Output: dist/
```

### Deploy to Vercel
```bash
npx vercel
```
Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Clear Vite Cache (if styles don't update)
```cmd
rmdir /s /q node_modules\.vite
npm run dev
```

---

## 17. Free Tier Limits

| Service | Free Allowance |
|---------|---------------|
| Supabase | 500MB DB, 2GB bandwidth, 50MB file storage |
| Groq | ~14,400 req/day on llama-3.3-70b-versatile |
| Google Drive API | 1 billion requests/day |
| Vercel | 100GB bandwidth, unlimited deployments |

---

## Roadmap

- [x] Phase 1 — Auth · Layout · Notes · Goals · AI Chat
- [x] Phase 2 — Dashboard · Weekly Goals · Reminders · Export (PDF/Excel)
- [ ] Phase 3 — Expenses page · Health page · Drive page · PWA offline · Push reminders · Share links

---

*Generated: March 2026 | Project: Loco Personal Productivity App*
