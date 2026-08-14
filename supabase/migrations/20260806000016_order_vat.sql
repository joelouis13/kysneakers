-- VAT record-keeping: the rate applied and the amount already included in
-- orders.total (VAT-inclusive pricing, per EU consumer-law display norms —
-- see lib/currency/vat.ts). Both default to 0 for orders with no VAT
-- liability (everywhere except Netherlands, for now), stored in the order's
-- own currency (orders.currency), not always GHS.
alter table public.orders
  add column vat_rate numeric(5, 4) not null default 0 check (vat_rate >= 0 and vat_rate < 1),
  add column vat_amount numeric(10, 2) not null default 0 check (vat_amount >= 0);
