-- Seed data mirroring lib/data/placeholder-catalog.ts. Run against a real
-- Supabase project once connected (`supabase db reset` runs this
-- automatically, or `psql -f supabase/seed.sql`). Image URLs point at the
-- local /public/products files — swap for Supabase Storage URLs once images
-- are uploaded there.

insert into public.brands (name, slug) values
  ('Nike', 'nike'),
  ('Adidas', 'adidas'),
  ('Jordan', 'jordan'),
  ('New Balance', 'new-balance'),
  ('Puma', 'puma'),
  ('Converse', 'converse'),
  ('Reebok', 'reebok');

insert into public.categories (name, slug) values
  ('Running', 'running'),
  ('Basketball', 'basketball'),
  ('Lifestyle', 'lifestyle'),
  ('Streetwear', 'streetwear');

insert into public.products (
  sku, name, slug, description, brand_id, category_id,
  regular_price, sale_price, is_featured, is_new_arrival, is_on_sale, status
)
select
  v.sku, v.name, v.slug, v.description, b.id, c.id,
  v.regular_price, v.sale_price, v.is_featured, v.is_new_arrival, v.is_on_sale, 'active'
from (values
  ('NK-AMP-001', 'Air Max Pulse', 'nike-air-max-pulse', 'Cushioned comfort meets street-ready style — a re-engineered Air unit with breathable mesh for all-day wear.', 'nike', 'running', 950.00, 799.00, true, true, true),
  ('NK-AF1-002', 'Air Force 1 ''07', 'nike-air-force-1-07', 'The b-ball original that started it all — crisp leather, bold branding, and an Air-Sole unit for all-day comfort.', 'nike', 'lifestyle', 850.00, null, true, false, false),
  ('AD-UBL-003', 'Ultraboost Light', 'adidas-ultraboost-light', 'The lightest Ultraboost yet — responsive Light BOOST cushioning wrapped in a Primeknit+ upper.', 'adidas', 'running', 1100.00, 949.00, false, false, true),
  ('AD-SMB-004', 'Samba OG', 'adidas-samba-og', 'A 1950s football classic turned street staple — soft leather upper with a gum rubber outsole.', 'adidas', 'lifestyle', 780.00, null, false, true, false),
  ('JD-AJ1-005', 'Air Jordan 1 Retro High', 'air-jordan-1-retro-high', 'The silhouette that changed sneaker culture forever — premium leather in the original colorblocking.', 'jordan', 'basketball', 1450.00, null, true, false, false),
  ('JD-AJ4-006', 'Air Jordan 4 Retro', 'air-jordan-4-retro', 'Visible Air cushioning, mesh inserts, and iconic wing eyelets — a certified hardwood legend.', 'jordan', 'basketball', 1600.00, 1399.00, true, false, true),
  ('NB-550-007', '550', 'new-balance-550', 'An ''80s basketball archive piece revived — clean leather panels and a chunky rubber cupsole.', 'new-balance', 'lifestyle', 890.00, null, false, true, false),
  ('NB-906-008', '9060', 'new-balance-9060', 'Exaggerated dad-shoe proportions meet 2000s running heritage, in a layered mesh-and-suede build.', 'new-balance', 'lifestyle', 1050.00, null, false, false, false),
  ('PM-SUC-009', 'Suede Classic', 'puma-suede-classic', 'The 1968 original — soft suede upper, Formstrip branding, and a low-profile vulcanized sole.', 'puma', 'lifestyle', 620.00, null, false, false, false),
  ('PM-RSX-010', 'RS-X', 'puma-rs-x', 'Chunky ''80s-running-tech energy — layered mesh, oversized RS foam, and loud colorblocking.', 'puma', 'running', 700.00, 599.00, false, false, true),
  ('CV-CTA-011', 'Chuck Taylor All Star', 'converse-chuck-taylor-all-star', 'The most recognizable sneaker on the planet — canvas upper, rubber toe cap, timeless silhouette.', 'converse', 'streetwear', 450.00, null, false, false, false),
  ('RB-CLL-012', 'Classic Leather', 'reebok-classic-leather', 'A running-track icon since 1983 — soft leather upper on a die-cut EVA midsole for everyday comfort.', 'reebok', 'lifestyle', 590.00, null, false, false, false),
  ('NK-DNK-013', 'Dunk Low', 'nike-dunk-low', 'Retro basketball hardwood energy in a low-cut build — leather overlays over a padded, low-cut collar.', 'nike', 'streetwear', 900.00, 749.00, true, false, true),
  ('NK-AM97-014', 'Air Max 97', 'nike-air-max-97', 'Inspired by Japanese bullet trains — full-length Air cushioning under rippling, wavy design lines.', 'nike', 'running', 1150.00, null, false, true, false),
  ('AD-FRM-015', 'Forum Low', 'adidas-forum-low', '''80s basketball DNA with the signature ankle strap — full-grain leather on a herringbone outsole.', 'adidas', 'streetwear', 810.00, null, false, false, false),
  ('AD-GZL-016', 'Gazelle', 'adidas-gazelle', 'A 1966 training-shoe original — soft suede upper with the classic three-stripe branding.', 'adidas', 'lifestyle', 700.00, null, false, true, false),
  ('JD-AJ11-017', 'Jordan Retro 11', 'jordan-retro-11', 'Patent leather mudguard, ballistic mesh, and a carbon fiber spring plate — the most hyped Jordan retro.', 'jordan', 'basketball', 1750.00, 1499.00, true, false, true),
  ('NB-990-018', '990v6', 'new-balance-990v6', 'Made in the USA — pigskin suede and ENCAP cushioning define the gold standard of dad shoes.', 'new-balance', 'running', 1400.00, null, true, false, false),
  ('PM-PLM-019', 'Palermo', 'puma-palermo', 'Terrace-culture inspired — soft suede, low-cut profile, and a gum sole for an off-pitch look.', 'puma', 'lifestyle', 650.00, null, false, true, false),
  ('NK-AM90-020', 'Air Max 90', 'nike-air-max-90', 'The 1990 original that never left — visible Air cushioning and bold color-blocked overlays.', 'nike', 'lifestyle', 880.00, 749.00, false, false, true)
) as v(sku, name, slug, description, brand_slug, category_slug, regular_price, sale_price, is_featured, is_new_arrival, is_on_sale)
join public.brands b on b.slug = v.brand_slug
join public.categories c on c.slug = v.category_slug;

-- Product images: files are named 1.jpg..N.jpg per product folder.
insert into public.product_images (product_id, url, display_order, is_featured)
select p.id, '/products/' || v.slug || '/' || n || '.jpg', n, (n = 1)
from (values
  ('nike-air-max-pulse', 7), ('nike-air-force-1-07', 8), ('adidas-ultraboost-light', 7),
  ('adidas-samba-og', 8), ('air-jordan-1-retro-high', 8), ('air-jordan-4-retro', 7),
  ('new-balance-550', 7), ('new-balance-9060', 2), ('puma-suede-classic', 7),
  ('puma-rs-x', 7), ('converse-chuck-taylor-all-star', 5), ('reebok-classic-leather', 6),
  ('nike-dunk-low', 6), ('nike-air-max-97', 6), ('adidas-forum-low', 6),
  ('adidas-gazelle', 8), ('jordan-retro-11', 6), ('new-balance-990v6', 6),
  ('puma-palermo', 6), ('nike-air-max-90', 5)
) as v(slug, image_count)
join public.products p on p.slug = v.slug
cross join lateral generate_series(1, v.image_count) as n;

-- Sizes + per-size inventory (mirrors the "Nike Air Max: 40->8, 41->4..." example in the spec).
with size_data (slug, size, stock) as (
  values
    ('nike-air-max-pulse', '40', 5), ('nike-air-max-pulse', '41', 8), ('nike-air-max-pulse', '42', 0),
    ('nike-air-max-pulse', '43', 10), ('nike-air-max-pulse', '44', 3), ('nike-air-max-pulse', '45', 2),

    ('nike-air-force-1-07', '39', 6), ('nike-air-force-1-07', '40', 12), ('nike-air-force-1-07', '41', 9),
    ('nike-air-force-1-07', '42', 11), ('nike-air-force-1-07', '43', 7), ('nike-air-force-1-07', '44', 4),

    ('adidas-ultraboost-light', '40', 4), ('adidas-ultraboost-light', '41', 6), ('adidas-ultraboost-light', '42', 8),
    ('adidas-ultraboost-light', '43', 0), ('adidas-ultraboost-light', '44', 5),

    ('adidas-samba-og', '39', 7), ('adidas-samba-og', '40', 10), ('adidas-samba-og', '41', 8),
    ('adidas-samba-og', '42', 6), ('adidas-samba-og', '43', 9),

    ('air-jordan-1-retro-high', '40', 3), ('air-jordan-1-retro-high', '41', 5), ('air-jordan-1-retro-high', '42', 4),
    ('air-jordan-1-retro-high', '43', 6), ('air-jordan-1-retro-high', '44', 2), ('air-jordan-1-retro-high', '45', 0),

    ('air-jordan-4-retro', '40', 2), ('air-jordan-4-retro', '41', 4), ('air-jordan-4-retro', '42', 5),
    ('air-jordan-4-retro', '43', 3), ('air-jordan-4-retro', '44', 6),

    ('new-balance-550', '40', 9), ('new-balance-550', '41', 7), ('new-balance-550', '42', 8),
    ('new-balance-550', '43', 5),

    ('new-balance-9060', '41', 4), ('new-balance-9060', '42', 6), ('new-balance-9060', '43', 3),

    ('puma-suede-classic', '39', 8), ('puma-suede-classic', '40', 10), ('puma-suede-classic', '41', 6),
    ('puma-suede-classic', '42', 7),

    ('puma-rs-x', '40', 5), ('puma-rs-x', '41', 6), ('puma-rs-x', '42', 0), ('puma-rs-x', '43', 4),

    ('converse-chuck-taylor-all-star', '38', 9), ('converse-chuck-taylor-all-star', '39', 11),
    ('converse-chuck-taylor-all-star', '40', 14), ('converse-chuck-taylor-all-star', '41', 8),
    ('converse-chuck-taylor-all-star', '42', 10),

    ('reebok-classic-leather', '40', 7), ('reebok-classic-leather', '41', 5), ('reebok-classic-leather', '42', 6),

    ('nike-dunk-low', '40', 6), ('nike-dunk-low', '41', 8), ('nike-dunk-low', '42', 5), ('nike-dunk-low', '43', 0),

    ('nike-air-max-97', '40', 4), ('nike-air-max-97', '41', 3), ('nike-air-max-97', '42', 5), ('nike-air-max-97', '43', 6),

    ('adidas-forum-low', '40', 5), ('adidas-forum-low', '41', 7), ('adidas-forum-low', '42', 4),

    ('adidas-gazelle', '38', 8), ('adidas-gazelle', '39', 10), ('adidas-gazelle', '40', 9), ('adidas-gazelle', '41', 6),

    ('jordan-retro-11', '41', 2), ('jordan-retro-11', '42', 3), ('jordan-retro-11', '43', 1), ('jordan-retro-11', '44', 0),

    ('new-balance-990v6', '41', 4), ('new-balance-990v6', '42', 5), ('new-balance-990v6', '43', 3),

    ('puma-palermo', '39', 7), ('puma-palermo', '40', 9), ('puma-palermo', '41', 5),

    ('nike-air-max-90', '40', 6), ('nike-air-max-90', '41', 8), ('nike-air-max-90', '42', 7), ('nike-air-max-90', '43', 4)
),
inserted_sizes as (
  insert into public.product_sizes (product_id, size)
  select p.id, sd.size
  from size_data sd
  join public.products p on p.slug = sd.slug
  returning id, product_id, size
)
insert into public.inventory (product_size_id, quantity)
select ins.id, sd.stock
from inserted_sizes ins
join public.products p on p.id = ins.product_id
join size_data sd on sd.slug = p.slug and sd.size = ins.size;

insert into public.shipping_zones (name, delivery_fee, estimated_days_min, estimated_days_max) values
  ('Accra', 25.00, 1, 2),
  ('Kumasi', 35.00, 2, 3),
  ('Takoradi', 40.00, 2, 4),
  ('Cape Coast', 35.00, 2, 3),
  ('Tamale', 50.00, 3, 5),
  ('Other Regions', 60.00, 3, 6);
