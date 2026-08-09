-- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.categories (id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_slug_idx on public.categories (slug);

create trigger set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- brands
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index brands_slug_idx on public.brands (slug);

create trigger set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  description text,
  brand_id uuid references public.brands (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  regular_price numeric(10, 2) not null check (regular_price >= 0),
  sale_price numeric(10, 2) check (sale_price >= 0 and sale_price <= regular_price),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  weight_grams integer check (weight_grams >= 0),
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_on_sale boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index products_brand_id_idx on public.products (brand_id);
create index products_category_id_idx on public.products (category_id);
create index products_slug_idx on public.products (slug);
create index products_sku_idx on public.products (sku);
create index products_status_idx on public.products (status);
create index products_featured_idx on public.products (is_featured) where is_featured = true;
create index products_new_arrival_idx on public.products (is_new_arrival) where is_new_arrival = true;
create index products_on_sale_idx on public.products (is_on_sale) where is_on_sale = true;

create trigger set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- product_images
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);
create unique index product_images_one_featured_per_product
  on public.product_images (product_id)
  where is_featured = true;

-- product_sizes
create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  price_adjustment numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, size)
);

create index product_sizes_product_id_idx on public.product_sizes (product_id);

-- inventory: stock tracked per product size, per spec's Nike Air Max example.
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_size_id uuid not null unique references public.product_sizes (id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();
