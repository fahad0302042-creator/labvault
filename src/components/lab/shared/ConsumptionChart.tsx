"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type ConsumptionChartProps = {
  /** Array of 7 daily totals (oldest → newest) */
  data: { date: string; consumed: number; restocked: number }[];
  className?: string;
};

/**
 * Compact 7-day consumption bar chart.
 * Shows consumed (downward, amber) vs restocked (upward, green) per day.
 * Pure SVG + framer-motion for the animated bars.
 */
export function ConsumptionChart({ data, className }: ConsumptionChartProps) {
  const maxVal = useMemo(
    () => Math.max(...data.flatMap((d) => [d.consumed, d.restocked]), 1),
    [data],
  );

  const chartHeight = 120;
  const barWidth = 24;
  const gap = 12;
  const totalWidth = data.length * (barWidth + gap) - gap;
  const centerLine = chartHeight / 2;

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-graphite">7-Day Activity</h3>
          <p className="text-xs text-slate-500">Consumed vs restocked</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-500">Used</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Added</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <svg
          width={totalWidth + 40}
          height={chartHeight + 30}
          viewBox={`0 0 ${totalWidth + 40} ${chartHeight + 30}`}
          className="mx-auto"
        >
          {/* Center line */}
          <line
            x1={20}
            y1={centerLine}
            x2={totalWidth + 20}
            y2={centerLine}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-slate-300"
          />

          {data.map((day, i) => {
            const x = 20 + i * (barWidth + gap) + barWidth / 2;
            const consumedH = (day.consumed / maxVal) * (chartHeight / 2 - 8);
            const restockedH = (day.restocked / maxVal) * (chartHeight / 2 - 8);

            return (
              <g key={i}>
                {/* Restocked bar (upward from center) */}
                <motion.rect
                  x={x - barWidth / 2 + 2}
                  y={centerLine - restockedH}
                  width={barWidth / 2 - 2}
                  height={restockedH}
                  rx={2}
                  fill="rgb(16 185 129)"
                  initial={{ height: 0, y: centerLine }}
                  animate={{ height: restockedH, y: centerLine - restockedH }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
                {/* Consumed bar (downward from center) */}
                <motion.rect
                  x={x}
                  y={centerLine}
                  width={barWidth / 2 - 2}
                  height={consumedH}
                  rx={2}
                  fill="rgb(245 158 11)"
                  initial={{ height: 0 }}
                  animate={{ height: consumedH }}
                  transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }}
                />
                {/* Day label */}
                <text
                  x={x}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-semibold"
                >
                  {day.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
