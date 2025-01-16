// src/middleware/monitoring.ts
import { Request, Response, NextFunction } from "express";

export const monitorRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

export default monitorRequest;
