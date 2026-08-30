import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { AdminCategoryDetail, AdminCategoryListItem } from "./types";

type Client = SupabaseClient<Database>;

const LIST_SELECT = `
  id, name, slug, image_url, display_order, is_active,
  products ( count )
`;

type ListRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  products: { count: number }[];
};

export async function listAdminCategories(supabase: Client): Promise<AdminCategoryListItem[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(LIST_SELECT)
    .order("display_order")
    .order("name");
  if (error) throw error;

  return (data as unknown as ListRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url,
    displayOrder: row.display_order,
    isActive: row.is_active,
    productCount: row.products[0]?.count ?? 0,
  }));
}

const DETAIL_SELECT = "id, name, slug, description, image_url, display_order, is_active";

type DetailRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export async function getAdminCategoryById(
  supabase: Client,
  id: string
): Promise<AdminCategoryDetail | null> {
  const { data, error } = await supabase.from("categories").select(DETAIL_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as DetailRow;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    displayOrder: row.display_order,
    isActive: row.is_active,
  };
}
