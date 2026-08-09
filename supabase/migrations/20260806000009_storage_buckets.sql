-- Storage buckets for product/brand/category media and promo banners.
-- All four are public-read (storefront-visible by design); writes are
-- staff-only, reusing the existing public.is_staff() RBAC helper.

insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('brand-logos', 'brand-logos', true),
  ('category-images', 'category-images', true),
  ('promotional-banners', 'promotional-banners', true)
on conflict (id) do nothing;

create policy "public_read_media_buckets" on storage.objects for select
  using (bucket_id in ('product-images', 'brand-logos', 'category-images', 'promotional-banners'));

create policy "staff_manage_media_buckets" on storage.objects for all
  using (bucket_id in ('product-images', 'brand-logos', 'category-images', 'promotional-banners') and public.is_staff())
  with check (bucket_id in ('product-images', 'brand-logos', 'category-images', 'promotional-banners') and public.is_staff());
