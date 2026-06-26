"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { useLogs } from "@/hooks/lab/useLogs";
import type {
  Apparatus,
  Chemical,
  ConsumptionLog,
} from "@/lib/lab/types";

type Period = "weekly" | "monthly";
type Tab = "chemicals" | "apparatus";

type Row = {
  id: string;
  name: string;
  sub?: string;
  stockIn: number;
  used: number;
  remaining: number;
  unit: string;
  health: "healthy" | "low" | "critical";
  pct: number;
};

export function Reports() {
  const { chemicals, loading: chemLoading } = useChemicals();
  const { apparatus, loading: appLoading } = useApparatus();
  const { logs, loading: logsLoading } = useLogs();
  const [period, setPeriod] = useState<Period>("weekly");
  const [tab, setTab] = useState<Tab>("chemicals");

  const sinceMs = period === "weekly" ? 7 : 30;
  const since = Date.now() - sinceMs * 24 * 60 * 60 * 1000;

  const chemicalRows = useMemo(
    () => buildRows(chemicals, logs, since, "chemical"),
    [chemicals, logs, since],
  );
  const apparatusRows = useMemo(
    () => buildRows(apparatus, logs, since, "apparatus"),
    [apparatus, logs, since],
  );

  const rows = tab === "chemicals" ? chemicalRows : apparatusRows;
  const maxUsed = useMemo(
    () => Math.max(...rows.map((r) => r.used), 1),
    [rows],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          stockIn: acc.stockIn + r.stockIn,
          used: acc.used + r.used,
          remaining: acc.remaining + r.remaining,
        }),
        { stockIn: 0, used: 0, remaining: 0 },
      ),
    [rows],
  );

  // Overall health: percentage of items that are "healthy"
  const healthPct = useMemo(() => {
    if (rows.length === 0) return 0;
    const healthy = rows.filter((r) => r.health === "healthy").length;
    return Math.round((healthy / rows.length) * 100);
  }, [rows]);

  const loading = chemLoading || appLoading || logsLoading;

  return (
    <div className="min-h-screen bg-white px-5 pt-8 pb-32 sm:px-8 lg:pb-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-graphite">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {period === "weekly" ? "Last 7 days" : "Last 30 days"} ·{" "}
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </p>
      </header>

      {/* Period toggle — minimalist pill */}
      <div className="mb-8 inline-flex rounded-full bg-slate-100 p-1">
        {(["weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`relative rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              period === p ? "text-white" : "text-slate-500 hover:text-graphite"
            }`}
          >
            {period === p && (
              <motion.span
                layoutId="report-period-pill"
                className="absolute inset-0 rounded-full bg-graphite"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative">{p}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-graphite" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-graphite">No data yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Add {tab === "chemicals" ? "chemicals" : "apparatus"} and log
            activity to see reports here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary section — minimalist stat cards */}
          <section className="mb-8 grid grid-cols-3 gap-3 sm:gap-6">
            <StatCard label="Stock In" value={totals.stockIn} tone="positive" />
            <StatCard label="Used" value={totals.used} tone="negative" />
            <StatCard
              label="Remaining"
              value={totals.remaining}
              tone="neutral"
            />
          </section>

          {/* Inventory health — circular progress */}
          <section className="mb-8">
            <div className="flex items-center gap-6 rounded-2xl border border-slate-100 bg-white p-6">
              <CircularProgress value={healthPct} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Inventory Health
                </p>
                <p className="mt-1 text-2xl font-bold text-graphite">
                  {healthPct}%
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {rows.filter((r) => r.health === "healthy").length} of{" "}
                  {rows.length} items healthy
                </p>
              </div>
            </div>
          </section>

          {/* Tab toggle */}
          <div className="mb-6 inline-flex rounded-full bg-slate-100 p-1">
            {(["chemicals", "apparatus"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? "text-white" : "text-slate-500 hover:text-graphite"
                }`}
              >
                {tab === t && (
                  <motion.span
                    layoutId="report-tab-pill"
                    className="absolute inset-0 rounded-full bg-graphite"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>

          {/* Export button — minimalist */}
          <button
            onClick={() => window.print()}
            className="no-print mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-graphite"
          >
            <span className="text-base">↓</span>
            Export as PDF
          </button>

          {/* Item breakdown — clean list */}
          <div id="print-area">
            {/* Print-only header */}
            <div className="hidden print:mb-6 print:block">
              <h1 className="text-2xl font-bold">LabVault Report</h1>
              <p className="text-sm text-slate-500">
                {tab === "chemicals" ? "Chemicals" : "Apparatus"} ·{" "}
                {period === "weekly" ? "Weekly" : "Monthly"} · Generated{" "}
                {new Date().toLocaleString()}
              </p>
            </div>

            <ul className="space-y-1">
              {rows.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="border-b border-slate-100 py-4 last:border-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-graphite">
                        {r.name}
                      </p>
                      {r.sub && (
                        <p className="font-mono text-xs text-slate-400">
                          {r.sub}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold tabular-nums text-graphite">
                        {r.remaining}
                        <span className="ml-0.5 text-xs font-normal text-slate-400">
                          {r.unit}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-2 flex items-center gap-6 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400">In</span>
                      <span className="font-mono font-semibold text-emerald-600">
                        +{r.stockIn}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400">Used</span>
                      <span className="font-mono font-semibold text-amber-600">
                        −{r.used}
                      </span>
                    </span>
                    <span
                      className={`ml-auto font-semibold ${
                        r.health === "healthy"
                          ? "text-emerald-600"
                          : r.health === "low"
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {r.health === "healthy"
                        ? "●"
                        : r.health === "low"
                          ? "●"
                          : "●"}{" "}
                      {r.health}
                    </span>
                  </div>

                  {/* Minimal usage bar */}
                  {r.used > 0 && (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        className="h-full rounded-full bg-graphite/80"
                        initial={{ width: 0 }}
                        animate={{ width: `${(r.used / maxUsed) * 100}%` }}
                        transition={{ duration: 0.5, delay: i * 0.03 }}
                      />
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Minimalist stat card ----------
function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative" | "neutral";
}) {
  const valueColor =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-amber-600"
        : "text-graphite";

  return (
    <div className="text-center sm:text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums sm:text-3xl ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

// ---------- Circular progress chart ----------
function CircularProgress({ value }: { value: number }) {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-slate-100"
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="text-graphite"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ---------- Build rows from data ----------
function buildRows(
  items: Chemical[] | Apparatus[],
  logs: ConsumptionLog[],
  since: number,
  type: "chemical" | "apparatus",
): Row[] {
  return items.map((item) => {
    const itemLogs = logs.filter(
      (l) => l.item_id === item.id && +new Date(l.logged_at) >= since,
    );
    const stockIn = itemLogs
      .filter((l) => l.action === "restocked" || l.action === "created")
      .reduce((sum, l) => sum + l.quantity, 0);
    const used = itemLogs
      .filter((l) => l.action === "consumed" || l.action === "broken")
      .reduce((sum, l) => sum + l.quantity, 0);
    const remaining = item.quantity;
    const initial = item.initialQuantity;
    const pct = initial > 0 ? remaining / initial : 0;
    const health = pct >= 0.5 ? "healthy" : pct >= 0.2 ? "low" : "critical";

    return {
      id: item.id,
      name: item.name,
      sub:
        type === "chemical"
          ? (item as Chemical).formula
          : (item as Apparatus).category,
      stockIn,
      used,
      remaining,
      unit: type === "chemical" ? (item as Chemical).unit : "units",
      health: health as Row["health"],
      pct,
    };
  });
}
