import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BrandList } from "@/components/admin/brands/brand-list";
import { listAdminBrands } from "@/lib/admin/brands/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Brands",
};

export default async function AdminBrandsPage() {
  const supabase = await createClient();
  const brands = await listAdminBrands(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Brands</h1>
        <Button asChild>
          <Link href="/admin/brands/new">Add Brand</Link>
        </Button>
      </div>

      <BrandList brands={brands} />
    </div>
  );
}
