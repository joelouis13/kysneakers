-- settings: key/value store for site-wide configuration (shipping banner
-- copy, social links, feature flags, etc.), editable from the admin dashboard.
create table public.settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- audit_logs: every product/order/settings change made from the admin
-- dashboard is recorded here. Rows are written server-side only (service
-- role) — see the RLS policy in the next migration.
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_table_record_idx on public.audit_logs (table_name, record_id);
create index audit_logs_profile_id_idx on public.audit_logs (profile_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
