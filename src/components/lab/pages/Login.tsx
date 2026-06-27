"use client";

import { motion } from "framer-motion";
import { FlaskConical, Loader2, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { haptic } from "@/lib/lab/haptics";
import { BlobBackground } from "@/components/lab/layout/BlobBackground";

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signin") {
        haptic("medium");
        await signIn(email, password);
      } else {
        haptic("medium");
        await signUp(email, password);
        setInfo("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      // If it's the "check your email" message, show as info not error
      if (msg.includes("Check your email") || msg.includes("confirm")) {
        setInfo(msg);
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(msg);
      }
    }
    setSubmitting(false);
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
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg">
              <FlaskConical className="h-8 w-8" strokeWidth={2.2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              LabVault
            </h1>
            <p className="mt-1.5 text-sm text-stone-700">
              Chemistry lab inventory, in your pocket.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wide text-stone-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-500 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="you@lab.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wide text-stone-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-500 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1.5"
              >
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold uppercase tracking-wide text-stone-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-500 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </motion.p>
            )}

            {info && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700"
              >
                {info}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : mode === "signin" ? (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create account
                </>
              )}
            </button>
          </form>

          {/* Toggle sign in / sign up */}
          <div className="mt-6 border-t border-stone-200 pt-4 text-center">
            <p className="text-xs text-stone-700">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                  setInfo(null);
                  setConfirmPassword("");
                }}
                className="font-semibold text-orange-600 underline-offset-2 hover:underline"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </main>
    </>
  );
}
