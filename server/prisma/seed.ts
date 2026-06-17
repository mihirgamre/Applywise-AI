import { ApplicationStatus, Priority, PrismaClient } from "@prisma/client";
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
      name: "Mihir Gamre",
      passwordHash
    },
    create: {
      name: "Mihir Gamre",
      email,
      passwordHash
    }
  });

  const resumes = await Promise.all([
    prisma.resume.create({
      data: {
        userId: user.id,
        title: "Full-Stack SWE Resume",
        originalFileName: "mihir-full-stack-resume.pdf",
        parsedSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Prisma", "Docker", "REST"],
        rawText: `Mihir Gamre
Computer Science student focused on full-stack software engineering.
Projects:
- Built ApplyWise AI, a full-stack job application tracker using React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.
- Implemented JWT authentication, REST APIs, Prisma models, dashboards, file parsing, and AI-powered resume-job analysis.
- Developed database-backed coursework projects involving data structures, operating systems, SQL, and web development.
Skills: React, TypeScript, JavaScript, Node.js, Express, PostgreSQL, Prisma, Docker, Git, REST APIs, Tailwind CSS.`
      }
    }),
    prisma.resume.create({
      data: {
        userId: user.id,
        title: "Frontend Product Resume",
        originalFileName: "mihir-frontend-resume.docx",
        parsedSkills: ["React", "TypeScript", "Tailwind", "Accessibility", "Recharts", "REST", "Design Systems"],
        rawText: `Mihir Gamre
Frontend-leaning software engineering resume for product teams.
Projects:
- Designed responsive SaaS interfaces with React, TypeScript, Tailwind CSS, React Router, and reusable component patterns.
- Built analytics dashboards with Recharts, status badges, empty states, loading states, and mobile-friendly navigation.
- Integrated REST APIs with Axios and protected user workflows through authenticated client-side routing.
Skills: React, TypeScript, Tailwind CSS, Recharts, REST APIs, UI systems, accessibility, Git.`
      }
    })
  ]);

  const jobInputs = [
    {
      company: "Stripe",
      title: "Software Engineering Intern",
      location: "San Francisco, CA",
      jobUrl: "https://stripe.com/jobs",
      source: "Company careers",
      employmentType: "Internship",
      jobDescription:
        "Build reliable full-stack products using React, TypeScript, backend services, APIs, SQL databases, automated testing, observability, and distributed systems fundamentals."
    },
    {
      company: "Datadog",
      title: "New Grad Software Engineer",
      location: "New York, NY",
      jobUrl: "https://www.datadoghq.com/careers/",
      source: "LinkedIn",
      employmentType: "Full-time",
      jobDescription:
        "Develop observability products with TypeScript, Go, distributed systems, cloud infrastructure, CI/CD, metrics, debugging, monitoring, and production ownership."
    },
    {
      company: "Figma",
      title: "Frontend Engineering Intern",
      location: "Remote",
      jobUrl: "https://figma.com/careers",
      source: "Handshake",
      employmentType: "Internship",
      jobDescription:
        "Create polished product experiences with React, TypeScript, design systems, accessibility, performance optimization, collaboration, and frontend architecture."
    },
    {
      company: "Ramp",
      title: "Software Engineer Intern, Product",
      location: "New York, NY",
      jobUrl: "https://ramp.com/careers",
      source: "Simplify",
      employmentType: "Internship",
      jobDescription:
        "Ship customer-facing financial software with React, TypeScript, backend APIs, PostgreSQL, product sense, experimentation, testing, and data-driven iteration."
    },
    {
      company: "Notion",
      title: "Frontend Software Engineer, Early Career",
      location: "San Francisco, CA",
      jobUrl: "https://www.notion.so/careers",
      source: "Company careers",
      employmentType: "Full-time",
      jobDescription:
        "Build collaborative workspace experiences using React, TypeScript, design systems, editor architecture, performance profiling, accessibility, and product craftsmanship."
    },
    {
      company: "Cloudflare",
      title: "Backend Engineering Intern",
      location: "Austin, TX",
      jobUrl: "https://www.cloudflare.com/careers/",
      source: "LinkedIn",
      employmentType: "Internship",
      jobDescription:
        "Work on high-scale backend systems, APIs, networking products, databases, reliability, security, distributed systems, and operational debugging."
    }
  ];

  const jobs = await Promise.all(jobInputs.map((job) => prisma.job.create({ data: { userId: user.id, ...job } })));

  await Promise.all([
    createApplication(user.id, jobs[0].id, resumes[0].id, ApplicationStatus.Applied, Priority.High, "2026-05-18", "2026-06-28", "Applied with full-stack resume and tailored project bullets."),
    createApplication(user.id, jobs[1].id, resumes[0].id, ApplicationStatus.OnlineAssessment, Priority.High, "2026-05-22", "2026-06-20", "OA pending. Review debugging and systems fundamentals."),
    createApplication(user.id, jobs[2].id, resumes[1].id, ApplicationStatus.Interview, Priority.High, "2026-05-28", "2026-06-21", "Recruiter screen scheduled. Emphasize frontend polish and design systems."),
    createApplication(user.id, jobs[3].id, resumes[0].id, ApplicationStatus.Saved, Priority.Medium, null, "2026-06-30", "Add testing and product metrics before applying."),
    createApplication(user.id, jobs[4].id, resumes[1].id, ApplicationStatus.Applied, Priority.Medium, "2026-06-02", "2026-07-03", "Submitted frontend resume."),
    createApplication(user.id, jobs[5].id, resumes[0].id, ApplicationStatus.Rejected, Priority.Low, "2026-05-09", null, "Rejected after resume screen; missing low-level systems evidence.")
  ]);

  await Promise.all([
    createAnalysis(user.id, jobs[0].id, resumes[0].id, 88, {
      summary:
        "Strong fit for Stripe's full-stack internship. The resume shows relevant React, TypeScript, APIs, Prisma, and PostgreSQL work. Add clearer testing and reliability evidence.",
      strengths: ["Full-stack TypeScript project", "Database-backed REST API experience", "Secure auth and user-scoped authorization"],
      weaknesses: ["Limited explicit testing examples", "Distributed systems experience is mostly implied"],
      missingSkills: ["Testing", "Observability", "Distributed systems"],
      missingKeywords: ["reliable services", "automated testing", "observability"],
      suggestedBullets: [
        "Built ApplyWise AI, a full-stack internship tracker with React, TypeScript, Express, PostgreSQL, Prisma, JWT auth, and deployment-ready configuration.",
        "Implemented user-scoped REST APIs and structured AI analysis workflows to score resume-job fit and surface missing technical skills."
      ],
      tailoredSummary:
        "CS student with full-stack TypeScript experience building secure, database-backed tools with React, Node.js, Express, PostgreSQL, Prisma, and production-minded API design.",
      interviewQuestions: [
        "How did you enforce user ownership across protected resources?",
        "How would you test the resume upload and parsing workflow?",
        "What reliability improvements would you add before production?"
      ]
    }),
    createAnalysis(user.id, jobs[2].id, resumes[1].id, 91, {
      summary:
        "Excellent frontend fit. The resume aligns strongly with React, TypeScript, Tailwind, dashboard UI, empty states, and product-focused interaction patterns.",
      strengths: ["Polished React UI work", "Reusable component patterns", "Dashboard and data visualization experience"],
      weaknesses: ["Could quantify UX or performance improvements", "Accessibility details should be more explicit"],
      missingSkills: ["Accessibility testing", "Performance profiling"],
      missingKeywords: ["design systems", "performance optimization", "collaboration"],
      suggestedBullets: [
        "Designed a responsive SaaS dashboard with React, TypeScript, Tailwind CSS, Recharts, loading states, empty states, and mobile navigation.",
        "Built structured product workflows for resume management, job tracking, and AI analysis with clean client-side routing and API integration."
      ],
      tailoredSummary:
        "Frontend-focused CS student with React, TypeScript, Tailwind, dashboard visualization, and product workflow experience across a full-stack recruiting tool.",
      interviewQuestions: [
        "How do you decide when to create a reusable UI component?",
        "How would you measure and improve dashboard performance?",
        "What accessibility checks would you run before shipping?"
      ]
    }),
    createAnalysis(user.id, jobs[5].id, resumes[0].id, 62, {
      summary:
        "Moderate backend fit. The resume has API and database experience, but needs stronger systems, networking, reliability, and operational debugging evidence.",
      strengths: ["REST API implementation", "PostgreSQL and Prisma modeling", "Authentication and authorization experience"],
      weaknesses: ["Limited networking depth", "No explicit high-scale backend systems experience"],
      missingSkills: ["Networking", "Reliability", "Security", "Distributed systems"],
      missingKeywords: ["high-scale", "operational debugging", "security"],
      suggestedBullets: [
        "Modeled relational data for resumes, jobs, applications, and AI analyses using PostgreSQL and Prisma with user-scoped access controls.",
        "Implemented secure Express APIs with JWT authentication, validation, rate limiting, and production environment configuration."
      ],
      tailoredSummary:
        "CS student with backend API, authentication, PostgreSQL, and Prisma experience seeking to grow into reliability, systems, and infrastructure-heavy engineering work.",
      interviewQuestions: [
        "How would you debug a slow API endpoint in production?",
        "What database indexes would you add for this application?",
        "How would you design rate limiting for authenticated APIs?"
      ]
    })
  ]);

  await prisma.activity.createMany({
    data: [
      { userId: user.id, type: "Seed", message: "Seeded a recruiter-ready demo workspace" },
      { userId: user.id, type: "ResumeCreated", message: "Added Full-Stack SWE Resume and Frontend Product Resume" },
      { userId: user.id, type: "JobCreated", message: "Added six internship and new-grad target roles" },
      { userId: user.id, type: "ApplicationCreated", message: "Tracked Figma interview and Datadog assessment" },
      { userId: user.id, type: "AnalysisCreated", message: "Generated Stripe, Figma, and Cloudflare fit analyses" }
    ]
  });

  console.log("Seeded demo user: demo@applywise.ai / Password123!");
}

async function createApplication(
  userId: string,
  jobId: string,
  resumeId: string,
  status: ApplicationStatus,
  priority: Priority,
  appliedDate: string | null,
  deadline: string | null,
  notes: string
) {
  return prisma.application.create({
    data: {
      userId,
      jobId,
      resumeId,
      status,
      priority,
      appliedDate: appliedDate ? new Date(appliedDate) : null,
      deadline: deadline ? new Date(deadline) : null,
      notes
    }
  });
}

async function createAnalysis(
  userId: string,
  jobId: string,
  resumeId: string,
  matchScore: number,
  analysis: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    missingKeywords: string[];
    suggestedBullets: string[];
    tailoredSummary: string;
    interviewQuestions: string[];
  }
) {
  return prisma.analysis.create({
    data: {
      userId,
      jobId,
      resumeId,
      matchScore,
      ...analysis
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
