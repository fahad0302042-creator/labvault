"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FABProps = {
  onClick: () => void;
  /** Override icon. Default: Plus */
  icon?: ReactNode;
  label?: string;
  className?: string;
};

/**
 * Floating Action Button — fixed to bottom-right above the bottom nav.
 * Always teal, always 56px (thumb-friendly).
 */
export function FAB({ onClick, icon, label = "Add", className }: FABProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "fixed right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-graphite text-white shadow-[0_8px_24px_-4px_rgba(42,37,32,0.45)]",
        "transition-colors hover:bg-graphite/90 active:bg-slate-950",
        "lg:hidden",
        className
      )}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon ?? <Plus className="h-6 w-6" strokeWidth={2.5} />}
    </motion.button>
  );
}
