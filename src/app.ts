// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Route imports
import riotRoutes from "./routes/riot";
import previewRoutes from "./routes/preview";
import socialRoutes from "./routes/social";
import challengeRoutes from "./routes/challenge";
import webhookRouter from "./services/webhook";

// Middleware imports
import { monitoringMiddleware } from "./middleware/monitoring";

// Service imports
import TelegramService from "./social/telegram";
import TwitterService from "./social/x";
import previewService from "./services/preview";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Initialize services
export const telegramService = new TelegramService();
export const twitterService = new TwitterService();

// Initialize preview service
(async () => {
  try {
    await previewService.initialize();
    console.log("Preview service initialized successfully");
  } catch (error) {
    console.error("Failed to initialize preview service:", error);
  }
})();

// Start Telegram bot
try {
  telegramService.start();
  console.log("Telegram bot started successfully");
} catch (error) {
  console.error("Failed to start Telegram bot:", error);
}

// Middleware configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(monitoringMiddleware);

// Mount API routes
app.use("/api", riotRoutes);
app.use("/api/preview", previewRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/challenge", challengeRoutes);
app.use("/webhook", webhookRouter);

// Health check endpoint with WebSocket status
app.get("/api/health", (req, res) => {
  const services = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      telegram: telegramService ? "running" : "not running",
      twitter: twitterService ? "running" : "not running",
      preview: previewService ? "running" : "not running",
      websocket: "status checked in index.ts", // WebSocket status is managed in index.ts
    },
    environment: process.env.NODE_ENV || "development",
  };

  res.json(services);
});

// Global error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  cleanup();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  cleanup();
});

// Graceful shutdown handler
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Starting graceful shutdown...");
  await cleanup();
  process.exit(0);
});

// Cleanup function
async function cleanup() {
  console.log("Starting cleanup...");
  try {
    // Stop Telegram bot
    telegramService.stop();
    console.log("Telegram bot stopped");

    // Cleanup preview service
    await previewService.cleanup();
    console.log("Preview service cleaned up");

    // Note: WebSocket cleanup is handled in index.ts
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

export default app;
