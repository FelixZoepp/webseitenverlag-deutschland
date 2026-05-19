-- Users werden via Supabase Auth verwaltet (auth.users)

-- customers: Kunden-Profile
create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  company_name text,
  contact_email text,
  cloudflare_account_id text,
  cloudflare_api_token text, -- verschlüsselt speichern in Production
  created_at timestamp with time zone default now()
);

-- sites: Webseiten der Kunden
create table sites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  name text not null,
  domain text, -- z.B. kunde.de oder test.deinefirma.de
  cloudflare_project_name text, -- Name des Cloudflare Pages-Projekts
  template_id text not null default 'business-basic',
  config jsonb not null default '{}', -- aktuelle Live-Config
  draft_config jsonb default '{}', -- ungespeicherte Änderungen
  status text default 'draft', -- draft, published, error
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- config_versions: Historie für Rollback
create table config_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  config jsonb not null,
  created_by text default 'user', -- user, chatbot, system
  description text,
  created_at timestamp with time zone default now()
);

-- chat_messages: Chatbot-Historie
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  role text not null, -- user, assistant
  content text not null,
  config_changes jsonb, -- was wurde geändert
  created_at timestamp with time zone default now()
);

-- RLS-Policies aktivieren
alter table customers enable row level security;
alter table sites enable row level security;
alter table config_versions enable row level security;
alter table chat_messages enable row level security;

-- Policies: User können nur eigene Daten sehen
create policy "Users can view own customer profile" on customers
  for select using (auth.uid() = user_id);
create policy "Users can update own customer profile" on customers
  for update using (auth.uid() = user_id);
create policy "Users can insert own customer profile" on customers
  for insert with check (auth.uid() = user_id);

create policy "Users can view own sites" on sites
  for select using (customer_id in (select id from customers where user_id = auth.uid()));
create policy "Users can update own sites" on sites
  for update using (customer_id in (select id from customers where user_id = auth.uid()));
create policy "Users can insert own sites" on sites
  for insert with check (customer_id in (select id from customers where user_id = auth.uid()));

create policy "Users can view own config versions" on config_versions
  for select using (site_id in (select s.id from sites s join customers c on s.customer_id = c.id where c.user_id = auth.uid()));
create policy "Users can insert own config versions" on config_versions
  for insert with check (site_id in (select s.id from sites s join customers c on s.customer_id = c.id where c.user_id = auth.uid()));

create policy "Users can view own chat messages" on chat_messages
  for select using (site_id in (select s.id from sites s join customers c on s.customer_id = c.id where c.user_id = auth.uid()));
create policy "Users can insert own chat messages" on chat_messages
  for insert with check (site_id in (select s.id from sites s join customers c on s.customer_id = c.id where c.user_id = auth.uid()));
