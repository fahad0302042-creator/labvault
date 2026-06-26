"use client";

import { motion } from "framer-motion";
import { FlaskConical, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { BlobBackground } from "@/components/lab/layout/BlobBackground";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <BlobBackground />
      <main className="safe-top flex min-h-screen flex-col items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-graphite text-white shadow-lg">
              <FlaskConical className="h-8 w-8" strokeWidth={2.2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-graphite">
              LabVault
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Chemistry lab inventory, in your pocket.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-graphite placeholder:text-slate-400 outline-none transition-all focus:border-graphite focus:ring-2 focus:ring-slate-100"
                  placeholder="you@lab.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-graphite placeholder:text-slate-400 outline-none transition-all focus:border-graphite focus:ring-2 focus:ring-slate-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-graphite py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-graphite/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-slate-400">
            Use the account you created in Supabase → Authentication → Users.
          </p>
        </motion.div>
      </main>
    </>
  );
}
