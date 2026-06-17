import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.flatten()
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error instanceof Error && error.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin is not allowed" });
  }

  if (error instanceof Error && error.name === "MulterError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}
