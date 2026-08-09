-- reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  image_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (product_id, profile_id)
);

create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_status_idx on public.reviews (status);

create trigger set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- notifications: in-app log of every email/SMS/in-app notification sent.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}',
  is_read boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_profile_id_idx on public.notifications (profile_id);
create index notifications_is_read_idx on public.notifications (is_read);
