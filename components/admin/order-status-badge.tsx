import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/database";

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  ready_for_dispatch: "Ready for Dispatch",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const NEGATIVE_STATUSES = new Set<OrderStatus>(["cancelled", "refunded"]);

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={NEGATIVE_STATUSES.has(status) ? "destructive" : "secondary"}>{LABELS[status]}</Badge>
  );
}
