"use client";

import { memo } from "react";

/**
 * Subtle lab doodles: 4 Erlenmeyer flasks with rising bubbles,
 * drifting slowly across the background. Pure SVG, no images.
 *
 * Rendered at ~5% opacity in graphite grey. Sits BEHIND the blobs
 * (which are -z-10) at -z-20, so it never blocks interaction.
 *
 * Bubbles are pure CSS animations (keyframes in globals.css),
 * one per flask with staggered delays for an organic feel.
 */
function LabDoodlesComponent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      {/* 4 flasks, scattered, each with a unique drift animation */}
      <FlaskDoodle
        className="flask-drift-a absolute left-[8%] top-[12%] h-32 w-20 text-slate-900/5"
        bubbleCount={3}
      />
      <FlaskDoodle
        className="flask-drift-b absolute right-[12%] top-[18%] h-40 w-24 text-slate-900/5"
        bubbleCount={4}
        variant="b"
      />
      <FlaskDoodle
        className="flask-drift-c absolute left-[20%] bottom-[14%] h-36 w-24 text-slate-900/5"
        bubbleCount={3}
        variant="c"
      />
      <FlaskDoodle
        className="flask-drift-d absolute right-[16%] bottom-[20%] h-28 w-20 text-slate-900/5"
        bubbleCount={2}
        variant="d"
      />
    </div>
  );
}

/**
 * Single Erlenmeyer flask SVG with rising bubbles inside.
 * `variant` swaps bubble timing slightly for variety.
 */
function FlaskDoodle({
  className,
  bubbleCount = 3,
  variant = "a",
}: {
  className: string;
  bubbleCount?: number;
  variant?: "a" | "b" | "c" | "d";
}) {
  // Bubble delay offsets per variant — keeps them out of sync
  const delays = {
    a: [0, 1.2, 2.4, 0.6],
    b: [0.4, 1.6, 2.8, 0.9],
    c: [0.2, 1.4, 2.6, 0.7],
    d: [0.5, 1.7, 2.9, 1.0],
  }[variant];

  return (
    <svg
      viewBox="0 0 80 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Flask outline — Erlenmeyer shape */}
      {/* Neck */}
      <path d="M 30 8 L 30 38" />
      {/* Rim */}
      <path d="M 26 8 L 34 8" />
      {/* Body — narrows from neck, flares out to base */}
      <path d="M 30 38 L 18 88 Q 16 100 24 104 L 56 104 Q 64 100 62 88 L 50 38" />
      {/* Liquid surface line */}
      <path d="M 22 70 Q 40 76 58 70" opacity="0.6" />

      {/* Bubbles rising inside the flask */}
      {Array.from({ length: bubbleCount }).map((_, i) => (
        <circle
          key={i}
          cx={32 + i * 8}
          cy={88}
          r={1.8 + (i % 2) * 0.6}
          fill="currentColor"
          stroke="none"
          style={{
            animation: "bubble-rise 3.2s ease-in infinite",
            animationDelay: `${delays[i] ?? 0}s`,
            transformOrigin: "center",
          }}
        />
      ))}
    </svg>
  );
}

export const LabDoodles = memo(LabDoodlesComponent);
