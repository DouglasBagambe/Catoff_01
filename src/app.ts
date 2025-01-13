// src/app.ts
import express from "express";
import dotenv from "dotenv";
import riotRoutes from "./routes/riot";
import { monitoringMiddleware } from "./middleware/monitoring";
import previewRoutes from "./routes/preview";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Add CORS support
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(monitoringMiddleware);

// API Routes
app.use("/api", riotRoutes);
app.use("/api/preview", previewRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use(
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
