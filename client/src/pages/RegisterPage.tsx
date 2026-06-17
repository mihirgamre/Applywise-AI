import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { ErrorState } from "../components/States";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(name, email, password);
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
        <h1 className="text-2xl font-bold text-ink">Create account</h1>
        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
        <label className="mt-5 block text-sm font-semibold text-slate-700">Name</label>
        <input className="field mt-1" value={name} onChange={(event) => setName(event.target.value)} />
        <label className="mt-4 block text-sm font-semibold text-slate-700">Email</label>
        <input className="field mt-1" value={email} onChange={(event) => setEmail(event.target.value)} />
        <label className="mt-4 block text-sm font-semibold text-slate-700">Password</label>
        <input className="field mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="btn btn-primary mt-5 w-full" disabled={loading}>{loading ? "Creating" : "Create account"}</button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered? <Link className="font-semibold text-brand" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
