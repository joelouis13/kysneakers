import Image from "next/image";

import { InstagramIcon } from "@/components/icons/social";
import { queryProducts } from "@/lib/catalog/queries";
import { isGhanaVisitor } from "@/lib/currency/detect";
import { createClient } from "@/lib/supabase/server";

export async function InstagramGallery() {
  const supabase = await createClient();
  const isGhana = await isGhanaVisitor();
  const { products } = await queryProducts(supabase, {
    isFeatured: true,
    sort: "newest",
    perPage: 6,
    isGhana,
  });
  const galleryImages = products
    .map((p) => p.primaryImageUrl)
    .filter((url): url is string => Boolean(url));

  if (galleryImages.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-3xl tracking-wide text-foreground">
          @kysneakers
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tag us for a chance to be featured
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {galleryImages.map((src, i) => (
          <a
            key={src}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={src}
              alt={`KYSneakers Instagram post ${i + 1}`}
              fill
              sizes="(min-width: 1024px) 16vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
              <InstagramIcon className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
