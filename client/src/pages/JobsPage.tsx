import { FormEvent, useEffect, useState } from "react";
import { Edit3, ExternalLink, Save, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import type { Job } from "../types";

const emptyJob = { company: "", title: "", location: "", jobUrl: "", source: "", employmentType: "Internship", jobDescription: "" };

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Job[]>("/jobs");
      setJobs(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/jobs/${editingId}`, form);
      } else {
        await api.post("/jobs", form);
      }
      setForm(emptyJob);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    setError("");
    try {
      await api.delete(`/jobs/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Jobs" subtitle="Store roles, links, sources, and job descriptions." />
      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form className="panel p-5" onSubmit={submit}>
          <h2 className="mb-4 font-semibold text-ink">{editingId ? "Edit job" : "Add job"}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className="field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input className="field" placeholder="Job URL" value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} />
            <input className="field" placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <select className="field" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
              <option>Internship</option>
              <option>Full-time</option>
              <option>Contract</option>
            </select>
          </div>
          <textarea className="field mt-3 min-h-44" placeholder="Job description" value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} />
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" type="submit"><Save className="h-4 w-4" />Save</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyJob); }}><X className="h-4 w-4" />Cancel</button> : null}
          </div>
        </form>
        <section>
          {loading ? <LoadingState /> : jobs.length === 0 ? (
            <EmptyState
              title="No jobs yet"
              description="Add target roles with full job descriptions so ApplyWise can track applications and analyze resume fit."
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <article className="panel p-5" key={job.id}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <Link className="text-lg font-semibold text-ink hover:text-brand" to={`/jobs/${job.id}`}>{job.title}</Link>
                      <p className="text-sm text-slate-500">{job.company} {job.location ? `- ${job.location}` : ""}</p>
                    </div>
                    <div className="flex gap-2">
                      {job.jobUrl ? <a className="btn btn-secondary" href={job.jobUrl} target="_blank" rel="noreferrer" title="Open job"><ExternalLink className="h-4 w-4" /></a> : null}
                      <button className="btn btn-secondary" type="button" title="Edit" onClick={() => { setEditingId(job.id); setForm({ company: job.company, title: job.title, location: job.location || "", jobUrl: job.jobUrl || "", source: job.source || "", employmentType: job.employmentType || "", jobDescription: job.jobDescription }); }}><Edit3 className="h-4 w-4" /></button>
                      <button className="btn btn-secondary text-red-600" type="button" title="Delete" onClick={() => remove(job.id)}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{job.jobDescription}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
