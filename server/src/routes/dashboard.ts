import { ApplicationStatus } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const [totalApplications, groupedStatuses, averageMatch, recentActivity, analyses, recentApplications] =
      await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.application.groupBy({
          by: ["status"],
          where: { userId },
          _count: { status: true }
        }),
        prisma.analysis.aggregate({
          where: { userId },
          _avg: { matchScore: true }
        }),
        prisma.activity.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 8
        }),
        prisma.analysis.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 20
        }),
        prisma.application.findMany({
          where: { userId },
          include: { job: true, resume: true },
          orderBy: { updatedAt: "desc" },
          take: 5
        })
      ]);

    const countsByStatus = Object.values(ApplicationStatus).map((status) => ({
      status,
      count: groupedStatuses.find((item) => item.status === status)?._count.status ?? 0
    }));

    const skillCounts = new Map<string, number>();
    analyses.forEach((analysis) => {
      (analysis.missingSkills as string[]).forEach((skill) => {
        skillCounts.set(skill, (skillCounts.get(skill) ?? 0) + 1);
      });
    });

    const topMissingSkills = [...skillCounts.entries()]
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      totalApplications,
      countsByStatus,
      averageMatchScore: Math.round(averageMatch._avg.matchScore ?? 0),
      recentActivity,
      recentApplications,
      topMissingSkills
    });
  })
);

export default router;
