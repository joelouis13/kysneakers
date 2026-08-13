-- International payments (Stripe) alongside the existing Ghana-only Moolre
-- rails. orders.currency snapshots which currency the order was actually
-- placed/charged in (orders.total/subtotal/delivery_fee are stored in
-- whatever this says, not always GHS); payments.method gains 'card' for
-- Stripe.

alter table public.orders
  add column currency text not null default 'GHS';

alter table public.payments
  drop constraint payments_method_check;

alter table public.payments
  add constraint payments_method_check
  check (method in ('mtn_momo', 'telecel_cash', 'airteltigo_money', 'card'));
