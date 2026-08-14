"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateInventoryQuantity } from "@/lib/admin/inventory/actions";
import type { AdminInventoryRow } from "@/lib/admin/inventory/types";

function InventoryRow({ row }: { row: AdminInventoryRow }) {
  const [value, setValue] = useState(String(row.quantity));
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = value !== "" && Number(value) !== row.quantity;

  async function handleSave() {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      toast.error("Enter a valid stock quantity.");
      return;
    }
    setIsSaving(true);
    const result = await updateInventoryQuantity(row.inventoryId, row.productSlug, quantity);
    setIsSaving(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Stock updated");
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{row.productName}</p>
        <p className="text-xs text-muted-foreground">Size {row.size}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {row.isLowStock && <Badge variant="destructive">Low Stock</Badge>}
        <span className="text-xs text-muted-foreground">Alert at {row.lowStockThreshold}</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-20"
        />
        <Button size="sm" variant="outline" onClick={handleSave} disabled={!isDirty || isSaving}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export function InventoryList({ rows }: { rows: AdminInventoryRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No inventory rows found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <InventoryRow key={row.inventoryId} row={row} />
      ))}
    </div>
  );
}
