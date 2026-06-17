import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { loginSchema, registerSchema } from "../utils/validation.js";

const router = Router();

function publicUser(user: { id: string; name: string; email: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function signToken(user: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new HttpError(500, "JWT_SECRET is not configured");
  }
  return jwt.sign({ email: user.email }, secret, {
    subject: user.id,
    expiresIn: "7d"
  });
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new HttpError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash
      }
    });

    res.status(201).json({
      token: signToken(user),
      user: publicUser(user)
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid email or password");
    }

    res.json({
      token: signToken(user),
      user: publicUser(user)
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id }
    });
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    res.json({ user: publicUser(user) });
  })
);

export default router;
