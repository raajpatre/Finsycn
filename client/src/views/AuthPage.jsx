import { useState } from "react";

import { Card } from "../components/Card";
import { useAuth } from "../state/AuthContext";

export function AuthPage() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.25),_transparent_30%),linear-gradient(180deg,_#08101d_0%,_#0f172a_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-100/80">Student Splits</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Track the hangout, not the math.</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
          Create a room, log shared spends, and let MyFinance simplify who owes whom.
        </p>

        <Card className="mt-8 bg-slate-950/60 p-5">
          <div className="mb-5 flex rounded-full bg-white/5 p-1">
            {["login", "register"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize ${
                  mode === item ? "bg-brand-600 text-white" : "text-slate-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Username</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base outline-none placeholder:text-slate-500"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="aarav_23"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base outline-none placeholder:text-slate-500"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••"
              />
            </label>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-brand-500 px-4 py-4 text-base font-semibold text-white transition active:scale-[0.99]"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
