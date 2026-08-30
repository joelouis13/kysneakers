-- get_catalog_facets previously only listed a category if it already had an
-- active product, so a newly-created category (e.g. Perfumes/Suits/T-Shirts
-- with all-draft products, or Bags with none yet) never appeared as a
-- selectable filter on /shop even though it's a real, active category.
-- Categories should be selectable as soon as an admin activates them,
-- independent of whether any product in them has been published yet -- an
-- empty result set for a brand-new category is expected, not a bug. Brands
-- keep the "has an active product" requirement unchanged (not in scope here
-- and not reported as broken).
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
       from public.categories c where c.is_active and c.deleted_at is null),
    (select min(coalesce(p.sale_price, p.regular_price)) from public.products p where p.status = 'active' and p.deleted_at is null),
    (select max(coalesce(p.sale_price, p.regular_price)) from public.products p where p.status = 'active' and p.deleted_at is null);
$$;

grant execute on function public.get_catalog_facets to anon, authenticated;

-- One-time data fix: Perfumes/T-Shirts/Suits had no image_url (never set when
-- the categories were created), so their homepage/category tiles rendered
-- with no photo. Bags has no products yet, so no real image exists for it --
-- left null until one does.
update public.categories set image_url = '/products/rose-petal-eau-de-parfum/1.jpg' where slug = 'perfumes';
update public.categories set image_url = '/products/classic-crew-neck-tee/1.jpg' where slug = 't-shirts';
update public.categories set image_url = '/products/navy-slim-fit-two-piece-suit/1.jpg' where slug = 'suits';
