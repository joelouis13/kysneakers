import Link from "next/link";

import { getBrands } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export async function BrandStrip() {
  const supabase = await createClient();
  const brands = await getBrands(supabase);

  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Shop Your Favorite Brands
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="font-heading text-2xl tracking-wide text-muted-foreground transition-colors hover:text-primary"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
