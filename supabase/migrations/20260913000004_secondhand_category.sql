-- New top-level category for pre-owned/resale stock, shown alongside
-- Sneakers/Perfumes/T-Shirts/Suits/Bags on /categories and the home page's
-- "Shop by Category" strip.
insert into public.categories (name, slug, display_order) values
  ('2nd Hand Shop', '2nd-hand-shop', 6)
on conflict (slug) do nothing;
