-- Staff comment: a note admins write per order (e.g. "delayed due to
-- restock", "shipped via DHL, tracking XYZ") that customers see when they
-- track that order — distinct from `orders.notes`, which is the customer's
-- own note left at checkout. Nullable; empty means no comment has been left.
alter table public.orders
  add column staff_comment text;
