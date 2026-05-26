-- =============================================================
-- seed/templates.sql
-- 15 starter meme templates.
-- Mix of classic Western memes + South Asian / Nepali / Hindi
-- cultural templates.
--
-- Categories: reaction (8), animal (4), text (3)
--
-- image_url uses placehold.co until real assets are uploaded.
-- Replace with actual Supabase Storage URLs before launch.
--
-- Run via:
--   supabase db execute --file supabase/seed/templates.sql
-- =============================================================

insert into public.templates (name, image_url, category)
select name, image_url, category
from (values

  -- ============================================================
  -- REACTION (8) — relatable situations and emotional reactions
  -- ============================================================

  -- Classic Western
  (
    'Drake Approves',
    'https://placehold.co/800x600?text=Drake+Approves',
    'reaction'
  ),
  (
    'Distracted Boyfriend',
    'https://placehold.co/800x600?text=Distracted+Boyfriend',
    'reaction'
  ),
  (
    'Two Buttons',
    'https://placehold.co/800x600?text=Two+Buttons',
    'reaction'
  ),
  (
    'Change My Mind',
    'https://placehold.co/800x600?text=Change+My+Mind',
    'reaction'
  ),
  (
    'Surprised Pikachu',
    'https://placehold.co/800x600?text=Surprised+Pikachu',
    'reaction'
  ),

  -- South Asian / Nepali / Hindi cultural templates
  (
    'Bahut Hard',
    'https://placehold.co/800x600?text=Bahut+Hard',
    'reaction'
    -- "Very hard" — South Asian reaction to anything overwhelming
  ),
  (
    'Chai Break',
    'https://placehold.co/800x600?text=Chai+Break',
    'reaction'
    -- The universal South Asian solution to every problem
  ),
  (
    'Sahi Baat Hai',
    'https://placehold.co/800x600?text=Sahi+Baat+Hai',
    'reaction'
    -- "That's exactly right" — Indian agreement/validation reaction
  ),

  -- ============================================================
  -- ANIMAL (4)
  -- ============================================================

  (
    'Doge',
    'https://placehold.co/800x600?text=Doge',
    'animal'
  ),
  (
    'Buff Doge vs Cheems',
    'https://placehold.co/800x600?text=Buff+Doge+vs+Cheems',
    'animal'
    -- Then vs Now / Strong vs Weak comparison format
  ),
  (
    'Crying Cat',
    'https://placehold.co/800x600?text=Crying+Cat',
    'animal'
  ),
  (
    'Billi Ji',
    'https://placehold.co/800x600?text=Billi+Ji',
    'animal'
    -- "Respected cat" — the judgemental temple / street cat of South Asia
  ),

  -- ============================================================
  -- TEXT (3) — blank canvases for text-heavy memes
  -- ============================================================

  (
    'Classic Top Bottom',
    'https://placehold.co/800x600?text=Classic+Top+Bottom',
    'text'
    -- White background, Impact font top and bottom — the original meme format
  ),
  (
    'Dark Slate',
    'https://placehold.co/800x600?text=Dark+Slate',
    'text'
    -- Pure black background for white text — clean, modern
  ),
  (
    'Bollywood Title Card',
    'https://placehold.co/800x600?text=Bollywood+Title+Card',
    'text'
    -- Golden text on dark cinematic background — Bollywood / Kollywood style
  )

) as t(name, image_url, category)
-- Skip rows that already exist by name to allow safe re-runs
where not exists (
  select 1 from public.templates where public.templates.name = t.name
);
