import type { Metadata } from "next";

import { ProductSection } from "@/components/home/product-section";
import {
  getBestSellers,
  getFeaturedProducts,
  getFlashSaleProducts,
  getNewArrivals,
} from "@/lib/catalog/queries";
import { isGhanaVisitor } from "@/lib/currency/detect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated KYSneakers collections — Flash Sales, Featured, New Arrivals, and Best Sellers.",
};

export default async function CollectionsPage() {
  const supabase = await createClient();
  const isGhana = await isGhanaVisitor();
  const [flashSales, featured, newArrivals, bestSellers] = await Promise.all([
    getFlashSaleProducts(supabase, 8, isGhana),
    getFeaturedProducts(supabase, 8, isGhana),
    getNewArrivals(supabase, 8, isGhana),
    getBestSellers(supabase, 8, isGhana),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl tracking-wide text-foreground">Collections</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Curated edits of the catalog — hand-picked for every kind of sneakerhead.
      </p>

      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <ProductSection
          title="Flash Sales"
          subtitle="Limited-time deals — grab them before they're gone"
          products={flashSales}
          viewAllHref="/shop?filter=flash-sale"
        />
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
          subtitle="Get the most-loved products before they sell out"
          products={bestSellers}
          viewAllHref="/shop?sort=popular"
        />
      </div>
    </div>
  );
}
