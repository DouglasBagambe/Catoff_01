import { Request, Response, NextFunction } from "express";
import MonitoringService from "../services/monitoring";

export function monitoringMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tracker = MonitoringService.trackRequest(req.method, req.path);

  // Track response
  res.on("finish", () => {
    tracker.end();
  });

  // Track errors
  res.on("error", (error) => {
    MonitoringService.trackError("response_error", error);
  });

  next();
}
