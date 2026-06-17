import { BarChart3, BriefcaseBusiness, FileText, LayoutDashboard, LogOut, Sparkles, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resumes", label: "Resumes", icon: FileText },
  { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/applications", label: "Applications", icon: BarChart3 },
  { to: "/analysis", label: "AI Analysis", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-4 md:block">
        <div className="mb-8">
          <div className="text-xl font-bold text-ink">ApplyWise AI</div>
          <div className="mt-1 text-sm text-slate-500">{user?.email}</div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <button className="btn btn-secondary absolute bottom-4 left-4 right-4" onClick={logout} title="Log out">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink">ApplyWise AI</span>
            <button className="btn btn-secondary" onClick={logout} title="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold ${
                    isActive ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
