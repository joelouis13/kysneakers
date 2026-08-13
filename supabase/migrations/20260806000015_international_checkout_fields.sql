-- Card payments (Stripe) have no MoMo number, and international orders have
-- no Ghana "region" concept but do need country/postal code.

alter table public.payments
  alter column payer_phone drop not null;

alter table public.orders
  alter column shipping_region drop not null,
  add column shipping_country text,
  add column shipping_postal_code text;
