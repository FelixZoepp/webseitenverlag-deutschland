-- ============================================================
-- Upsell-Aktivierungen
-- ============================================================

create table activated_upsells (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  upsell_id text not null,               -- z.B. 'karriere-seite'
  preis_pro_monat_cent int not null,
  aktiviert_am timestamp with time zone default now(),
  deaktiviert_am timestamp with time zone,
  externe_payment_item_ref text,          -- z.B. Stripe Subscription Item ID
  konfiguration jsonb not null default '{}',

  constraint uq_customer_upsell unique (customer_id, upsell_id)
);

-- ============================================================
-- Rechnungs-Posten (interne Buchhaltung, unabhängig vom Payment-Provider)
-- ============================================================

create table rechnungs_posten (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  typ text not null check (typ in ('PAKET_BASIS', 'UPSELL_AKTIVIERUNG', 'UPSELL_DEAKTIVIERUNG', 'PAKET_UPGRADE')),
  bezeichnung text not null,              -- z.B. 'Karriere-Seite Aktivierung'
  betrag_pro_monat_cent int not null,
  gueltig_ab timestamp with time zone not null,
  gueltig_bis timestamp with time zone,   -- null = bis Vertragsende
  bezugs_id text,                         -- z.B. activated_upsells.id
  extern_uebertragen boolean default false,
  extern_ref text,                        -- z.B. Lexoffice-Posten-ID
  created_at timestamp with time zone default now()
);

-- ============================================================
-- Upsell-Ablehnungen (Tracking für 30-Tage-Retry)
-- ============================================================

create table upsell_rejections (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  upsell_id text not null,
  rejected_at timestamp with time zone default now(),
  reason text,                            -- 'too_expensive', 'not_needed', 'maybe_later', 'other'
  retry_after timestamp with time zone not null
);

-- ============================================================
-- Email-Log
-- ============================================================

create table email_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  template text not null,
  subject text not null,
  sent_at timestamp with time zone default now(),
  metadata jsonb
);

-- ============================================================
-- Branche auf customers (für Chatbot-Kontext)
-- ============================================================

alter table customers add column if not exists branche text;
alter table customers add column if not exists externe_payment_ref text;

-- ============================================================
-- RLS Policies
-- ============================================================

alter table activated_upsells enable row level security;
alter table rechnungs_posten enable row level security;
alter table upsell_rejections enable row level security;
alter table email_logs enable row level security;

-- Kunden können eigene aktivierte Upsells sehen
create policy "Users can view own activated upsells" on activated_upsells
  for select using (customer_id in (select id from customers where user_id = auth.uid()));

-- Admin (service_role) hat vollen Zugriff über die API-Routes
-- Die Admin-API-Routes nutzen createClient() mit service_role key

-- Index für häufige Queries
create index idx_activated_upsells_customer on activated_upsells(customer_id);
create index idx_activated_upsells_active on activated_upsells(customer_id) where deaktiviert_am is null;
create index idx_rechnungs_posten_offen on rechnungs_posten(extern_uebertragen) where extern_uebertragen = false;
create index idx_upsell_rejections_retry on upsell_rejections(customer_id, upsell_id, retry_after);
