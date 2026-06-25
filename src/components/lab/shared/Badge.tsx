"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "teal" | "green" | "amber" | "red" | "slate" | "violet";

type BadgeProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /** Optional dot indicator */
  dot?: boolean;
};

const TONE_CLASSES: Record<Tone, string> = {
  teal: "bg-sky-100 text-sky-700 ring-sky-200/60",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200/60",
  amber: "bg-amber-100 text-amber-700 ring-amber-200/60",
  red: "bg-red-100 text-red-700 ring-red-200/60",
  slate: "bg-slate-100 text-slate-600 ring-slate-200/60",
  violet: "bg-violet-100 text-violet-700 ring-violet-200/60",
};

const DOT_CLASSES: Record<Tone, string> = {
  teal: "bg-sky-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  slate: "bg-slate-500",
  violet: "bg-violet-500",
};

export function Badge({ children, tone = "slate", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONE_CLASSES[tone],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[tone])} />
      )}
      {children}
    </span>
  );
}
