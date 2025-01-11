import cron from "node-cron";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

// Run database vacuum
async function vacuumDatabase() {
  try {
    await execAsync("VACUUM ANALYZE");
    console.log("Database vacuum completed");
  } catch (error) {
    console.error("Database vacuum failed:", error);
  }
}

// Clear old logs
async function clearOldLogs() {
  const logsDir = "./logs";
  const oldestAllowedDate = new Date();
  oldestAllowedDate.setDate(oldestAllowedDate.getDate() - 30);

  const files = await fs.promises.readdir(logsDir);

  for (const file of files) {
    const filePath = `${logsDir}/${file}`;
    const stats = await fs.promises.stat(filePath);

    if (stats.mtime < oldestAllowedDate) {
      await fs.promises.unlink(filePath);
      console.log(`Deleted old log: ${file}`);
    }
  }
}

// Rotate API keys
async function rotateApiKeys() {
  // Implement your key rotation logic here
  console.log("API keys rotated");
}

// Schedule maintenance tasks
cron.schedule("0 0 * * 0", vacuumDatabase); // Every Sunday at midnight
cron.schedule("0 1 * * *", clearOldLogs); // Every day at 1 AM
cron.schedule("0 0 1 * *", rotateApiKeys); // First of every month
