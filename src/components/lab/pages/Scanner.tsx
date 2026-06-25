"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ScanLine,
  Search,
  PackageMinus,
  PackagePlus,
  Eye,
  Printer,
  Camera,
  X,
  CheckCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { findByQr } from "@/lib/lab/storage";
import type { Chemical, Apparatus } from "@/lib/lab/types";
import { GlassCard } from "@/components/lab/shared/GlassCard";
import { Badge } from "@/components/lab/shared/Badge";
import { StockBar } from "@/components/lab/shared/StockBar";
import { QrPrintSheet } from "@/components/lab/qr/QrPrintSheet";

type ScanResult =
  | { type: "chemical"; item: Chemical }
  | { type: "apparatus"; item: Apparatus }
  | null;

type Mode = "idle" | "scanning" | "found" | "notFound" | "manual";

type ScannerProps = {
  scanSignal?: number;
  onScanSignalConsumed?: () => void;
};

export function Scanner({ scanSignal, onScanSignalConsumed }: ScannerProps) {
  const { chemicals, consume, restock } = useChemicals();
  const { apparatus, logBreakage, restock: restockApparatus } = useApparatus();

  const [mode, setMode] = useState<Mode>("idle");
  const [result, setResult] = useState<ScanResult>(null);
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(false);

  // Allow dashboard quick-action to trigger a scan
  if (scanSignal && mode !== "scanning") {
    setMode("scanning");
    onScanSignalConsumed?.();
  }

  const allItems = useMemo(() => {
    return [
      ...chemicals.map((c) => ({ type: "chemical" as const, item: c })),
      ...apparatus.map((a) => ({ type: "apparatus" as const, item: a })),
    ];
  }, [chemicals, apparatus]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(({ item }) =>
      item.name.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  function startScan() {
    setMode("scanning");
    setResult(null);
    // Simulate camera scan: after 2.5s, "find" a random item
    setTimeout(() => {
      if (allItems.length === 0) {
        setMode("notFound");
        return;
      }
      // Try to find by random QR (works because we're using mock storage)
      const pick = allItems[Math.floor(Math.random() * allItems.length)];
      const found = findByQr(pick.item.qr_code);
      if (found) {
        setResult(found);
        setMode("found");
      } else {
        setMode("notFound");
      }
    }, 2500);
  }

  function cancelScan() {
    setMode("idle");
    setResult(null);
  }

  function handleConsume() {
    if (!result) return;
    if (result.type === "chemical") {
      consume(result.item.id, 10, "Consumed via QR scan");
    } else {
      logBreakage(result.item.id, "Logged via QR scan");
    }
    flashTick();
    setTimeout(() => cancelScan(), 900);
  }

  function handleRestock() {
    if (!result) return;
    if (result.type === "chemical") {
      restock(result.item.id, 50, "Restocked via QR scan");
    } else {
      restockApparatus(result.item.id, 1, "Restocked via QR scan");
    }
    flashTick();
    setTimeout(() => cancelScan(), 900);
  }

  function flashTick() {
    setTick(true);
    setTimeout(() => setTick(false), 900);
  }

  function handleManualSelect(
    sel: { type: "chemical"; item: Chemical } | { type: "apparatus"; item: Apparatus },
  ) {
    setResult(sel);
    setMode("found");
    setSearch("");
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scanner</h1>
          <p className="text-sm text-slate-500">
            Scan an item's QR to log activity
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md">
          <ScanLine className="h-5 w-5" />
        </div>
      </header>

      {/* Camera viewport */}
      <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-3xl border border-white/80 bg-slate-900 shadow-lg">
        {/* Mock camera background — animated gradient simulating low-light camera feed */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
        <div className="blob-1 absolute -top-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-2xl" />
        <div className="blob-2 absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5 blur-2xl" />

        {/* Center frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          {mode === "scanning" ? (
            <div className="relative">
              {/* Pulse rings */}
              <div className="qr-pulse-ring absolute inset-0 rounded-3xl border-2 border-white/70" />
              <div
                className="qr-pulse-ring absolute inset-0 rounded-3xl border-2 border-white/70"
                style={{ animationDelay: "0.6s" }}
              />
              {/* Viewfinder */}
              <div className="relative h-48 w-48 rounded-3xl border-2 border-white/50">
                {/* Corner brackets */}
                <CornerBrackets />
                {/* Moving scan line */}
                <motion.div
                  className="absolute inset-x-2 h-0.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]"
                  initial={{ top: "10%" }}
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          ) : mode === "found" && result ? (
            <ScanResultCard result={result} tick={tick} />
          ) : mode === "notFound" ? (
            <div className="px-6 text-center text-white">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-300">
                <X className="h-7 w-7" />
              </div>
              <p className="font-bold">No item found</p>
              <p className="mt-1 text-sm text-slate-400">
                That QR code isn't registered. Try another or add it manually.
              </p>
              <button
                onClick={cancelScan}
                className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="px-6 text-center text-white">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
                <Camera className="h-7 w-7" />
              </div>
              <p className="font-bold">Point your camera at a QR</p>
              <p className="mt-1 text-sm text-slate-400">
                Or browse all items below to find it manually.
              </p>
            </div>
          )}
        </div>

        {/* Cancel button while scanning */}
        {mode === "scanning" && (
          <button
            onClick={cancelScan}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            aria-label="Cancel scan"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Big scan button at bottom of viewport */}
        {mode !== "scanning" && mode !== "found" && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <button
              onClick={startScan}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/40 transition-all hover:bg-slate-800 active:scale-95"
            >
              <ScanLine className="h-5 w-5" />
              Start scanning
            </button>
          </div>
        )}
      </div>

      {/* Result actions (below viewport) */}
      <AnimatePresence>
        {mode === "found" && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mb-5 grid grid-cols-3 gap-2"
          >
            <ResultAction
              tone="amber"
              icon={<PackageMinus className="h-5 w-5" />}
              label={result.type === "chemical" ? "Consume" : "Breakage"}
              onClick={handleConsume}
            />
            <ResultAction
              tone="green"
              icon={<PackagePlus className="h-5 w-5" />}
              label="Restock"
              onClick={handleRestock}
            />
            <ResultAction
              tone="slate"
              icon={<Eye className="h-5 w-5" />}
              label="Dismiss"
              onClick={cancelScan}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual lookup */}
      {mode !== "scanning" && mode !== "found" && (
        <div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Or search by name…"
              className="w-full rounded-xl border border-white/80 bg-white/70 py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none backdrop-blur focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {search.trim() && (
            <ul className="space-y-2">
              {filtered.length === 0 ? (
                <li className="rounded-xl bg-white/60 p-4 text-center text-sm text-slate-500 backdrop-blur">
                  No matches.
                </li>
              ) : (
                filtered.slice(0, 8).map(({ type, item }) => (
                  <li key={`${type}-${item.id}`}>
                    <button
                      onClick={() =>
                        handleManualSelect({ type, item })
                      }
                      className="flex w-full items-center gap-3 rounded-xl border border-white/80 bg-white/70 p-3 text-left backdrop-blur transition-colors hover:bg-white/90"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700`}
                      >
                        {type === "chemical" ? (
                          <PackageMinus className="h-4 w-4" />
                        ) : (
                          <PackagePlus className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {type === "chemical"
                            ? `${(item as Chemical).quantity} ${(item as Chemical).unit}`
                            : `${(item as Apparatus).quantity} units`}
                        </p>
                      </div>
                      <Badge tone={type === "chemical" ? "teal" : "violet"}>
                        {type}
                      </Badge>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {/* Print sheet trigger */}
      <GlassCard
        interactive
        onClick={() => window.print()}
        className="mt-5 flex items-center gap-3 p-4"
        enter={false}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Printer className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">Print QR labels</p>
          <p className="text-xs text-slate-500">
            All {chemicals.length + apparatus.length} items on one A4 sheet
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-900">Print</span>
      </GlassCard>

      {/* Hidden print sheet */}
      <QrPrintSheet chemicals={chemicals} apparatus={apparatus} />
    </div>
  );
}

function CornerBrackets() {
  const corner = "absolute h-6 w-6 border-white/70";
  return (
    <>
      <span className={`${corner} -top-1 -left-1 rounded-tl-2xl border-l-2 border-t-2`} />
      <span className={`${corner} -top-1 -right-1 rounded-tr-2xl border-r-2 border-t-2`} />
      <span className={`${corner} -bottom-1 -left-1 rounded-bl-2xl border-l-2 border-b-2`} />
      <span className={`${corner} -bottom-1 -right-1 rounded-br-2xl border-r-2 border-b-2`} />
    </>
  );
}

function ScanResultCard({
  result,
  tick,
}: {
  result: NonNullable<ScanResult>;
  tick: boolean;
}) {
  const isChemical = result.type === "chemical";
  const item = result.item;
  const quantity = isChemical
    ? (item as Chemical).quantity
    : (item as Apparatus).quantity;
  const initialQuantity = isChemical
    ? (item as Chemical).initialQuantity
    : (item as Apparatus).initialQuantity;
  const unit = isChemical ? (item as Chemical).unit : "units";

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="relative w-72 rounded-2xl bg-white/95 p-5 shadow-2xl backdrop-blur"
    >
      {tick && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
        >
          <CheckCircle2 className="h-5 w-5" />
        </motion.div>
      )}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
            isChemical
              ? "bg-slate-100 text-slate-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {isChemical ? "🧪" : "⚗️"}
        </span>
        <Badge tone={isChemical ? "slate" : "slate"}>{result.type}</Badge>
      </div>
      <h3 className="mt-2 text-lg font-bold text-slate-900">{item.name}</h3>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Stock</span>
          <span className="font-bold tabular-nums text-slate-900">
            {quantity} / {initialQuantity} {unit}
          </span>
        </div>
        <StockBar
          value={quantity}
          max={initialQuantity}
          className="mt-1.5"
        />
      </div>
    </motion.div>
  );
}

function ResultAction({
  tone,
  icon,
  label,
  onClick,
}: {
  tone: "amber" | "green" | "slate";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const toneClasses = {
    amber: "bg-amber-500 shadow-amber-500/30 hover:bg-amber-400",
    green: "bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400",
    slate: "bg-slate-700 shadow-slate-700/30 hover:bg-slate-600",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-2xl py-3.5 text-white shadow-lg transition-all active:scale-95 ${toneClasses}`}
    >
      {icon}
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
