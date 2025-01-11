"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Run database vacuum
function vacuumDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield execAsync("VACUUM ANALYZE");
            console.log("Database vacuum completed");
        }
        catch (error) {
            console.error("Database vacuum failed:", error);
        }
    });
}
// Clear old logs
function clearOldLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        const logsDir = "./logs";
        const oldestAllowedDate = new Date();
        oldestAllowedDate.setDate(oldestAllowedDate.getDate() - 30);
        const files = yield fs_1.default.promises.readdir(logsDir);
        for (const file of files) {
            const filePath = `${logsDir}/${file}`;
            const stats = yield fs_1.default.promises.stat(filePath);
            if (stats.mtime < oldestAllowedDate) {
                yield fs_1.default.promises.unlink(filePath);
                console.log(`Deleted old log: ${file}`);
            }
        }
    });
}
// Rotate API keys
function rotateApiKeys() {
    return __awaiter(this, void 0, void 0, function* () {
        // Implement your key rotation logic here
        console.log("API keys rotated");
    });
}
// Schedule maintenance tasks
node_cron_1.default.schedule("0 0 * * 0", vacuumDatabase); // Every Sunday at midnight
node_cron_1.default.schedule("0 1 * * *", clearOldLogs); // Every day at 1 AM
node_cron_1.default.schedule("0 0 1 * *", rotateApiKeys); // First of every month
