"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/admin/products/actions";
import { productFormSchema, type ProductFormValues } from "@/lib/admin/products/schemas";
import type { AdminProductDetail } from "@/lib/admin/products/types";
import type { ProductBrand, ProductCategoryRef } from "@/lib/catalog/types";
import { slugify } from "@/lib/catalog/slugify";

import { ImagePicker, toImageInputs, type ImageDraft } from "./image-picker";

function defaultValuesFor(product?: AdminProductDetail): ProductFormValues {
  if (!product) {
    return {
      sku: "",
      name: "",
      slug: "",
      description: "",
      brandId: "",
      categoryId: "",
      regularPrice: 0,
      isOnSale: false,
      salePrice: undefined,
      weightGrams: undefined,
      tags: "",
      isFeatured: false,
      isNewArrival: false,
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      sizes: [{ size: "", quantity: 0, lowStockThreshold: 5 }],
    };
  }
  return {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    brandId: product.brandId ?? "",
    categoryId: product.categoryId ?? "",
    regularPrice: product.regularPrice,
    isOnSale: product.isOnSale,
    salePrice: product.salePrice ?? undefined,
    weightGrams: product.weightGrams ?? undefined,
    tags: product.tags.join(", "),
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    status: product.status,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    sizes: product.sizes.map((s) => ({
      id: s.id,
      size: s.size,
      quantity: s.quantity,
      lowStockThreshold: s.lowStockThreshold,
    })),
  };
}

export function ProductForm({
  mode,
  initialProduct,
  brands,
  categories,
}: {
  mode: "create" | "edit";
  initialProduct?: AdminProductDetail;
  brands: ProductBrand[];
  categories: ProductCategoryRef[];
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [images, setImages] = useState<ImageDraft[]>(
    () =>
      initialProduct?.images.map((img) => ({
        kind: "existing" as const,
        id: img.id,
        url: img.url,
        isFeatured: img.isFeatured,
      })) ?? []
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValuesFor(initialProduct),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "sizes" });
  const isOnSale = useWatch({ control, name: "isOnSale" });
  const name = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name));
    }
  }, [name, slugTouched, setValue]);

  async function onSubmit(values: ProductFormValues) {
    const imageInputs = toImageInputs(images);

    const result =
      mode === "create"
        ? await createProduct(values, imageInputs)
        : await updateProduct(initialProduct!.id, values, imageInputs);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "create" ? "Product created" : "Product updated");
    router.push("/admin/products");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      <section>
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">Basics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5">SKU</Label>
            <Input aria-invalid={!!errors.sku} {...register("sku")} />
            {errors.sku && <p className="mt-1.5 text-xs text-destructive">{errors.sku.message}</p>}
          </div>
          <div>
            <Label className="mb-1.5">Product Name</Label>
            <Input aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5">URL Slug</Label>
            <Input
              aria-invalid={!!errors.slug}
              {...register("slug", { onChange: () => setSlugTouched(true) })}
            />
            {errors.slug && <p className="mt-1.5 text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5">Description</Label>
            <Textarea rows={4} {...register("description")} />
          </div>
          <div>
            <Label className="mb-1.5">Brand</Label>
            <Select
              defaultValue={initialProduct?.brandId ?? ""}
              onValueChange={(v) => setValue("brandId", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No brand</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5">Category</Label>
            <Select
              defaultValue={initialProduct?.categoryId ?? ""}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">Pricing</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5">Regular Price (GHS)</Label>
            <Input
              type="number"
              step="0.01"
              aria-invalid={!!errors.regularPrice}
              {...register("regularPrice", { valueAsNumber: true })}
            />
            {errors.regularPrice && (
              <p className="mt-1.5 text-xs text-destructive">{errors.regularPrice.message}</p>
            )}
          </div>
          <div>
            <Label className="mb-1.5">Weight (grams, optional)</Label>
            <Input type="number" step="1" {...register("weightGrams", { valueAsNumber: true })} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isOnSale"
              checked={isOnSale}
              onCheckedChange={(checked) => setValue("isOnSale", checked === true)}
            />
            <Label htmlFor="isOnSale" className="font-normal">
              On Sale
            </Label>
          </div>
          {isOnSale && (
            <div>
              <Label className="mb-1.5">Sale Price (GHS)</Label>
              <Input
                type="number"
                step="0.01"
                aria-invalid={!!errors.salePrice}
                {...register("salePrice", { valueAsNumber: true })}
              />
              {errors.salePrice && (
                <p className="mt-1.5 text-xs text-destructive">{errors.salePrice.message}</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">Sizes &amp; Stock</h2>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <div>
                <Label className="mb-1.5">Size</Label>
                <Input className="w-20" {...register(`sizes.${index}.size` as const)} />
              </div>
              <div>
                <Label className="mb-1.5">Stock</Label>
                <Input
                  type="number"
                  className="w-24"
                  {...register(`sizes.${index}.quantity` as const, { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label className="mb-1.5">Low Stock Alert</Label>
                <Input
                  type="number"
                  className="w-28"
                  {...register(`sizes.${index}.lowStockThreshold` as const, { valueAsNumber: true })}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        {errors.sizes && !Array.isArray(errors.sizes) && (
          <p className="mt-1.5 text-xs text-destructive">{errors.sizes.message}</p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => append({ size: "", quantity: 0, lowStockThreshold: 5 })}
        >
          + Add Size
        </Button>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">Images</h2>
        <ImagePicker value={images} onChange={setImages} />
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">Organization</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isFeatured"
              onCheckedChange={(checked) => setValue("isFeatured", checked === true)}
              defaultChecked={initialProduct?.isFeatured}
            />
            <Label htmlFor="isFeatured" className="font-normal">
              Featured Product
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isNewArrival"
              onCheckedChange={(checked) => setValue("isNewArrival", checked === true)}
              defaultChecked={initialProduct?.isNewArrival}
            />
            <Label htmlFor="isNewArrival" className="font-normal">
              New Arrival
            </Label>
          </div>
          <div>
            <Label className="mb-1.5">Tags (comma-separated)</Label>
            <Input {...register("tags")} />
          </div>
          <div>
            <Label className="mb-1.5">Status</Label>
            <Select
              defaultValue={initialProduct?.status ?? "draft"}
              onValueChange={(v) => setValue("status", v as ProductFormValues["status"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">SEO</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5">SEO Title</Label>
            <Input {...register("seoTitle")} />
          </div>
          <div>
            <Label className="mb-1.5">SEO Description</Label>
            <Textarea rows={3} {...register("seoDescription")} />
          </div>
        </div>
      </section>

      <Button type="submit" size="lg" variant="secondary" disabled={isSubmitting}>
        {mode === "create" ? "Create Product" : "Save Changes"}
      </Button>
    </form>
  );
}
