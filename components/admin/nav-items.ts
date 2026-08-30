import {
  LayoutDashboard,
  Package,
  Tags,
  BadgeCheck,
  Boxes,
  ClipboardList,
  Users,
  Ticket,
  Star,
  BarChart3,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, enabled: true },
  { label: "Products", href: "/admin/products", icon: Package, enabled: true },
  { label: "Categories", href: "/admin/categories", icon: Tags, enabled: true },
  { label: "Brands", href: "/admin/brands", icon: BadgeCheck, enabled: true },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes, enabled: true },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList, enabled: true },
  { label: "Customers", href: "/admin/customers", icon: Users, enabled: false },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket, enabled: false },
  { label: "Reviews", href: "/admin/reviews", icon: Star, enabled: false },
  { label: "Reports", href: "/admin/reports", icon: BarChart3, enabled: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, enabled: false },
  { label: "Users", href: "/admin/users", icon: ShieldCheck, enabled: false },
];
