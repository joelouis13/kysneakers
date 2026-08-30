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
import { createCategory, updateCategory } from "@/lib/admin/categories/actions";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/admin/categories/schemas";
import type { AdminCategoryDetail } from "@/lib/admin/categories/types";
import { slugify } from "@/lib/catalog/slugify";

function defaultValuesFor(category?: AdminCategoryDetail): CategoryFormValues {
  if (!category) {
    return {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      displayOrder: 0,
      isActive: true,
    };
  }
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    imageUrl: category.imageUrl ?? "",
    displayOrder: category.displayOrder,
    isActive: category.isActive,
  };
}

export function CategoryForm({
  mode,
  initialCategory,
}: {
  mode: "create" | "edit";
  initialCategory?: AdminCategoryDetail;
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultValuesFor(initialCategory),
  });

  const isActive = useWatch({ control, name: "isActive" });
  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name));
    }
  }, [name, slugTouched, setValue]);

  async function onSubmit(values: CategoryFormValues) {
    const result =
      mode === "create"
        ? await createCategory(values)
        : await updateCategory(initialCategory!.id, values);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "create" ? "Category created" : "Category updated");
    router.push("/admin/categories");
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
        <Label className="mb-1.5">Image URL (optional)</Label>
        <Input placeholder="/products/... or https://..." {...register("imageUrl")} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Shown as the tile image on the /categories page. Leave blank for a plain tile.
        </p>
      </div>

      <div>
        <Label className="mb-1.5">Display Order</Label>
        <Input
          type="number"
          step="1"
          aria-invalid={!!errors.displayOrder}
          {...register("displayOrder", { valueAsNumber: true })}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Lower numbers appear first on the /categories page.
        </p>
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
            ? "Create Category"
            : "Save Changes"}
      </Button>
    </form>
  );
}
