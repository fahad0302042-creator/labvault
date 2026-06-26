"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, Beaker, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { GlassCard } from "@/components/lab/shared/GlassCard";
import { StockBar } from "@/components/lab/shared/StockBar";
import { FAB } from "@/components/lab/shared/FAB";
import { ApparatusDetail } from "./ApparatusDetail";
import { AddApparatusModal } from "./AddApparatusModal";
import type {
  Apparatus,
  ApparatusCategory,
} from "@/lib/lab/types";

const CATEGORY_LABEL: Record<ApparatusCategory, string> = {
  glassware: "Glassware",
  balances: "Balances",
  heating: "Heating",
  measurement: "Measurement",
  other: "Other",
};

type ApparatusPageProps = {
  addSignal?: number;
  onAddSignalConsumed?: () => void;
};

export function ApparatusPage({
  addSignal,
  onAddSignalConsumed,
}: ApparatusPageProps) {
  const { apparatus, logBreakage, restock, update, remove, add } = useApparatus();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ApparatusCategory | "all">("all");
  const [selected, setSelected] = useState<Apparatus | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  if (addSignal && !addOpen) {
    setAddOpen(true);
    onAddSignalConsumed?.();
  }

  const filtered = useMemo(() => {
    let list = apparatus;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q),
      );
    }
    if (filter !== "all") {
      list = list.filter((a) => a.category === filter);
    }
    return list;
  }, [apparatus, search, filter]);

  const liveSelected = selected
    ? apparatus.find((a) => a.id === selected.id) ?? null
    : null;

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Apparatus</h1>
          <p className="text-sm text-stone-700">
            {apparatus.length} item{apparatus.length === 1 ? "" : "s"} tracked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-md sm:hidden">
            <Beaker className="h-5 w-5" />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="hidden items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-500 sm:flex"
          >
            <Plus className="h-4 w-4" />
            Add Apparatus
          </button>
        </div>
      </header>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category…"
          className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-600 outline-none transition-all focus:border-graphite focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {/* Category filter */}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", ...Object.keys(CATEGORY_LABEL)] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as ApparatusCategory | "all")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-stone-800 ring-1 ring-inset ring-stone-200 hover:bg-stone-100"
            }`}
          >
            {f === "all" ? "All" : CATEGORY_LABEL[f as ApparatusCategory]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Beaker className="h-8 w-8" />}
          title={apparatus.length === 0 ? "No apparatus yet" : "No matches"}
          sub={
            apparatus.length === 0
              ? "Tap the + button to add your first item."
              : "Try a different search or category."
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {filtered.map((a, i) => {
              const pct =
                a.initialQuantity > 0
                  ? (a.quantity / a.initialQuantity) * 100
                  : 0;
              return (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(i * 0.03, 0.3),
                  }}
                >
                  <GlassCard
                    interactive
                    index={i}
                    onClick={() => setSelected(a)}
                    className="border-stone-200 bg-stone-100 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-stone-900">
                          {a.name}
                        </h3>
                        <p className="text-xs text-stone-700">
                          {CATEGORY_LABEL[a.category]}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <StockBar
                        value={a.quantity}
                        max={a.initialQuantity}
                        className="flex-1"
                      />
                      <span className="text-sm font-bold tabular-nums text-stone-900">
                        {a.quantity}
                        <span className="ml-1 text-xs font-normal text-stone-600">
                          / {a.initialQuantity}
                        </span>
                      </span>
                    </div>
                  </GlassCard>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <FAB onClick={() => setAddOpen(true)} label="Add apparatus" />

      <ApparatusDetail
        apparatus={liveSelected}
        open={!!liveSelected}
        onClose={() => setSelected(null)}
        onLogBreakage={logBreakage}
        onRestock={restock}
        onUpdate={update}
        onDelete={remove}
      />

      <AddApparatusModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={add}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <GlassCard
      className="flex flex-col items-center gap-3 p-10 text-center"
      enter={false}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
        {icon}
      </div>
      <div>
        <p className="font-bold text-stone-700">{title}</p>
        <p className="mt-0.5 text-sm text-stone-700">{sub}</p>
      </div>
    </GlassCard>
  );
}
