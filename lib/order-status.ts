// lib/order-status.ts
export type OrderStatus =
  | "pending"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "preparing",
  "on_the_way",
  "delivered",
  "cancelled",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Order received",
  preparing: "Preparing your food",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  on_the_way: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

// Step index for the timeline (cancelled is a special case)
export const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  preparing: 1,
  on_the_way: 2,
  delivered: 3,
  cancelled: -1,
};