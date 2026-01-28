import axios from "axios";
import { PaymentVerification } from "../types/index";

const PAYSTACK_API_URL = "https://api.paystack.co";

// Get the secret key dynamically to ensure dotenv has loaded it
function getPaystackSecretKey(): string {
  const key = (process.env.PAYSTACK_SECRET_KEY || "").trim();
  if (!key) {
    console.warn(
      "⚠️  PAYSTACK_SECRET_KEY is not set in environment variables. Payment functionality will not work.",
    );
  }
  return key;
}

export class PaymentService {
  /**
   * Initialize a payment transaction with Paystack
   */
  static async initializePayment(
    email: string,
    amount: number,
    reference: string,
  ) {
    try {
      const PAYSTACK_SECRET_KEY = getPaystackSecretKey();

      // Validate that secret key is configured
      if (!PAYSTACK_SECRET_KEY) {
        console.error(
          "❌ PAYSTACK_SECRET_KEY is not configured. Please set it in your .env file.",
        );
        return {
          status: false,
          message: "Payment service is not configured. Please contact support.",
          error: "Missing PAYSTACK_SECRET_KEY",
        };
      }

      const response = await axios.post(
        `${PAYSTACK_API_URL}/transaction/initialize`,
        {
          email,
          amount: Math.round(amount * 100), // Convert to kobo (Paystack requires amount in kobo)
          reference,
          metadata: {
            custom_fields: [
              {
                display_name: "Order Reference",
                variable_name: "order_ref",
                value: reference,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        status: true,
        data: response.data.data,
        message: "Payment initialized successfully",
      };
    } catch (error: any) {
      console.error(
        "Payment initialization error:",
        error.response?.data || error.message,
      );
      return {
        status: false,
        message: "Failed to initialize payment",
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Verify a payment transaction
   */
  static async verifyPayment(reference: string): Promise<PaymentVerification> {
    try {
      const PAYSTACK_SECRET_KEY = getPaystackSecretKey();

      const response = await axios.get(
        `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data.data;

      return {
        status: data.status === "success",
        message:
          data.status === "success" ? "Payment verified" : "Payment failed",
        data: {
          reference: data.reference,
          amount: data.amount / 100, // Convert from kobo to naira
          status: data.status,
          paid_at: data.paid_at,
          customer: {
            email: data.customer.email,
            customer_code: data.customer.customer_code,
          },
        },
      };
    } catch (error: any) {
      console.error(
        "Payment verification error:",
        error.response?.data || error.message,
      );
      return {
        status: false,
        message: "Failed to verify payment",
      };
    }
  }
}

export default PaymentService;
