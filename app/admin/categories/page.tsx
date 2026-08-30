import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CategoryList } from "@/components/admin/categories/category-list";
import { listAdminCategories } from "@/lib/admin/categories/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const categories = await listAdminCategories(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-3xl tracking-wide text-foreground">Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/new">Add Category</Link>
        </Button>
      </div>

      <CategoryList categories={categories} />
    </div>
  );
}
