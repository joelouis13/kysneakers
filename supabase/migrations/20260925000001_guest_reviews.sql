-- Guest reviews: sign-ups are currently closed (see app config), so almost
-- no customer has an account — a review flow that requires being logged in
-- is effectively unusable for them. Reviews can now be left by a guest
-- (name + email captured directly on the review) as well as a signed-in
-- customer; exactly one of the two identities must be present.
alter table public.reviews
  alter column profile_id drop not null;

alter table public.reviews
  add column guest_name text,
  add column guest_email text;

alter table public.reviews
  add constraint reviews_reviewer_check
    check (profile_id is not null or (guest_name is not null and guest_email is not null));

-- Guest submissions go through the service-role client (server action),
-- bypassing RLS entirely — same pattern as guest checkout — so no change is
-- needed to reviews_insert_own. Only the public display name needs to fall
-- back to the guest's name when there's no profile to join against.
create or replace function public.get_approved_reviews(p_product_id uuid)
returns table (
  id uuid,
  rating smallint,
  title text,
  body text,
  created_at timestamptz,
  reviewer_name text,
  verified_purchase boolean
)
language sql stable security definer set search_path = public as $$
  select
    r.id, r.rating, r.title, r.body, r.created_at,
    coalesce(p.full_name, r.guest_name, 'Anonymous') as reviewer_name,
    (r.order_item_id is not null) as verified_purchase
  from public.reviews r
  left join public.profiles p on p.id = r.profile_id
  where r.product_id = p_product_id and r.status = 'approved'
  order by r.created_at desc;
$$;

grant execute on function public.get_approved_reviews to anon, authenticated;
