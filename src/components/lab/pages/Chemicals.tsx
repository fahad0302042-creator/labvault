"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  Search,
  FlaskConical,
  PackageMinus,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { GlassCard } from "@/components/lab/shared/GlassCard";
import { StockBar } from "@/components/lab/shared/StockBar";
import { Badge } from "@/components/lab/shared/Badge";
import { FAB } from "@/components/lab/shared/FAB";
import { ChemicalDetail } from "./ChemicalDetail";
import { AddChemicalModal } from "./AddChemicalModal";
import type { Chemical } from "@/lib/lab/types";

type ChemicalsProps = {
  /** Internal: open the add modal automatically (e.g. from dashboard quick action) */
  addSignal?: number;
  onAddSignalConsumed?: () => void;
};

export function Chemicals({ addSignal, onAddSignalConsumed }: ChemicalsProps) {
  const { chemicals, consume, restock, update, remove, add } = useChemicals();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "critical">("all");
  const [selected, setSelected] = useState<Chemical | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // Allow dashboard quick-action to open the add modal
  if (addSignal && !addOpen) {
    setAddOpen(true);
    onAddSignalConsumed?.();
  }

  const filtered = useMemo(() => {
    let list = chemicals;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.formula ?? "").toLowerCase().includes(q),
      );
    }
    if (filter !== "all") {
      list = list.filter((c) => {
        const pct = c.initialQuantity > 0 ? c.quantity / c.initialQuantity : 0;
        return filter === "low" ? pct < 0.5 : pct < 0.2;
      });
    }
    return list;
  }, [chemicals, search, filter]);

  // Keep selected chemical in sync after mutations so detail view stays live
  const liveSelected = selected
    ? chemicals.find((c) => c.id === selected.id) ?? null
    : null;

  function handleDragEnd(id: string, info: PanInfo) {
    if (info.offset.x < -80) {
      setSwipedId(id);
    } else {
      setSwipedId(null);
    }
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Chemicals</h1>
          <p className="text-sm text-slate-700">
            {chemicals.length} item{chemicals.length === 1 ? "" : "s"} in inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-graphite text-white shadow-md sm:hidden">
            <FlaskConical className="h-5 w-5" />
          </div>
          {/* Desktop Add button */}
          <button
            onClick={() => setAddOpen(true)}
            className="hidden items-center gap-2 rounded-xl bg-graphite px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-graphite/90 sm:flex"
          >
            <Plus className="h-4 w-4" />
            Add Chemical
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or formula…"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-graphite placeholder:text-slate-600 outline-none transition-all focus:border-graphite focus:ring-2 focus:ring-slate-100"
        />
      </div>

      {/* Filter pills */}
      <div className="mb-4 flex gap-2">
        {(["all", "low", "critical"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-graphite text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All" : f === "low" ? "Low (<50%)" : "Critical (<20%)"}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="h-8 w-8" />}
          title={
            chemicals.length === 0
              ? "No chemicals yet"
              : "No matches"
          }
          sub={
            chemicals.length === 0
              ? "Tap the + button to add your first chemical."
              : "Try a different search or filter."
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {filtered.map((c, i) => {
              const pct =
                c.initialQuantity > 0
                  ? (c.quantity / c.initialQuantity) * 100
                  : 0;
              const isCritical = pct < 20;
              const isLow = pct < 50;
              return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(i * 0.03, 0.3),
                  }}
                >
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* Swipe action (revealed underneath) */}
                    <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-end gap-1 bg-amber-500 pr-4 text-white">
                      <PackageMinus className="h-5 w-5" />
                      <span className="text-xs font-semibold">Consume</span>
                    </div>

                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(_, info) => handleDragEnd(c.id, info)}
                      onClick={() => {
                        if (swipedId === c.id) {
                          setSwipedId(null);
                          return;
                        }
                        setSelected(c);
                      }}
                      animate={{
                        x: swipedId === c.id ? -96 : 0,
                      }}
                      whileDrag={{ scale: 0.99 }}
                      className="relative"
                    >
                      <GlassCard
                        interactive
                        enter={false}
                        className="border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-base font-bold text-graphite">
                                {c.name}
                              </h3>
                              {isCritical && (
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                              )}
                            </div>
                            {c.formula && (
                              <p className="font-mono text-xs text-slate-700">
                                {c.formula}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold tabular-nums text-graphite">
                              {c.quantity}
                              <span className="ml-0.5 text-xs font-normal text-slate-700">
                                {c.unit}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-600">
                              of {c.initialQuantity} {c.unit}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <StockBar
                            value={c.quantity}
                            max={c.initialQuantity}
                            className="flex-1"
                          />
                          <Badge
                            tone={isCritical ? "red" : isLow ? "amber" : "green"}
                            dot
                          >
                            {Math.round(pct)}%
                          </Badge>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {/* Quick consume confirm */}
      <AnimatePresence>
        {swipedId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 z-30 mx-auto max-w-md"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)" }}
          >
            <div className="flex items-center gap-2 rounded-2xl bg-graphite px-4 py-3 text-white shadow-2xl">
              <span className="flex-1 text-sm">Quick consume 10 units?</span>
              <button
                onClick={() => setSwipedId(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = filtered.find((c) => c.id === swipedId);
                  if (target) consume(target.id, 10, "Quick consume via swipe");
                  setSwipedId(null);
                }}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-400"
              >
                Consume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FAB onClick={() => setAddOpen(true)} label="Add chemical" />

      <ChemicalDetail
        chemical={liveSelected}
        open={!!liveSelected}
        onClose={() => setSelected(null)}
        onConsume={consume}
        onRestock={restock}
        onUpdate={update}
        onDelete={remove}
      />

      <AddChemicalModal
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
    <GlassCard className="flex flex-col items-center gap-3 p-10 text-center" enter={false}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div>
        <p className="font-bold text-slate-700">{title}</p>
        <p className="mt-0.5 text-sm text-slate-700">{sub}</p>
      </div>
    </GlassCard>
  );
}
