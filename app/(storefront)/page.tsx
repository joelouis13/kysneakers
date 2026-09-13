import { BrandStrip } from "@/components/home/brand-strip";
import { CategoryStrip } from "@/components/home/category-strip";
import { Hero } from "@/components/home/hero";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { Testimonials } from "@/components/home/testimonials";
import { getBestSellers, getFeaturedProducts, getNewArrivals } from "@/lib/catalog/queries";
import { isGhanaVisitor } from "@/lib/currency/detect";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const isGhana = await isGhanaVisitor();
  const [featured, bestSellers, newArrivals] = await Promise.all([
    getFeaturedProducts(supabase, 8, isGhana),
    getBestSellers(supabase, 8, isGhana),
    getNewArrivals(supabase, 8, isGhana),
  ]);

  return (
    <>
      <Hero />
      <CategoryStrip />
      <ProductSection
        title="Featured Products"
        subtitle="Hand-picked styles our team is loving right now"
        products={featured}
        viewAllHref="/shop?filter=featured"
      />
      <PromoBanner />
      <ProductSection
        title="Best Sellers"
        subtitle="Ghana's most-loved sneakers"
        products={bestSellers}
        viewAllHref="/shop?sort=popular"
      />
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh off the shelf"
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
      />
      <BrandStrip />
      <Testimonials />
      <InstagramGallery />
    </>
  );
}
