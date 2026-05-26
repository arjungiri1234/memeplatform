# CLAUDE.md — Meme Platform

## What this project is
A multilingual AI meme generator and social feed platform.
Users type a prompt in any language (English, Nepali, Hindi,
Russian, Chinese), get an AI-generated image + captions, style
text on a canvas editor, and publish to a community feed.
Think 9GAG but with built-in AI creation for non-English cultures.

Solo project. Phase 1 MVP only. See "Out of scope" before building
anything not listed here.

---

## Architecture

### Layered structure — strict, never skip layers

```
Browser (React components)
  ↓ call only
Custom hooks (src/hooks/)
  ↓ call only
Library layer (src/lib/)        ← supabaseClient.ts, ai/provider.ts
  ↓ call only
Supabase Edge Functions          ← server-side logic lives here
  ↓ call only
External services               ← Gemini, Replicate, Claude API
```

**Rule: a component never calls Supabase or any AI API directly.
It calls a hook. The hook calls lib/. Lib calls the Edge Function.**

This means:
- Swapping Supabase for another DB = change lib/ only
- Swapping Gemini for Claude = change ai/provider.ts only
- Frontend never breaks when backend changes

### Request flow examples

**User generates a meme (Flow B):**
```
MemeEditor component
  → useMemeGeneration hook
    → lib/ai/provider.ts generateMemeAI()
      → POST /functions/v1/generate-meme
        → Gemini: translate prompt to English
        → Promise.all([
            Gemini image generation,
            Gemini caption generation (in original language)
          ])
        → Upload image to Supabase Storage
        → Return { imageUrl, captions }
```

**User loads the feed:**
```
FeedPage component
  → useFeed hook
    → lib/supabaseClient.ts getFeed(cursor)
      → GET /functions/v1/get-feed?cursor=&limit=20
        → SELECT memes JOIN profiles ORDER BY created_at DESC
        → Return { memes: MemeWithProfile[], nextCursor }
```

**User signs in:**
```
LoginPage component
  → useAuth hook
    → lib/supabaseClient.ts signInWithGoogle()
      → Supabase Auth (Google OAuth)
        → handle_new_user trigger fires
          → INSERT INTO profiles (id, username, locale)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript (strict) |
| Styling | TailwindCSS — no custom CSS files |
| Routing | react-router-dom v6 |
| State | Zustand — authStore + memeStore only |
| Canvas | Konva.js + react-konva |
| i18n | react-i18next |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| AI (dev) | Google Gemini 2.5 Flash — image + captions |
| AI (prod) | Claude Haiku (captions) + Replicate FLUX (images) |
| AI router | AI_PROVIDER env var → src/lib/ai/provider.ts |

---

## Project structure

```
├── CLAUDE.md
├── SKILLS.md
├── .env.example
├── .env.local               ← never commit
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
│
├── src/
│   ├── main.tsx
│   ├── App.tsx              ← router setup only
│   │
│   ├── components/          ← reusable, no page logic
│   │   ├── ui/              ← Button, Input, Card, Avatar, Badge
│   │   ├── MemeCard.tsx     ← feed card component
│   │   ├── MemeEditor.tsx   ← Konva canvas wrapper
│   │   ├── TemplatePicker.tsx
│   │   ├── LangPicker.tsx
│   │   └── Navbar.tsx
│   │
│   ├── pages/               ← route-level, thin — logic in hooks
│   │   ├── HomePage.tsx     ← feed
│   │   ├── CreatePage.tsx   ← template picker + AI generate entry
│   │   ├── EditorPage.tsx   ← Konva canvas editor
│   │   ├── ProfilePage.tsx
│   │   └── LoginPage.tsx
│   │
│   ├── hooks/               ← all async logic lives here
│   │   ├── useAuth.ts
│   │   ├── useFeed.ts
│   │   ├── useMemeGeneration.ts
│   │   ├── useUpload.ts
│   │   ├── useTemplates.ts
│   │   └── useLocale.ts
│   │
│   ├── lib/
│   │   ├── supabaseClient.ts  ← typed client + all DB functions
│   │   ├── types.ts           ← all shared TypeScript types
│   │   ├── constants.ts       ← LANGUAGES, ROUTES, config
│   │   └── ai/
│   │       ├── provider.ts    ← reads AI_PROVIDER, routes calls
│   │       ├── gemini.ts      ← Gemini implementation (dev)
│   │       └── production.ts  ← Claude + Replicate (Phase 3)
│   │
│   ├── stores/
│   │   ├── authStore.ts       ← user session, profile
│   │   └── memeStore.ts       ← editor state, generated content
│   │
│   └── i18n/
│       ├── index.ts           ← react-i18next config
│       ├── en.json
│       ├── ne.json            ← नेपाली
│       ├── hi.json            ← हिन्दी
│       ├── ru.json            ← Русский
│       └── zh.json            ← 中文
│
└── supabase/
    ├── migrations/
    │   ├── 001_profiles.sql
    │   ├── 002_templates.sql
    │   ├── 003_memes.sql
    │   ├── 004_rls.sql
    │   └── 005_triggers.sql
    └── functions/
        ├── generate-meme/
        │   └── index.ts
        └── get-feed/
            └── index.ts
```

---

## Database schema

### profiles
```sql
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text unique not null,
  avatar_url  text,
  locale      text not null default 'en',
  created_at  timestamptz not null default now()
);
```

### templates
```sql
create table templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  image_url   text not null,
  category    text,           -- 'reaction' | 'animal' | 'text' | 'custom'
  created_at  timestamptz not null default now()
);
```

### memes
```sql
create table memes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  template_id  uuid references templates(id) on delete set null,
  title        text,
  image_url    text not null,
  language     text not null default 'en',
  view_count   int not null default 0,
  created_at   timestamptz not null default now()
);
```

---

## RLS policies

```sql
-- profiles
alter table profiles enable row level security;
create policy "anyone can read profiles"
  on profiles for select using (true);
create policy "users insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "users update own profile"
  on profiles for update using (auth.uid() = id);

-- memes
alter table memes enable row level security;
create policy "anyone can read memes"
  on memes for select using (true);
create policy "auth users insert own memes"
  on memes for insert with check (auth.uid() = user_id);
create policy "users delete own memes"
  on memes for delete using (auth.uid() = user_id);

-- templates
alter table templates enable row level security;
create policy "anyone can read templates"
  on templates for select using (true);
```

---

## Auth trigger

```sql
-- fires on every new auth.users row
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'en'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

---

## Storage buckets

```
memes/       public read | auth write | path: {user_id}/{filename}
avatars/     public read | auth write | path: {user_id}/avatar
templates/   public read | no user write
```

---

## Edge Functions

### POST /functions/v1/generate-meme

```typescript
// Input
{ userPrompt: string, language: string }

// Logic
1. Single Gemini call → returns JSON:
   { imagePrompt: string (English), captions: string[3] }
   
2. Promise.all([
     gemini.generateImage(imagePrompt),   // → base64 or blob
     // captions already returned in step 1
   ])
   
3. Upload image blob → supabase.storage
     .from('memes').upload(path, blob)
   
4. Return { imageUrl: string, captions: string[3] }

// Error handling
- Gemini timeout → return 504 with message
- Invalid language → default to 'en'
- Storage upload fail → return 500, don't save partial state
```

### GET /functions/v1/get-feed

```typescript
// Input
?cursor=<iso_timestamp>&limit=20

// Logic
SELECT
  memes.*,
  profiles.username,
  profiles.avatar_url
FROM memes
JOIN profiles ON memes.user_id = profiles.id
WHERE memes.created_at < cursor   -- cursor pagination
ORDER BY memes.created_at DESC
LIMIT limit + 1                   -- fetch one extra to know if more exist

// Output
{
  memes: MemeWithProfile[],
  nextCursor: string | null        -- null means no more pages
}
```

---

## AI provider abstraction

```typescript
// src/lib/ai/provider.ts
export interface MemeAIResult {
  imageUrl: string
  captions: string[]    // always 3 items
}

export async function generateMemeAI(
  userPrompt: string,
  language: string
): Promise<MemeAIResult> {
  const provider = Deno.env.get('AI_PROVIDER') ?? 'gemini'
  
  if (provider === 'gemini') {
    return generateWithGemini(userPrompt, language)
  }
  if (provider === 'production') {
    return generateWithProduction(userPrompt, language)
  }
  throw new Error(`Unknown AI_PROVIDER: ${provider}`)
}
```

---

## TypeScript types

```typescript
// src/lib/types.ts — define these first, reference everywhere

export type Locale = 'en' | 'ne' | 'hi' | 'ru' | 'zh'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  locale: Locale
  created_at: string
}

export interface Template {
  id: string
  name: string
  image_url: string
  category: string | null
  created_at: string
}

export interface Meme {
  id: string
  user_id: string
  template_id: string | null
  title: string | null
  image_url: string
  language: string
  view_count: number
  created_at: string
}

export interface MemeWithProfile extends Meme {
  profiles: Pick<Profile, 'username' | 'avatar_url'>
}

export interface MemeAIResult {
  imageUrl: string
  captions: string[]
}

export interface FeedPage {
  memes: MemeWithProfile[]
  nextCursor: string | null
}
```

---

## i18n keys (all 5 language files must have these)

```json
{
  "nav": {
    "feed": "",
    "create": "",
    "profile": "",
    "login": "",
    "logout": ""
  },
  "feed": {
    "empty": "",
    "loading": "",
    "load_more": ""
  },
  "editor": {
    "generate": "",
    "prompt_placeholder": "",
    "upload_image": "",
    "choose_template": "",
    "add_caption": "",
    "publish": "",
    "generating": "",
    "caption_suggestion": ""
  },
  "auth": {
    "sign_in_google": "",
    "sign_in_email": "",
    "email": "",
    "password": "",
    "no_account": "",
    "have_account": ""
  },
  "errors": {
    "generic": "",
    "upload_failed": "",
    "generate_failed": "",
    "auth_failed": ""
  }
}
```

---

## Environment variables

```bash
# .env.local — frontend (Vite needs VITE_ prefix)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# supabase/functions/.env — Edge Functions (server side only)
GEMINI_API_KEY=
AI_PROVIDER=gemini
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

**GEMINI_API_KEY must never appear in frontend code or
VITE_ prefixed variables. Only Edge Functions use it.**

---

## Coding conventions

- TypeScript strict mode — zero `any` allowed
- No direct Supabase imports in components — use hooks only
- No direct AI API calls in components — use hooks only
- All async operations need loading + error + empty states
- Every button needs: default, hover, focus, active, disabled, loading
- TailwindCSS only — no custom CSS unless Konva canvas requires it
- Functional components + hooks only — no class components
- File names: PascalCase for components, camelCase for everything else

---

## In scope — Phase 1

- [x] Project scaffold
- [x] SQL migrations (profiles, templates, memes, RLS, trigger)
- [x] Supabase client setup + TypeScript types
- [x] i18n setup — 5 languages, basic keys
- [x] Auth — Google OAuth + email, profile auto-creation
- [ ] Flow A — upload image → AI captions → canvas → publish
- [ ] Flow B — type prompt → Gemini image + captions → canvas → publish
- [ ] Konva canvas editor — background + draggable text + Unicode fonts
- [ ] Template picker — grid, category filter, click to load in editor
- [x] Feed UI — authenticated mock meme feed layout
- [ ] Feed page — infinite scroll, cursor pagination, 20 per page
- [ ] Profile page — user's own memes grid
- [ ] Language switcher — 5 languages in Navbar dropdown
- [x] Seed script — 15 starter templates

---

## Out of scope — do not build

- Comments + reactions → Phase 2
- Follow / unfollow → Phase 2
- Notifications → Phase 2
- Trending / personalized feed → Phase 3
- Public REST API with token auth → Phase 3
- Video memes → Phase 3
- Image moderation → Phase 3

---

## Session instructions for Claude Code

1. Always read this file at the start of every session
2. Check the build status checklist above before starting
3. Follow the layered architecture — never skip layers
4. Update the checklist at the end of every session
5. Ask no clarifying questions — use this spec
6. If something is ambiguous, pick the simpler option
