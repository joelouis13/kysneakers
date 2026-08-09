-- roles: fixed lookup table for RBAC.
create table public.roles (
  id smallint primary key,
  name text not null unique,
  description text
);

insert into public.roles (id, name, description) values
  (1, 'super_admin', 'Full system access, including permanent deletes and role management'),
  (2, 'admin', 'Manage products, orders, customers, and most settings'),
  (3, 'manager', 'Manage inventory, orders, and coupons'),
  (4, 'staff', 'Process orders and update order statuses'),
  (5, 'customer', 'Storefront customer account');

-- profiles: 1:1 extension of Supabase's built-in auth.users. We deliberately
-- do NOT duplicate a separate "users" table — auth.users + profiles already
-- satisfies the spec's user/role/authentication requirements without
-- duplicating auth data.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id smallint not null references public.roles (id) default 5,
  full_name text,
  phone text,
  avatar_url text,
  date_of_birth date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_id_idx on public.profiles (role_id);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile (default role: customer) whenever a new auth
-- user signs up, so every authenticated user always has a matching profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role_id)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 5);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RBAC helper functions, used throughout RLS policies.
create or replace function public.current_profile_role()
returns text
language sql
stable
security definer set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('super_admin', 'admin', 'manager', 'staff'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('super_admin', 'admin'), false);
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'super_admin', false);
$$;
