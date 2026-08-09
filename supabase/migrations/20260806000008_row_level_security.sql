-- Row Level Security. These policies take effect once a real Supabase
-- project is connected; validate them against real auth flows in Phase 3.

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_sizes enable row level security;
alter table public.inventory enable row level security;
alter table public.addresses enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.coupons enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

-- roles: readable by anyone (needed to render role labels); staff-only writes.
create policy "roles_select_all" on public.roles for select using (true);
create policy "roles_write_super_admin" on public.roles for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- profiles: users manage their own row; staff can view all, admins can update any.
create policy "profiles_select_own" on public.profiles for select
  using (id = auth.uid() or public.is_staff());
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_admin" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- categories / brands: public reads active rows; staff manage everything.
create policy "categories_select_public" on public.categories for select
  using (is_active = true and deleted_at is null or public.is_staff());
create policy "categories_write_staff" on public.categories for all
  using (public.is_staff()) with check (public.is_staff());

create policy "brands_select_public" on public.brands for select
  using (is_active = true and deleted_at is null or public.is_staff());
create policy "brands_write_staff" on public.brands for all
  using (public.is_staff()) with check (public.is_staff());

-- products: public reads active, non-deleted rows; staff manage everything.
create policy "products_select_public" on public.products for select
  using (status = 'active' and deleted_at is null or public.is_staff());
create policy "products_write_staff" on public.products for all
  using (public.is_staff()) with check (public.is_staff());

create policy "product_images_select_public" on public.product_images for select
  using (true);
create policy "product_images_write_staff" on public.product_images for all
  using (public.is_staff()) with check (public.is_staff());

create policy "product_sizes_select_public" on public.product_sizes for select
  using (true);
create policy "product_sizes_write_staff" on public.product_sizes for all
  using (public.is_staff()) with check (public.is_staff());

create policy "inventory_select_public" on public.inventory for select
  using (true);
create policy "inventory_write_staff" on public.inventory for all
  using (public.is_staff()) with check (public.is_staff());

-- addresses: owner-only.
create policy "addresses_owner" on public.addresses for all
  using (profile_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid());

-- shipping_zones: public reads active zones; staff manage.
create policy "shipping_zones_select_public" on public.shipping_zones for select
  using (is_active = true or public.is_staff());
create policy "shipping_zones_write_staff" on public.shipping_zones for all
  using (public.is_staff()) with check (public.is_staff());

-- coupons: customers can only validate an active coupon by code; staff manage.
create policy "coupons_select_active" on public.coupons for select
  using ((is_active = true and deleted_at is null) or public.is_staff());
create policy "coupons_write_staff" on public.coupons for all
  using (public.is_staff()) with check (public.is_staff());

-- carts / cart_items / wishlists / wishlist_items: owner-only. Guest (anon)
-- carts are written server-side with the service-role client, which bypasses
-- RLS entirely, so no anon policy is defined here.
create policy "carts_owner" on public.carts for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "cart_items_owner" on public.cart_items for all
  using (exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id and c.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id and c.profile_id = auth.uid()
  ));

create policy "wishlists_owner" on public.wishlists for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "wishlist_items_owner" on public.wishlist_items for all
  using (exists (
    select 1 from public.wishlists w
    where w.id = wishlist_items.wishlist_id and w.profile_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.wishlists w
    where w.id = wishlist_items.wishlist_id and w.profile_id = auth.uid()
  ));

-- orders / order_items / payments: customers read their own; only staff (or
-- the service-role client used by the checkout/webhook flow) can write.
-- Orders only become "paid" via the server-side webhook handler, never a
-- direct client update.
create policy "orders_select_own" on public.orders for select
  using (profile_id = auth.uid() or public.is_staff());
create policy "orders_write_staff" on public.orders for all
  using (public.is_staff()) with check (public.is_staff());

create policy "order_items_select_own" on public.order_items for select
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.profile_id = auth.uid() or public.is_staff())
  ));
create policy "order_items_write_staff" on public.order_items for all
  using (public.is_staff()) with check (public.is_staff());

create policy "payments_select_own" on public.payments for select
  using (exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and (o.profile_id = auth.uid() or public.is_staff())
  ));
create policy "payments_write_staff" on public.payments for all
  using (public.is_staff()) with check (public.is_staff());

-- reviews: public reads approved reviews; owners manage their own review;
-- staff can moderate (approve/reject/delete) any review.
create policy "reviews_select_approved" on public.reviews for select
  using (status = 'approved' or profile_id = auth.uid() or public.is_staff());
create policy "reviews_insert_own" on public.reviews for insert
  with check (profile_id = auth.uid());
create policy "reviews_update_own_or_staff" on public.reviews for update
  using (profile_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid() or public.is_staff());
create policy "reviews_delete_own_or_staff" on public.reviews for delete
  using (profile_id = auth.uid() or public.is_staff());

-- notifications: owner reads/marks-as-read own notifications; writes happen
-- server-side via the service-role client.
create policy "notifications_select_own" on public.notifications for select
  using (profile_id = auth.uid() or public.is_staff());
create policy "notifications_update_own" on public.notifications for update
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- settings: public can read (site-wide config like shipping banners); only
-- staff can write.
create policy "settings_select_public" on public.settings for select using (true);
create policy "settings_write_staff" on public.settings for all
  using (public.is_staff()) with check (public.is_staff());

-- audit_logs: staff can read; nothing else is granted, so all client-side
-- writes are denied by default — rows are inserted via the service-role
-- client from server actions/route handlers only.
create policy "audit_logs_select_staff" on public.audit_logs for select
  using (public.is_staff());
