import prometheus from "prom-client";
import pino from "pino";

class MonitoringService {
  private metrics: {
    requestCounter: prometheus.Counter;
    responseTime: prometheus.Histogram;
    errorCounter: prometheus.Counter;
  };

  private logger: pino.Logger;

  constructor() {
    // Initialize Prometheus metrics
    this.metrics = {
      requestCounter: new prometheus.Counter({
        name: "api_requests_total",
        help: "Total number of API requests",
        labelNames: ["method", "endpoint"],
      }),

      responseTime: new prometheus.Histogram({
        name: "api_response_time",
        help: "Response time in seconds",
        buckets: [0.1, 0.5, 1, 2, 5],
      }),

      errorCounter: new prometheus.Counter({
        name: "api_errors_total",
        help: "Total number of API errors",
        labelNames: ["type"],
      }),
    };

    // Initialize logger
    this.logger = pino({
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
  trackRequest(method: string, endpoint: string) {
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
  trackError(type: string, error: Error) {
    this.metrics.errorCounter.inc({ type });
    this.logger.error({
      type,
      error: error.message,
      stack: error.stack,
    });
  }

  // Log info
  info(message: string, data?: any) {
    this.logger.info(data || {}, message);
  }

  // Get metrics
  async getMetrics() {
    return await prometheus.register.metrics();
  }
}

export default new MonitoringService();
