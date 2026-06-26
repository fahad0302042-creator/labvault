"use client";

import { motion } from "framer-motion";
import {
  FlaskConical,
  Beaker,
  AlertTriangle,
  TrendingDown,
  ScanLine,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { useLogs } from "@/hooks/lab/useLogs";
import { clearAllData } from "@/lib/lab/storage";
import { GlassCard } from "@/components/lab/shared/GlassCard";
import { Badge } from "@/components/lab/shared/Badge";
import { Sparkline } from "@/components/lab/shared/Sparkline";
import { ConsumptionChart } from "@/components/lab/shared/ConsumptionChart";
import { GlobalSearch } from "./GlobalSearch";
import {
  formatHeaderDate,
  formatRelative,
  greeting,
  type LogAction,
  type Chemical,
  type Apparatus,
} from "@/lib/lab/types";
import type { TabKey } from "@/components/lab/layout/BottomNav";

type DashboardProps = {
  onNavigate: (tab: TabKey) => void;
  onQuickAdd: (kind: "chemical" | "apparatus") => void;
  onQuickScan: () => void;
};

const ACTION_META: Record<
  LogAction,
  { label: string; tone: "teal" | "green" | "amber" | "red" | "violet" | "slate" }
> = {
  consumed:  { label: "Consumed",  tone: "amber" },
  restocked: { label: "Restocked", tone: "green" },
  broken:    { label: "Broken",    tone: "red" },
  created:   { label: "Added",     tone: "teal" },
  updated:   { label: "Updated",   tone: "slate" },
  deleted:   { label: "Removed",   tone: "slate" },
};

/** Build 7-day daily buckets from logs */
function use7DayData(logs: ReturnType<typeof useLogs>["logs"]) {
  return useMemo(() => {
    const days: { date: string; consumed: number; restocked: number; created: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const dayStart = day.getTime();
      const dayEnd = nextDay.getTime();

      const dayLogs = logs.filter((l) => {
        const t = +new Date(l.logged_at);
        return t >= dayStart && t < dayEnd;
      });

      days.push({
        date: day.toLocaleDateString(undefined, { weekday: "narrow" }),
        consumed: dayLogs
          .filter((l) => l.action === "consumed" || l.action === "broken")
          .reduce((s, l) => s + l.quantity, 0),
        restocked: dayLogs
          .filter((l) => l.action === "restocked")
          .reduce((s, l) => s + l.quantity, 0),
        created: dayLogs.filter((l) => l.action === "created").length,
      });
    }
    return days;
  }, [logs]);
}

function KpiCard({
  index,
  icon,
  label,
  value,
  sub,
  tone,
  sparkData,
  sparkColor,
  onClick,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone: "teal" | "amber" | "red" | "violet";
  sparkData: number[];
  sparkColor: string;
  onClick?: () => void;
}) {
  const toneClasses = {
    teal: "from-orange-500 to-orange-700 shadow-[0_8px_20px_-6px_rgba(42,37,32,0.35)]",
    amber: "from-amber-400 to-orange-500 shadow-[0_8px_20px_-6px_rgba(245,158,11,0.4)]",
    red: "from-rose-400 to-red-500 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.4)]",
    violet: "from-orange-500 to-orange-700 shadow-[0_8px_20px_-6px_rgba(42,37,32,0.35)]",
  }[tone];

  return (
    <GlassCard
      interactive={!!onClick}
      index={index}
      onClick={onClick}
      className="p-4"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${toneClasses} text-white`}
        >
          {icon}
        </div>
        <div style={{ color: sparkColor }} className="opacity-80">
          <Sparkline data={sparkData} width={50} height={20} />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tabular-nums text-stone-900">
          {value}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-stone-700">
          {label}
        </div>
        {sub && <div className="mt-0.5 text-[11px] text-stone-600">{sub}</div>}
      </div>
    </GlassCard>
  );
}

export function Dashboard({ onNavigate, onQuickAdd, onQuickScan }: DashboardProps) {
  const { user } = useAuth();
  const { chemicals, refresh: refreshChemicals } = useChemicals();
  const { apparatus, refresh: refreshApparatus } = useApparatus();
  const { logs, refresh: refreshLogs } = useLogs();
  const [searchOpen, setSearchOpen] = useState(false);

  const dailyData = use7DayData(logs);

  const stats = useMemo(() => {
    const lowStock = chemicals.filter(
      (c) => c.initialQuantity > 0 && c.quantity / c.initialQuantity < 0.2,
    ).length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyConsumption = logs
      .filter(
        (l) =>
          (l.action === "consumed" || l.action === "broken") &&
          +new Date(l.logged_at) >= weekAgo,
      )
      .reduce((sum, l) => sum + l.quantity, 0);

    return {
      totalChemicals: chemicals.length,
      totalApparatus: apparatus.length,
      lowStock,
      weeklyConsumption,
    };
  }, [chemicals, apparatus, logs]);

  // Sparkline data arrays
  const chemicalSpark = useMemo(() => {
    // Cumulative chemicals count over 7 days (approximate from created_at)
    const now = Date.now();
    return dailyData.map((_, i) => {
      const dayEnd = now - (6 - i) * 24 * 60 * 60 * 1000;
      return chemicals.filter((c) => +new Date(c.created_at) <= dayEnd).length;
    });
  }, [chemicals, dailyData]);

  const apparatusSpark = useMemo(() => {
    const now = Date.now();
    return dailyData.map((_, i) => {
      const dayEnd = now - (6 - i) * 24 * 60 * 60 * 1000;
      return apparatus.filter((a) => +new Date(a.created_at) <= dayEnd).length;
    });
  }, [apparatus, dailyData]);

  const lowStockSpark = useMemo(
    () => dailyData.map((d) => d.consumed + d.created),
    [dailyData],
  );

  const consumptionSpark = useMemo(
    () => dailyData.map((d) => d.consumed),
    [dailyData],
  );

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-5 px-4 pt-6 pb-4 sm:px-6">
      {/* Header with global search */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-700">
            {formatHeaderDate()}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">
            {greeting()}, {user?.name?.split(" ")[0] ?? "Researcher"}
          </h1>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-stone-900 shadow-sm ring-1 ring-stone-200 transition-colors hover:bg-stone-100"
        >
          <Search className="h-4 w-4" />
        </button>
      </motion.header>

      {/* Global search trigger bar (tap to open) */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-stone-200 bg-white py-3 px-4 text-sm text-stone-600 shadow-sm transition-colors hover:bg-stone-100"
      >
        <Search className="h-4 w-4" />
        Search chemicals & apparatus…
      </button>

      {/* KPI grid */}
      <section
        aria-label="Key metrics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <KpiCard
          index={0}
          tone="teal"
          icon={<FlaskConical className="h-5 w-5" />}
          label="Chemicals"
          value={stats.totalChemicals}
          sub="In inventory"
          sparkData={chemicalSpark}
          sparkColor="#2A2520"
          onClick={() => onNavigate("chemicals")}
        />
        <KpiCard
          index={1}
          tone="violet"
          icon={<Beaker className="h-5 w-5" />}
          label="Apparatus"
          value={stats.totalApparatus}
          sub="Tracked items"
          sparkData={apparatusSpark}
          sparkColor="#2A2520"
          onClick={() => onNavigate("apparatus")}
        />
        <KpiCard
          index={2}
          tone="amber"
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Low Stock"
          value={stats.lowStock}
          sub="Below 20% remaining"
          sparkData={lowStockSpark}
          sparkColor="#F59E0B"
          onClick={() => onNavigate("chemicals")}
        />
        <KpiCard
          index={3}
          tone="red"
          icon={<TrendingDown className="h-5 w-5" />}
          label="This Week"
          value={stats.weeklyConsumption}
          sub="Units consumed/broken"
          sparkData={consumptionSpark}
          sparkColor="#DC2626"
          onClick={() => onNavigate("reports")}
        />
      </section>

      {/* 7-Day consumption chart */}
      <section aria-label="Weekly activity chart">
        <GlassCard className="p-4 sm:p-5" index={4}>
          <ConsumptionChart data={dailyData} />
        </GlassCard>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions" className="grid grid-cols-3 gap-3">
        <QuickAction
          icon={<ScanLine className="h-5 w-5" />}
          label="Scan QR"
          onClick={onQuickScan}
        />
        <QuickAction
          icon={<FlaskConical className="h-5 w-5" />}
          label="Add Chemical"
          onClick={() => onQuickAdd("chemical")}
        />
        <QuickAction
          icon={<Beaker className="h-5 w-5" />}
          label="Add Apparatus"
          onClick={() => onQuickAdd("apparatus")}
        />
      </section>

      {/* Recent activity */}
      <section aria-label="Recent activity">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-stone-700">
            Recent Activity
          </h2>
          <button
            onClick={() => onNavigate("reports")}
            className="text-xs font-semibold text-stone-900 hover:text-stone-700"
          >
            View all
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <GlassCard className="p-6 text-center" index={5}>
            <p className="text-sm text-stone-700">
              No activity yet. Add or consume something to see it here.
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="divide-y divide-stone-200" index={5}>
            {recentLogs.map((log, i) => {
              const meta = ACTION_META[log.action];
              const isUp = log.action === "restocked" || log.action === "created";
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isUp
                        ? "bg-emerald-50 text-emerald-600"
                        : log.action === "broken"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {log.item_name}
                    </p>
                    <p className="text-xs text-stone-700">
                      {log.logged_by_name} · {formatRelative(log.logged_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {log.quantity > 0 && (
                      <span className="font-mono text-xs tabular-nums text-stone-700">
                        {log.quantity}
                        {log.unit ? ` ${log.unit}` : ""}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </GlassCard>
        )}
      </section>

      {/* Low stock callout */}
      {stats.lowStock > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          aria-label="Low stock alert"
        >
          <GlassCard
            interactive
            onClick={() => onNavigate("chemicals")}
            className="flex items-center gap-3 border-amber-200 bg-amber-50 p-4"
            enter={false}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                {stats.lowStock} chemical{stats.lowStock === 1 ? "" : "s"} need restocking
              </p>
              <p className="text-xs text-amber-700">
                Tap to review and reorder.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-400" />
          </GlassCard>
        </motion.section>
      )}

      {/* Clear all data — for testing / resetting */}
      {chemicals.length === 0 && apparatus.length === 0 && logs.length === 0 ? (
        <GlassCard className="p-4 text-center" enter={false}>
          <p className="text-sm font-semibold text-stone-900">
            Welcome to LabVault
          </p>
          <p className="mt-1 text-xs text-stone-700">
            Your inventory is empty. Tap "Add Chemical" or "Add Apparatus" above to get started.
          </p>
        </GlassCard>
      ) : (
        <button
          onClick={async () => {
            if (confirm("Clear ALL inventory data? This removes every chemical, apparatus, and log. This cannot be undone.")) {
              await clearAllData();
              await refreshChemicals();
              await refreshApparatus();
              await refreshLogs();
              toast("All inventory data cleared");
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear all inventory data
        </button>
      )}

      {/* Global search overlay */}
      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        chemicals={chemicals}
        apparatus={apparatus}
        onSelectChemical={() => {
          setSearchOpen(false);
          onNavigate("chemicals");
        }}
        onSelectApparatus={() => {
          setSearchOpen(false);
          onNavigate("apparatus");
        }}
      />
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <GlassCard
      interactive
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-200">
        {icon}
      </div>
      <span className="text-center text-xs font-semibold text-stone-700">
        {label}
      </span>
    </GlassCard>
  );
}
