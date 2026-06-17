import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center text-slate-500">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>;
}

export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
