import type { Metadata } from "next";

import { Pagination } from "@/components/shop/pagination";
import { ProductResults } from "@/components/shop/product-results";
import { ProductSearchInput } from "@/components/shop/product-search-input";
import { SortSelect } from "@/components/shop/sort-select";
import { parseProductSearchParams } from "@/lib/catalog/search-params";
import { queryProducts } from "@/lib/catalog/queries";
import type { ProductQueryResult } from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the KYSneakers catalog.",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";

  let result: ProductQueryResult = { products: [], total: 0, page: 1, perPage: 12, totalPages: 1 };
  if (query) {
    const supabase = await createClient();
    result = await queryProducts(supabase, parseProductSearchParams(sp));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} {result.total === 1 ? "product" : "products"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProductSearchInput placeholder="Search sneakers..." />
          <SortSelect />
        </div>
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
          <p className="text-lg font-semibold text-foreground">Start typing to search</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a brand, style, or product name.
          </p>
        </div>
      ) : (
        <>
          <ProductResults products={result.products} />
          <Pagination
            pathname="/search"
            searchParams={sp}
            page={result.page}
            totalPages={result.totalPages}
          />
        </>
      )}
    </div>
  );
}
