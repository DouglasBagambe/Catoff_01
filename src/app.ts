// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import WebSocketService from "./services/websocket";

// Route imports
import riotRoutes from "./routes/riot";
import previewRoutes from "./routes/preview";
import socialRoutes from "./routes/social";
import webhookRouter from "./services/webhook";

// Service imports
import TelegramService from "./social/telegram";
import TwitterService from "./social/x";
import PreviewService from "./services/preview";
import cacheService from "./services/cache";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Service instances
export let telegramService: TelegramService;
export let twitterService: TwitterService;
export let previewService: PreviewService;
// export let cacheService: CacheService;

// Basic middleware setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${Date.now() - start}ms`,
    });
  });
  next();
});

// Initialize all services and start server
const startApp = async () => {
  try {
    // Initialize services
    // cacheService = CacheService.getInstance();
    previewService = PreviewService.getInstance();
    await previewService.initialize();
    telegramService = new TelegramService();
    twitterService = new TwitterService();
    telegramService.start();

    // Mount routes
    app.use("/api", riotRoutes);
    app.use("/api/preview", previewRoutes);
    app.use("/api/social", socialRoutes);
    app.use("/webhook", webhookRouter);

    // Health check endpoint
    app.get("/api/health", (req, res) => {
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

    // Create and start server
    const server = http.createServer(app);
    new WebSocketService(server);

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Cleanup function
    const cleanup = async () => {
      try {
        if (telegramService) telegramService.stop();
        if (previewService) await previewService.cleanup();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };

    // Error handlers
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

    return server;
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

// Error handling middleware
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

export { startApp };
export default app;
