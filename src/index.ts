// src/index.ts
import app from "./app";
import http from "http";
import WebSocketService from "./services/websocket";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3001; // Changed to 3001 for backend

const server = http.createServer(app);
const wsService = new WebSocketService(server);

server.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
