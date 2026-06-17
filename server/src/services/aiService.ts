import OpenAI from "openai";
import type { Job, Resume } from "@prisma/client";
import { aiAnalysisResponseSchema, type AiAnalysisResponse } from "../utils/validation.js";

function pickKeywords(text: string) {
  const matches = text.match(/\b[A-Za-z][A-Za-z+#.]{2,}\b/g) ?? [];
  const stop = new Set(["and", "the", "with", "for", "you", "are", "our", "will", "that", "this"]);
  const unique = [...new Set(matches.map((word) => word.trim()))].filter(
    (word) => !stop.has(word.toLowerCase())
  );
  return unique.slice(0, 12);
}

export function createMockAnalysis(resume: Resume, job: Job): AiAnalysisResponse {
  const resumeText = resume.rawText.toLowerCase();
  const jobKeywords = pickKeywords(job.jobDescription);
  const matching = jobKeywords.filter((keyword) => resumeText.includes(keyword.toLowerCase()));
  const missing = jobKeywords.filter((keyword) => !resumeText.includes(keyword.toLowerCase())).slice(0, 6);
  const score = Math.min(92, Math.max(48, Math.round((matching.length / Math.max(jobKeywords.length, 1)) * 70 + 22)));

  return {
    matchScore: score,
    summary: `${resume.title} shows a ${score}% match for ${job.title} at ${job.company}. The strongest signal is project and technical experience that overlaps with the role, while the main opportunity is adding clearer evidence for the role's priority keywords.`,
    strengths: [
      "Shows hands-on software project experience",
      "Includes technical implementation details that can map to SWE internship expectations",
      "Demonstrates enough baseline engineering context for a targeted application"
    ],
    weaknesses: [
      "Some accomplishments could use stronger metrics and impact",
      "The resume should mirror more of the job description language where accurate",
      "Relevant coursework or systems experience may need clearer placement"
    ],
    missingSkills: missing.slice(0, 4),
    missingKeywords: missing,
    suggestedBullets: [
      `Built and maintained a software project using ${matching.slice(0, 3).join(", ") || "modern web technologies"}, improving reliability and user workflow clarity.`,
      `Implemented backend features and data models aligned with ${job.title} responsibilities without overstating experience.`,
      "Collaborated through Git-based development, debugging, and iterative feature delivery across frontend and backend tasks."
    ],
    tailoredSummary: `CS student focused on full-stack software engineering, with project experience that can be positioned for ${job.company}'s ${job.title} role by emphasizing relevant tools, measurable outcomes, and production-minded development practices.`,
    interviewQuestions: [
      "Walk me through the most technically challenging project on your resume.",
      `Which parts of your experience best prepare you for ${job.company}'s engineering environment?`,
      "How would you debug a slow API endpoint used by a React application?",
      "Tell me about a time you improved code quality or reliability.",
      "What tradeoffs did you make in your most recent full-stack project?"
    ]
  };
}

export async function analyzeResumeForJob(resume: Resume, job: Job): Promise<AiAnalysisResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return createMockAnalysis(resume, job);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Act like a technical recruiter and resume coach. Be honest and specific. Do not invent experience. Suggested bullets must be based only on the provided resume and job description. Return valid JSON only."
        },
        {
          role: "user",
          content: JSON.stringify({
            expectedShape: {
              matchScore: "integer 0-100",
              summary: "string",
              strengths: ["string"],
              weaknesses: ["string"],
              missingSkills: ["string"],
              missingKeywords: ["string"],
              suggestedBullets: ["string"],
              tailoredSummary: "string",
              interviewQuestions: ["string"]
            },
            resume: {
              title: resume.title,
              rawText: resume.rawText
            },
            job: {
              company: job.company,
              title: job.title,
              description: job.jobDescription
            }
          })
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return createMockAnalysis(resume, job);
    }

    return aiAnalysisResponseSchema.parse(JSON.parse(content));
  } catch (error) {
    console.warn("OpenAI analysis failed; returning mock analysis.", error);
    return createMockAnalysis(resume, job);
  }
}
