import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { analyzeResumeForJob } from "../services/aiService.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { analysisSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const input = analysisSchema.parse(req.body);
    const [resume, job] = await Promise.all([
      prisma.resume.findFirst({ where: { id: input.resumeId, userId: authReq.user.id } }),
      prisma.job.findFirst({ where: { id: input.jobId, userId: authReq.user.id } })
    ]);

    if (!resume) {
      throw new HttpError(404, "Resume not found");
    }
    if (!job) {
      throw new HttpError(404, "Job not found");
    }

    const result = await analyzeResumeForJob(resume, job);
    const analysis = await prisma.analysis.create({
      data: {
        userId: authReq.user.id,
        jobId: job.id,
        resumeId: resume.id,
        ...result
      }
    });

    await prisma.activity.create({
      data: {
        userId: authReq.user.id,
        type: "AnalysisCreated",
        message: `Analyzed ${resume.title} for ${job.title} at ${job.company}`
      }
    });

    res.status(201).json(analysis);
  })
);

router.get(
  "/job/:jobId",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const job = await prisma.job.findFirst({ where: { id: req.params.jobId, userId: authReq.user.id } });
    if (!job) {
      throw new HttpError(404, "Job not found");
    }

    const analyses = await prisma.analysis.findMany({
      where: { jobId: job.id, userId: authReq.user.id },
      include: { resume: true, job: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(analyses);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const analysis = await prisma.analysis.findFirst({
      where: { id: req.params.id, userId: authReq.user.id },
      include: { resume: true, job: true }
    });
    if (!analysis) {
      throw new HttpError(404, "Analysis not found");
    }
    res.json(analysis);
  })
);

export default router;
