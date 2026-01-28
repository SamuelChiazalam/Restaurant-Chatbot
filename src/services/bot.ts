import { menu } from "../data/menu";
import { v4 as uuidv4 } from "uuid";
import PaymentService from "./payment";

interface BotSession {
  currentOrder?: string[];
  orderHistory?: string[][];
  isOrdering?: boolean;
  paymentReference?: string;
  scheduledOrders?: ScheduledOrder[];
  awaitingPayment?: boolean;
}

interface ScheduledOrder {
  id: string;
  items: string[];
  scheduledTime: Date;
  status: "pending" | "completed" | "cancelled";
}

export class BotService {
  /**
   * Generate initial welcome message with menu options
   */
  static getWelcomeMessage(): string {
    return `🍽️ Welcome to Restaurant Chatbot! 🤖

How can I help you today?

Select 1️⃣ to Place an order
Select 99️⃣ to Checkout order
Select 98️⃣ to See order history
Select 97️⃣ to See current order
Select 0️⃣ to Cancel order`;
  }

  /**
   * Get the menu display
   */
  static getMenuDisplay(): string {
    const menuText = menu
      .map((item) => `${item.id}. ${item.name} - ₦${item.price}`)
      .join("\n");

    return `🍽️ **Our Menu** 🍽️\n\n${menuText}\n\nSelect an item number to add to your order.
Or select 99 to checkout.`;
  }

  /**
   * Handle menu selection
   */
  static handleMenuSelection(
    option: number,
    session: BotSession,
  ): { reply: string; paymentUrl?: string } {
    switch (option) {
      // Place an order
      case 1:
        session.isOrdering = true;
        return {
          reply: this.getMenuDisplay(),
        };

      // Checkout
      case 99:
        return this.handleCheckout(session);

      // Order history
      case 98:
        return this.handleOrderHistory(session);

      // Current order
      case 97:
        return this.handleCurrentOrder(session);

      // Cancel order
      case 0:
        return this.handleCancelOrder(session);

      default:
        return {
          reply:
            "❌ Invalid option. Please select from the menu.\n\n" +
            this.getWelcomeMessage(),
        };
    }
  }

  /**
   * Handle item selection for ordering
   */
  static addItemToOrder(itemId: number, session: BotSession): string {
    const selectedItem = menu.find((item) => item.id === itemId);

    if (!selectedItem) {
      return "❌ Invalid item selection. Please select a valid menu item.";
    }

    if (!session.currentOrder) {
      session.currentOrder = [];
    }

    const orderItem = `${selectedItem.name} - ₦${selectedItem.price}`;
    session.currentOrder.push(orderItem);

    return `✅ ${selectedItem.name} added to your order!\n\nSelect another item number to continue ordering
or select 99 to checkout.`;
  }

  /**
   * Handle checkout process
   */
  static handleCheckout(session: BotSession): {
    reply: string;
    paymentUrl?: string;
  } {
    if (!session.currentOrder || session.currentOrder.length === 0) {
      return {
        reply:
          "❌ No order to place.\n\nWould you like to place a new order?\n" +
          "Select 1 to start ordering or select 0 to exit.",
      };
    }

    // Initialize orderHistory if needed
    if (!session.orderHistory) {
      session.orderHistory = [];
    }

    // Calculate total
    const total = session.currentOrder.reduce((sum, item) => {
      const parts = item.split("₦");
      const priceStr = parts[1] || "0";
      const price = parseInt(priceStr) || 0;
      return sum + price;
    }, 0);

    // Move to order history
    session.orderHistory.push([...session.currentOrder]);
    const reference = `ORDER_${uuidv4().substring(0, 8).toUpperCase()}`;
    session.paymentReference = reference;

    const lastOrder = session.orderHistory[session.orderHistory.length - 1];
    const orderSummary = (lastOrder || [])
      .map((item, idx) => `${idx + 1}. ${item}`)
      .join("\n");

    session.currentOrder = [];
    session.isOrdering = false;
    session.awaitingPayment = true;

    return {
      reply: `✅ Order placed successfully!\n\n📦 Your Order Summary:\n${orderSummary}\n\n💰 Total Amount: ₦${total}\n\nOrder Reference: ${reference}\n\nSelect 1 to proceed to payment or select 0 to exit.`,
    };
  }

  /**
   * Handle order history
   */
  static handleOrderHistory(session: BotSession): { reply: string } {
    if (!session.orderHistory || session.orderHistory.length === 0) {
      return {
        reply:
          "📭 You have no order history.\n\nWould you like to place a new order?\nSelect 1 to start.",
      };
    }

    const historyText = session.orderHistory
      .map(
        (order, index) =>
          `📦 Order ${index + 1}:\n${order
            .map((item, idx) => `  ${idx + 1}. ${item}`)
            .join("\n")}`,
      )
      .join("\n\n");

    return {
      reply: `📜 Your Order History:\n\n${historyText}\n\nSelect 1 to place a new order or 0 to exit.`,
    };
  }

  /**
   * Handle current order display
   */
  static handleCurrentOrder(session: BotSession): { reply: string } {
    if (!session.currentOrder || session.currentOrder.length === 0) {
      return {
        reply:
          "🛒 Your current order is empty.\n\nSelect 1 to start placing an order.",
      };
    }

    const total = session.currentOrder.reduce((sum, item) => {
      const parts = item.split("₦");
      const priceStr = parts[1] || "0";
      const price = parseInt(priceStr) || 0;
      return sum + price;
    }, 0);

    const orderText = session.currentOrder
      .map((item, idx) => `${idx + 1}. ${item}`)
      .join("\n");

    return {
      reply: `🧾 Your Current Order:\n\n${orderText}\n\n💰 Total: ₦${total}\n\nSelect 99 to checkout or continue adding items.`,
    };
  }

  /**
   * Handle order cancellation
   */
  static handleCancelOrder(session: BotSession): { reply: string } {
    if (!session.currentOrder || session.currentOrder.length === 0) {
      return {
        reply: "📭 No order to cancel.\n\nSelect 1 to place a new order.",
      };
    }

    session.currentOrder = [];
    session.isOrdering = false;

    return {
      reply:
        "❌ Your order has been cancelled.\n\n" +
        "Would you like to place a new order?\n" +
        this.getWelcomeMessage(),
    };
  }

  /**
   * Process payment initialization
   */
  static async initializePayment(
    orderReference: string,
    amount: number,
    email: string,
  ): Promise<{ success: boolean; paymentUrl?: string; message: string }> {
    try {
      const result = await PaymentService.initializePayment(
        email || "customer@restaurant.com",
        amount,
        orderReference,
      );

      if (result.status && result.data) {
        return {
          success: true,
          paymentUrl: result.data.authorization_url,
          message: "Payment initialized successfully",
        };
      }

      return {
        success: false,
        message: result.message || "Failed to initialize payment",
      };
    } catch (error) {
      console.error("Payment initialization error:", error);
      return {
        success: false,
        message: "Error initializing payment",
      };
    }
  }

  /**
   * Verify payment and update order status
   */
  static async verifyPayment(reference: string): Promise<{
    verified: boolean;
    message: string;
  }> {
    try {
      const result = await PaymentService.verifyPayment(reference);
      return {
        verified: result.status,
        message: result.message,
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        verified: false,
        message: "Error verifying payment",
      };
    }
  }

  /**
   * Calculate the total amount of the last order
   */
  static calculateOrderTotal(session: BotSession): number {
    if (!session.orderHistory || session.orderHistory.length === 0) {
      return 0;
    }

    const lastOrder = session.orderHistory[session.orderHistory.length - 1];
    if (!lastOrder) return 0;

    return lastOrder.reduce((sum, item) => {
      const parts = item.split("₦");
      const priceStr = parts[1] || "0";
      const price = parseInt(priceStr) || 0;
      return sum + price;
    }, 0);
  }

  /**
   * Handle payment initiation
   */
  static async handlePaymentInitiation(
    email: string,
    amount: number,
    reference: string,
    session: BotSession,
  ): Promise<{ reply: string; paymentUrl?: string }> {
    try {
      const paymentResult = await PaymentService.initializePayment(
        email,
        amount,
        reference,
      );

      if (paymentResult.status && paymentResult.data?.authorization_url) {
        session.awaitingPayment = false;
        return {
          reply: `✅ Payment initialized!\n\nYou'll be redirected to Paystack to complete your payment.\n\nAmount: ₦${amount}\nReference: ${reference}`,
          paymentUrl: paymentResult.data.authorization_url,
        };
      } else {
        return {
          reply: "❌ Failed to initialize payment. Please try again.",
        };
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      return {
        reply: "❌ Error initializing payment. Please try again.",
      };
    }
  }
}

export default BotService;
