import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/categories/category-form";

export const metadata: Metadata = {
  title: "Add Category",
};

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Add Category</h1>
      <CategoryForm mode="create" />
    </div>
  );
}
