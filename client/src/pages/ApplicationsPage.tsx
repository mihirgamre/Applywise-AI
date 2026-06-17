import { FormEvent, useEffect, useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { api, getErrorMessage } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import type { Application, Job, Priority, Resume, Status } from "../types";

const statuses: Status[] = ["Saved", "Applied", "OnlineAssessment", "Interview", "Offer", "Rejected", "Withdrawn"];
const priorities: Priority[] = ["Low", "Medium", "High"];

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filter, setFilter] = useState<Status | "All">("All");
  const [form, setForm] = useState({
    jobId: "",
    resumeId: "",
    status: "Saved" as Status,
    priority: "Medium" as Priority,
    appliedDate: "",
    deadline: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [appsResponse, jobsResponse, resumesResponse] = await Promise.all([
        api.get<Application[]>("/applications"),
        api.get<Job[]>("/jobs"),
        api.get<Resume[]>("/resumes")
      ]);
      setApplications(appsResponse.data);
      setJobs(jobsResponse.data);
      setResumes(resumesResponse.data);
      if (!form.jobId && jobsResponse.data[0]) setForm((current) => ({ ...current, jobId: jobsResponse.data[0].id }));
      if (!form.resumeId && resumesResponse.data[0]) setForm((current) => ({ ...current, resumeId: resumesResponse.data[0].id }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visibleApplications = useMemo(
    () => applications.filter((app) => (filter === "All" ? true : app.status === filter)),
    [applications, filter]
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/applications", { ...form, resumeId: form.resumeId || null });
      setForm((current) => ({ ...current, status: "Saved", priority: "Medium", appliedDate: "", deadline: "", notes: "" }));
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function updateStatus(app: Application, status: Status) {
    setError("");
    try {
      await api.put(`/applications/${app.id}`, { status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    setError("");
    try {
      await api.delete(`/applications/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Applications" subtitle="Track role status, priority, deadlines, and notes." />
      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form className="panel p-5" onSubmit={submit}>
          <h2 className="mb-4 font-semibold text-ink">New application</h2>
          {jobs.length === 0 ? (
            <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Add a job before creating an application.</p>
          ) : null}
          <label className="text-sm font-semibold text-slate-700">Job</label>
          <select className="field mt-1" value={form.jobId} onChange={(e) => setForm({ ...form, jobId: e.target.value })}>
            {jobs.map((job) => <option value={job.id} key={job.id}>{job.company} - {job.title}</option>)}
          </select>
          <label className="mt-3 block text-sm font-semibold text-slate-700">Resume</label>
          <select className="field mt-1" value={form.resumeId} onChange={(e) => setForm({ ...form, resumeId: e.target.value })}>
            <option value="">None</option>
            {resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.title}</option>)}
          </select>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              {priorities.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
            <input className="field" type="date" value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} />
            <input className="field" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <textarea className="field mt-3 min-h-28" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="btn btn-primary mt-4" disabled={!form.jobId} type="submit"><Save className="h-4 w-4" />Save</button>
        </form>
        <section className="panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-ink">Tracked applications</h2>
            <select className="field max-w-48" value={filter} onChange={(e) => setFilter(e.target.value as Status | "All")}>
              <option>All</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
          {loading ? <LoadingState /> : visibleApplications.length === 0 ? <EmptyState title="No applications match this view" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr><th className="py-3">Role</th><th>Status</th><th>Priority</th><th>Deadline</th><th></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="py-3">
                        <p className="font-semibold text-slate-800">{app.job.title}</p>
                        <p className="text-slate-500">{app.job.company}</p>
                      </td>
                      <td className="py-3">
                        <select className="field max-w-44" value={app.status} onChange={(e) => updateStatus(app, e.target.value as Status)}>
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="py-3"><PriorityBadge priority={app.priority} /></td>
                      <td className="py-3 text-slate-600">{app.deadline ? new Date(app.deadline).toLocaleDateString() : "-"}</td>
                      <td className="py-3 text-right">
                        <button className="btn btn-secondary text-red-600" type="button" title="Delete" onClick={() => remove(app.id)}><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">{statuses.map((status) => <StatusBadge status={status} key={status} />)}</div>
        </section>
      </div>
    </>
  );
}
