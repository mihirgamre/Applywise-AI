import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Edit3, FileUp, Save, Trash2, X } from "lucide-react";
import { api, getErrorMessage } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import type { Resume } from "../types";

export function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<Resume[]>("/resumes");
      setResumes(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setTitle("");
    setRawText("");
    setEditingId(null);
  }

  async function submitManual(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/resumes/${editingId}`, { title, rawText });
      } else {
        await api.post("/resumes", { title, rawText });
      }
      resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function uploadResume(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setError("");
    const data = new FormData();
    data.append("resume", file);
    if (title) data.append("title", title);
    try {
      await api.post("/resumes/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      setTitle("");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function remove(id: string) {
    setError("");
    try {
      await api.delete(`/resumes/${id}`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title="Resumes" subtitle="Upload PDF/DOCX files or maintain resume text manually." />
      {error ? <div className="mb-4"><ErrorState message={error} /></div> : null}
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold text-ink">{editingId ? "Edit resume" : "Manual resume"}</h2>
          <form onSubmit={submitManual}>
            <input className="field" placeholder="Resume title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <textarea className="field mt-3 min-h-56" placeholder="Paste resume text" value={rawText} onChange={(event) => setRawText(event.target.value)} />
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" type="submit"><Save className="h-4 w-4" />Save</button>
              {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}><X className="h-4 w-4" />Cancel</button> : null}
            </div>
          </form>
          <form className="mt-6 border-t border-slate-200 pt-5" onSubmit={uploadResume}>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">File upload</h3>
            <input className="field" type="file" accept=".pdf,.docx" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} />
            <button className="btn btn-secondary mt-3" type="submit" disabled={!file}><FileUp className="h-4 w-4" />Upload</button>
          </form>
        </section>
        <section>
          {loading ? <LoadingState /> : resumes.length === 0 ? <EmptyState title="No resumes yet" /> : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <article className="panel p-5" key={resume.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">{resume.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{resume.originalFileName || "Manual entry"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary" type="button" title="Edit" onClick={() => { setEditingId(resume.id); setTitle(resume.title); setRawText(resume.rawText); }}><Edit3 className="h-4 w-4" /></button>
                      <button className="btn btn-secondary text-red-600" type="button" title="Delete" onClick={() => remove(resume.id)}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {resume.parsedSkills?.map((skill) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600" key={skill}>{skill}</span>)}
                  </div>
                  <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">{resume.rawText}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
