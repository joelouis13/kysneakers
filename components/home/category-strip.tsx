import Image from "next/image";
import Link from "next/link";

import { getCategories } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export async function CategoryStrip() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 font-heading text-3xl tracking-wide text-foreground">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            <span className="absolute bottom-4 left-4 font-heading text-xl tracking-wide text-white">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
