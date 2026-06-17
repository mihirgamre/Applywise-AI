import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Lightbulb,
  MessageSquareText,
  Search,
  Sparkles,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import type { Analysis, Job, Resume } from "../types";

export function AnalysisPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobId, setJobId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get<Job[]>("/jobs"), api.get<Resume[]>("/resumes")])
      .then(([jobsResponse, resumesResponse]) => {
        setJobs(jobsResponse.data);
        setResumes(resumesResponse.data);
        setJobId(jobsResponse.data[0]?.id ?? "");
        setResumeId(resumesResponse.data[0]?.id ?? "");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === jobId), [jobId, jobs]);
  const selectedResume = useMemo(() => resumes.find((resume) => resume.id === resumeId), [resumeId, resumes]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!jobId || !resumeId) {
      setError("Select a resume and job before running analysis.");
      return;
    }
    setRunning(true);
    setError("");
    try {
      const response = await api.post<Analysis>("/analysis", { jobId, resumeId });
      setAnalysis(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  if (loading) return <LoadingState label="Loading analysis workspace" />;

  return (
    <>
      <PageHeader title="AI Analysis" subtitle="Turn a resume and job description into recruiter-style fit feedback." />
      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}

      {jobs.length === 0 || resumes.length === 0 ? (
        <EmptyState
          title="Add a resume and a job to unlock fit analysis"
          description="ApplyWise compares your resume text against the job description and returns a structured score, skill gaps, tailored bullets, and interview prep."
          icon={Sparkles}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link className="btn btn-secondary" to="/resumes">Add resume</Link>
              <Link className="btn btn-primary" to="/jobs">Add job</Link>
            </div>
          }
        />
      ) : (
        <section className="surface-grid overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr] lg:p-6">
            <form className="space-y-4" onSubmit={submit}>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand" />
                  <label className="text-sm font-semibold text-slate-700">Resume</label>
                </div>
                <select className="field" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.title}</option>)}
                </select>
                {selectedResume ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedResume.parsedSkills.slice(0, 6).map((skill) => (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" key={skill}>{skill}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-brand" />
                  <label className="text-sm font-semibold text-slate-700">Target role</label>
                </div>
                <select className="field" value={jobId} onChange={(e) => setJobId(e.target.value)}>
                  {jobs.map((job) => <option value={job.id} key={job.id}>{job.company} - {job.title}</option>)}
                </select>
                {selectedJob ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{selectedJob.jobDescription}</p>
                ) : null}
              </div>

              <button className="btn btn-primary w-full py-3" disabled={!resumeId || !jobId || running} type="submit">
                <Sparkles className="h-4 w-4" />
                {running ? "Analyzing fit" : "Run resume-job analysis"}
              </button>
            </form>

            <div className="rounded-lg bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-2 text-emerald-300">
                <Search className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-wide">Recruiter review mode</p>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-normal">What the analysis evaluates</h2>
              <div className="mt-5 grid gap-3">
                {[
                  "Technical skill overlap with the job description",
                  "Resume evidence for responsibilities and impact",
                  "Missing keywords recruiters and ATS screens may expect",
                  "Interview questions tied to the role and resume"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-md bg-white/8 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <p className="text-sm leading-6 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {analysis ? (
        <section className="mt-6 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <div className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Match score</p>
                  <p className="mt-2 text-5xl font-bold text-brand">{analysis.matchScore}%</p>
                </div>
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-brand/15 bg-brand/5">
                  <Target className="h-8 w-8 text-brand" />
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">{analysis.summary}</p>
            </div>

            <InsightList title="Missing skills" icon={AlertCircle} items={analysis.missingSkills} tone="amber" />
            <InsightList title="Missing keywords" icon={Search} items={analysis.missingKeywords} tone="slate" />
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <InsightList title="Strengths" icon={CheckCircle2} items={analysis.strengths} tone="green" />
              <InsightList title="Weaknesses" icon={AlertCircle} items={analysis.weaknesses} tone="red" />
            </div>

            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold text-ink">Suggested resume bullets</h2>
              </div>
              <div className="space-y-3">
                {analysis.suggestedBullets.map((item) => (
                  <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand" />
                <h2 className="font-semibold text-ink">Tailored summary</h2>
              </div>
              <p className="rounded-md bg-brand/5 p-4 text-sm leading-7 text-slate-700">{analysis.tailoredSummary}</p>
            </div>

            <div className="panel p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-blue-700" />
                <h2 className="font-semibold text-ink">Interview prep</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {analysis.interviewQuestions.map((item) => (
                  <div key={item} className="rounded-md border border-slate-200 p-3 text-sm leading-6 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function InsightList({
  title,
  items,
  icon: Icon,
  tone
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
  tone: "green" | "red" | "amber" | "slate";
}) {
  const toneClass = {
    green: "text-emerald-700 bg-emerald-50",
    red: "text-red-700 bg-red-50",
    amber: "text-amber-700 bg-amber-50",
    slate: "text-slate-700 bg-slate-100"
  }[tone];

  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-semibold text-ink">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
