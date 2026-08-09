import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { Review } from "./types";

type Client = SupabaseClient<Database>;

export async function getApprovedReviews(supabase: Client, productId: string): Promise<Review[]> {
  const { data, error } = await supabase.rpc("get_approved_reviews", { p_product_id: productId });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    reviewerName: row.reviewer_name,
    verifiedPurchase: row.verified_purchase,
    status: "approved" as const,
  }));
}

/**
 * A user's own review, regardless of status (RLS lets a user see their own
 * row whether pending/approved/rejected) — kept separate from
 * getApprovedReviews, which must never leak a caller's own pending/rejected
 * review into what's rendered as the public grid.
 */
export async function getMyReview(
  supabase: Client,
  productId: string,
  profileId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, body, created_at, status")
    .eq("product_id", productId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    rating: data.rating,
    title: data.title,
    body: data.body,
    createdAt: data.created_at,
    reviewerName: "You",
    verifiedPurchase: false,
    status: data.status,
  };
}

export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
