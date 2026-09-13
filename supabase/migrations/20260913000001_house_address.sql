-- House address: a specific house/building identifier alongside the street
-- address and landmark, common in Ghanaian addressing. Optional on both the
-- reusable address book and the per-order shipping snapshot, same nullability
-- pattern as landmark.
alter table public.addresses
  add column house_address text;

alter table public.orders
  add column shipping_house_address text;
