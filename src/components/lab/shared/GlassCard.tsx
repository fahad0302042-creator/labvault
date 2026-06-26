"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlassCardProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  /** Animate in on mount (fade + slide up). Default: true */
  enter?: boolean;
  /** Index for staggered enter animations. Default: 0 */
  index?: number;
  /** Hover lift effect — enable for tappable cards. Default: false */
  interactive?: boolean;
};

/**
 * Clean white card with subtle border.
 * Solid background for maximum text readability.
 * Optionally fades + slides up on mount.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { children, className, enter = true, index = 0, interactive = false, ...rest },
    ref
  ) {
    const motionProps = enter
      ? {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.4,
            delay: Math.min(index * 0.04, 0.4),
            ease: [0.22, 1, 0.36, 1] as const,
          },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl border border-slate-200 bg-slate-50 shadow-sm",
          interactive &&
            "transition-all hover:border-slate-300 hover:shadow-md cursor-pointer",
          className
        )}
        {...motionProps}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);
