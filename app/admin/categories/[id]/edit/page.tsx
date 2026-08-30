import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/categories/category-form";
import { getAdminCategoryById } from "@/lib/admin/categories/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Category",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const category = await getAdminCategoryById(supabase, id);
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Edit Category</h1>
      <CategoryForm mode="edit" initialCategory={category} />
    </div>
  );
}
