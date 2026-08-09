"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shop/product-card";
import { useProductsBySlugs } from "@/lib/catalog/hooks";
import { useWishlist } from "@/lib/wishlist/wishlist-context";

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const { data: products, isLoading } = useProductsBySlugs(slugs);

  if (slugs.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <Heart className="size-12 text-icon" />
        <h1 className="mt-4 font-heading text-2xl tracking-wide text-foreground">
          Your wishlist is empty
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the heart on any product to save it here.
        </p>
        <Button size="lg" variant="secondary" className="mt-6" asChild>
          <Link href="/shop">Browse Sneakers</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Wishlist</h1>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
          {slugs.map((slug) => (
            <Skeleton key={slug} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  const resolved = products ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-heading text-3xl tracking-wide text-foreground">Wishlist</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {resolved.length} {resolved.length === 1 ? "item" : "items"} saved
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
        {resolved.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
