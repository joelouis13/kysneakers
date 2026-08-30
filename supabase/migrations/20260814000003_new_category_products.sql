-- Nine draft products seeding the new Perfumes/Suits/T-Shirts categories,
-- one per usable supplied stock photo (3 images were skipped: a garbled
-- "PEFRUME" label, a "CUSTOM DESIGN" placeholder shirt, and a 5-item collage
-- that isn't a single product). status='draft' -- invisible on the
-- storefront (search_products defaults to p_status='active') until reviewed
-- and published via /admin/products. Prices are flat, clearly-placeholder
-- numbers, not real pricing -- no brand_id, since brands stay sneaker-scoped
-- by convention (see the categories-expansion migration's note).
insert into public.products (
  sku, name, slug, description, category_id, regular_price, status
)
select v.sku, v.name, v.slug, v.description, c.id, v.regular_price, 'draft'
from (values
  ('PF-RPT-001', 'Rose Petal Eau de Parfum', 'rose-petal-eau-de-parfum',
   'A romantic floral blend built around fresh rose petals, finished with a soft, lingering warmth.',
   'perfumes', 250.00),
  ('PF-FLB-002', 'Floral Bouquet Eau de Parfum', 'floral-bouquet-eau-de-parfum',
   'A layered bouquet of garden florals in a faceted bottle — bright, elegant, and versatile for everyday wear.',
   'perfumes', 250.00),
  ('PF-MDC-003', 'Midnight Crystal Eau de Parfum', 'midnight-crystal-eau-de-parfum',
   'A cool, crystalline evening scent with a jeweled cap — sharp, refined, and made to be noticed.',
   'perfumes', 250.00),
  ('ST-NSF-001', 'Navy Slim-Fit Two-Piece Suit', 'navy-slim-fit-two-piece-suit',
   'A tailored navy two-piece for the boardroom or a big night out — clean lines, sharp shoulders, easy movement.',
   'suits', 1200.00),
  ('ST-NWP-002', 'Navy Windowpane Three-Piece Suit', 'navy-windowpane-three-piece-suit',
   'A navy windowpane check across jacket, waistcoat, and trouser — a three-piece with real presence.',
   'suits', 1200.00),
  ('ST-GPS-003', 'Green Pinstripe Double-Breasted Suit', 'green-pinstripe-double-breasted-suit',
   'A double-breasted suit in forest green pinstripe — a confident, statement silhouette.',
   'suits', 1200.00),
  ('TS-CCN-001', 'Classic Crew Neck Tee', 'classic-crew-neck-tee',
   'The everyday crew neck — soft cotton, a relaxed fit, and a colour for every mood.',
   't-shirts', 90.00),
  ('TS-HCN-002', 'Heather Crew Neck Tee', 'heather-crew-neck-tee',
   'A heathered cotton crew neck with a slightly heavier hand — built for everyday layering.',
   't-shirts', 90.00),
  ('TS-ATS-003', 'Athletic Stripe Tee', 'athletic-stripe-tee',
   'A performance-cut tee with a bold diagonal stripe print — built to move.',
   't-shirts', 90.00)
) as v(sku, name, slug, description, category_slug, regular_price)
join public.categories c on c.slug = v.category_slug;

insert into public.product_images (product_id, url, display_order, is_featured)
select p.id, '/products/' || p.slug || '/1.jpg', 1, true
from public.products p
where p.slug in (
  'rose-petal-eau-de-parfum', 'floral-bouquet-eau-de-parfum', 'midnight-crystal-eau-de-parfum',
  'navy-slim-fit-two-piece-suit', 'navy-windowpane-three-piece-suit', 'green-pinstripe-double-breasted-suit',
  'classic-crew-neck-tee', 'heather-crew-neck-tee', 'athletic-stripe-tee'
);

-- Perfumes are sized by volume, not S/M/L; clothing gets standard letter sizes.
-- Stock left at 0 (no real inventory committed yet) -- set real counts before publishing.
with size_data (slug, size) as (
  values
    ('rose-petal-eau-de-parfum', '50ml'),
    ('floral-bouquet-eau-de-parfum', '50ml'),
    ('midnight-crystal-eau-de-parfum', '50ml'),
    ('navy-slim-fit-two-piece-suit', 'S'), ('navy-slim-fit-two-piece-suit', 'M'),
    ('navy-slim-fit-two-piece-suit', 'L'), ('navy-slim-fit-two-piece-suit', 'XL'),
    ('navy-windowpane-three-piece-suit', 'S'), ('navy-windowpane-three-piece-suit', 'M'),
    ('navy-windowpane-three-piece-suit', 'L'), ('navy-windowpane-three-piece-suit', 'XL'),
    ('green-pinstripe-double-breasted-suit', 'S'), ('green-pinstripe-double-breasted-suit', 'M'),
    ('green-pinstripe-double-breasted-suit', 'L'), ('green-pinstripe-double-breasted-suit', 'XL'),
    ('classic-crew-neck-tee', 'S'), ('classic-crew-neck-tee', 'M'),
    ('classic-crew-neck-tee', 'L'), ('classic-crew-neck-tee', 'XL'),
    ('heather-crew-neck-tee', 'S'), ('heather-crew-neck-tee', 'M'),
    ('heather-crew-neck-tee', 'L'), ('heather-crew-neck-tee', 'XL'),
    ('athletic-stripe-tee', 'S'), ('athletic-stripe-tee', 'M'),
    ('athletic-stripe-tee', 'L'), ('athletic-stripe-tee', 'XL')
),
inserted_sizes as (
  insert into public.product_sizes (product_id, size)
  select p.id, sd.size
  from size_data sd
  join public.products p on p.slug = sd.slug
  returning id
)
insert into public.inventory (product_size_id, quantity)
select id, 0 from inserted_sizes;
