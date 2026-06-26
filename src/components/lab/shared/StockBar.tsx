"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StockBarProps = {
  /** Current quantity */
  value: number;
  /** Reference (max) quantity — defines 100% */
  max: number;
  /** Optional className override */
  className?: string;
  /** Show numeric label inside the bar */
  showLabel?: boolean;
  /** unit suffix, e.g. "g", "mL" */
  unit?: string;
};

/**
 * Stock progress bar with animated fill on render.
 * Colour-coded: green >=50%, amber 20-50%, red <20%.
 */
export function StockBar({
  value,
  max,
  className,
  showLabel = false,
  unit,
}: StockBarProps) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const color =
    pct >= 50
      ? "bg-emerald-500"
      : pct >= 20
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-stone-200/70",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {showLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white tabular-nums">
            {value}
            {unit ? ` ${unit}` : ""} / {max}
            {unit ? ` ${unit}` : ""}
          </span>
        )}
      </motion.div>
    </div>
  );
}
