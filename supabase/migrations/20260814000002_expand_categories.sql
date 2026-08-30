-- Store expands beyond sneakers: Sneakers, Perfumes, T-Shirts, Suits, and
-- Bags become the top-level categories shown on /categories and used for
-- shop/facet filtering. The original Running/Basketball/Lifestyle/Streetwear
-- rows are retired (not deleted -- preserves FK history) with their products
-- re-pointed straight at the new "Sneakers" category, since no nested-
-- category UI exists yet (getCategoriesWithCounts renders a flat list) --
-- this keeps /categories showing exactly the 5 categories asked for.
insert into public.categories (name, slug, display_order) values
  ('Sneakers', 'sneakers', 1),
  ('Perfumes', 'perfumes', 2),
  ('T-Shirts', 't-shirts', 3),
  ('Suits', 'suits', 4),
  ('Bags', 'bags', 5)
on conflict (slug) do nothing;

update public.categories
set image_url = '/products/nike-air-force-1-07/1.jpg'
where slug = 'sneakers' and image_url is null;

update public.products
set category_id = (select id from public.categories where slug = 'sneakers')
where category_id in (
  select id from public.categories where slug in ('running', 'basketball', 'lifestyle', 'streetwear')
);

update public.categories
set is_active = false
where slug in ('running', 'basketball', 'lifestyle', 'streetwear');
