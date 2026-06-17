import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorState, LoadingState } from "../components/States";
import type { Job } from "../types";

export function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Job>(`/jobs/${id}`).then((response) => setJob(response.data)).catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!job) return <LoadingState label="Loading job" />;

  return (
    <>
      <PageHeader title={job.title} subtitle={`${job.company}${job.location ? ` - ${job.location}` : ""}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <section className="panel p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {job.jobUrl ? <a className="btn btn-secondary" href={job.jobUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Open posting</a> : null}
            <Link className="btn btn-primary" to="/analysis">Analyze fit</Link>
          </div>
          <h2 className="font-semibold text-ink">Description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{job.jobDescription}</p>
        </section>
        <aside className="space-y-6">
          <section className="panel p-5">
            <h2 className="mb-3 font-semibold text-ink">Applications</h2>
            <div className="space-y-3">
              {job.applications?.length ? job.applications.map((app) => (
                <div className="rounded-md border border-slate-100 p-3" key={app.id}>
                  <StatusBadge status={app.status} />
                  <p className="mt-2 text-sm text-slate-600">{app.resume?.title || "No resume linked"}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No applications for this job.</p>}
            </div>
          </section>
          <section className="panel p-5">
            <h2 className="mb-3 font-semibold text-ink">Analyses</h2>
            <div className="space-y-3">
              {job.analyses?.length ? job.analyses.map((analysis) => (
                <div className="rounded-md border border-slate-100 p-3" key={analysis.id}>
                  <p className="text-lg font-bold text-brand">{analysis.matchScore}%</p>
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600">{analysis.summary}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No analyses for this job.</p>}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
