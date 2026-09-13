import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/shop/pagination";
import { ProductResults } from "@/components/shop/product-results";
import { SortSelect } from "@/components/shop/sort-select";
import { getCategoryBySlug, queryProducts } from "@/lib/catalog/queries";
import { parseProductSearchParams } from "@/lib/catalog/search-params";
import { isGhanaVisitor } from "@/lib/currency/detect";
import { createClient } from "@/lib/supabase/server";

type RawSearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `Shop ${category.name} at KYSneakers.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) notFound();

  const sp = await searchParams;
  const isGhana = await isGhanaVisitor();
  const result = await queryProducts(supabase, {
    ...parseProductSearchParams(sp),
    category: [slug],
    isGhana,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">{category.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? "product" : "products"}
          </p>
        </div>
        <SortSelect />
      </div>

      <ProductResults products={result.products} />

      <Pagination
        pathname={`/categories/${slug}`}
        searchParams={sp}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
