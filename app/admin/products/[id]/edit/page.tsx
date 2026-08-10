import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/products/product-form";
import { getAdminProductById } from "@/lib/admin/products/queries";
import { getBrands, getCategories } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [product, brands, categories] = await Promise.all([
    getAdminProductById(supabase, id),
    getBrands(supabase),
    getCategories(supabase),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Edit Product</h1>
      <ProductForm mode="edit" initialProduct={product} brands={brands} categories={categories} />
    </div>
  );
}
