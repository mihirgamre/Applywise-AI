import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/http.js";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new HttpError(401, "Missing authorization token");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new HttpError(500, "JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    (req as AuthenticatedRequest).user = {
      id: decoded.sub,
      email: decoded.email
    };
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
