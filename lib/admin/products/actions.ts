"use server";

import { revalidatePath } from "next/cache";

import { logAudit, requireStaffUser } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";

import { productFormSchema, parseTags, type ProductFormValues } from "./schemas";
import { removeProductImage, uploadProductImage } from "./storage";
import type { ImageInput } from "./types";

function mapUniqueViolation(message: string): string | null {
  if (message.includes("products_sku_key")) return "That SKU is already in use.";
  if (message.includes("products_slug_key")) return "That URL slug is already in use — try a different one.";
  if (message.includes("product_sizes_product_id_size_key")) return "Each size can only appear once.";
  return null;
}

function scalarProductFields(values: ProductFormValues) {
  return {
    sku: values.sku,
    name: values.name,
    slug: values.slug,
    description: values.description || null,
    brand_id: values.brandId || null,
    category_id: values.categoryId || null,
    regular_price: values.regularPrice,
    sale_price: values.isOnSale ? (values.salePrice ?? null) : null,
    weight_grams: values.weightGrams ?? null,
    tags: parseTags(values.tags),
    is_featured: values.isFeatured,
    is_new_arrival: values.isNewArrival,
    is_on_sale: values.isOnSale,
    status: values.status,
    seo_title: values.seoTitle || null,
    seo_description: values.seoDescription || null,
  };
}

export async function createProduct(
  values: ProductFormValues,
  images: ImageInput[]
): Promise<{ error: string } | { success: true; productId: string; slug: string }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const productId = crypto.randomUUID();

  try {
    const uploaded = await Promise.all(
      images.map(async (img, index) => {
        if (img.kind === "new") {
          const url = await uploadProductImage(supabase, productId, img.file);
          return { url, isFeatured: img.isFeatured, displayOrder: index };
        }
        // Create never has "existing" images, but stay defensive.
        return null;
      })
    );
    const imageRows = uploaded.filter((r): r is NonNullable<typeof r> => r !== null);

    // Client enforces exactly one featured image; fall back to the first if none was marked.
    if (imageRows.length > 0 && !imageRows.some((r) => r.isFeatured)) {
      imageRows[0].isFeatured = true;
    }

    const { error: insertError } = await supabase
      .from("products")
      .insert({ id: productId, created_by: staff.userId, ...scalarProductFields(parsed.data) });
    if (insertError) {
      const friendly = mapUniqueViolation(insertError.message);
      return { error: friendly ?? "Couldn't create the product. Please try again." };
    }

    if (imageRows.length > 0) {
      const { error: imagesError } = await supabase.from("product_images").insert(
        imageRows.map((r) => ({
          product_id: productId,
          url: r.url,
          display_order: r.displayOrder,
          is_featured: r.isFeatured,
        }))
      );
      if (imagesError) return { error: "Product created, but saving images failed. Edit the product to retry." };
    }

    const { data: sizeRows, error: sizesError } = await supabase
      .from("product_sizes")
      .insert(parsed.data.sizes.map((s) => ({ product_id: productId, size: s.size })))
      .select("id,size");
    if (sizesError) {
      const friendly = mapUniqueViolation(sizesError.message);
      return { error: friendly ?? "Product created, but saving sizes failed. Edit the product to retry." };
    }

    const inventoryPayload = (sizeRows ?? []).map((row) => {
      const match = parsed.data.sizes.find((s) => s.size === row.size);
      return {
        product_size_id: row.id,
        quantity: match?.quantity ?? 0,
        low_stock_threshold: match?.lowStockThreshold ?? 5,
      };
    });
    const { error: inventoryError } = await supabase.from("inventory").insert(inventoryPayload);
    if (inventoryError) {
      return { error: "Product created, but saving stock failed. Edit the product to retry." };
    }

    await logAudit("products", "product_created", productId, staff.userId, parsed.data);

    revalidatePath("/admin/products");
    revalidatePath(`/product/${parsed.data.slug}`);

    return { success: true, productId, slug: parsed.data.slug };
  } catch {
    return { error: "Couldn't create the product. Please try again." };
  }
}

export async function updateProduct(
  productId: string,
  values: ProductFormValues,
  images: ImageInput[]
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    // --- Images: clear-then-set, so the partial unique index on
    // (product_id) where is_featured never transiently sees two rows true.
    const { data: currentImages, error: currentImagesError } = await supabase
      .from("product_images")
      .select("id,url")
      .eq("product_id", productId);
    if (currentImagesError) return { error: "Couldn't load the product's current images." };

    const keptIds = new Set(
      images.filter((i): i is Extract<ImageInput, { kind: "existing" }> => i.kind === "existing").map((i) => i.id)
    );
    const removed = (currentImages ?? []).filter((img) => !keptIds.has(img.id));

    await supabase.from("product_images").update({ is_featured: false }).eq("product_id", productId);

    if (removed.length > 0) {
      await supabase
        .from("product_images")
        .delete()
        .in("id", removed.map((r) => r.id));
      await Promise.all(removed.map((r) => removeProductImage(supabase, r.url)));
    }

    const hasFeatured = images.some((i) => i.isFeatured);

    for (let index = 0; index < images.length; index++) {
      const img = images[index];
      const isFeatured = img.isFeatured || (!hasFeatured && index === 0);

      if (img.kind === "new") {
        const url = await uploadProductImage(supabase, productId, img.file);
        await supabase.from("product_images").insert({
          product_id: productId,
          url,
          display_order: index,
          is_featured: isFeatured,
        });
      } else {
        await supabase
          .from("product_images")
          .update({ display_order: index, is_featured: isFeatured })
          .eq("id", img.id);
      }
    }

    // --- Scalar fields
    const { error: updateError } = await supabase
      .from("products")
      .update(scalarProductFields(parsed.data))
      .eq("id", productId);
    if (updateError) {
      const friendly = mapUniqueViolation(updateError.message);
      return { error: friendly ?? "Couldn't save the product. Please try again." };
    }

    // --- Sizes/inventory diff
    const { data: currentSizes, error: currentSizesError } = await supabase
      .from("product_sizes")
      .select("id,size")
      .eq("product_id", productId);
    if (currentSizesError) return { error: "Couldn't load the product's current sizes." };

    const incomingIds = new Set(parsed.data.sizes.map((s) => s.id).filter(Boolean));
    const sizesToDelete = (currentSizes ?? []).filter((s) => !incomingIds.has(s.id));
    if (sizesToDelete.length > 0) {
      await supabase
        .from("product_sizes")
        .delete()
        .in("id", sizesToDelete.map((s) => s.id));
    }

    for (const size of parsed.data.sizes) {
      if (size.id) {
        await supabase.from("product_sizes").update({ size: size.size }).eq("id", size.id);
        const { error: invError } = await supabase
          .from("inventory")
          .update({ quantity: size.quantity, low_stock_threshold: size.lowStockThreshold })
          .eq("product_size_id", size.id);
        if (invError) {
          // No inventory row exists yet for this size — create one.
          await supabase.from("inventory").insert({
            product_size_id: size.id,
            quantity: size.quantity,
            low_stock_threshold: size.lowStockThreshold,
          });
        }
      } else {
        const { data: newSize, error: newSizeError } = await supabase
          .from("product_sizes")
          .insert({ product_id: productId, size: size.size })
          .select("id")
          .single();
        if (newSizeError) {
          const friendly = mapUniqueViolation(newSizeError.message);
          return { error: friendly ?? "Couldn't save one of the sizes." };
        }
        await supabase.from("inventory").insert({
          product_size_id: newSize.id,
          quantity: size.quantity,
          low_stock_threshold: size.lowStockThreshold,
        });
      }
    }

    await logAudit("products", "product_updated", productId, staff.userId, parsed.data);

    revalidatePath("/admin/products");
    revalidatePath(`/product/${parsed.data.slug}`);

    return { success: true };
  } catch {
    return { error: "Couldn't save the product. Please try again." };
  }
}

export async function softDeleteProduct(
  productId: string,
  slug: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", productId);
  if (error) return { error: "Couldn't delete the product. Please try again." };

  await logAudit("products", "product_soft_deleted", productId, staff.userId, null);

  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);

  return { success: true };
}

export async function restoreProduct(
  productId: string,
  slug: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const staff = await requireStaffUser(supabase);
  if ("error" in staff) return staff;

  const { error } = await supabase
    .from("products")
    .update({ deleted_at: null })
    .eq("id", productId);
  if (error) return { error: "Couldn't restore the product. Please try again." };

  await logAudit("products", "product_restored", productId, staff.userId, null);

  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);

  return { success: true };
}
