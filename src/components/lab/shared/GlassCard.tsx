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
 * Filled subtle card — warm light fill, no border, minimal shadow.
 * Sits on the cream background with soft separation.
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
          "rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/60",
          interactive &&
            "transition-all hover:shadow-md hover:ring-stone-300 cursor-pointer",
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
