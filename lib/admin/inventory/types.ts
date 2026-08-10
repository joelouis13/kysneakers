export type AdminInventoryRow = {
  inventoryId: string;
  productId: string;
  productName: string;
  productSlug: string;
  size: string;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
};
