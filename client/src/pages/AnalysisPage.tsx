import { FormEvent, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
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
      <PageHeader title="AI Analysis" subtitle="Compare a resume to a job description and store the result." />
      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}
      {jobs.length === 0 || resumes.length === 0 ? (
        <EmptyState
          title="Add at least one resume and one job before running analysis"
          action={
            <div className="flex justify-center gap-2">
              <Link className="btn btn-secondary" to="/resumes">Resumes</Link>
              <Link className="btn btn-primary" to="/jobs">Jobs</Link>
            </div>
          }
        />
      ) : (
        <form className="panel grid gap-3 p-5 md:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
          <select className="field" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.title}</option>)}
          </select>
          <select className="field" value={jobId} onChange={(e) => setJobId(e.target.value)}>
            {jobs.map((job) => <option value={job.id} key={job.id}>{job.company} - {job.title}</option>)}
          </select>
          <button className="btn btn-primary" disabled={!resumeId || !jobId || running} type="submit"><Sparkles className="h-4 w-4" />{running ? "Analyzing" : "Analyze"}</button>
        </form>
      )}
      {analysis ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="panel p-6">
            <p className="text-sm font-semibold text-slate-500">Match score</p>
            <p className="mt-2 text-5xl font-bold text-brand">{analysis.matchScore}%</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{analysis.summary}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <List title="Strengths" items={analysis.strengths} />
            <List title="Weaknesses" items={analysis.weaknesses} />
            <List title="Missing skills" items={analysis.missingSkills} />
            <List title="Missing keywords" items={analysis.missingKeywords} />
          </div>
          <div className="panel p-5 lg:col-span-2">
            <h2 className="mb-3 font-semibold text-ink">Suggested bullets</h2>
            <ul className="space-y-2 text-sm leading-6 text-slate-700">{analysis.suggestedBullets.map((item) => <li key={item}>- {item}</li>)}</ul>
            <h2 className="mb-3 mt-6 font-semibold text-ink">Tailored summary</h2>
            <p className="text-sm leading-6 text-slate-700">{analysis.tailoredSummary}</p>
            <h2 className="mb-3 mt-6 font-semibold text-ink">Interview questions</h2>
            <ul className="space-y-2 text-sm leading-6 text-slate-700">{analysis.interviewQuestions.map((item) => <li key={item}>- {item}</li>)}</ul>
          </div>
        </section>
      ) : null}
    </>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="panel p-5">
      <h2 className="mb-3 font-semibold text-ink">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" key={item}>{item}</span>)}
      </div>
    </div>
  );
}
