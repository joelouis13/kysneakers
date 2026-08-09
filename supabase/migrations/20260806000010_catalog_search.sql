-- search_products: the single filter/sort/paginate engine every listing
-- route goes through (shop, search, categories/[slug], brands/[slug],
-- related products, home strips). "Available" for size/in-stock filters
-- means inventory.quantity > 0 for that size, not merely that the size row
-- exists.
create or replace function public.search_products(
  p_q text default null,
  p_brand_slugs text[] default null,
  p_category_slugs text[] default null,
  p_sizes text[] default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_in_stock boolean default null,
  p_is_featured boolean default null,
  p_is_new_arrival boolean default null,
  p_is_on_sale boolean default null,
  p_exclude_id uuid default null,
  p_status text default 'active',
  p_sort text default 'newest',
  p_limit int default 12,
  p_offset int default 0
)
returns table (
  id uuid, sku text, name text, slug text, description text,
  brand_id uuid, brand_name text, brand_slug text,
  category_id uuid, category_name text, category_slug text,
  regular_price numeric, sale_price numeric, effective_price numeric,
  is_featured boolean, is_new_arrival boolean, is_on_sale boolean,
  tags text[], created_at timestamptz,
  primary_image_url text, total_stock bigint,
  review_count bigint, rating_avg numeric,
  total_count bigint
)
language sql stable as $$
  with filtered as (
    select
      p.id, p.sku, p.name, p.slug, p.description, p.brand_id, p.category_id,
      p.regular_price, p.sale_price, coalesce(p.sale_price, p.regular_price) as effective_price,
      p.is_featured, p.is_new_arrival, p.is_on_sale, p.tags, p.created_at,
      b.name as brand_name, b.slug as brand_slug,
      c.name as category_name, c.slug as category_slug,
      (select pi.url from public.product_images pi where pi.product_id = p.id
         order by pi.is_featured desc, pi.display_order asc limit 1) as primary_image_url,
      (select coalesce(sum(inv.quantity), 0) from public.product_sizes ps
         join public.inventory inv on inv.product_size_id = ps.id
         where ps.product_id = p.id) as total_stock,
      (select count(*) from public.reviews r where r.product_id = p.id and r.status = 'approved') as review_count,
      (select avg(r.rating) from public.reviews r where r.product_id = p.id and r.status = 'approved') as rating_avg
    from public.products p
    left join public.brands b on b.id = p.brand_id
    left join public.categories c on c.id = p.category_id
    where p.deleted_at is null
      and (p_status is null or p.status = p_status)
      and (p_exclude_id is null or p.id <> p_exclude_id)
      and (p_q is null or p_q = '' or
           (p.name || ' ' || coalesce(b.name, '') || ' ' || coalesce(p.description, '')) ilike '%' || p_q || '%')
      and (p_brand_slugs is null or b.slug = any(p_brand_slugs))
      and (p_category_slugs is null or c.slug = any(p_category_slugs))
      and (p_is_featured is null or p.is_featured = p_is_featured)
      and (p_is_new_arrival is null or p.is_new_arrival = p_is_new_arrival)
      and (p_is_on_sale is null or p.is_on_sale = p_is_on_sale)
      and (p_min_price is null or coalesce(p.sale_price, p.regular_price) >= p_min_price)
      and (p_max_price is null or coalesce(p.sale_price, p.regular_price) <= p_max_price)
      and (p_sizes is null or exists (
        select 1 from public.product_sizes ps join public.inventory inv on inv.product_size_id = ps.id
        where ps.product_id = p.id and ps.size = any(p_sizes) and inv.quantity > 0))
      and (p_in_stock is not true or exists (
        select 1 from public.product_sizes ps join public.inventory inv on inv.product_size_id = ps.id
        where ps.product_id = p.id and inv.quantity > 0))
  ),
  counted as (select *, count(*) over() as total_count from filtered)
  select id, sku, name, slug, description, brand_id, brand_name, brand_slug,
         category_id, category_name, category_slug, regular_price, sale_price, effective_price,
         is_featured, is_new_arrival, is_on_sale, tags, created_at,
         primary_image_url, total_stock, review_count, rating_avg, total_count
  from counted
  order by
    case when p_sort = 'price-asc' then effective_price end asc,
    case when p_sort = 'price-desc' then effective_price end desc,
    case when p_sort = 'popular' then review_count end desc,
    created_at desc
  limit p_limit offset p_offset;
$$;

grant execute on function public.search_products to anon, authenticated;

-- get_catalog_facets: single round-trip for the shop filter sidebar (distinct
-- sizes, active brands/categories that actually have products, price bounds).
create or replace function public.get_catalog_facets()
returns table (sizes text[], brands jsonb, categories jsonb, min_price numeric, max_price numeric)
language sql stable as $$
  select
    (select array_agg(distinct ps.size order by ps.size) from public.product_sizes ps
       join public.products p on p.id = ps.product_id where p.status = 'active' and p.deleted_at is null),
    (select jsonb_agg(jsonb_build_object('id', b.id, 'name', b.name, 'slug', b.slug) order by b.name)
       from public.brands b where b.is_active and exists (
         select 1 from public.products p where p.brand_id = b.id and p.status = 'active' and p.deleted_at is null)),
    (select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug) order by c.name)
       from public.categories c where c.is_active and exists (
         select 1 from public.products p where p.category_id = c.id and p.status = 'active' and p.deleted_at is null)),
    (select min(coalesce(p.sale_price, p.regular_price)) from public.products p where p.status = 'active' and p.deleted_at is null),
    (select max(coalesce(p.sale_price, p.regular_price)) from public.products p where p.status = 'active' and p.deleted_at is null);
$$;

grant execute on function public.get_catalog_facets to anon, authenticated;

-- One-time data fix: categories.image_url exists in the schema but was never
-- populated by seed.sql, needed so category-strip can read a real image
-- column instead of deriving one from a hardcoded product index.
update public.categories set image_url = '/products/nike-air-max-97/1.jpg' where slug = 'running';
update public.categories set image_url = '/products/air-jordan-1-retro-high/1.jpg' where slug = 'basketball';
update public.categories set image_url = '/products/nike-air-force-1-07/1.jpg' where slug = 'lifestyle';
update public.categories set image_url = '/products/nike-dunk-low/1.jpg' where slug = 'streetwear';
