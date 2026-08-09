-- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid references public.profiles (id) on delete set null,
  status text not null default 'pending_payment' check (
    status in (
      'pending_payment', 'paid', 'processing', 'ready_for_dispatch',
      'dispatched', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'
    )
  ),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address_id uuid references public.addresses (id) on delete set null,
  shipping_zone_id uuid references public.shipping_zones (id) on delete set null,
  delivery_fee numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  discount_total numeric(10, 2) not null default 0,
  coupon_id uuid references public.coupons (id) on delete set null,
  total numeric(10, 2) not null check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_profile_id_idx on public.orders (profile_id);
create index orders_status_idx on public.orders (status);
create index orders_order_number_idx on public.orders (order_number);

create trigger set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- order_items: snapshots product details at time of purchase so historical
-- orders stay accurate even if the product is later edited or deleted.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_size_id uuid references public.product_sizes (id) on delete set null,
  product_name text not null,
  size text not null,
  sku text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);

-- payments: orders only move to 'paid' after a payment row here is verified
-- against a Moolre webhook — never trust client-reported payment status.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'moolre',
  method text not null check (method in ('mtn_momo', 'telecel_cash', 'airteltigo_money')),
  amount numeric(10, 2) not null check (amount >= 0),
  currency text not null default 'GHS',
  status text not null default 'initiated' check (
    status in ('initiated', 'pending', 'successful', 'failed', 'refunded')
  ),
  provider_reference text,
  webhook_payload jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments (order_id);
create index payments_provider_reference_idx on public.payments (provider_reference);

create trigger set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();
