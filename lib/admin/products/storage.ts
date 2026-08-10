import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const BUCKET = "product-images";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function extensionFromMimeType(mimeType: string): string {
  return EXTENSION_BY_MIME[mimeType] ?? "jpg";
}

/** Uploads via the cookie-bound client — RLS's staff_manage_media_buckets policy already allows this for an authenticated staff session, no service-role needed. */
export async function uploadProductImage(
  supabase: Client,
  productId: string,
  file: File
): Promise<string> {
  const path = `${productId}/${crypto.randomUUID()}.${extensionFromMimeType(file.type)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

/** Best-effort — a missing/already-removed storage object should never block the DB row deletion that triggers this. */
export async function removeProductImage(supabase: Client, url: string): Promise<void> {
  const path = storagePathFromPublicUrl(url);
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
