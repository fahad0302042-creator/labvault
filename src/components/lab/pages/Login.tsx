"use client";

import { motion } from "framer-motion";
import { FlaskConical, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { BlobBackground } from "@/components/lab/layout/BlobBackground";
import { GlassCard } from "@/components/lab/shared/GlassCard";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("researcher@labvault.app");
  const [password, setPassword] = useState("demo1234");
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
    } catch {
      setError("Could not sign in. Please try again.");
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
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-graphite to-graphite/90 shadow-[0_8px_24px_-6px_rgba(42,37,32,0.45)]">
              <FlaskConical className="h-8 w-8 text-white" strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-graphite">
              LabVault
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Chemistry lab inventory, in your pocket.
            </p>
          </div>

          {/* Card */}
          <GlassCard className="p-6 sm:p-8" enter={false}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 py-3 pl-10 pr-3 text-sm text-graphite placeholder:text-slate-400 shadow-sm outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="you@lab.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 py-3 pl-10 pr-3 text-sm text-graphite placeholder:text-slate-400 shadow-sm outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-graphite py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_-4px_rgba(42,37,32,0.4)] transition-all hover:bg-graphite/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
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

            <div className="mt-6 border-t border-slate-200/70 pt-4 text-center">
              <p className="text-xs text-slate-500">
                Got a team invite link?{" "}
                <button
                  type="button"
                  className="font-semibold text-graphite hover:text-slate-700 underline-offset-2 hover:underline"
                  onClick={() => {
                    setEmail("teammate@labvault.app");
                    setPassword("");
                  }}
                >
                  Set your password
                </button>
              </p>
            </div>
          </GlassCard>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Prototype mode · any email + 4+ char password will sign you in.
          </p>
        </motion.div>
      </main>
    </>
  );
}
