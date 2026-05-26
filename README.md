# Meme Platform

Multilingual AI meme generator and social feed platform.
Users generate memes in English, Nepali, Hindi, Russian, or Chinese
using AI-powered image and caption generation.

## Stack
- React + Vite + TypeScript + TailwindCSS
- Supabase (Postgres + Auth + Storage + Edge Functions)
- Google Gemini 2.5 Flash (AI image + caption generation)
- Konva.js (canvas editor)

## Setup
```bash
cp .env.example .env.local
# fill in your Supabase URL, anon key, and Gemini API key
npm install
npm run dev
```

## Phases
- Phase 1 (current): MVP — auth, editor, AI generation, feed
- Phase 2: Social layer — comments, reactions, follows
- Phase 3: Algorithm + public API
