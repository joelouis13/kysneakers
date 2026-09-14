import Link from "next/link";
import {
  Briefcase,
  Footprints,
  Recycle,
  ShoppingBag,
  Shirt,
  SprayCan,
  Tag,
  type LucideIcon,
} from "lucide-react";

import { getCategories } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

/** Keyed by slug — falls back to a generic tag icon for any category without a specific match. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  sneakers: Footprints,
  perfumes: SprayCan,
  "t-shirts": Shirt,
  suits: Briefcase,
  bags: ShoppingBag,
  "2nd-hand-shop": Recycle,
};

export async function CategoryStrip() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 font-heading text-3xl tracking-wide text-foreground">
        Shop by Category
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.slug] ?? Tag;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-3 py-5 text-center transition-colors hover:border-primary hover:shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-medium tracking-wide text-foreground">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
