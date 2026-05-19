-- Add package tier to sites
alter table sites add column if not exists package text not null default 'starter'
  check (package in ('starter', 'business', 'growth'));

-- Add package to customers for default
alter table customers add column if not exists package text not null default 'starter'
  check (package in ('starter', 'business', 'growth'));
