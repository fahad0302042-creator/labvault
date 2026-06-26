"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FlaskConical,
  Beaker,
  ScanLine,
  FileBarChart2,
  FlaskRound,
  type LucideIcon,
} from "lucide-react";
import type { TabKey } from "./BottomNav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type Tab = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
};

const TABS: Tab[] = [
  { key: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { key: "chemicals",  label: "Chemicals",  icon: FlaskConical },
  { key: "apparatus",  label: "Apparatus",  icon: Beaker },
  { key: "scanner",    label: "Scanner",    icon: ScanLine },
  { key: "reports",    label: "Reports",    icon: FileBarChart2 },
];

type SidebarNavProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

/**
 * Desktop sidebar — visible on lg+ screens.
 * Vertical nav with logo at top, nav items in middle, user at bottom.
 * Hidden on mobile/tablet (bottom nav takes over).
 */
export function SidebarNav({ active, onChange }: SidebarNavProps) {
  const { user } = useAuth();

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-100 bg-white lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-graphite to-graphite/80 text-white shadow-md">
          <FlaskRound className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-base font-bold text-graphite">LabVault</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Lab Inventory
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav aria-label="Primary" className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            const Icon = tab.icon;
            return (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => onChange(tab.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "text-graphite"
                      : "text-slate-500 hover:bg-slate-100 hover:text-graphite"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-slate-100"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn("relative h-5 w-5", isActive && "text-graphite")}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="relative">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User at bottom */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-graphite text-sm font-bold text-white">
            {user?.name?.charAt(0) ?? "R"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-graphite">
              {user?.name ?? "Researcher"}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
