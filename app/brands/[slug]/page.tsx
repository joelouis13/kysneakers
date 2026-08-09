import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/shop/pagination";
import { ProductResults } from "@/components/shop/product-results";
import { SortSelect } from "@/components/shop/sort-select";
import { getBrandBySlug, queryProducts } from "@/lib/catalog/queries";
import { parseProductSearchParams } from "@/lib/catalog/search-params";
import { createClient } from "@/lib/supabase/server";

type RawSearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const brand = await getBrandBySlug(supabase, slug);
  if (!brand) return {};
  return {
    title: brand.name,
    description: `Shop authentic ${brand.name} sneakers at KYSneakers.`,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const brand = await getBrandBySlug(supabase, slug);
  if (!brand) notFound();

  const sp = await searchParams;
  const result = await queryProducts(supabase, { ...parseProductSearchParams(sp), brand: [slug] });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">{brand.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? "product" : "products"}
          </p>
        </div>
        <SortSelect />
      </div>

      <ProductResults products={result.products} />

      <Pagination
        pathname={`/brands/${slug}`}
        searchParams={sp}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
