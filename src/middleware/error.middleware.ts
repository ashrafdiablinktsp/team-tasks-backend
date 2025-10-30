import type { Request, Response, NextFunction } from "express";
import { AppError } from "../interfaces/error.interface";

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🔥 Error:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message =
    err.message || "Something went wrong. Please try again later.";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
