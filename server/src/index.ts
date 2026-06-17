import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";
import jobRoutes from "./routes/jobs.js";
import applicationRoutes from "./routes/applications.js";
import analysisRoutes from "./routes/analysis.js";
import dashboardRoutes from "./routes/dashboard.js";
import { errorHandler, HttpError } from "./utils/http.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllowedOrigins() {
  const configured = process.env.CLIENT_URL?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured?.length) {
    return configured;
  }

  return ["http://localhost:5173"];
}

function validateRuntimeConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  if (isProduction && process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
}

validateRuntimeConfig();

if (isProduction) {
  app.set("trust proxy", 1);
}
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"]
          }
        }
      : false
  })
);

if (!isProduction || process.env.CLIENT_URL) {
  app.use(
    cors({
      origin(origin, callback) {
        const allowedOrigins = getAllowedOrigins();
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true
    })
  );
}
app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "applywise-ai-server" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api", (_req, _res, next) => {
  next(new HttpError(404, "API route not found"));
});

if (isProduction) {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((_req, _res, next) => {
  next(new HttpError(404, "Route not found"));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`ApplyWise AI API running on http://localhost:${port}`);
});
