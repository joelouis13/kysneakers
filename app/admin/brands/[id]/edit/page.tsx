import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandForm } from "@/components/admin/brands/brand-form";
import { getAdminBrandById } from "@/lib/admin/brands/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Brand",
};

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const brand = await getAdminBrandById(supabase, id);
  if (!brand) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Edit Brand</h1>
      <BrandForm mode="edit" initialBrand={brand} />
    </div>
  );
}
