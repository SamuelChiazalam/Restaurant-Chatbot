import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import chatRoute from "./routes/chat";

dotenv.config();

declare module "express-session" {
  interface SessionData {
    currentOrder: string[];
    orderHistory: string[][];
    isOrdering: boolean;
    paymentReference?: string;
    awaitingPayment?: boolean;
    scheduledOrders?: ScheduledOrder[];
  }
}

interface ScheduledOrder {
  id: string;
  items: string[];
  scheduledTime: Date;
  status: "pending" | "completed" | "cancelled";
}

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - Device-based session tracking
app.use(
  session({
    secret: process.env.SESSION_SECRET || "restaurant-chatbot-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  }),
);

// Initialize session properties middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (!req.session.currentOrder) {
    req.session.currentOrder = [];
    req.session.orderHistory = [];
    req.session.isOrdering = false;
    req.session.scheduledOrders = [];
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use("/api/chat", chatRoute);

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
