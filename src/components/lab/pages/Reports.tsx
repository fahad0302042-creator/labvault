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
  /** How much we started with (initial quantity) */
  inStock: number;
  /** How much was used in the period (consumed + broken) */
  used: number;
  /** How much is left now (current quantity, auto-calculated) */
  left: number;
  unit: string;
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
  const loading = chemLoading || appLoading || logsLoading;

  return (
    <div className="min-h-screen bg-[#FAF8F3] px-5 pt-8 pb-32 sm:px-8 lg:pb-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Reports
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          {period === "weekly" ? "Last 7 days" : "Last 30 days"} ·{" "}
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </p>
      </header>

      {/* Period toggle */}
      <div className="mb-6 inline-flex rounded-full bg-stone-200/60 p-1">
        {(["weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`relative rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              period === p ? "text-white" : "text-stone-700 hover:text-stone-900"
            }`}
          >
            {period === p && (
              <motion.span
                layoutId="report-period-pill"
                className="absolute inset-0 rounded-full bg-orange-600"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative">{p}</span>
          </button>
        ))}
      </div>

      {/* Tab toggle */}
      <div className="mb-6 inline-flex rounded-full bg-stone-200/60 p-1">
        {(["chemicals", "apparatus"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "text-white" : "text-stone-700 hover:text-stone-900"
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="report-tab-pill"
                className="absolute inset-0 rounded-full bg-stone-900"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      {/* Export */}
      <button
        onClick={() => window.print()}
        className="no-print mb-6 flex items-center gap-2 text-sm font-semibold text-stone-700 transition-colors hover:text-orange-600"
      >
        <span className="text-base">↓</span>
        Export as PDF
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-orange-600" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-stone-900">No data yet</p>
          <p className="mt-1 text-sm text-stone-600">
            Add {tab === "chemicals" ? "chemicals" : "apparatus"} and log
            activity to see reports here.
          </p>
        </div>
      ) : (
        <div id="print-area">
          {/* Print-only header */}
          <div className="hidden print:mb-6 print:block">
            <h1 className="text-2xl font-bold">LabVault Report</h1>
            <p className="text-sm text-stone-600">
              {tab === "chemicals" ? "Chemicals" : "Apparatus"} ·{" "}
              {period === "weekly" ? "Weekly" : "Monthly"} · Generated{" "}
              {new Date().toLocaleString()}
            </p>
          </div>

          {/* Table header */}
          <div className="mb-2 grid grid-cols-12 gap-2 border-b border-stone-200 px-1 pb-2 text-[10px] font-bold uppercase tracking-wide text-stone-600">
            <div className="col-span-5">Name</div>
            <div className="col-span-2 text-right">In Stock</div>
            <div className="col-span-2 text-right">Used</div>
            <div className="col-span-3 text-right">Left</div>
          </div>

          {/* Rows */}
          <ul>
            {rows.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="grid grid-cols-12 items-center gap-2 border-b border-stone-100 py-3 last:border-0"
              >
                {/* Name */}
                <div className="col-span-5 min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {r.name}
                  </p>
                  {r.sub && (
                    <p className="font-mono text-xs text-stone-600">{r.sub}</p>
                  )}
                </div>

                {/* In Stock */}
                <div className="col-span-2 text-right">
                  <span className="font-mono text-sm font-bold tabular-nums text-stone-900">
                    {r.inStock}
                  </span>
                  <span className="ml-0.5 text-[10px] text-stone-600">
                    {r.unit}
                  </span>
                </div>

                {/* Used */}
                <div className="col-span-2 text-right">
                  <span className="font-mono text-sm font-bold tabular-nums text-amber-600">
                    −{r.used}
                  </span>
                  <span className="ml-0.5 text-[10px] text-stone-600">
                    {r.unit}
                  </span>
                </div>

                {/* Left (auto-calculated: inStock - used) */}
                <div className="col-span-3 text-right">
                  <span
                    className={`font-mono text-sm font-bold tabular-nums ${
                      r.left <= 0
                        ? "text-red-600"
                        : r.left < r.inStock * 0.2
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {r.left}
                  </span>
                  <span className="ml-0.5 text-[10px] text-stone-600">
                    {r.unit}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Totals row */}
          <div className="mt-4 grid grid-cols-12 gap-2 border-t-2 border-stone-300 pt-3 text-sm font-bold">
            <div className="col-span-5 text-stone-900">Total</div>
            <div className="col-span-2 text-right font-mono tabular-nums text-stone-900">
              {rows.reduce((s, r) => s + r.inStock, 0)}
            </div>
            <div className="col-span-2 text-right font-mono tabular-nums text-amber-600">
              −{rows.reduce((s, r) => s + r.used, 0)}
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-stone-900">
              {rows.reduce((s, r) => s + r.left, 0)}
            </div>
          </div>
        </div>
      )}
    </div>
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
    const used = itemLogs
      .filter((l) => l.action === "consumed" || l.action === "broken")
      .reduce((sum, l) => sum + l.quantity, 0);
    const inStock = item.initialQuantity;
    const left = item.quantity; // current quantity (already auto-calculated by the app)

    return {
      id: item.id,
      name: item.name,
      sub:
        type === "chemical"
          ? (item as Chemical).formula
          : (item as Apparatus).category,
      inStock,
      used,
      left,
      unit: type === "chemical" ? (item as Chemical).unit : "units",
    };
  });
}
