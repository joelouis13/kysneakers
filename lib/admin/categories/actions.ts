"use server";

import { revalidatePath } from "next/cache";

import { logAudit, requireStaffUser } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";

import { categoryFormSchema, type CategoryFormValues } from "./schemas";

function mapUniqueViolation(message: string): string | null {
  if (message.includes("categories_slug_key")) return "That URL slug is already in use — try a different one.";
  return null;
}

function scalarCategoryFields(values: CategoryFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    image_url: values.imageUrl || null,
    display_order: values.displayOrder,
    is_active: values.isActive,
  };
}

export async function createCategory(
  values: CategoryFormValues
): Promise<{ error: string } | { success: true; categoryId: string }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert(scalarCategoryFields(parsed.data))
    .select("id")
    .single();
  if (error) {
    const friendly = mapUniqueViolation(error.message);
    return { error: friendly ?? "Couldn't create the category. Please try again." };
  }

  await logAudit("categories", "category_created", data.id, staff.userId, parsed.data);

  revalidatePath("/admin/categories");
  revalidatePath("/categories");

  return { success: true, categoryId: data.id };
}

export async function updateCategory(
  categoryId: string,
  values: CategoryFormValues
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("categories")
    .update(scalarCategoryFields(parsed.data))
    .eq("id", categoryId);
  if (error) {
    const friendly = mapUniqueViolation(error.message);
    return { error: friendly ?? "Couldn't save the category. Please try again." };
  }

  await logAudit("categories", "category_updated", categoryId, staff.userId, parsed.data);

  revalidatePath("/admin/categories");
  revalidatePath("/categories");

  return { success: true };
}
