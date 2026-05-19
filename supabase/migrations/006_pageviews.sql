-- Pageview tracking table
create table if not exists pageviews (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references sites(id) on delete cascade not null,
  page_path text not null default '/',
  referrer text default '',
  screen_size text default '',
  ip_address text default '',
  user_agent text default '',
  created_at timestamptz default now() not null
);

-- Index for fast queries by site + date
create index idx_pageviews_site_created on pageviews (site_id, created_at desc);

-- Index for page path aggregation
create index idx_pageviews_site_path on pageviews (site_id, page_path);

-- Enable RLS
alter table pageviews enable row level security;

-- Allow insert from anon (public tracking pixel)
create policy "Allow public pageview inserts" on pageviews
  for insert with check (true);

-- Allow read for authenticated users who own the site
create policy "Allow site owner to read pageviews" on pageviews
  for select using (
    site_id in (
      select s.id from sites s
      join customers c on s.customer_id = c.id
      where c.user_id = auth.uid()
    )
  );
