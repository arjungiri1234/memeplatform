# memeit 

> A multilingual AI meme generator and social feed platform.
> Create, share, and discover memes in English, नेपाली, हिन्दी, Русский, and 中文.


---

## What is memeit?

memeit is a full-stack web application that lets users generate memes in their own language using AI. Unlike existing platforms like 9GAG or Imgflip which are English-first, memeit is built for multilingual audiences — particularly South Asian and non-English speaking internet cultures that are massively underserved by current meme tools.

**The core flow:**
1. Pick a template or upload your own image
2. Type a prompt in any language — AI generates an image and captions in the same language
3. Style text on a canvas editor — drag, resize, add stickers
4. Publish to the community feed
5. Share to WhatsApp, Telegram, Facebook, Twitter/X

---

## Features

- **AI meme generation** — type a prompt in any language, Gemini generates an image and 3 captions
- **Multilingual captions** — English, Nepali, Hindi, Russian, Chinese supported natively
- **Canvas editor** — built with Konva.js — drag and resize text, emoji stickers, background color picker, export as high-quality PNG
- **Template library** — 20+ curated classic meme templates with category filtering and search
- **Community feed** — chronological feed with language filtering and load more pagination
- **User profiles** — view your memes, delete memes, edit username and avatar
- **Share system** — copy link, WhatsApp, Facebook, Twitter/X, Telegram
- **Authentication** — Google OAuth + email/password via Supabase Auth
- **Toast notifications** — react-hot-toast for user feedback on all actions
- **Animations** — Framer Motion + GSAP for hero animations, scroll reveals, micro-interactions
- **Mobile responsive** — tested on multiple mobile devices 

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| TypeScript (strict) | Type safety throughout — zero `any` |
| TailwindCSS | Utility-first styling |
| react-router-dom v6 | Client-side routing |
| Zustand | Lightweight global state management |
| Konva.js + react-konva | Canvas editor — image layers, text layers, drag + resize |
| react-i18next + i18next | Multilingual UI — 5 languages |
| Framer Motion | Component animations, page transitions, micro-interactions |
| GSAP | Complex timeline animations — hero card stack, marquee strip |
| react-hot-toast | Toast notifications for user actions |
| use-image | Image loading hook for Konva canvas |

### Backend

| Technology | Purpose |
|---|---|
| Supabase Edge Functions | Serverless API endpoints |
| Deno (TypeScript) | Runtime for Edge Functions — no Node.js required |
| Supabase PostgreSQL | Primary relational database |
| Supabase Auth | Authentication — Google OAuth + email/password |
| Supabase Storage | CDN image storage — memes, avatars, templates |
| Row Level Security (RLS) | Database-level authorization on all tables |
| Google Gemini 2.5 Flash | AI image generation + multilingual caption writing |
| Resend | Transactional email — confirmation and password reset |

### Tooling

| Tool | Purpose |
|---|---|
| CodeRabbit | Automated AI code review on every PR |
| Git + GitHub | Version control with feature branch workflow |

---

## Project Structure

```
MEME P/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Base design system components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── MemeCard.tsx
│   │   │   ├── MemeEditor.tsx       # Konva canvas editor
│   │   │   ├── EditorToolbar.tsx    # Text styling tools
│   │   │   ├── StickerPanel.tsx     # Emoji sticker picker
│   │   │   ├── CaptionSelector.tsx  # AI caption selection UI
│   │   │   ├── ShareDropdown.tsx    # Share options dropdown
│   │   │   ├── EditProfileModal.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Navbar.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Landing page + feed
│   │   │   ├── TemplatePickerPage.tsx
│   │   │   ├── EditorPage.tsx       # Canvas editor page
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MemePage.tsx         # Single meme + share target
│   │   │   └── AuthCallbackPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useFeed.ts
│   │   │   ├── useMemeGeneration.ts
│   │   │   ├── useUpload.ts
│   │   │   ├── useTemplates.ts
│   │   │   ├── useProfile.ts
│   │   │   ├── usePublish.ts
│   │   │   ├── useShare.ts
│   │   │   └── useLocale.ts
│   │   ├── lib/
│   │   │   ├── supabaseClient.ts    # All DB + storage functions
│   │   │   ├── types.ts             # Shared TypeScript interfaces
│   │   │   ├── constants.ts         # Languages, routes, config
│   │   │   ├── fileValidation.ts    # File type + size validation
│   │   │   ├── shareUtils.ts        # Share URL builders
│   │   │   └── ai/
│   │   │       ├── provider.ts      # AI_PROVIDER env var router
│   │   │       └── gemini.ts        # Gemini implementation
│   │   ├── stores/
│   │   │   ├── authStore.ts         # Zustand auth state
│   │   │   └── memeStore.ts         # Zustand canvas editor state
│   │   └── i18n/
│   │       ├── index.ts             # react-i18next config
│   │       ├── en.json              # English
│   │       ├── ne.json              # नेपाली
│   │       ├── hi.json              # हिन्दी
│   │       ├── ru.json              # Русский
│   │       └── zh.json              # 中文
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                         # Supabase Edge Functions (Deno)
│   ├── functions/
│   │   ├── generate-meme/
│   │   │   └── index.ts             # Gemini image + caption generation
│   │   └── get-feed/
│   │       └── index.ts             # Paginated feed with language filter
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── provider.ts          # Routes by AI_PROVIDER env var
│   │   │   └── gemini.ts            # Gemini API calls
│   │   ├── cors.ts                  # Shared CORS headers
│   │   └── types.ts                 # Shared types (matches frontend)
│   ├── deno.json
│   └── .env.example
│
└── supabase/                        # Database configuration
    ├── migrations/
    │   ├── 001_profiles.sql
    │   ├── 002_templates.sql
    │   ├── 003_memes.sql
    │   ├── 004_rls.sql
    │   └── 005_triggers.sql         # handle_new_user trigger
    ├── seed/
    │   └── templates.sql            # 20+ starter meme templates
    └── storage/
        └── buckets.sql              # Bucket creation + RLS policies
```

---

## Architecture

![memeit architecture](docs/images/Memeit%20Architecture.png)

```
Browser (React components)
  ↓ calls only
Custom hooks (src/hooks/)
  ↓ calls only
Library layer (src/lib/)
  ↓ calls only
Supabase Edge Functions (Deno)
  ↓ calls only
External services (Gemini API / Supabase DB / Storage)
```

**Core rule:** Components never call Supabase or AI APIs directly. Everything flows through the layered architecture above. Swapping any backend service only requires changing one file.

---

## Database Schema

```sql
-- User profiles (extends Supabase auth.users)
profiles (
  id          uuid PK references auth.users,
  username    text unique not null,
  avatar_url  text,
  locale      text default 'en',
  created_at  timestamptz
)

-- Curated meme templates (admin seeded)
templates (
  id          uuid PK,
  name        text not null,
  image_url   text not null,
  category    text,   -- 'reaction' | 'animal' | 'text' | 'custom'
  created_at  timestamptz
)

-- User-created memes
memes (
  id          uuid PK,
  user_id     uuid FK → profiles.id ON DELETE CASCADE,
  template_id uuid FK → templates.id nullable,
  title       text,
  image_url   text not null,
  language    text,   -- 'en' | 'ne' | 'hi' | 'ru' | 'zh'
  view_count  int default 0,
  created_at  timestamptz
)
```

RLS is enabled on all tables. Write operations are enforced at the database level using `auth.uid()` checks — not just the application layer.

---

## Edge Functions (Deno)

### POST `/functions/v1/generate-meme`

Requires authentication. Generates a meme from a text prompt.

```typescript
// Input
{ userPrompt: string, language: string }

// Output
{ imageUrl: string, captions: string[], imagePrompt: string }
```

**Flow:**
1. Verifies JWT from Authorization header
2. Single Gemini call — translates prompt to English + generates 3 captions in original language
3. Gemini generates image from English prompt
4. Image uploaded to Supabase Storage under `generated/{userId}/{timestamp}.png`
5. Returns public CDN URL + captions array

### GET `/functions/v1/get-feed`

Public endpoint. Returns paginated memes with profile data.

```
?cursor=<iso_timestamp>   cursor-based pagination
?limit=20                 default 20, max 50
?language=ne              optional language filter
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase CLI
- Supabase account (free tier works)
- Google AI Studio account (free Gemini API key)

### 1. Clone the repo
```bash
git clone https://github.com/arjungiri1234/memeplatform.git
cd memeplatform
```

### 2. Install frontend dependencies
```bash
cd frontend
npm install
```

### 3. Set up environment variables
```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Fill in `frontend/.env.local`:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Fill in `backend/.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get your free Gemini API key at `aistudio.google.com`

### 4. Run database migrations
```bash
cd supabase
supabase db push
```

### 5. Seed template data
```bash
supabase db seed
```

### 6. Configure Google OAuth

In Supabase dashboard → Authentication → Providers → Google:
- Enable Google provider
- Add your Google OAuth Client ID and Secret
- Get credentials from `console.cloud.google.com`

Add authorized redirect URI in Google Cloud Console:
```
https://your-project-ref.supabase.co/auth/v1/callback
```

### 7. Deploy Edge Functions
```bash
supabase functions deploy generate-meme
supabase functions deploy get-feed
```

Add secrets in Supabase dashboard → Edge Functions → Secrets.

### 8. Start the frontend
```bash
cd frontend
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase public anon key |
| `GEMINI_API_KEY` | backend only | Google Gemini API key |
| `AI_PROVIDER` | backend only | Set to `gemini` |
| `SUPABASE_URL` | backend only | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | backend only | Supabase service role key |
| `SUPABASE_ANON_KEY` | backend only | Supabase anon key |

⚠️ `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never appear in frontend code or `VITE_` prefixed variables. Both are server-side only.

---

## Canvas Editor

The meme editor is built with Konva.js and react-konva.

**Canvas layers (bottom to top):**
1. Background layer — solid color fill or loaded image (template/AI-generated/uploaded)
2. Text layer — draggable, resizable Konva.Text objects with Transformer handles
3. UI layer — non-exportable selection indicators

**Text features:**
- Drag anywhere on canvas
- Resize with transformer handles
- Double-click to edit text inline
- Font picker: Impact, Arial, Georgia, Courier New, Comic Sans
- Color swatches: white, black, yellow, red, cyan, purple
- Stroke (outline) toggle for classic meme style
- Font size controls (12–120px)

**Sticker panel:**
- 50+ emoji stickers in 5 categories: Reactions, Fire/Hype, Animals, Gestures, Food
- Each sticker added as a draggable Konva.Text node

**Export:**
```typescript
stage.toDataURL({ pixelRatio: 2 })
// Exports at 2x resolution for high quality PNG output
```

---

## Supported Languages

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `ne` | Nepali | Devanagari — नेपाली |
| `hi` | Hindi | Devanagari — हिन्दी |
| `ru` | Russian | Cyrillic — Русский |
| `zh` | Chinese | Simplified — 中文 |

Language preference saved to `profiles.locale` for logged-in users and `localStorage` for guests.

---


## Author

Built by **[Arjun Giri]** 

- GitHub: [@arjungiri1234](https://github.com/arjungiri1234) 


---

*Built with React, Vite, Supabase, Deno, and Google Gemini.*
*Designed for every culture, every language.*
