// src/index.ts

import app from "./app";
import http from "http";
import WebSocketService from "./services/websocket";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;

// Create HTTP server using the Express app
const server = http.createServer(app);

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Start server with WebSocket support
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
