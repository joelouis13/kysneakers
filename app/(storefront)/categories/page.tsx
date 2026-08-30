import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCategoriesWithCounts } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse KYSneakers by category — Sneakers, Perfumes, T-Shirts, Suits, and Bags.",
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const categories = await getCategoriesWithCounts(supabase);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl tracking-wide text-foreground">Categories</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Browse everything we carry, by category.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative aspect-4/5 overflow-hidden rounded-xl bg-muted"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="font-heading text-2xl tracking-wide text-white">{category.name}</span>
              <p className="text-xs text-white/80">{category.productCount} styles</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
