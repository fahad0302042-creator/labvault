"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FlaskConical,
  Beaker,
  ScanLine,
  FileBarChart2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey =
  | "dashboard"
  | "chemicals"
  | "apparatus"
  | "scanner"
  | "reports";

type Tab = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
};

const TABS: Tab[] = [
  { key: "dashboard",  label: "Home",       icon: LayoutDashboard },
  { key: "chemicals",  label: "Chemicals",  icon: FlaskConical },
  { key: "apparatus",  label: "Apparatus",  icon: Beaker },
  { key: "scanner",    label: "Scan",       icon: ScanLine },
  { key: "reports",    label: "Reports",    icon: FileBarChart2 },
];

type BottomNavProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

/**
 * Fixed bottom navigation — 5 thumb-friendly tabs.
 * Active tab glows teal with a sliding pill indicator.
 */
export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="no-print safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <li key={tab.key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(tab.key)}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                className={cn(
                  "relative flex h-16 w-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors",
                  isActive
                    ? "text-graphite"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute -top-px h-1 w-10 rounded-full bg-graphite"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
