"use server";

import { revalidatePath } from "next/cache";

import { logAudit, requireStaffUser } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";

import { brandFormSchema, type BrandFormValues } from "./schemas";

function mapUniqueViolation(message: string): string | null {
  if (message.includes("brands_slug_key")) return "That URL slug is already in use — try a different one.";
  return null;
}

function scalarBrandFields(values: BrandFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    logo_url: values.logoUrl || null,
    is_active: values.isActive,
  };
}

export async function createBrand(
  values: BrandFormValues
): Promise<{ error: string } | { success: true; brandId: string }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = brandFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { data, error } = await supabase
    .from("brands")
    .insert(scalarBrandFields(parsed.data))
    .select("id")
    .single();
  if (error) {
    const friendly = mapUniqueViolation(error.message);
    return { error: friendly ?? "Couldn't create the brand. Please try again." };
  }

  await logAudit("brands", "brand_created", data.id, staff.userId, parsed.data);

  revalidatePath("/admin/brands");
  revalidatePath("/brands");

  return { success: true, brandId: data.id };
}

export async function updateBrand(
  brandId: string,
  values: BrandFormValues
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = brandFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.from("brands").update(scalarBrandFields(parsed.data)).eq("id", brandId);
  if (error) {
    const friendly = mapUniqueViolation(error.message);
    return { error: friendly ?? "Couldn't save the brand. Please try again." };
  }

  await logAudit("brands", "brand_updated", brandId, staff.userId, parsed.data);

  revalidatePath("/admin/brands");
  revalidatePath("/brands");

  return { success: true };
}
