export type Status = "Saved" | "Applied" | "OnlineAssessment" | "Interview" | "Offer" | "Rejected" | "Withdrawn";
export type Priority = "Low" | "Medium" | "High";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  title: string;
  originalFileName?: string | null;
  rawText: string;
  parsedSkills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  location?: string | null;
  jobUrl?: string | null;
  jobDescription: string;
  employmentType?: string | null;
  source?: string | null;
  createdAt: string;
  updatedAt: string;
  applications?: Application[];
  analyses?: Analysis[];
}

export interface Application {
  id: string;
  jobId: string;
  resumeId?: string | null;
  status: Status;
  priority: Priority;
  appliedDate?: string | null;
  deadline?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  job: Job;
  resume?: Resume | null;
}

export interface Analysis {
  id: string;
  jobId: string;
  resumeId: string;
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  missingKeywords: string[];
  suggestedBullets: string[];
  tailoredSummary: string;
  interviewQuestions: string[];
  createdAt: string;
  job?: Job;
  resume?: Resume;
}

export interface DashboardStats {
  totalApplications: number;
  countsByStatus: Array<{ status: Status; count: number }>;
  averageMatchScore: number;
  recentActivity: Array<{ id: string; type: string; message: string; createdAt: string }>;
  recentApplications: Application[];
  topMissingSkills: Array<{ skill: string; count: number }>;
}
