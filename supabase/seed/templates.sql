-- =============================================================
-- seed/templates.sql  —  15 starter meme templates
-- Mix: 5 classic Western · 3 South Asian reaction · 4 animal · 3 South Asian custom
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste this → Run
--
-- Safe to re-run: deletes and re-inserts by name.
-- =============================================================

-- Wipe and reload so re-runs are always clean
delete from public.templates
where name in (
  'Drake Approves', 'Distracted Boyfriend', 'Two Buttons', 'Change My Mind', 'Surprised Pikachu',
  'Shah Rukh Khan', 'SRK Angry', 'Ranveer Singh',
  'Doge', 'Buff Doge vs Cheems', 'Woman Yelling at Cat', 'Monkey Puppet',
  'Baburao Hera Pheri', 'Paresh Rawal', 'Nepali Meme',
  -- legacy placeholder names (safe to remove)
  'Bahut Hard', 'Chai Break', 'Sahi Baat Hai',
  'Crying Cat', 'Billi Ji',
  'Classic Top Bottom', 'Dark Slate', 'Bollywood Title Card'
);

insert into public.templates (name, image_url, category) values

  -- ================================================================
  -- REACTION (8) — relatable reactions, Western + South Asian icons
  -- ================================================================

  ('Drake Approves',       'https://i.imgflip.com/30b1gx.jpg',    'reaction'),
  ('Distracted Boyfriend', 'https://i.imgflip.com/1ur9b0.jpg',    'reaction'),
  ('Two Buttons',          'https://i.imgflip.com/1g8my4.jpg',    'reaction'),
  ('Change My Mind',       'https://i.imgflip.com/24y43o.jpg',    'reaction'),
  ('Surprised Pikachu',    'https://i.imgflip.com/2kbn1e.jpg',    'reaction'),

  -- Shah Rukh Khan — most remixed Bollywood actor on the internet
  ('Shah Rukh Khan',       'https://i.imgflip.com/2/8204i5.jpg',  'reaction'),
  -- SRK in full rage mode — perfect for "how dare you" moments
  ('SRK Angry',            'https://i.imgflip.com/2/1yoert.jpg',  'reaction'),
  -- Ranveer's unhinged energy — South Asian chaos energy meme
  ('Ranveer Singh',        'https://i.imgflip.com/2/86qpws.jpg',  'reaction'),

  -- ================================================================
  -- ANIMAL (4)
  -- ================================================================

  ('Doge',                  'https://i.imgflip.com/4t0m5.jpg',    'animal'),
  ('Buff Doge vs Cheems',   'https://i.imgflip.com/43a45p.png',   'animal'),
  ('Woman Yelling at Cat',  'https://i.imgflip.com/345v97.jpg',   'animal'),
  ('Monkey Puppet',         'https://i.imgflip.com/2gnnjh.jpg',   'animal'),

  -- ================================================================
  -- CUSTOM (3) — South Asian / Nepali / Bollywood formats
  -- ================================================================

  -- Hera Pheri's Baburao — the original desi "why is this happening to me"
  ('Baburao Hera Pheri',   'https://i.imgflip.com/2/334bel.jpg',  'custom'),
  -- Paresh Rawal reaction — classic Bollywood over-the-top expression
  ('Paresh Rawal',         'https://i.imgflip.com/2/1pv4h4.jpg',  'custom'),
  -- Nepali meme format — viral Nepali internet humor template
  ('Nepali Meme',          'https://i.imgflip.com/2/61ug7a.jpg',  'custom');
