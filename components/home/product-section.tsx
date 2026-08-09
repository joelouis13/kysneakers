import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import type { ProductSummary } from "@/lib/catalog/types";

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  products: ProductSummary[];
  viewAllHref: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-3xl tracking-wide text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-secondary sm:flex"
        >
          View All <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <Link
        href={viewAllHref}
        className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-secondary sm:hidden"
      >
        View All <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
