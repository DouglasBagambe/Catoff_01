// src/utils/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class RiotAPIError extends APIError {
  constructor(
    statusCode: number,
    message: string,
    public riotErrorCode?: string
  ) {
    super(statusCode, message, "RIOT_API_ERROR");
    this.name = "RiotAPIError";
  }
}

// Error codes mapping
export const RIOT_ERROR_CODES = {
  400: "Bad request",
  401: "Unauthorized - Invalid API key",
  403: "Forbidden",
  404: "Data not found",
  429: "Rate limit exceeded",
  500: "Internal server error",
  503: "Service unavailable",
};

// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { APIError, RiotAPIError } from "../utils/errors";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  if (err instanceof RiotAPIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      riotErrorCode: err.riotErrorCode,
      details: process.env.NODE_ENV === "development" ? err.details : undefined,
    });
  }

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: process.env.NODE_ENV === "development" ? err.details : undefined,
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
