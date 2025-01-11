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
const prom_client_1 = __importDefault(require("prom-client"));
const pino_1 = __importDefault(require("pino"));
class MonitoringService {
    constructor() {
        // Initialize Prometheus metrics
        this.metrics = {
            requestCounter: new prom_client_1.default.Counter({
                name: "api_requests_total",
                help: "Total number of API requests",
                labelNames: ["method", "endpoint"],
            }),
            responseTime: new prom_client_1.default.Histogram({
                name: "api_response_time",
                help: "Response time in seconds",
                buckets: [0.1, 0.5, 1, 2, 5],
            }),
            errorCounter: new prom_client_1.default.Counter({
                name: "api_errors_total",
                help: "Total number of API errors",
                labelNames: ["type"],
            }),
        };
        // Initialize logger
        this.logger = (0, pino_1.default)({
            level: process.env.LOG_LEVEL || "info",
            transport: {
                target: "pino-pretty",
            },
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
            formatters: {
                level: (label) => {
                    return { level: label };
                },
            },
        });
    }
    // Track API request
    trackRequest(method, endpoint) {
        this.metrics.requestCounter.inc({ method, endpoint });
        const startTime = process.hrtime();
        return {
            end: () => {
                const [seconds, nanoseconds] = process.hrtime(startTime);
                const duration = seconds + nanoseconds / 1e9;
                this.metrics.responseTime.observe(duration);
            },
        };
    }
    // Track error
    trackError(type, error) {
        this.metrics.errorCounter.inc({ type });
        this.logger.error({
            type,
            error: error.message,
            stack: error.stack,
        });
    }
    // Log info
    info(message, data) {
        this.logger.info(data || {}, message);
    }
    // Get metrics
    getMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prom_client_1.default.register.metrics();
        });
    }
}
exports.default = new MonitoringService();
