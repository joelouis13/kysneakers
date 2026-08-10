import type { Metadata } from "next";
import Link from "next/link";

import { getBrandsWithCounts } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Brands",
  description: "Shop authentic sneakers from Nike, Adidas, Jordan, New Balance, Puma, and more.",
};

export default async function BrandsPage() {
  const supabase = await createClient();
  const brands = await getBrandsWithCounts(supabase);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl tracking-wide text-foreground">Brands</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Authentic sneakers from the names you trust.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-8 text-center transition-colors hover:border-primary"
          >
            <span className="font-heading text-2xl tracking-wide text-foreground">{brand.name}</span>
            <span className="text-xs text-muted-foreground">{brand.productCount} styles</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
