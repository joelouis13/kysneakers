import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ProductSection } from "@/components/home/product-section";
import { AddToCartForm } from "@/components/shop/add-to-cart-form";
import { ImageGallery } from "@/components/shop/image-gallery";
import { ProductPrice } from "@/components/shop/product-price";
import { ProductReviews } from "@/components/shop/product-reviews";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import { RESELLER_DISCLAIMER } from "@/lib/data/disclaimer";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .in("status", ["active", "out_of_stock"])
    .is("deleted_at", null);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const product = await getProductBySlug(supabase, slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: product.primaryImageUrl ? { images: [{ url: product.primaryImageUrl }] } : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const product = await getProductBySlug(supabase, slug);
  if (!product) notFound();

  const related = await getRelatedProducts(supabase, product);
  const inStock = product.totalStock > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="size-3" />
            <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images.map((i) => i.url)} productName={product.name} />

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {product.brandName}
          </p>
          <h1 className="mt-1 font-heading text-3xl tracking-wide text-foreground sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <ProductPrice
              regularPrice={product.regularPrice}
              salePrice={product.salePrice}
              eurRegularPrice={product.eurRegularPrice}
              eurSalePrice={product.eurSalePrice}
            />
          </div>

          <p className={cn("mt-2 text-sm font-medium", inStock ? "text-foreground" : "text-destructive")}>
            {inStock ? "In Stock" : "Out of Stock"}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-6 border-t border-border pt-6">
            <AddToCartForm product={product} />
          </div>

          <dl className="mt-8 space-y-2 border-t border-border pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">SKU</dt>
              <dd className="text-foreground">{product.sku}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Brand</dt>
              <dd className="text-foreground">{product.brandName}</dd>
            </div>
            {product.category && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="text-foreground">{product.category.name}</dd>
              </div>
            )}
          </dl>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{RESELLER_DISCLAIMER}</p>
        </div>
      </div>

      <ProductReviews productId={product.id} productSlug={product.slug} />

      {related.length > 0 && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <ProductSection
            title="You Might Also Like"
            products={related}
            viewAllHref={product.category ? `/categories/${product.category.slug}` : "/shop"}
          />
        </div>
      )}
    </div>
  );
}
