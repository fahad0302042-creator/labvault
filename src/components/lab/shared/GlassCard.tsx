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
 * Frosted-glass card.
 *   backdrop-blur-xl · bg-white/60 · border-white/80 · soft shadow
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
          "rounded-2xl border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_2px_12px_-2px_rgba(15,23,42,0.08),0_8px_24px_-8px_rgba(15,23,42,0.06)]",
          interactive &&
            "transition-shadow hover:shadow-[0_4px_16px_-2px_rgba(15,23,42,0.12),0_12px_32px_-8px_rgba(42,37,32,0.12)] cursor-pointer",
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
