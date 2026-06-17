import type { Priority, Status } from "../types";

const statusClass: Record<Status, string> = {
  Saved: "bg-slate-100 text-slate-700",
  Applied: "bg-blue-100 text-blue-700",
  OnlineAssessment: "bg-amber-100 text-amber-800",
  Interview: "bg-cyan-100 text-cyan-800",
  Offer: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-700",
  Withdrawn: "bg-zinc-100 text-zinc-700"
};

const priorityClass: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-red-100 text-red-700"
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[status]}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass[priority]}`}>{priority}</span>;
}
