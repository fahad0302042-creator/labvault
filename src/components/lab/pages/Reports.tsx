"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { useLogs } from "@/hooks/lab/useLogs";
import { clearMonthData } from "@/lib/lab/storage";
import { haptic } from "@/lib/lab/haptics";
import type {
  Apparatus,
  Chemical,
  ConsumptionLog,
} from "@/lib/lab/types";

type Tab = "chemicals" | "apparatus";

type Row = {
  id: string;
  name: string;
  sub?: string;
  /** Original stock (initial quantity) */
  stock: number;
  /** How much was used in the selected month */
  used: number;
  /** Current remaining quantity */
  left: number;
  unit: string;
};

export function Reports() {
  const { chemicals, loading: chemLoading } = useChemicals();
  const { apparatus, loading: appLoading } = useApparatus();
  const { logs, loading: logsLoading, refresh: refreshLogs } = useLogs();
  const [tab, setTab] = useState<Tab>("chemicals");
  const [generated, setGenerated] = useState(false);

  // Month picker — default to current month
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  );

  // Generate list of months (current month + 11 previous = 12 months)
  const months = useMemo(() => {
    const result: { value: string; label: string }[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      result.push({ value, label });
    }
    return result;
  }, []);

  // Build date range for the selected month
  const monthRange = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 1).getTime();
    return { start, end };
  }, [selectedMonth]);

  const chemicalRows = useMemo(
    () =>
      buildRows(chemicals, logs, monthRange.start, monthRange.end, "chemical").filter(
        (r) => r.used > 0,
      ),
    [chemicals, logs, monthRange],
  );
  const apparatusRows = useMemo(
    () =>
      buildRows(apparatus, logs, monthRange.start, monthRange.end, "apparatus").filter(
        (r) => r.used > 0,
      ),
    [apparatus, logs, monthRange],
  );

  const rows = tab === "chemicals" ? chemicalRows : apparatusRows;
  const loading = chemLoading || appLoading || logsLoading;
  const totalUsed = rows.reduce((s, r) => s + r.used, 0);
  const totalStock = rows.reduce((s, r) => s + r.stock, 0);
  const totalLeft = rows.reduce((s, r) => s + r.left, 0);
  const selectedMonthLabel = months.find((m) => m.value === selectedMonth)?.label ?? "";

  async function handleClearMonth() {
    if (!confirm(`Clear ALL logs from ${selectedMonthLabel}? This cannot be undone.`)) return;
    haptic("warning");
    await clearMonthData(selectedMonth);
    await refreshLogs();
    setGenerated(false);
    toast(`Cleared all activity logs from ${selectedMonthLabel}`);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] px-5 pt-8 pb-32 sm:px-8 lg:pb-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Reports
        </h1>
        <p className="mt-1 text-sm text-stone-700">
          {selectedMonthLabel} ·{" "}
          {rows.length} item{rows.length === 1 ? "" : "s"} used
        </p>
      </header>

      {/* Month dropdown */}
      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-700">
          Select Month
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setGenerated(false);
          }}
          className="w-full max-w-xs rounded-xl border border-stone-200 bg-white py-3 px-4 text-sm font-semibold text-stone-900 outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tab toggle */}
      <div className="mb-6 inline-flex rounded-full bg-stone-200/60 p-1">
        {(["chemicals", "apparatus"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { haptic("selection"); setTab(t); setGenerated(false); }}
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

      {/* Generate + Clear buttons */}
      <div className="no-print mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => { haptic("medium"); setGenerated(true); }}
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500 active:scale-95"
        >
          <span className="text-base">📊</span>
          Generate Report
        </button>
        <button
          onClick={handleClearMonth}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-50 active:scale-95"
        >
          <span className="text-base">🗑</span>
          Clear {selectedMonthLabel} Data
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-orange-600" />
        </div>
      ) : !generated ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-stone-900">Ready to generate</p>
          <p className="mt-1 text-sm text-stone-700">
            Click "Generate Report" to see {tab === "chemicals" ? "chemical" : "apparatus"} usage for {selectedMonthLabel}.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-stone-900">No usage recorded</p>
          <p className="mt-1 text-sm text-stone-700">
            No {tab === "chemicals" ? "chemicals" : "apparatus"} were consumed or broken in {selectedMonthLabel}.
          </p>
        </div>
      ) : (
        <div id="print-area">
          {/* Print-only header */}
          <div className="hidden print:mb-6 print:block">
            <h1 className="text-2xl font-bold">LabVault Usage Report</h1>
            <p className="text-sm text-stone-700">
              {tab === "chemicals" ? "Chemicals" : "Apparatus"} · {selectedMonthLabel} · Generated{" "}
              {new Date().toLocaleString()}
            </p>
          </div>

          {/* On-screen header */}
          <div className="no-print mb-4">
            <h2 className="text-lg font-bold text-stone-900">
              {tab === "chemicals" ? "Chemicals" : "Apparatus"} Used — {selectedMonthLabel}
            </h2>
            <p className="text-sm text-stone-700">
              {rows.length} item{rows.length === 1 ? "" : "s"} · {totalUsed} total units used
            </p>
          </div>

          {/* Table header */}
          <div className="mb-2 grid grid-cols-12 gap-2 border-b border-stone-200 px-1 pb-2 text-[10px] font-bold uppercase tracking-wide text-stone-700">
            <div className="col-span-5">Name</div>
            <div className="col-span-2 text-right">Stock</div>
            <div className="col-span-2 text-right">−Used</div>
            <div className="col-span-3 text-right">=Left</div>
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
                    <p className="font-mono text-xs text-stone-700">{r.sub}</p>
                  )}
                </div>

                {/* Stock */}
                <div className="col-span-2 text-right">
                  <span className="font-mono text-sm font-bold tabular-nums text-stone-900">
                    {r.stock}
                  </span>
                  <span className="ml-0.5 text-[10px] text-stone-700">
                    {r.unit}
                  </span>
                </div>

                {/* −Used */}
                <div className="col-span-2 text-right">
                  <span className="font-mono text-sm font-bold tabular-nums text-amber-600">
                    −{r.used}
                  </span>
                  <span className="ml-0.5 text-[10px] text-stone-700">
                    {r.unit}
                  </span>
                </div>

                {/* =Left */}
                <div className="col-span-3 text-right">
                  <span
                    className={`font-mono text-sm font-bold tabular-nums ${
                      r.left <= 0
                        ? "text-red-600"
                        : r.left < r.stock * 0.2
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    ={r.left}
                  </span>
                  <span className="ml-0.5 text-[10px] text-stone-700">
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
              {totalStock}
            </div>
            <div className="col-span-2 text-right font-mono tabular-nums text-amber-600">
              −{totalUsed}
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-stone-900">
              ={totalLeft}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={() => { haptic("light"); window.print(); }}
            className="no-print mt-6 flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-stone-800 active:scale-95"
          >
            <span className="text-base">📄</span>
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Build rows from data ----------
function buildRows(
  items: Chemical[] | Apparatus[],
  logs: ConsumptionLog[],
  sinceMs: number,
  untilMs: number,
  type: "chemical" | "apparatus",
): Row[] {
  return items.map((item) => {
    const itemLogs = logs.filter((l) => {
      const t = +new Date(l.logged_at);
      return l.item_id === item.id && t >= sinceMs && t < untilMs;
    });
    const used = itemLogs
      .filter((l) => l.action === "consumed" || l.action === "broken")
      .reduce((sum, l) => sum + l.quantity, 0);

    return {
      id: item.id,
      name: item.name,
      sub:
        type === "chemical"
          ? (item as Chemical).formula
          : (item as Apparatus).category,
      stock: item.initialQuantity,
      used,
      left: item.quantity,
      unit: type === "chemical" ? (item as Chemical).unit : "units",
    };
  });
}
