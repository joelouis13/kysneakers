"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { restoreProduct, softDeleteProduct } from "@/lib/admin/products/actions";
import type { AdminProductListItem } from "@/lib/admin/products/types";
import { formatCurrency } from "@/lib/currency/format";

type ConfirmTarget = { id: string; slug: string; name: string; action: "delete" | "restore" };

export function ProductList({ products }: { products: AdminProductListItem[] }) {
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [isActing, setIsActing] = useState(false);

  async function handleConfirm() {
    if (!confirmTarget) return;
    setIsActing(true);
    const result =
      confirmTarget.action === "delete"
        ? await softDeleteProduct(confirmTarget.id, confirmTarget.slug)
        : await restoreProduct(confirmTarget.id, confirmTarget.slug);
    setIsActing(false);
    setConfirmTarget(null);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(confirmTarget.action === "delete" ? "Product deleted" : "Product restored");
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.primaryImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- remote Supabase Storage URL, admin-only thumbnail
                  <img src={product.primaryImageUrl} alt="" className="size-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.sku} · {product.brandName ?? "No brand"} · {product.categoryName ?? "No category"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(product.salePrice ?? product.regularPrice, "GHS")}
              </span>
              <span className="text-xs text-muted-foreground">{product.totalStock} in stock</span>
              <Badge variant={product.status === "active" ? "secondary" : "destructive"}>
                {product.status}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Row actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  {product.deletedAt ? (
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmTarget({ id: product.id, slug: product.slug, name: product.name, action: "restore" })
                      }
                    >
                      Restore
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        setConfirmTarget({ id: product.id, slug: product.slug, name: product.name, action: "delete" })
                      }
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.action === "delete" ? "Delete product?" : "Restore product?"}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.action === "delete"
                ? `"${confirmTarget?.name}" will be hidden from the storefront. You can restore it later from the Deleted view.`
                : `"${confirmTarget?.name}" will become visible on the storefront again (if its status is Active).`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={isActing}>
              Cancel
            </Button>
            <Button
              variant={confirmTarget?.action === "delete" ? "destructive" : "secondary"}
              onClick={handleConfirm}
              disabled={isActing}
            >
              {confirmTarget?.action === "delete" ? "Delete" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
