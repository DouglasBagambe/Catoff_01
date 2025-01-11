import axios from "axios";
import WebSocket from "ws";
import { createClient } from "redis";
import { Client } from "pg";

async function checkSystem() {
  console.log("Starting system check...");

  try {
    // Check API
    const apiResponse = await axios.get("http://localhost:3000/health");
    console.log("API Status:", apiResponse.status === 200 ? "OK" : "Failed");

    // Check WebSocket
    const ws = new WebSocket("ws://localhost:3000");
    ws.on("open", () => {
      console.log("WebSocket Status: OK");
      ws.close();
    });

    // Check Redis
    const redis = createClient();
    await redis.connect();
    await redis.ping();
    console.log("Redis Status: OK");
    await redis.quit();

    // Check Database
    const pg = new Client();
    await pg.connect();
    await pg.query("SELECT NOW()");
    console.log("Database Status: OK");
    await pg.end();

    console.log("All systems operational!");
  } catch (error) {
    console.error("System check failed:", error);
    process.exit(1);
  }
}

checkSystem();
