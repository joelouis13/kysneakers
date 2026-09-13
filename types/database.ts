/**
 * Hand-written stand-in for `supabase gen types typescript` — there is no
 * live Supabase project yet. Once one exists, regenerate this file from the
 * real schema; the shape (Database -> public -> Tables/Functions) must match
 * what `@supabase/supabase-js`'s generic client expects.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Row fields that have a DB default or are nullable become optional on Insert. */
type Table<
  Row extends Record<string, unknown>,
  OptionalOnInsert extends keyof Row = never,
> = {
  Row: Row;
  Insert: Omit<Row, OptionalOnInsert> & Partial<Pick<Row, OptionalOnInsert>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type RoleName = "super_admin" | "admin" | "manager" | "staff" | "customer";
export type ProductStatus = "draft" | "active" | "archived";
export type CouponDiscountType = "percentage" | "fixed_amount";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "ready_for_dispatch"
  | "dispatched"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentMethod = "mtn_momo" | "telecel_cash" | "airteltigo_money" | "card";
export type PaymentStatus = "initiated" | "pending" | "successful" | "failed" | "refunded";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type NotificationChannel = "email" | "sms" | "in_app";

export interface Database {
  public: {
    Tables: {
      roles: Table<
        { id: number; name: RoleName; description: string | null },
        "description"
      >;
      profiles: Table<
        {
          id: string;
          role_id: number;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        "role_id" | "full_name" | "phone" | "avatar_url" | "date_of_birth" | "is_active" | "created_at" | "updated_at"
      >;
      categories: Table<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        },
        "id" | "description" | "image_url" | "parent_id" | "display_order" | "is_active" | "created_at" | "updated_at" | "deleted_at"
      >;
      brands: Table<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        },
        "id" | "description" | "logo_url" | "is_active" | "created_at" | "updated_at" | "deleted_at"
      >;
      products: Table<
        {
          id: string;
          sku: string;
          name: string;
          slug: string;
          description: string | null;
          brand_id: string | null;
          category_id: string | null;
          regular_price: number;
          sale_price: number | null;
          eur_regular_price: number | null;
          eur_sale_price: number | null;
          sale_starts_at: string | null;
          sale_ends_at: string | null;
          weight_grams: number | null;
          tags: string[];
          is_featured: boolean;
          is_new_arrival: boolean;
          is_on_sale: boolean;
          status: ProductStatus;
          seo_title: string | null;
          seo_description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        },
        | "id"
        | "description"
        | "brand_id"
        | "category_id"
        | "sale_price"
        | "eur_regular_price"
        | "eur_sale_price"
        | "sale_starts_at"
        | "sale_ends_at"
        | "weight_grams"
        | "tags"
        | "is_featured"
        | "is_new_arrival"
        | "is_on_sale"
        | "status"
        | "seo_title"
        | "seo_description"
        | "created_by"
        | "created_at"
        | "updated_at"
        | "deleted_at"
      >;
      product_images: Table<
        {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          display_order: number;
          is_featured: boolean;
          created_at: string;
        },
        "id" | "alt_text" | "display_order" | "is_featured" | "created_at"
      >;
      product_sizes: Table<
        {
          id: string;
          product_id: string;
          size: string;
          price_adjustment: number;
          created_at: string;
        },
        "id" | "price_adjustment" | "created_at"
      >;
      inventory: Table<
        {
          id: string;
          product_size_id: string;
          quantity: number;
          low_stock_threshold: number;
          updated_at: string;
        },
        "id" | "quantity" | "low_stock_threshold" | "updated_at"
      >;
      addresses: Table<
        {
          id: string;
          profile_id: string;
          label: string;
          recipient_name: string;
          phone: string;
          region: string;
          city: string;
          street_address: string;
          house_address: string | null;
          landmark: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        },
        "id" | "label" | "house_address" | "landmark" | "is_default" | "created_at" | "updated_at"
      >;
      shipping_zones: Table<
        {
          id: string;
          name: string;
          delivery_fee: number;
          estimated_days_min: number;
          estimated_days_max: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        "id" | "is_active" | "created_at" | "updated_at"
      >;
      coupons: Table<
        {
          id: string;
          code: string;
          discount_type: CouponDiscountType;
          discount_value: number;
          minimum_purchase: number;
          usage_limit: number | null;
          times_used: number;
          starts_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        },
        | "id"
        | "minimum_purchase"
        | "usage_limit"
        | "times_used"
        | "starts_at"
        | "expires_at"
        | "is_active"
        | "created_at"
        | "updated_at"
        | "deleted_at"
      >;
      carts: Table<
        {
          id: string;
          profile_id: string | null;
          session_id: string | null;
          created_at: string;
          updated_at: string;
        },
        "id" | "profile_id" | "session_id" | "created_at" | "updated_at"
      >;
      cart_items: Table<
        {
          id: string;
          cart_id: string;
          product_size_id: string;
          quantity: number;
          saved_for_later: boolean;
          created_at: string;
          updated_at: string;
        },
        "id" | "saved_for_later" | "created_at" | "updated_at"
      >;
      wishlists: Table<
        { id: string; profile_id: string; created_at: string },
        "id" | "created_at"
      >;
      wishlist_items: Table<
        { id: string; wishlist_id: string; product_id: string; created_at: string },
        "id" | "created_at"
      >;
      orders: Table<
        {
          id: string;
          order_number: string;
          profile_id: string | null;
          status: OrderStatus;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_address_id: string | null;
          shipping_zone_id: string | null;
          shipping_recipient_name: string;
          shipping_phone: string;
          shipping_region: string | null;
          shipping_city: string;
          shipping_street_address: string;
          shipping_house_address: string | null;
          shipping_landmark: string | null;
          shipping_country: string | null;
          shipping_postal_code: string | null;
          delivery_fee: number;
          subtotal: number;
          discount_total: number;
          coupon_id: string | null;
          total: number;
          currency: string;
          vat_rate: number;
          vat_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        | "id"
        | "profile_id"
        | "status"
        | "shipping_address_id"
        | "shipping_zone_id"
        | "shipping_region"
        | "shipping_house_address"
        | "shipping_landmark"
        | "shipping_country"
        | "shipping_postal_code"
        | "delivery_fee"
        | "discount_total"
        | "coupon_id"
        | "currency"
        | "vat_rate"
        | "vat_amount"
        | "notes"
        | "created_at"
        | "updated_at"
      >;
      order_items: Table<
        {
          id: string;
          order_id: string;
          product_id: string | null;
          product_size_id: string | null;
          product_name: string;
          size: string;
          sku: string;
          unit_price: number;
          quantity: number;
          line_total: number;
          created_at: string;
        },
        "id" | "product_id" | "product_size_id" | "created_at"
      >;
      payments: Table<
        {
          id: string;
          order_id: string;
          provider: string;
          method: PaymentMethod;
          amount: number;
          currency: string;
          status: PaymentStatus;
          payer_phone: string | null;
          provider_reference: string | null;
          provider_message: string | null;
          webhook_payload: Json | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        },
        | "id"
        | "provider"
        | "currency"
        | "status"
        | "payer_phone"
        | "provider_reference"
        | "provider_message"
        | "webhook_payload"
        | "verified_at"
        | "created_at"
        | "updated_at"
      >;
      reviews: Table<
        {
          id: string;
          product_id: string;
          profile_id: string;
          order_item_id: string | null;
          rating: number;
          title: string | null;
          body: string | null;
          image_urls: string[];
          status: ReviewStatus;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        },
        | "id"
        | "order_item_id"
        | "title"
        | "body"
        | "image_urls"
        | "status"
        | "created_at"
        | "updated_at"
        | "deleted_at"
      >;
      notifications: Table<
        {
          id: string;
          profile_id: string | null;
          channel: NotificationChannel;
          type: string;
          title: string;
          body: string | null;
          metadata: Json;
          is_read: boolean;
          sent_at: string | null;
          created_at: string;
        },
        "id" | "profile_id" | "body" | "metadata" | "is_read" | "sent_at" | "created_at"
      >;
      settings: Table<
        {
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        },
        "description" | "updated_by" | "updated_at"
      >;
      audit_logs: Table<
        {
          id: string;
          profile_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          previous_value: Json | null;
          new_value: Json | null;
          created_at: string;
        },
        "id" | "profile_id" | "record_id" | "previous_value" | "new_value" | "created_at"
      >;
    };
    Views: Record<string, never>;
    Functions: {
      current_profile_role: { Args: Record<string, never>; Returns: RoleName | null };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      search_products: {
        Args: {
          p_q?: string | null;
          p_brand_slugs?: string[] | null;
          p_category_slugs?: string[] | null;
          p_sizes?: string[] | null;
          p_min_price?: number | null;
          p_max_price?: number | null;
          p_in_stock?: boolean | null;
          p_is_featured?: boolean | null;
          p_is_new_arrival?: boolean | null;
          p_is_on_sale?: boolean | null;
          p_exclude_id?: string | null;
          p_status?: string | null;
          p_sort?: string | null;
          p_limit?: number | null;
          p_offset?: number | null;
        };
        Returns: {
          id: string;
          sku: string;
          name: string;
          slug: string;
          description: string | null;
          brand_id: string | null;
          brand_name: string | null;
          brand_slug: string | null;
          category_id: string | null;
          category_name: string | null;
          category_slug: string | null;
          regular_price: number;
          sale_price: number | null;
          effective_price: number;
          eur_regular_price: number | null;
          eur_sale_price: number | null;
          eur_effective_price: number | null;
          is_featured: boolean;
          is_new_arrival: boolean;
          is_on_sale: boolean;
          tags: string[];
          created_at: string;
          primary_image_url: string | null;
          total_stock: number;
          review_count: number;
          rating_avg: number | null;
          total_count: number;
        }[];
      };
      get_catalog_facets: {
        Args: Record<string, never>;
        Returns: {
          sizes: string[] | null;
          brands: { id: string; name: string; slug: string }[] | null;
          categories: { id: string; name: string; slug: string }[] | null;
          min_price: number | null;
          max_price: number | null;
        }[];
      };
      get_approved_reviews: {
        Args: { p_product_id: string };
        Returns: {
          id: string;
          rating: number;
          title: string | null;
          body: string | null;
          created_at: string;
          reviewer_name: string;
          verified_purchase: boolean;
        }[];
      };
      increment_coupon_usage: {
        Args: { p_coupon_id: string };
        Returns: {
          id: string;
          code: string;
          discount_type: CouponDiscountType;
          discount_value: number;
          minimum_purchase: number;
          usage_limit: number | null;
          times_used: number;
          starts_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        } | null;
      };
      confirm_payment_success: {
        Args: {
          p_payment_id: string;
          p_provider_reference: string;
          p_webhook_payload: Json;
        };
        Returns: {
          order_id: string;
          order_status: OrderStatus;
          payment_status: PaymentStatus;
          newly_confirmed: boolean;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
