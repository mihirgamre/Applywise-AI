import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { ErrorState } from "../components/States";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@applywise.ai");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form className="panel w-full max-w-md p-6" onSubmit={submit}>
        <h1 className="text-2xl font-bold text-ink">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Demo: demo@applywise.ai / Password123!</p>
        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        <label className="mt-5 block text-sm font-semibold text-slate-700">Email</label>
        <input className="field mt-1" value={email} onChange={(event) => setEmail(event.target.value)} />
        <label className="mt-4 block text-sm font-semibold text-slate-700">Password</label>
        <input className="field mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="btn btn-primary mt-5 w-full" disabled={loading}>{loading ? "Signing in" : "Sign in"}</button>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here? <Link className="font-semibold text-brand" to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
