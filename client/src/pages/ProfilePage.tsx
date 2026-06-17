import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/PageHeader";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Profile" subtitle="Account details for the signed-in user." />
      <section className="panel max-w-xl p-5">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-slate-500">Name</dt>
            <dd className="mt-1 text-slate-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Email</dt>
            <dd className="mt-1 text-slate-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">User ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-slate-700">{user?.id}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
