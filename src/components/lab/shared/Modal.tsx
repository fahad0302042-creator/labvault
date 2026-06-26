"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Footer actions area (typically buttons) */
  footer?: ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

/**
 * Bottom-sheet-style modal on mobile, centered on desktop.
 * Frosted backdrop, glass panel.
 *
 * Layout: flexbox column with a STICKY HEADER (close button always visible)
 * and a STICKY FOOTER (action buttons always visible), and a scrollable
 * middle region for the form/content. This way the user can always reach
 * Cancel and Close without scrolling, even on a tall form on a short phone.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-graphite/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl",
              SIZE_CLASSES[size]
            )}
            initial={{ y: "100%", opacity: 0.6, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Drag handle (mobile) */}
            <div className="flex shrink-0 justify-center pt-3 sm:hidden">
              <div className="h-1.5 w-10 rounded-full bg-slate-300" />
            </div>

            {/* Sticky header — close button always visible */}
            {(title || description) && (
              <div className="relative shrink-0 px-6 pt-4 pb-2">
                {title && (
                  <h2 className="pr-10 text-lg font-bold text-graphite">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-0.5 pr-10 text-sm text-slate-500">
                    {description}
                  </p>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* When no title, still render an always-visible close button */}
            {!title && !description && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Scrollable content region */}
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-4">
              {children}
            </div>

            {/* Sticky footer — actions always visible */}
            {footer && (
              <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
