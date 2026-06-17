import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { jobSchema, jobUpdateSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const input = jobSchema.parse(req.body);
    const job = await prisma.job.create({
      data: {
        userId: authReq.user.id,
        ...input
      }
    });

    await prisma.activity.create({
      data: {
        userId: authReq.user.id,
        type: "JobCreated",
        message: `Added ${job.title} at ${job.company}`
      }
    });

    res.status(201).json(job);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const jobs = await prisma.job.findMany({
      where: { userId: authReq.user.id },
      include: { applications: true },
      orderBy: { updatedAt: "desc" }
    });
    res.json(jobs);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, userId: authReq.user.id },
      include: {
        applications: { include: { resume: true } },
        analyses: { orderBy: { createdAt: "desc" } }
      }
    });
    if (!job) {
      throw new HttpError(404, "Job not found");
    }
    res.json(job);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const input = jobUpdateSchema.parse(req.body);
    const existing = await prisma.job.findFirst({
      where: { id: req.params.id, userId: authReq.user.id }
    });
    if (!existing) {
      throw new HttpError(404, "Job not found");
    }
    const job = await prisma.job.update({
      where: { id: existing.id },
      data: input
    });
    res.json(job);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const existing = await prisma.job.findFirst({
      where: { id: req.params.id, userId: authReq.user.id }
    });
    if (!existing) {
      throw new HttpError(404, "Job not found");
    }
    await prisma.job.delete({ where: { id: existing.id } });
    res.status(204).send();
  })
);

export default router;
