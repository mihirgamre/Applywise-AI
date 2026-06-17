import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { parseResumeFile, upload } from "../services/fileParser.js";
import { extractSkills } from "../services/skills.js";
import { asyncHandler, HttpError } from "../utils/http.js";
import { resumeSchema, resumeUpdateSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

router.post(
  "/upload",
  upload.single("resume"),
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    if (!req.file) {
      throw new HttpError(400, "Resume file is required");
    }

    const rawText = await parseResumeFile(req.file);
    if (rawText.length < 20) {
      throw new HttpError(400, "Could not extract enough text from this resume");
    }

    const title = String(req.body.title || req.file.originalname.replace(/\.(pdf|docx)$/i, "")).trim();
    if (!title) {
      throw new HttpError(400, "Resume title is required");
    }
    const resume = await prisma.resume.create({
      data: {
        userId: authReq.user.id,
        title,
        originalFileName: req.file.originalname,
        rawText,
        parsedSkills: extractSkills(rawText)
      }
    });

    await prisma.activity.create({
      data: {
        userId: authReq.user.id,
        type: "ResumeUploaded",
        message: `Uploaded resume "${resume.title}"`
      }
    });

    res.status(201).json(resume);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const input = resumeSchema.parse(req.body);
    const resume = await prisma.resume.create({
      data: {
        userId: authReq.user.id,
        title: input.title,
        rawText: input.rawText,
        parsedSkills: extractSkills(input.rawText)
      }
    });

    await prisma.activity.create({
      data: {
        userId: authReq.user.id,
        type: "ResumeCreated",
        message: `Created resume "${resume.title}"`
      }
    });

    res.status(201).json(resume);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const resumes = await prisma.resume.findMany({
      where: { userId: authReq.user.id },
      orderBy: { updatedAt: "desc" }
    });
    res.json(resumes);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: authReq.user.id }
    });
    if (!resume) {
      throw new HttpError(404, "Resume not found");
    }
    res.json(resume);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const input = resumeUpdateSchema.parse(req.body);
    const existing = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: authReq.user.id }
    });
    if (!existing) {
      throw new HttpError(404, "Resume not found");
    }

    const resume = await prisma.resume.update({
      where: { id: existing.id },
      data: {
        ...input,
        ...(input.rawText ? { parsedSkills: extractSkills(input.rawText) } : {})
      }
    });
    res.json(resume);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const existing = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: authReq.user.id }
    });
    if (!existing) {
      throw new HttpError(404, "Resume not found");
    }

    await prisma.resume.delete({ where: { id: existing.id } });
    res.status(204).send();
  })
);

export default router;
