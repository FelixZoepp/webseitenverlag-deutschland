-- 024: Branchen-Fabrik F2 — branchen_profile, Flagship-Verknüpfung, Qualifizierung
-- Additiv, keine destruktiven Änderungen (Masterprompt §0).

-- Branchen-Profile: Wissensbasis je Branche (BF §5)
create table if not exists branchen_profile (
  id uuid primary key default gen_random_uuid(),
  branche_key text not null unique,
  meta_kategorie text not null,
  name text not null,
  profil jsonb not null default '{}'::jsonb,
  guideline_notes text[] not null default '{}',
  quality_status text not null default 'draft' check (quality_status in ('draft', 'approved')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_branchen_profile_meta on branchen_profile(meta_kategorie);

alter table branchen_profile enable row level security;

drop policy if exists "Admins verwalten branchen_profile" on branchen_profile;
create policy "Admins verwalten branchen_profile" on branchen_profile
  for all
  using (exists (select 1 from customers where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from customers where user_id = auth.uid() and role = 'admin'));

-- Library-Seiten können auf ein Branchen-Profil zeigen
alter table library_pages
  add column if not exists branchen_profil_id uuid references branchen_profile(id);

-- Strukturierte Qualifizierung aus dem /anfrage-Funnel (BF §1.2)
alter table form_submissions
  add column if not exists qualifizierung jsonb;
