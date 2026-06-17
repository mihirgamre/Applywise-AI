import { ArrowRight, BarChart3, FileSearch, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="text-lg font-bold">ApplyWise AI</div>
        <div className="flex items-center gap-2">
          <Link className="btn text-slate-200 hover:text-white" to="/login">
            Login
          </Link>
          <Link className="btn bg-white text-slate-900 hover:bg-slate-100" to="/register">
            Start
          </Link>
        </div>
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_0.9fr]">
        <section>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-300">CS internship tracker</p>
          <h1 className="max-w-3xl text-5xl font-bold tracking-normal md:text-6xl">ApplyWise AI</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Track SWE applications, parse resumes, compare them to job descriptions, and turn fit analysis into targeted resume improvements.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn btn-primary bg-emerald-600 hover:bg-emerald-500" to="/register">
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="btn border border-white/15 bg-white/10 text-white hover:bg-white/15" to="/login">
              Demo login
            </Link>
          </div>
        </section>
        <section className="grid gap-3">
          {[
            { icon: BarChart3, title: "Application pipeline", text: "Saved, applied, OA, interview, offer, rejected, and withdrawn status tracking." },
            { icon: FileSearch, title: "Resume-job analysis", text: "Match scores, missing skills, tailored summaries, and interview questions." },
            { icon: ShieldCheck, title: "Portfolio-ready backend", text: "JWT auth, user ownership checks, Prisma models, file parsing, and zod validation." }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft">
                <Icon className="mb-4 h-6 w-6 text-emerald-300" />
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
