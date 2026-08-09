"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { reviewSchema, type ReviewValues } from "./schemas";

export async function submitReview(
  productId: string,
  productSlug: string,
  values: ReviewValues
): Promise<{ error: string } | { success: true }> {
  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to leave a review." };

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    profile_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    body: parsed.data.body,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You've already reviewed this product." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}
