import { Router, Request, Response } from "express";
import BotService from "../services/bot";

const router = Router();

/**
 * Chat route handler - Main endpoint for all chat interactions
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const message = req.body.message?.trim();

    // Initialize session properties if they don't exist
    if (!req.session.currentOrder) {
      req.session.currentOrder = [];
    }
    if (!req.session.orderHistory) {
      req.session.orderHistory = [];
    }
    if (req.session.isOrdering === undefined) {
      req.session.isOrdering = false;
    }

    // 1️⃣ Validate input
    if (!message) {
      return res.json({
        reply: "Please enter a valid message.",
        showOptions: true,
      });
    }

    // Check if it's a number input
    if (isNaN(Number(message))) {
      return res.json({
        reply: "Invalid input. Please enter a number from the menu.",
        showOptions: true,
      });
    }

    const option = Number(message);

    // 2️⃣ Handle payment flow - if awaiting payment and user selects 1, initiate payment
    if (req.session.awaitingPayment) {
      if (option === 1) {
        // Initiate payment
        const amount = BotService.calculateOrderTotal(req.session as any);
        const userEmail = "user@example.com"; // Use a default email or get from session if available
        const paymentResult = await BotService.handlePaymentInitiation(
          userEmail,
          amount,
          req.session.paymentReference || "",
          req.session as any,
        );
        return res.json({
          reply: paymentResult.reply,
          paymentUrl: paymentResult.paymentUrl,
          showOptions: false,
          currentOrder: req.session.currentOrder,
          orderHistory: req.session.orderHistory,
        });
      } else if (option === 0) {
        // Cancel payment
        req.session.awaitingPayment = false;
        return res.json({
          reply:
            "Payment cancelled. How can I help you today?\n\nSelect 1 to place a new order or 0 to exit.",
          showOptions: true,
          currentOrder: req.session.currentOrder,
          orderHistory: req.session.orderHistory,
        });
      }
    }

    // 3️⃣ Handle item selection if user is ordering
    if (req.session.isOrdering && option !== 99 && option !== 0) {
      const addItemReply = BotService.addItemToOrder(
        option,
        req.session as any,
      );
      return res.json({
        reply: addItemReply,
        showOptions: false,
      });
    }

    // 4️⃣ Handle main menu commands
    const result = BotService.handleMenuSelection(option, req.session as any);

    return res.json({
      reply: result.reply,
      paymentUrl: result.paymentUrl,
      showOptions: true,
      currentOrder: req.session.currentOrder,
      orderHistory: req.session.orderHistory,
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({
      reply: "An error occurred. Please try again later.",
      showOptions: true,
    });
  }
});

/**
 * Initialize payment endpoint
 */
router.post("/payment/initialize", async (req: Request, res: Response) => {
  try {
    const { amount, email } = req.body;
    const orderReference = req.session.paymentReference;

    if (!orderReference) {
      return res.status(400).json({
        success: false,
        message: "No order reference found",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const result = await BotService.initializePayment(
      orderReference,
      amount,
      email || "customer@restaurant.com",
    );

    if (result.success) {
      return res.json({
        success: true,
        paymentUrl: result.paymentUrl,
        message: "Payment initialized successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: result.message || "Failed to initialize payment",
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return res.status(500).json({
      success: false,
      message: "Error initializing payment",
    });
  }
});

/**
 * Verify payment endpoint
 */
router.post("/payment/verify", async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "No reference provided",
      });
    }

    const result = await BotService.verifyPayment(reference);

    if (result.verified) {
      req.session.paymentReference = undefined as any;
      return res.json({
        success: true,
        message:
          "✅ Payment verified successfully! Your order will be processed soon.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
});

/**
 * Initialize chat session endpoint
 */
router.get("/init", (req: Request, res: Response) => {
  // Initialize session if needed
  if (!req.session.currentOrder) {
    req.session.currentOrder = [];
    req.session.orderHistory = [];
    req.session.isOrdering = false;
  }

  const welcomeMessage = BotService.getWelcomeMessage();
  res.json({
    reply: welcomeMessage,
    showOptions: true,
  });
});

export default router;
