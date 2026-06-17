import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AlertTriangle, ArrowUpRight, BriefcaseBusiness, CalendarClock, Target, TrendingUp } from "lucide-react";
import { api, getErrorMessage } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { PriorityBadge, StatusBadge } from "../components/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import type { DashboardStats, Status } from "../types";

const statusColors: Record<Status, string> = {
  Saved: "#64748b",
  Applied: "#2563eb",
  OnlineAssessment: "#d97706",
  Interview: "#0891b2",
  Offer: "#059669",
  Rejected: "#dc2626",
  Withdrawn: "#71717a"
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<DashboardStats>("/dashboard/stats")
      .then((response) => setStats(response.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const activeApplications = useMemo(() => {
    if (!stats) return 0;
    return stats.countsByStatus
      .filter((item) => !["Rejected", "Withdrawn"].includes(item.status))
      .reduce((total, item) => total + item.count, 0);
  }, [stats]);

  const interviewCount = stats?.countsByStatus.find((item) => item.status === "Interview")?.count ?? 0;
  const offerCount = stats?.countsByStatus.find((item) => item.status === "Offer")?.count ?? 0;

  if (error) return <ErrorState message={error} />;
  if (!stats) return <LoadingState label="Loading dashboard" />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A recruiter-ready view of your application pipeline and resume fit signals." />

      <section className="surface-grid mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr] lg:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Application command center</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-normal text-ink">
              Track every role, measure resume fit, and surface the gaps that matter.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric icon={BriefcaseBusiness} label="Total applications" value={stats.totalApplications} tone="brand" />
              <Metric icon={Target} label="Avg. match score" value={`${stats.averageMatchScore}%`} tone="blue" />
              <Metric icon={TrendingUp} label="Interviews + offers" value={interviewCount + offerCount} tone="green" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-sm font-semibold text-slate-300">Active pipeline</p>
            <p className="mt-2 text-5xl font-bold">{activeApplications}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Applications still moving through saved, applied, assessment, interview, and offer stages.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${Math.min(100, Math.max(8, stats.averageMatchScore))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink">Pipeline by status</h2>
              <p className="mt-1 text-sm text-slate-500">Counts across each application stage.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.countsByStatus} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.countsByStatus.map((item) => (
                    <Cell key={item.status} fill={statusColors[item.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="font-semibold text-ink">Status mix</h2>
          <p className="mt-1 text-sm text-slate-500">Visual breakdown for quick scanning.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.countsByStatus.filter((item) => item.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={4}
                >
                  {stats.countsByStatus
                    .filter((item) => item.count > 0)
                    .map((item) => (
                      <Cell key={item.status} fill={statusColors[item.status]} />
                    ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {stats.countsByStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[item.status] }} />
                <span>{item.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-ink">Top missing skills</h2>
          </div>
          {stats.topMissingSkills.length ? (
            <div className="space-y-3">
              {stats.topMissingSkills.map((item, index) => (
                <div key={item.skill}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.skill}</span>
                    <span className="text-slate-500">{item.count} mentions</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${Math.max(18, 100 - index * 11)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No missing-skill insights yet" description="Run an AI analysis to generate skill gaps from your resume and target jobs." />
          )}
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-brand" />
            <h2 className="font-semibold text-ink">Recent applications</h2>
          </div>
          {stats.recentApplications.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3">Role</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="py-3">
                        <p className="font-semibold text-slate-800">{app.job.title}</p>
                        <p className="text-slate-500">{app.job.company}</p>
                      </td>
                      <td className="py-3"><StatusBadge status={app.status} /></td>
                      <td className="py-3"><PriorityBadge priority={app.priority} /></td>
                      <td className="py-3 text-slate-600">{app.deadline ? new Date(app.deadline).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No applications yet" description="Create an application to start building your recruiting pipeline." />
          )}
        </section>
      </div>

      <section className="panel mt-6 p-5">
        <h2 className="mb-4 font-semibold text-ink">Recent activity</h2>
        {stats.recentActivity.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="rounded-md border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-sm font-semibold text-slate-700">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(activity.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No activity yet" description="Your resume uploads, job additions, applications, and analyses will appear here." />
        )}
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone
}: {
  label: string;
  value: string | number;
  icon: typeof BriefcaseBusiness;
  tone: "brand" | "blue" | "green";
}) {
  const toneClass = {
    brand: "bg-brand/10 text-brand",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700"
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-md ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
