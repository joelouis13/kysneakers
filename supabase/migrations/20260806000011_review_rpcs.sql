-- get_approved_reviews: public reviews_select_approved RLS lets anyone read
-- approved review rows, but profiles_select_own RLS only lets a user read
-- their OWN profile — so a plain join from reviews to profiles would return
-- null reviewer names for everyone except the viewer's own reviews. This
-- security definer function (same pattern as is_staff()/current_profile_role()
-- in roles_and_profiles.sql) safely exposes just the reviewer's display name
-- for already-public (approved) reviews, without opening up profiles itself.
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
    coalesce(p.full_name, 'Anonymous') as reviewer_name,
    (r.order_item_id is not null) as verified_purchase
  from public.reviews r
  left join public.profiles p on p.id = r.profile_id
  where r.product_id = p_product_id and r.status = 'approved'
  order by r.created_at desc;
$$;

grant execute on function public.get_approved_reviews to anon, authenticated;
