-- addresses
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  region text not null,
  city text not null,
  street_address text not null,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_profile_id_idx on public.addresses (profile_id);

create trigger set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- shipping_zones
create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  delivery_fee numeric(10, 2) not null check (delivery_fee >= 0),
  estimated_days_min integer not null check (estimated_days_min >= 0),
  estimated_days_max integer not null check (estimated_days_max >= estimated_days_min),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.shipping_zones
  for each row execute function public.set_updated_at();

-- coupons
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed_amount')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  minimum_purchase numeric(10, 2) not null default 0,
  usage_limit integer check (usage_limit > 0),
  times_used integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index coupons_code_idx on public.coupons (code);

create trigger set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- carts: one cart per signed-in customer (profile_id), or a guest cart keyed
-- by an opaque session_id stored in an httpOnly cookie. Guest cart writes go
-- through a server action using the service-role client, not direct RLS.
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_owner_check check (profile_id is not null or session_id is not null)
);

create unique index carts_profile_id_idx on public.carts (profile_id) where profile_id is not null;
create index carts_session_id_idx on public.carts (session_id) where session_id is not null;

create trigger set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

-- cart_items
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_size_id uuid not null references public.product_sizes (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  saved_for_later boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_size_id)
);

create index cart_items_cart_id_idx on public.cart_items (cart_id);

create trigger set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- wishlists
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- wishlist_items
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

create index wishlist_items_wishlist_id_idx on public.wishlist_items (wishlist_id);
