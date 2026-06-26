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
  CameraOff,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChemicals } from "@/hooks/lab/useChemicals";
import { useApparatus } from "@/hooks/lab/useApparatus";
import { useRecentlyScanned } from "@/hooks/lab/useRecentlyScanned";
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
  onOpenChemicalDetail?: (id: string) => void;
  onOpenApparatusDetail?: (id: string) => void;
};

export function Scanner({
  scanSignal,
  onScanSignalConsumed,
  onOpenChemicalDetail,
  onOpenApparatusDetail,
}: ScannerProps) {
  const { chemicals } = useChemicals();
  const { apparatus } = useApparatus();
  const { recent, addScan } = useRecentlyScanned();

  const [mode, setMode] = useState<Mode>("idle");
  const [result, setResult] = useState<ScanResult>(null);
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const scannerDivId = "qr-reader-element";

  // Cleanup camera on unmount or when leaving scanning mode
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (mode !== "scanning") {
      stopCamera();
    }
  }, [mode]);

  function stopCamera() {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  }

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

  async function startScan() {
    setMode("scanning");
    setResult(null);
    setCameraError(null);

    // Check if chemicals exist
    if (chemicals.length === 0) {
      setMode("notFound");
      return;
    }

    // Check if camera API is available
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported on this device. Use manual search below.");
      setMode("idle");
      return;
    }

    // Dynamically import html5-qrcode (only loads when scanning)
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Wait for the DOM element to exist
      await new Promise((r) => setTimeout(r, 200));

      // Verify the element exists
      const el = document.getElementById(scannerDivId);
      if (!el) {
        throw new Error("Scanner element not found");
      }

      const html5QrCode = new Html5Qrcode(scannerDivId, {
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const qrCodeSuccessCallback = async (decodedText: string) => {
        // Found a QR code — look it up in the database
        stopCamera();
        const found = await findByQr(decodedText);
        if (found) {
          setResult(found);
          setMode("found");
          addScan({ id: found.item.id, type: found.type, name: found.item.name });
        } else {
          setMode("notFound");
        }
      };

      // Use a function for qrbox so it adapts to screen size (min of 60% of width/height, capped)
      const config = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.7);
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        () => {
          // Ignore individual scan errors (they fire frequently)
        },
      );
    } catch (err: any) {
      console.error("Camera start error:", err);
      stopCamera();
      const msg = err?.message || String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed") || msg.includes("denied")) {
        setCameraError("Camera permission denied. Allow camera access in your browser settings and try again.");
      } else if (msg.includes("NotFound") || msg.includes("NotReadable") || msg.includes("device")) {
        setCameraError("No camera found on this device. Use manual search below.");
      } else if (msg.includes("element")) {
        setCameraError("Scanner failed to initialize. Try refreshing the page.");
      } else {
        setCameraError("Camera couldn't start. Make sure you're on HTTPS and have granted camera permission.");
      }
      setMode("idle");
    }
  }

  function cancelScan() {
    setMode("idle");
    setResult(null);
  }

  function handleConsume() {
    if (!result) return;
    // Don't auto-consume a fixed amount — open the detail modal so the user
    // can enter the exact amount, date, and note.
    if (result.type === "chemical") {
      onOpenChemicalDetail?.(result.item.id);
    } else {
      onOpenApparatusDetail?.(result.item.id);
    }
    cancelScan();
  }

  function handleRestock() {
    if (!result) return;
    // Same — open detail modal for the user to enter amount.
    if (result.type === "chemical") {
      onOpenChemicalDetail?.(result.item.id);
    } else {
      onOpenApparatusDetail?.(result.item.id);
    }
    cancelScan();
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
    addScan({ id: sel.item.id, type: sel.type, name: sel.item.name });
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-graphite">Scanner</h1>
          <p className="text-sm text-slate-700">
            Scan an item's QR to log activity
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-graphite text-white shadow-md">
          <ScanLine className="h-5 w-5" />
        </div>
      </header>

      {/* Camera viewport */}
      <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-3xl border border-slate-100 bg-graphite shadow-lg">
        {/* Mock camera background — animated gradient simulating low-light camera feed */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
        <div className="blob-1 absolute -top-20 -left-20 h-60 w-60 rounded-full bg-white/5 blur-2xl" />
        <div className="blob-2 absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5 blur-2xl" />

        {/* Center frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          {mode === "scanning" ? (
            <div className="relative">
              {/* Hidden div where html5-qrcode renders the camera feed */}
              <div id={scannerDivId} className="overflow-hidden rounded-3xl" />

              {/* Pulse rings + viewfinder (shown as overlay on top of camera, or standalone if camera hasn't started) */}
              <div className="qr-pulse-ring absolute inset-0 rounded-3xl border-2 border-white/70 pointer-events-none" />
              <div
                className="qr-pulse-ring absolute inset-0 rounded-3xl border-2 border-white/70 pointer-events-none"
                style={{ animationDelay: "0.6s" }}
              />
              {/* Viewfinder overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48 rounded-3xl border-2 border-white/50">
                  <CornerBrackets />
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
              {/* Loading hint */}
              <p className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-white/80">
                Scanning…
              </p>
            </div>
          ) : cameraError ? (
            <div className="px-6 text-center text-white">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                <CameraOff className="h-7 w-7" />
              </div>
              <p className="font-bold">Camera unavailable</p>
              <p className="mt-1 text-sm text-slate-600">{cameraError}</p>
              <button
                onClick={() => setCameraError(null)}
                className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Dismiss
              </button>
            </div>
          ) : mode === "found" && result ? (
            <ScanResultCard result={result} tick={tick} />
          ) : mode === "notFound" ? (
            <div className="px-6 text-center text-white">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-300">
                <X className="h-7 w-7" />
              </div>
              <p className="font-bold">No item found</p>
              <p className="mt-1 text-sm text-slate-600">
                That QR code isn't registered. Try another or add it manually.
              </p>
              <button
                onClick={cancelScan}
                className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
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
              <p className="mt-1 text-sm text-slate-600">
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
              className="flex items-center gap-2 rounded-full bg-graphite px-6 py-3 text-sm font-bold text-white shadow-lg shadow-graphite/20 transition-all hover:bg-graphite/90 active:scale-95"
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

      {/* Recently scanned chips */}
      {mode !== "scanning" && mode !== "found" && recent.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Recently scanned
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {recent.map((r) => {
              const item = r.type === "chemical"
                ? chemicals.find((c) => c.id === r.id)
                : apparatus.find((a) => a.id === r.id);
              if (!item) return null;
              return (
                <button
                  key={r.id}
                  onClick={() =>
                    handleManualSelect({
                      type: r.type,
                      item,
                    } as { type: "chemical"; item: Chemical } | { type: "apparatus"; item: Apparatus })
                  }
                  className="flex shrink-0 items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-xs font-semibold text-graphite shadow-sm backdrop-blur transition-colors hover:bg-white"
                >
                  <span className="text-slate-600">
                    {r.type === "chemical" ? "🧪" : "⚗️"}
                  </span>
                  <span className="max-w-[120px] truncate">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual lookup */}
      {mode !== "scanning" && mode !== "found" && (
        <div>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Or search by name…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-graphite placeholder:text-slate-600 outline-none transition-all focus:border-graphite focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {search.trim() && (
            <ul className="space-y-2">
              {filtered.length === 0 ? (
                <li className="rounded-xl bg-white p-4 text-center text-sm text-slate-700 backdrop-blur">
                  No matches.
                </li>
              ) : (
                filtered.slice(0, 8).map(({ type, item }) => (
                  <li key={`${type}-${item.id}`}>
                    <button
                      onClick={() =>
                        handleManualSelect({ type, item })
                      }
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left backdrop-blur transition-colors hover:bg-white"
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
                        <p className="truncate text-sm font-semibold text-graphite">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-700">
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
          <p className="text-sm font-bold text-graphite">Print chemical QR labels</p>
          <p className="text-xs text-slate-700">
            {chemicals.length} chemical{chemicals.length === 1 ? "" : "s"} · A4 sheet for box stickers
          </p>
        </div>
        <span className="text-xs font-semibold text-graphite">Print</span>
      </GlassCard>

      {/* Hidden print sheet */}
      <QrPrintSheet chemicals={chemicals} />
    </div>
  );
}

function CornerBrackets() {
  const corner = "absolute h-6 w-6 border-slate-100";
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
      <h3 className="mt-2 text-lg font-bold text-graphite">{item.name}</h3>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-700">
          <span>Stock</span>
          <span className="font-bold tabular-nums text-graphite">
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
