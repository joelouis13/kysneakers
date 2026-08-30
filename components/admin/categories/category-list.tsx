import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminCategoryListItem } from "@/lib/admin/categories/types";

export function CategoryList({ categories }: { categories: AdminCategoryListItem[] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No categories yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-border p-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {category.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- local/remote category tile image, admin-only thumbnail
                <img src={category.imageUrl} alt="" className="size-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{category.name}</p>
              <p className="text-xs text-muted-foreground">
                /{category.slug} · {category.productCount} product{category.productCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <Badge variant={category.isActive ? "secondary" : "destructive"}>
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/categories/${category.id}/edit`}>Edit</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
