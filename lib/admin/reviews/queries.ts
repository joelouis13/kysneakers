import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { AdminReviewListItem, ReviewStatus } from "./types";

type Client = SupabaseClient<Database>;

export type AdminReviewFilters = {
  status?: ReviewStatus;
};

const LIST_SELECT = `
  id, rating, title, body, status, created_at, guest_name, guest_email,
  product:products ( id, name, slug ),
  profile:profiles ( full_name )
`;

type ListRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  product: { id: string; name: string; slug: string } | null;
  profile: { full_name: string | null } | null;
};

function mapRow(row: ListRow): AdminReviewListItem {
  return {
    id: row.id,
    productId: row.product?.id ?? "",
    productName: row.product?.name ?? "Unknown product",
    productSlug: row.product?.slug ?? "",
    reviewerName: row.guest_name ?? row.profile?.full_name ?? "Anonymous",
    reviewerEmail: row.guest_email,
    isGuest: !row.profile,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listAdminReviews(
  supabase: Client,
  filters: AdminReviewFilters
): Promise<AdminReviewListItem[]> {
  let query = supabase.from("reviews").select(LIST_SELECT).is("deleted_at", null);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ListRow[]).map(mapRow);
}
