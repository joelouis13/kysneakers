import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { AdminBrandDetail, AdminBrandListItem } from "./types";

type Client = SupabaseClient<Database>;

const LIST_SELECT = `
  id, name, slug, logo_url, is_active,
  products ( count )
`;

type ListRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  products: { count: number }[];
};

export async function listAdminBrands(supabase: Client): Promise<AdminBrandListItem[]> {
  const { data, error } = await supabase.from("brands").select(LIST_SELECT).order("name");
  if (error) throw error;

  return (data as unknown as ListRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    isActive: row.is_active,
    productCount: row.products[0]?.count ?? 0,
  }));
}

const DETAIL_SELECT = "id, name, slug, description, logo_url, is_active";

type DetailRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
};

export async function getAdminBrandById(supabase: Client, id: string): Promise<AdminBrandDetail | null> {
  const { data, error } = await supabase.from("brands").select(DETAIL_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as DetailRow;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logo_url,
    isActive: row.is_active,
  };
}
