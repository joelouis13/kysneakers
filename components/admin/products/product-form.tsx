"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/admin/products/actions";
import { buildProductFormSchema, type ProductFormValues } from "@/lib/admin/products/schemas";
import type { AdminProductDetail } from "@/lib/admin/products/types";
import type { ProductBrand, ProductCategoryRef } from "@/lib/catalog/types";
import { slugify } from "@/lib/catalog/slugify";

import { ImagePicker, toImageInputs, type ImageDraft } from "./image-picker";

/**
 * `valueAsNumber` reads the input's native `.valueAsNumber`, which is `NaN`
 * for an empty number input — not `undefined`. Zod's `.optional()` only
 * treats `undefined` as "not provided", so an empty optional field was
 * failing validation as an invalid number instead of being skipped.
 */
function optionalNumber(value: string) {
  return value === "" ? undefined : Number(value);
}

/** Bags have no size variant — a single stock count/threshold still needs a `size` value to satisfy the DB row, so this fills in for the hidden input. */
const BAGS_SIZE_LABEL = "One Size";

function defaultValuesFor(product?: AdminProductDetail): ProductFormValues {
  if (!product) {
    return {
      sku: "",
      name: "",
      slug: "",
      description: "",
      brandId: "",
      categoryId: "",
      regularPrice: undefined,
      isOnSale: false,
      salePrice: undefined,
      eurRegularPrice: undefined,
      eurSalePrice: undefined,
      weightGrams: undefined,
      tags: "",
      isFeatured: false,
      isNewArrival: false,
      isFlashSale: false,
      isInternationalOnly: false,
      isGhanaOnly: false,
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
    eurRegularPrice: product.eurRegularPrice ?? undefined,
    eurSalePrice: product.eurSalePrice ?? undefined,
    weightGrams: product.weightGrams ?? undefined,
    tags: product.tags.join(", "),
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isFlashSale: product.isFlashSale,
    isInternationalOnly: product.isInternationalOnly,
    isGhanaOnly: product.isGhanaOnly,
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
  const perfumeCategoryId = useMemo(
    () => categories.find((c) => c.slug === "perfumes")?.id ?? null,
    [categories]
  );
  const bagsCategoryId = useMemo(() => categories.find((c) => c.slug === "bags")?.id ?? null, [categories]);
  const schema = useMemo(() => buildProductFormSchema(perfumeCategoryId), [perfumeCategoryId]);
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
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesFor(initialProduct),
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "sizes" });
  const isOnSale = useWatch({ control, name: "isOnSale" });
  const isInternationalOnly = useWatch({ control, name: "isInternationalOnly" });
  const isGhanaOnly = useWatch({ control, name: "isGhanaOnly" });
  const watchedStatus = useWatch({ control, name: "status" });
  const name = useWatch({ control, name: "name" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const isPerfumeCategory = perfumeCategoryId !== null && categoryId === perfumeCategoryId;
  const isBagsCategory = bagsCategoryId !== null && categoryId === bagsCategoryId;

  // Bags have no size dimension, but (unlike Perfumes) still need a real
  // stock count/threshold — collapse to exactly one row with a fixed
  // placeholder size whenever Bags is selected, so there's always a valid
  // row for the hidden Stock/Low Stock Alert inputs to write into.
  useEffect(() => {
    if (!isBagsCategory) return;
    const current = getValues("sizes");
    if (current.length === 1 && current[0].size === BAGS_SIZE_LABEL) return;
    replace([
      {
        id: current[0]?.id,
        size: BAGS_SIZE_LABEL,
        quantity: current[0]?.quantity ?? 0,
        lowStockThreshold: current[0]?.lowStockThreshold ?? 5,
      },
    ]);
  }, [isBagsCategory, getValues, replace]);

  useEffect(() => {
    if (!slugTouched && name) {
      setValue("slug", slugify(name));
    }
  }, [name, slugTouched, setValue]);

  async function onSubmit(values: ProductFormValues) {
    const imageInputs = toImageInputs(images);

    let result;
    try {
      result =
        mode === "create"
          ? await createProduct(values, imageInputs)
          : await updateProduct(initialProduct!.id, values, imageInputs);
    } catch {
      // A thrown/rejected Server Action call (e.g. exceeding the request
      // body size limit, a network drop) never reaches the try/catch inside
      // createProduct/updateProduct — without this, it fails with zero
      // feedback: the button just stops spinning and nothing else happens.
      toast.error("Something went wrong saving the product. Please try again.");
      return;
    }

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
            <Label className="mb-1.5">Regular Price (GHS, optional)</Label>
            <Input
              type="number"
              step="0.01"
              aria-invalid={!!errors.regularPrice}
              {...register("regularPrice", { setValueAs: optionalNumber })}
            />
            {errors.regularPrice ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.regularPrice.message}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Leave blank to auto-convert from EUR at the current exchange rate.
              </p>
            )}
          </div>
          <div>
            <Label className="mb-1.5">Weight (grams, optional)</Label>
            <Input type="number" step="1" {...register("weightGrams", { setValueAs: optionalNumber })} />
          </div>
          <div>
            <Label className="mb-1.5">Regular Price (EUR, optional)</Label>
            <Input
              type="number"
              step="0.01"
              aria-invalid={!!errors.eurRegularPrice}
              {...register("eurRegularPrice", { setValueAs: optionalNumber })}
            />
            {errors.eurRegularPrice ? (
              <p className="mt-1.5 text-xs text-destructive">{errors.eurRegularPrice.message}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Leave blank to auto-convert from GHS at the current exchange rate.
              </p>
            )}
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
            <>
              <div>
                <Label className="mb-1.5">Sale Price (GHS)</Label>
                <Input
                  type="number"
                  step="0.01"
                  aria-invalid={!!errors.salePrice}
                  {...register("salePrice", { setValueAs: optionalNumber })}
                />
                {errors.salePrice && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.salePrice.message}</p>
                )}
              </div>
              <div>
                <Label className="mb-1.5">Sale Price (EUR, optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  aria-invalid={!!errors.eurSalePrice}
                  {...register("eurSalePrice", { setValueAs: optionalNumber })}
                />
                {errors.eurSalePrice ? (
                  <p className="mt-1.5 text-xs text-destructive">{errors.eurSalePrice.message}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Leave blank to auto-convert from GHS at the current exchange rate.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl tracking-wide text-foreground">Sizes &amp; Stock</h2>
        {isPerfumeCategory && (
          <p className="mb-2 text-xs text-muted-foreground">
            Optional for Perfumes — remove all sizes for a single-variant fragrance.
          </p>
        )}
        {isBagsCategory && (
          <p className="mb-2 text-xs text-muted-foreground">
            Bags have no size — just set the stock count and low stock alert below.
          </p>
        )}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              {!isBagsCategory && (
                <div>
                  <Label className="mb-1.5">Size</Label>
                  <Input className="w-20" {...register(`sizes.${index}.size` as const)} />
                </div>
              )}
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
              {!isBagsCategory && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1 && !isPerfumeCategory}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors.sizes && !Array.isArray(errors.sizes) && (
          <p className="mt-1.5 text-xs text-destructive">{errors.sizes.message}</p>
        )}
        {!isBagsCategory && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => append({ size: "", quantity: 0, lowStockThreshold: 5 })}
          >
            + Add Size
          </Button>
        )}
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="isFlashSale"
              onCheckedChange={(checked) => setValue("isFlashSale", checked === true)}
              defaultChecked={initialProduct?.isFlashSale}
            />
            <Label htmlFor="isFlashSale" className="font-normal">
              Flash Sales
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isInternationalOnly"
              checked={isInternationalOnly}
              onCheckedChange={(checked) => {
                setValue("isInternationalOnly", checked === true);
                if (checked === true) setValue("isGhanaOnly", false);
              }}
            />
            <Label htmlFor="isInternationalOnly" className="font-normal">
              International Only
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isGhanaOnly"
              checked={isGhanaOnly}
              onCheckedChange={(checked) => {
                setValue("isGhanaOnly", checked === true);
                if (checked === true) setValue("isInternationalOnly", false);
              }}
            />
            <Label htmlFor="isGhanaOnly" className="font-normal">
              Ghana Only
            </Label>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground sm:col-span-2">
            International Only hides this product from Ghana visitors (shows for EUR/USD/GBP shoppers only). Ghana
            Only does the reverse — hides it from everyone outside Ghana. A product can only use one at a time.
          </p>
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
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {watchedStatus === "out_of_stock" && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Stays visible and browsable on the storefront, but shows as out of stock and can&apos;t be
                purchased — regardless of the real stock counts below.
              </p>
            )}
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
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting
          ? mode === "create"
            ? "Creating..."
            : "Saving..."
          : mode === "create"
            ? "Create Product"
            : "Save Changes"}
      </Button>
    </form>
  );
}
