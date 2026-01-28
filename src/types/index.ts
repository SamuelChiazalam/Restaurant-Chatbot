export interface Order {
  id: string;
  items: string[];
  total: number;
  timestamp: Date;
  status: "pending" | "completed" | "cancelled" | "paid";
  paymentReference?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export interface PaymentVerification {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    status: string;
    paid_at: string;
    customer: {
      email: string;
      customer_code: string;
    };
  };
}
