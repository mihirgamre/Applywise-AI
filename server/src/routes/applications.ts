import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { applicationSchema, applicationStatusQuerySchema, applicationUpdateSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

async function assertJobOwned(jobId: string, userId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) {
    throw new HttpError(404, "Job not found");
  }
}

async function assertResumeOwned(resumeId: string | null | undefined, userId: string) {
  if (!resumeId) {
    return;
  }
  const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
  if (!resume) {
    throw new HttpError(404, "Resume not found");
  }
}

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const input = applicationSchema.parse(req.body);
    await assertJobOwned(input.jobId, authReq.user.id);
    await assertResumeOwned(input.resumeId, authReq.user.id);

    const application = await prisma.application.create({
      data: {
        userId: authReq.user.id,
        jobId: input.jobId,
        resumeId: input.resumeId || null,
        status: input.status,
        priority: input.priority,
        appliedDate: input.appliedDate,
        deadline: input.deadline,
        notes: input.notes
      },
      include: { job: true, resume: true }
    });

    await prisma.activity.create({
      data: {
        userId: authReq.user.id,
        type: "ApplicationCreated",
        message: `Tracked application for ${application.job.title} at ${application.job.company}`
      }
    });

    res.status(201).json(application);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const { status } = applicationStatusQuerySchema.parse(req.query);
    const applications = await prisma.application.findMany({
      where: {
        userId: authReq.user.id,
        ...(status ? { status } : {})
      },
      include: { job: true, resume: true },
      orderBy: { updatedAt: "desc" }
    });
    res.json(applications);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const application = await prisma.application.findFirst({
      where: { id: req.params.id, userId: authReq.user.id },
      include: { job: true, resume: true }
    });
    if (!application) {
      throw new HttpError(404, "Application not found");
    }
    res.json(application);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const input = applicationUpdateSchema.parse(req.body);
    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: authReq.user.id }
    });
    if (!existing) {
      throw new HttpError(404, "Application not found");
    }

    if (input.jobId) {
      await assertJobOwned(input.jobId, authReq.user.id);
    }
    if (input.resumeId !== undefined) {
      await assertResumeOwned(input.resumeId, authReq.user.id);
    }

    const application = await prisma.application.update({
      where: { id: existing.id },
      data: {
        ...input,
        resumeId: input.resumeId || null
      },
      include: { job: true, resume: true }
    });
    res.json(application);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: authReq.user.id }
    });
    if (!existing) {
      throw new HttpError(404, "Application not found");
    }
    await prisma.application.delete({ where: { id: existing.id } });
    res.status(204).send();
  })
);

export default router;
