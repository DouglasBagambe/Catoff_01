"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const riot_1 = __importDefault(require("./routes/riot"));
const monitoring_1 = require("./middleware/monitoring");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(monitoring_1.monitoringMiddleware);
// Routes
app.use("/api", riot_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
});
exports.default = app;
