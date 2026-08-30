import type { Metadata } from "next";

import { BrandForm } from "@/components/admin/brands/brand-form";

export const metadata: Metadata = {
  title: "Add Brand",
};

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl tracking-wide text-foreground">Add Brand</h1>
      <BrandForm mode="create" />
    </div>
  );
}
