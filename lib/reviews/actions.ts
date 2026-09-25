"use server";

import { revalidatePath } from "next/cache";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

import { buildReviewSchema, type ReviewValues } from "./schemas";

export async function submitReview(
  productId: string,
  productSlug: string,
  values: ReviewValues
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Never trust a client-supplied "I'm logged in" flag — re-derive whether
  // guest info is required from the actual server-side session.
  const parsed = buildReviewSchema(!user).safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const base = {
    product_id: productId,
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    body: parsed.data.body,
  };

  // Guests write via the service-role client (bypassing RLS), same pattern
  // as guest checkout — reviews_insert_own only covers the signed-in path.
  const { error } = user
    ? await supabase.from("reviews").insert({ ...base, profile_id: user.id })
    : await createServiceRoleClient()
        .from("reviews")
        .insert({ ...base, guest_name: parsed.data.guestName, guest_email: parsed.data.guestEmail });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already reviewed this product." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}
