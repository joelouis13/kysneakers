import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FiltersSidebar } from "@/components/shop/filters-sidebar";
import { Pagination } from "@/components/shop/pagination";
import { ProductResults } from "@/components/shop/product-results";
import { ProductSearchInput } from "@/components/shop/product-search-input";
import { SortSelect } from "@/components/shop/sort-select";
import { parseProductSearchParams } from "@/lib/catalog/search-params";
import { queryProducts } from "@/lib/catalog/queries";
import { isGhanaVisitor } from "@/lib/currency/detect";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full KYSneakers catalog — filter by brand, category, size, and price.",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const isGhana = await isGhanaVisitor();
  const result = await queryProducts(supabase, { ...parseProductSearchParams(sp), isGhana });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Shop</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FiltersSidebar />
        </aside>

        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="size-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-6">
                    <FiltersSidebar />
                  </div>
                </SheetContent>
              </Sheet>
              <ProductSearchInput />
            </div>
            <SortSelect />
          </div>

          <ProductResults products={result.products} />

          <Pagination
            pathname="/shop"
            searchParams={sp}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </div>
  );
}
