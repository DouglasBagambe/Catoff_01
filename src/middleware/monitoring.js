"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringMiddleware = monitoringMiddleware;
const monitoring_1 = __importDefault(require("../services/monitoring"));
function monitoringMiddleware(req, res, next) {
    const tracker = monitoring_1.default.trackRequest(req.method, req.path);
    // Track response
    res.on("finish", () => {
        tracker.end();
    });
    // Track errors
    res.on("error", (error) => {
        monitoring_1.default.trackError("response_error", error);
    });
    next();
}
