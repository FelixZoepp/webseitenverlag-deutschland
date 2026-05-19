-- Form Submissions
create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  form_type text default 'contact',
  data jsonb not null,
  sender_email text,
  sender_name text,
  status text default 'new',
  notification_sent boolean default false,
  notification_error text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone
);

create index idx_form_submissions_site_created on form_submissions(site_id, created_at desc);

alter table form_submissions enable row level security;

create policy "Users can view own submissions" on form_submissions
  for select using (site_id in (
    select s.id from sites s join customers c on s.customer_id = c.id where c.user_id = auth.uid()
  ));

create policy "Users can update own submissions" on form_submissions
  for update using (site_id in (
    select s.id from sites s join customers c on s.customer_id = c.id where c.user_id = auth.uid()
  ));

create policy "Users can delete own submissions" on form_submissions
  for delete using (site_id in (
    select s.id from sites s join customers c on s.customer_id = c.id where c.user_id = auth.uid()
  ));

-- Public insert (no auth needed, called from external websites)
create policy "Anyone can insert submissions" on form_submissions
  for insert with check (true);

-- Notification settings on sites
alter table sites add column if not exists notification_email text;
alter table sites add column if not exists notification_enabled boolean default true;