import { useState } from "react";

import { Card } from "../components/Card";
import { Pressable } from "../components/Pressable";
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
    <div className="min-h-screen bg-paper-bg px-4 py-8 text-ink-charcoal">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.4em] text-ink-dark/70">Student Splits</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-ink-dark">
          Track the hangout, not the math.
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-ink-charcoal/70">
          Create a room, log shared spends, and let MyFinance simplify who owes whom.
        </p>

        <Card className="taped-paper mt-8 bg-[#fffef8] p-5" tilt="right">
          <div className="mb-5 rounded-[1.5rem] border border-ink-dark/20 bg-[rgba(255,255,255,0.45)] p-1">
            {["login", "register"].map((item) => (
              <Pressable
                key={item}
                as="button"
                type="button"
                onClick={() => setMode(item)}
                className={`w-1/2 rounded-[1.2rem] px-4 py-3 text-sm font-semibold capitalize ${
                  mode === item ? "marker-button" : "text-ink-charcoal/65"
                }`}
              >
                {item}
              </Pressable>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.2em] text-ink-dark/70">Username</span>
              <input
                className="lined-input text-base"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="aarav_23"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.2em] text-ink-dark/70">Password</span>
              <input
                type="password"
                className="lined-input text-base"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="••••••••"
              />
            </label>

            {error ? <p className="text-sm text-marker-red">{error}</p> : null}

            <Pressable
              as="button"
              type="submit"
              disabled={loading}
              className="marker-button w-full px-4 py-4 text-base font-semibold transition"
              whileTap={{ scale: 0.965, y: 2, rotate: -1 }}
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </Pressable>
          </form>
        </Card>
      </div>
    </div>
  );
}
