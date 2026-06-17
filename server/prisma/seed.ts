import { ApplicationStatus, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@applywise.ai";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.activity.deleteMany({ where: { userId: existing.id } });
    await prisma.analysis.deleteMany({ where: { userId: existing.id } });
    await prisma.application.deleteMany({ where: { userId: existing.id } });
    await prisma.job.deleteMany({ where: { userId: existing.id } });
    await prisma.resume.deleteMany({ where: { userId: existing.id } });
  }

  const passwordHash = await bcrypt.hash("Password123!", 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Demo Student",
      passwordHash
    },
    create: {
      name: "Demo Student",
      email,
      passwordHash
    }
  });

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: "CS Full-Stack Resume",
      originalFileName: "demo-resume.pdf",
      parsedSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Prisma", "Docker"],
      rawText: `Demo Student
Computer Science student focused on full-stack engineering.
Projects:
- Built ApplyWise AI using React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.
- Implemented JWT authentication, REST APIs, dashboards, and resume parsing workflows.
- Developed coursework projects in data structures, operating systems, databases, and web development.
Skills: React, TypeScript, JavaScript, Node.js, Express, PostgreSQL, Prisma, Docker, Git, REST APIs.`
    }
  });

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        userId: user.id,
        company: "Stripe",
        title: "Software Engineering Intern",
        location: "San Francisco, CA",
        jobUrl: "https://stripe.com/jobs",
        source: "Company careers",
        employmentType: "Internship",
        jobDescription:
          "Build reliable full-stack products using React, TypeScript, backend services, APIs, SQL databases, testing, and distributed systems fundamentals."
      }
    }),
    prisma.job.create({
      data: {
        userId: user.id,
        company: "Datadog",
        title: "New Grad Software Engineer",
        location: "New York, NY",
        jobUrl: "https://www.datadoghq.com/careers/",
        source: "LinkedIn",
        employmentType: "Full-time",
        jobDescription:
          "Develop observability products with TypeScript, Go, distributed systems, cloud infrastructure, CI/CD, metrics, debugging, and production ownership."
      }
    }),
    prisma.job.create({
      data: {
        userId: user.id,
        company: "Figma",
        title: "Frontend Engineering Intern",
        location: "Remote",
        jobUrl: "https://figma.com/careers",
        source: "Handshake",
        employmentType: "Internship",
        jobDescription:
          "Create polished product experiences with React, TypeScript, design systems, accessibility, performance optimization, collaboration, and frontend architecture."
      }
    })
  ]);

  await Promise.all([
    prisma.application.create({
      data: {
        userId: user.id,
        jobId: jobs[0].id,
        resumeId: resume.id,
        status: ApplicationStatus.Applied,
        priority: "High",
        appliedDate: new Date("2026-01-10"),
        notes: "Applied with full-stack resume."
      }
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        jobId: jobs[1].id,
        resumeId: resume.id,
        status: ApplicationStatus.OnlineAssessment,
        priority: "Medium",
        appliedDate: new Date("2026-01-12"),
        deadline: new Date("2026-01-22"),
        notes: "OA due next week."
      }
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        jobId: jobs[2].id,
        resumeId: resume.id,
        status: ApplicationStatus.Saved,
        priority: "High",
        deadline: new Date("2026-02-01"),
        notes: "Tailor frontend bullets before applying."
      }
    })
  ]);

  await prisma.analysis.create({
    data: {
      userId: user.id,
      jobId: jobs[0].id,
      resumeId: resume.id,
      matchScore: 84,
      summary:
        "Strong full-stack match with clear overlap across React, TypeScript, Node.js, SQL, APIs, and product engineering. Add more testing and impact metrics.",
      strengths: ["Full-stack TypeScript experience", "REST API and database implementation", "Relevant dashboard and auth features"],
      weaknesses: ["Needs stronger quantified outcomes", "Could show more production debugging or testing depth"],
      missingSkills: ["Testing", "Distributed systems"],
      missingKeywords: ["reliable services", "testing", "distributed systems"],
      suggestedBullets: [
        "Built an AI-powered job application tracker using React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.",
        "Designed secure REST APIs with JWT authentication, user-specific authorization, and structured AI response validation."
      ],
      tailoredSummary:
        "CS student focused on full-stack product engineering with React, TypeScript, Node.js, SQL databases, and secure API development experience.",
      interviewQuestions: [
        "How did you structure authorization checks across your REST API?",
        "How would you add tests around resume parsing and analysis?",
        "What tradeoffs did you make when modeling applications and jobs?"
      ]
    }
  });

  await prisma.activity.createMany({
    data: [
      { userId: user.id, type: "Seed", message: "Created demo resume, jobs, applications, and analysis" },
      { userId: user.id, type: "ApplicationCreated", message: "Tracked application for Software Engineering Intern at Stripe" },
      { userId: user.id, type: "AnalysisCreated", message: "Generated sample AI fit analysis for Stripe" }
    ]
  });

  console.log("Seeded demo user: demo@applywise.ai / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
