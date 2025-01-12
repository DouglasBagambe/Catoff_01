// src/app.ts

import express from "express";
import dotenv from "dotenv";
import riotRoutes from "./routes/riot";
import { monitoringMiddleware } from "./middleware/monitoring";
import previewRoutes from "./routes/preview";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(monitoringMiddleware);

// Routes
app.use("/api", riotRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use(
  "/preview",
  previewRoutes,
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  }
);

export default app;
