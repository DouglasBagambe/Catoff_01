import app from "./app";
import http from "http";
import WebSocketService from "./services/websocket";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3001;

const server = http.createServer(app);
const wsService = new WebSocketService(server);

// Add error handling for server startup
server.on("error", (e: NodeJS.ErrnoException) => {
  if (e.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
  } else {
    console.error("An error occurred while starting the server:", e);
  }
  process.exit(1);
});

// Add more detailed logging
server.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Loaded services:");
  console.log("- Telegram webhook endpoint: /webhook/telegram");
  console.log("- WebSocket service: Initialized");
  console.log("- Riot API routes: /api/*");
});
