import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminBrandListItem } from "@/lib/admin/brands/types";

export function BrandList({ brands }: { brands: AdminBrandListItem[] }) {
  if (brands.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No brands yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {brands.map((brand) => (
        <div
          key={brand.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border p-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {brand.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- local/remote brand logo, admin-only thumbnail
                <img src={brand.logoUrl} alt="" className="size-full object-contain" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{brand.name}</p>
              <p className="text-xs text-muted-foreground">
                /{brand.slug} · {brand.productCount} product{brand.productCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <Badge variant={brand.isActive ? "secondary" : "destructive"}>
              {brand.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/brands/${brand.id}/edit`}>Edit</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
