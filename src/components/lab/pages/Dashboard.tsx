"use client";

import { motion } from "framer-motion";
import {
  FlaskConical,
  Beaker,
  AlertTriangle,
  TrendingDown,
  Plus,
  ScanLine,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { useLogs } from "@/hooks/lab/useLogs";
import { GlassCard } from "@/components/lab/shared/GlassCard";
import { Badge } from "@/components/lab/shared/Badge";
import {
  formatHeaderDate,
  formatRelative,
  greeting,
  type LogAction,
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

function KpiCard({
  index,
  icon,
  label,
  value,
  sub,
  tone,
  onClick,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone: "teal" | "amber" | "red" | "violet";
  onClick?: () => void;
}) {
  const toneClasses = {
    teal: "from-sky-400 to-cyan-500 shadow-[0_8px_20px_-6px_rgba(14,165,233,0.4)]",
    amber: "from-amber-400 to-orange-500 shadow-[0_8px_20px_-6px_rgba(245,158,11,0.4)]",
    red: "from-rose-400 to-red-500 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.4)]",
    violet: "from-violet-400 to-purple-500 shadow-[0_8px_20px_-6px_rgba(139,92,246,0.4)]",
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
        {onClick && (
          <ChevronRight className="h-4 w-4 text-slate-300" />
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tabular-nums text-slate-900">
          {value}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
        {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
      </div>
    </GlassCard>
  );
}

export function Dashboard({ onNavigate, onQuickAdd, onQuickScan }: DashboardProps) {
  const { user } = useAuth();
  const { chemicals } = useChemicals();
  const { apparatus } = useApparatus();
  const { logs } = useLogs();

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

  const recentLogs = logs.slice(0, 10);

  return (
    <div className="space-y-5 px-4 pt-6 pb-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {formatHeaderDate()}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {greeting()}, {user?.name?.split(" ")[0] ?? "Researcher"}
          </h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-sm font-bold text-sky-600 shadow-sm ring-1 ring-white/80 backdrop-blur">
          {user?.name?.charAt(0) ?? "R"}
        </div>
      </motion.header>

      {/* KPI grid */}
      <section
        aria-label="Key metrics"
        className="grid grid-cols-2 gap-3"
      >
        <KpiCard
          index={0}
          tone="teal"
          icon={<FlaskConical className="h-5 w-5" />}
          label="Chemicals"
          value={stats.totalChemicals}
          sub="In inventory"
          onClick={() => onNavigate("chemicals")}
        />
        <KpiCard
          index={1}
          tone="violet"
          icon={<Beaker className="h-5 w-5" />}
          label="Apparatus"
          value={stats.totalApparatus}
          sub="Tracked items"
          onClick={() => onNavigate("apparatus")}
        />
        <KpiCard
          index={2}
          tone="amber"
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Low Stock"
          value={stats.lowStock}
          sub="Below 20% remaining"
          onClick={() => onNavigate("chemicals")}
        />
        <KpiCard
          index={3}
          tone="red"
          icon={<TrendingDown className="h-5 w-5" />}
          label="This Week"
          value={stats.weeklyConsumption}
          sub="Units consumed/broken"
          onClick={() => onNavigate("reports")}
        />
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
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Recent Activity
          </h2>
          <button
            onClick={() => onNavigate("reports")}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            View all
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <GlassCard className="p-6 text-center" index={4}>
            <p className="text-sm text-slate-500">
              No activity yet. Add or consume something to see it here.
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="divide-y divide-slate-200/60" index={4}>
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
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {log.item_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {log.logged_by_name} · {formatRelative(log.logged_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {log.quantity > 0 && (
                      <span className="text-xs tabular-nums text-slate-500">
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
            className="flex items-center gap-3 border-amber-200/60 bg-amber-50/60 p-4"
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
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-colors group-hover:bg-sky-200">
        {icon}
      </div>
      <span className="text-center text-xs font-semibold text-slate-700">
        {label}
      </span>
    </GlassCard>
  );
}
