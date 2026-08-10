"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logAudit, requireStaffUser } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";

const quantitySchema = z.number().int().min(0, "Stock can't be negative");

export async function updateInventoryQuantity(
  inventoryId: string,
  productSlug: string,
  quantity: number
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = quantitySchema.safeParse(quantity);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid quantity." };

  const { error } = await supabase
    .from("inventory")
    .update({ quantity: parsed.data })
    .eq("id", inventoryId);
  if (error) return { error: "Couldn't update stock. Please try again." };

  await logAudit("inventory", "inventory_adjusted", inventoryId, staff.userId, { quantity: parsed.data });

  revalidatePath("/admin/inventory");
  revalidatePath(`/product/${productSlug}`);

  return { success: true };
}
