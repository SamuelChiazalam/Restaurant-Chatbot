import "express-session";

declare module "express-session" {
  interface SessionData {
    currentOrder: string[];
    orderHistory: string[][];
    isOrdering: boolean;
    paymentReference?: string;
    scheduledOrders?: ScheduledOrder[];
  }
}

export interface ScheduledOrder {
  id: string;
  items: string[];
  scheduledTime: Date;
  status: "pending" | "completed" | "cancelled";
}
