// src/index.ts
import app from "./app";
import initializeApp from "./app";
import http from "http";
import WebSocketService from "./services/websocket";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const port = process.env.PORT || 3001;
let server: http.Server;

const startServer = async () => {
  try {
    const req = {} as Request; // Define req object
    const res = {} as Response; // Define res object
    await initializeApp(req, res);

    // Create HTTP server
    server = http.createServer(app);

    // Initialize WebSocket service
    new WebSocketService(server);

    // Start listening
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    return server;
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
