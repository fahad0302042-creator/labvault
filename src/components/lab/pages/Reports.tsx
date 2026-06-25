"use client";

import { motion } from "framer-motion";
import { Printer, FileBarChart2, TrendingUp, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { useLogs } from "@/hooks/lab/useLogs";
import { GlassCard } from "@/components/lab/shared/GlassCard";
import { Badge } from "@/components/lab/shared/Badge";
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
};

export function Reports() {
  const { chemicals } = useChemicals();
  const { apparatus } = useApparatus();
  const { logs } = useLogs();
  const [period, setPeriod] = useState<Period>("weekly");
  const [tab, setTab] = useState<Tab>("chemicals");

  const sinceMs = period === "weekly" ? 7 : 30;
  const since = Date.now() - sinceMs * 24 * 60 * 60 * 1000;

  const chemicalRows = useMemo(() => buildRows(chemicals, logs, since, "chemical"), [chemicals, logs, since]);
  const apparatusRows = useMemo(() => buildRows(apparatus, logs, since, "apparatus"), [apparatus, logs, since]);

  const rows = tab === "chemicals" ? chemicalRows : apparatusRows;
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        stockIn: acc.stockIn + r.stockIn,
        used: acc.used + r.used,
        remaining: acc.remaining + r.remaining,
      }),
      { stockIn: 0, used: 0, remaining: 0 },
    );
  }, [rows]);

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">
            {period === "weekly" ? "Last 7 days" : "Last 30 days"} · {rows.length} item
            {rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-md">
          <FileBarChart2 className="h-5 w-5" />
        </div>
      </header>

      {/* Period toggle */}
      <div className="mb-4 flex rounded-xl bg-white/70 p-1 shadow-sm ring-1 ring-inset ring-white/80 backdrop-blur">
        {(["weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`relative flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
              period === p ? "text-white" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {period === p && (
              <motion.span
                layoutId="report-period-pill"
                className="absolute inset-0 rounded-lg bg-sky-500 shadow-sm"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative">{p}</span>
          </button>
        ))}
      </div>

      {/* Tab toggle */}
      <div className="mb-4 flex rounded-xl bg-white/70 p-1 shadow-sm ring-1 ring-inset ring-white/80 backdrop-blur">
        {(["chemicals", "apparatus"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t ? "text-white" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="report-tab-pill"
                className="absolute inset-0 rounded-lg bg-violet-500 shadow-sm"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="no-print mb-5 grid grid-cols-3 gap-3">
        <SummaryCard
          tone="green"
          icon={<TrendingUp className="h-4 w-4" />}
          label="Stock In"
          value={totals.stockIn}
        />
        <SummaryCard
          tone="amber"
          icon={<Package className="h-4 w-4" />}
          label="Used"
          value={totals.used}
        />
        <SummaryCard
          tone="teal"
          icon={<Package className="h-4 w-4" />}
          label="Remaining"
          value={totals.remaining}
        />
      </div>

      {/* Print button (mobile) */}
      <button
        onClick={() => window.print()}
        className="no-print mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-slate-800"
      >
        <Printer className="h-4 w-4" />
        Export as PDF
      </button>

      {/* Table */}
      <div id="print-area">
        {/* Print-only header */}
        <div className="hidden print:mb-6 print:block">
          <h1 className="text-2xl font-bold">LabVault Report</h1>
          <p className="text-sm text-slate-600">
            {tab === "chemicals" ? "Chemicals" : "Apparatus"} ·{" "}
            {period === "weekly" ? "Weekly" : "Monthly"} · Generated{" "}
            {new Date().toLocaleString()}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 border-b border-slate-200/70 bg-white/50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-right">Stock In</div>
            <div className="col-span-2 text-right">Used</div>
            <div className="col-span-3 text-right">Remaining</div>
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              No {tab} to report on yet.
            </div>
          ) : (
            rows.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="grid grid-cols-12 items-center gap-2 border-b border-slate-100/70 px-4 py-3 last:border-0"
              >
                <div className="col-span-5 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {r.name}
                  </p>
                  {r.sub && (
                    <p className="truncate text-xs text-slate-500">{r.sub}</p>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm font-bold tabular-nums text-emerald-600">
                  +{r.stockIn}
                  <span className="ml-0.5 text-[10px] font-normal text-slate-400">
                    {r.unit}
                  </span>
                </div>
                <div className="col-span-2 text-right text-sm font-bold tabular-nums text-amber-600">
                  −{r.used}
                  <span className="ml-0.5 text-[10px] font-normal text-slate-400">
                    {r.unit}
                  </span>
                </div>
                <div className="col-span-3 flex flex-col items-end gap-1">
                  <span className="text-sm font-bold tabular-nums text-slate-900">
                    {r.remaining}
                    <span className="ml-0.5 text-[10px] font-normal text-slate-400">
                      {r.unit}
                    </span>
                  </span>
                  <HealthBadge health={r.health} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

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
      sub: type === "chemical" ? (item as Chemical).formula : (item as Apparatus).category,
      stockIn,
      used,
      remaining,
      unit: type === "chemical" ? (item as Chemical).unit : "units",
      health: health as Row["health"],
    };
  });
}

function SummaryCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: "green" | "amber" | "teal";
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const toneClasses = {
    green: "from-emerald-400 to-emerald-500",
    amber: "from-amber-400 to-orange-500",
    teal: "from-sky-400 to-cyan-500",
  }[tone];

  return (
    <GlassCard className="p-3" enter={false}>
      <div
        className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${toneClasses} text-white`}
      >
        {icon}
      </div>
      <p className="text-lg font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </GlassCard>
  );
}

function HealthBadge({ health }: { health: Row["health"] }) {
  const tone = health === "healthy" ? "green" : health === "low" ? "amber" : "red";
  const label = health === "healthy" ? "Healthy" : health === "low" ? "Low" : "Critical";
  return (
    <Badge tone={tone as "green" | "amber" | "red"} dot>
      {label}
    </Badge>
  );
}
