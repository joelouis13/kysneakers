import { BrandStrip } from "@/components/home/brand-strip";
import { CategoryStrip } from "@/components/home/category-strip";
import { Hero } from "@/components/home/hero";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { Testimonials } from "@/components/home/testimonials";
import { getBestSellers, getFeaturedProducts, getNewArrivals } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const [featured, bestSellers, newArrivals] = await Promise.all([
    getFeaturedProducts(supabase),
    getBestSellers(supabase),
    getNewArrivals(supabase),
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
