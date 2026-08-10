import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/products/product-form";
import { getBrands, getCategories } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Add Product",
};

export default async function NewProductPage() {
  const supabase = await createClient();
  const [brands, categories] = await Promise.all([getBrands(supabase), getCategories(supabase)]);

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Add Product</h1>
      <ProductForm mode="create" brands={brands} categories={categories} />
    </div>
  );
}
