import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, getErrorMessage } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorState, LoadingState } from "../components/States";
import type { DashboardStats } from "../types";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<DashboardStats>("/dashboard/stats").then((response) => setStats(response.data)).catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!stats) return <LoadingState label="Loading dashboard" />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Application pipeline, match scores, and recent activity." />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Applications" value={stats.totalApplications} />
        <Metric label="Average match" value={`${stats.averageMatchScore}%`} />
        <Metric label="Missing skills" value={stats.topMissingSkills.length} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold text-ink">Status chart</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.countsByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#176B5B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold text-ink">Top missing skills</h2>
          <div className="space-y-3">
            {stats.topMissingSkills.length ? stats.topMissingSkills.map((item) => (
              <div key={item.skill} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span>{item.skill}</span>
                <span className="font-semibold text-slate-600">{item.count}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No analysis data yet.</p>}
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold text-ink">Recent applications</h2>
          <div className="space-y-3">
            {stats.recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-100 p-3">
                <div>
                  <p className="font-semibold text-slate-800">{app.job.title}</p>
                  <p className="text-sm text-slate-500">{app.job.company}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold text-ink">Recent activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="rounded-md border border-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-700">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(activity.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}
