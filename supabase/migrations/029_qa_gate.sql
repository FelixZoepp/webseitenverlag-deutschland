-- 029: Browser-QA-Gate (QA_GATE_PRODUKTSTUFEN_PROMPT Baustein A)
-- Additiv: qa_reports speichert jedes Browser-QA-Ergebnis pro Site.
-- report jsonb  = Regel-Ergebnisse (Regel-ID, pass/fail, Selector, gemessen, erwartet, Reparaturen)
-- screenshots jsonb = { mobile: url, desktop: url }

create table if not exists qa_reports (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  mode text not null check (mode in ('demo', 'publish', 'cron')),
  status text not null check (status in ('passed', 'repaired', 'failed')),
  report jsonb not null default '{}'::jsonb,
  screenshots jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists qa_reports_site_idx on qa_reports (site_id, created_at desc);

alter table qa_reports enable row level security;

-- Nur Service-Role (Admin-APIs) — keine Policies für anon/authenticated.
