// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import monitorRequest from "./middleware/monitoring";

// Route imports
import riotRoutes from "./routes/riot";
import previewRoutes from "./routes/preview";
import socialRoutes from "./routes/social";
import webhookRouter from "./services/webhook";

// Service imports
import TelegramService from "./social/telegram";
import TwitterService from "./social/x";
import PreviewService from "./services/preview";
import CacheService from "./services/cache";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Service instances
export let telegramService: TelegramService;
export let twitterService: TwitterService;
export let previewService: PreviewService;
export let cacheService: CacheService;

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
app.use(monitorRequest);

// Initialize services before mounting routes
export const initializeApp = async () => {
  try {
    // Initialize Cache Service
    cacheService = CacheService.getInstance();

    // Initialize Preview Service
    previewService = PreviewService.getInstance();
    await previewService.initialize();

    // Initialize Social Services
    telegramService = new TelegramService();
    twitterService = new TwitterService();

    // Start Telegram bot
    telegramService.start();

    // Mount routes after services are initialized
    app.use("/api", riotRoutes);
    app.use("/api/preview", previewRoutes);
    app.use("/api/social", socialRoutes);
    app.use("/webhook", webhookRouter);

    // Health check endpoint
    app.use("/api/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          telegram: "running",
          twitter: "running",
          preview: "running",
          cache: "running",
        },
        environment: process.env.NODE_ENV || "development",
      });
    });

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Application initialization failed:", error);
    throw error;
  }
};

// Error handling middleware - must be after routes
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// Cleanup function
export const cleanup = async () => {
  try {
    if (telegramService) {
      telegramService.stop();
    }
    if (previewService) {
      await previewService.cleanup();
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};

// Process handlers
process.on("uncaughtException", async (error) => {
  console.error("Uncaught Exception:", error);
  await cleanup();
  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  console.error("Unhandled Rejection:", reason);
  await cleanup();
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received");
  await cleanup();
  process.exit(0);
});

export default app;
