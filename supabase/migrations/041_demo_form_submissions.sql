-- Demo-Formulareinsendungen: demo_id Spalte für form_submissions
alter table form_submissions add column if not exists demo_id uuid references demos(id) on delete cascade;
create index if not exists idx_form_submissions_demo on form_submissions(demo_id) where demo_id is not null;
