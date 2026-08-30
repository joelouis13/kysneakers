"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrand, updateBrand } from "@/lib/admin/brands/actions";
import { brandFormSchema, type BrandFormValues } from "@/lib/admin/brands/schemas";
import type { AdminBrandDetail } from "@/lib/admin/brands/types";
import { slugify } from "@/lib/catalog/slugify";

function defaultValuesFor(brand?: AdminBrandDetail): BrandFormValues {
  if (!brand) {
    return { name: "", slug: "", description: "", logoUrl: "", isActive: true };
  }
  return {
    name: brand.name,
    slug: brand.slug,
    description: brand.description ?? "",
    logoUrl: brand.logoUrl ?? "",
    isActive: brand.isActive,
  };
}

export function BrandForm({
  mode,
  initialBrand,
}: {
  mode: "create" | "edit";
  initialBrand?: AdminBrandDetail;
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: defaultValuesFor(initialBrand),
  });

  const isActive = useWatch({ control, name: "isActive" });
  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name));
    }
  }, [name, slugTouched, setValue]);

  async function onSubmit(values: BrandFormValues) {
    const result =
      mode === "create" ? await createBrand(values) : await updateBrand(initialBrand!.id, values);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "create" ? "Brand created" : "Brand updated");
    router.push("/admin/brands");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-6">
      <div>
        <Label className="mb-1.5">Name</Label>
        <Input aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label className="mb-1.5">URL Slug</Label>
        <Input
          aria-invalid={!!errors.slug}
          {...register("slug", { onChange: () => setSlugTouched(true) })}
        />
        {errors.slug && <p className="mt-1.5 text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      <div>
        <Label className="mb-1.5">Description (optional)</Label>
        <Textarea rows={3} {...register("description")} />
      </div>

      <div>
        <Label className="mb-1.5">Logo URL (optional)</Label>
        <Input placeholder="/brands/... or https://..." {...register("logoUrl")} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setValue("isActive", checked === true)}
        />
        <Label htmlFor="isActive" className="font-normal">
          Active (visible on the storefront)
        </Label>
      </div>

      <Button type="submit" size="lg" variant="secondary" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting
          ? mode === "create"
            ? "Creating..."
            : "Saving..."
          : mode === "create"
            ? "Create Brand"
            : "Save Changes"}
      </Button>
    </form>
  );
}
