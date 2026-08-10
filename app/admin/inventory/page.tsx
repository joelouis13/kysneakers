import type { Metadata } from "next";

import { InventoryFilters } from "@/components/admin/inventory/inventory-filters";
import { InventoryList } from "@/components/admin/inventory/inventory-list";
import { listAdminInventory } from "@/lib/admin/inventory/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Inventory",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const rows = await listAdminInventory(supabase, {
    q: typeof sp.q === "string" ? sp.q : undefined,
    lowStockOnly: sp.lowStock === "1",
  });

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Inventory</h1>
      <InventoryFilters />
      <InventoryList rows={rows} />
    </div>
  );
}
