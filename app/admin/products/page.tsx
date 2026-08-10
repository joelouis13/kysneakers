import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/components/admin/products/product-filters";
import { ProductList } from "@/components/admin/products/product-list";
import { getBrands, getCategories } from "@/lib/catalog/queries";
import { listAdminProducts, type AdminProductFilters } from "@/lib/admin/products/queries";
import { createClient } from "@/lib/supabase/server";
import type { ProductStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Products",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

const STATUSES: ProductStatus[] = ["draft", "active", "archived"];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const status = typeof sp.status === "string" && STATUSES.includes(sp.status as ProductStatus)
    ? (sp.status as ProductStatus)
    : undefined;

  const filters: AdminProductFilters = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    status,
    brandId: typeof sp.brand === "string" ? sp.brand : undefined,
    categoryId: typeof sp.category === "string" ? sp.category : undefined,
    view: sp.view === "deleted" ? "deleted" : "active",
  };

  const [products, brands, categories] = await Promise.all([
    listAdminProducts(supabase, filters),
    getBrands(supabase),
    getCategories(supabase),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <ProductFilters brands={brands} categories={categories} />
      <ProductList products={products} />
    </div>
  );
}
