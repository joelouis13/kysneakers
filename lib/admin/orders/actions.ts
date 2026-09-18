"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAudit, requireStaffUser } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";

const orderStatusSchema = z.enum([
  "pending_payment",
  "paid",
  "processing",
  "ready_for_dispatch",
  "dispatched",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
]);

/**
 * No status-transition state machine — any status is settable from any
 * status. Staff are trusted; the spec only asks that admins can update
 * statuses, not that transitions be constrained.
 */
export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid order status." };

  const { error } = await supabase.from("orders").update({ status: parsed.data }).eq("id", orderId);
  if (error) return { error: "Couldn't update the order. Please try again." };

  await logAudit("orders", "order_status_updated", orderId, staff.userId, { status: parsed.data });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");

  return { success: true };
}

/** Shown to the customer on the tracking page — distinct from `orders.notes`, the customer's own note left at checkout. */
export async function updateOrderComment(
  orderId: string,
  comment: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const trimmed = comment.trim();

  const { error } = await supabase
    .from("orders")
    .update({ staff_comment: trimmed || null })
    .eq("id", orderId);
  if (error) return { error: "Couldn't save the comment. Please try again." };

  await logAudit("orders", "order_comment_updated", orderId, staff.userId, { staff_comment: trimmed || null });

  revalidatePath(`/admin/orders/${orderId}`);

  return { success: true };
}
