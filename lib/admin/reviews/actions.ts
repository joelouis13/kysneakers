"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAudit, requireStaffUser } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.enum(["pending", "approved", "rejected"]);

export async function updateReviewStatus(
  reviewId: string,
  status: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status." };

  const { error } = await supabase.from("reviews").update({ status: parsed.data }).eq("id", reviewId);
  if (error) return { error: "Couldn't update the review. Please try again." };

  await logAudit("reviews", "review_status_updated", reviewId, staff.userId, { status: parsed.data });

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReview(reviewId: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const { error } = await supabase
    .from("reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", reviewId);
  if (error) return { error: "Couldn't delete the review. Please try again." };

  await logAudit("reviews", "review_deleted", reviewId, staff.userId, null);

  revalidatePath("/admin/reviews");
  return { success: true };
}
