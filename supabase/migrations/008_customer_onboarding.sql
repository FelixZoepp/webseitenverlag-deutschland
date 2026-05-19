-- Track whether customer has completed the welcome onboarding
alter table customers add column if not exists onboarding_completed boolean not null default false;
