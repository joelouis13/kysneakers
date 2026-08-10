import type { Metadata } from "next";

import { ProductSection } from "@/components/home/product-section";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals,
  getOnSaleProducts,
} from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated KYSneakers collections — Featured, New Arrivals, Best Sellers, and Sale.",
};

export default async function CollectionsPage() {
  const supabase = await createClient();
  const [featured, newArrivals, bestSellers, onSale] = await Promise.all([
    getFeaturedProducts(supabase),
    getNewArrivals(supabase),
    getBestSellers(supabase),
    getOnSaleProducts(supabase),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl tracking-wide text-foreground">Collections</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Curated edits of the catalog — hand-picked for every kind of sneakerhead.
      </p>

      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <ProductSection
          title="Featured"
          subtitle="Hand-picked styles our team is loving right now"
          products={featured}
          viewAllHref="/shop?filter=featured"
        />
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh off the shelf"
          products={newArrivals}
          viewAllHref="/shop?sort=newest"
        />
        <ProductSection
          title="Best Sellers"
          subtitle="Ghana's most-loved sneakers"
          products={bestSellers}
          viewAllHref="/shop?sort=popular"
        />
        <ProductSection
          title="On Sale"
          subtitle="Limited-time markdowns"
          products={onSale}
          viewAllHref="/shop?filter=on-sale"
        />
      </div>
    </div>
  );
}
