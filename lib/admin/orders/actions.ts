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
