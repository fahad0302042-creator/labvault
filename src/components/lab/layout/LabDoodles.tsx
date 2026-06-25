"use client";

import { memo } from "react";

/**
 * Static (non-animated) background pattern of tiny chemistry doodles.
 *
 * Renders a tiled SVG with a scatter of small chemistry icons:
 *   - Erlenmeyer flask
 *   - Test tube
 *   - Beaker
 *   - Atom (with orbiting electrons)
 *   - Benzene ring
 *   - Dropper
 *
 * All in graphite at ~5% opacity. No motion. Sits at -z-20, behind
 * the frosted glass cards but above the warm-white body background.
 *
 * The pattern is a single fixed SVG covering the viewport with the
 * icons placed at hand-tuned positions for an organic, non-grid look.
 */
function LabDoodlesComponent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full text-graphite"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.05 }}
      >
        {/* --- Hand-placed doodles, repeated across the canvas --- */}

        {/* 1. Erlenmeyer flask — top left */}
        <g transform="translate(30, 60) rotate(-12 20 40)">
          <path d="M 14 4 L 14 22 L 6 50 Q 4 60 12 62 L 28 62 Q 36 60 34 50 L 26 22 L 26 4" />
          <path d="M 10 4 L 30 4" />
          <path d="M 10 42 Q 20 45 30 42" opacity="0.5" />
        </g>

        {/* 2. Test tube — top right */}
        <g transform="translate(330, 80) rotate(15 10 30)">
          <path d="M 4 4 L 4 50 Q 4 58 10 58 Q 16 58 16 50 L 16 4" />
          <path d="M 2 4 L 18 4" />
          <path d="M 4 40 Q 10 42 16 40" opacity="0.5" />
          <path d="M 4 46 L 16 46" opacity="0.4" />
        </g>

        {/* 3. Atom — middle left */}
        <g transform="translate(40, 280)">
          <circle cx="20" cy="20" r="3" fill="currentColor" stroke="none" />
          <ellipse cx="20" cy="20" rx="18" ry="6" />
          <ellipse cx="20" cy="20" rx="18" ry="6" transform="rotate(60 20 20)" />
          <ellipse cx="20" cy="20" rx="18" ry="6" transform="rotate(-60 20 20)" />
        </g>

        {/* 4. Benzene ring — middle right */}
        <g transform="translate(330, 300)">
          <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" />
          <circle cx="20" cy="20" r="9" opacity="0.4" />
        </g>

        {/* 5. Beaker — bottom left */}
        <g transform="translate(50, 480) rotate(8 18 26)">
          <path d="M 4 6 L 4 46 Q 4 52 10 52 L 26 52 Q 32 52 32 46 L 32 6" />
          <path d="M 2 6 L 34 6" />
          <path d="M 4 4 L 8 2" />
          <path d="M 32 4 L 28 2" />
          <path d="M 4 36 Q 18 39 32 36" opacity="0.5" />
        </g>

        {/* 6. Dropper — bottom right */}
        <g transform="translate(340, 500) rotate(-20 8 30)">
          <path d="M 6 4 L 10 4 L 10 36 Q 10 44 8 44 Q 6 44 6 36 Z" />
          <path d="M 6 8 L 10 8" opacity="0.5" />
          <path d="M 5 44 L 11 44" />
          <path d="M 8 44 L 8 58" />
        </g>

        {/* 7. Small flask — far bottom left */}
        <g transform="translate(20, 700) rotate(-5 14 28)">
          <path d="M 10 4 L 10 18 L 4 38 Q 2 46 8 48 L 20 48 Q 26 46 24 38 L 18 18 L 18 4" />
          <path d="M 8 4 L 20 4" />
          <path d="M 6 32 Q 14 34 22 32" opacity="0.5" />
        </g>

        {/* 8. Molecule (3 connected atoms) — top middle */}
        <g transform="translate(180, 40)">
          <line x1="10" y1="14" x2="24" y2="6" />
          <line x1="24" y1="6" x2="38" y2="14" />
          <circle cx="10" cy="14" r="4" fill="currentColor" stroke="none" />
          <circle cx="24" cy="6" r="4" fill="currentColor" stroke="none" />
          <circle cx="38" cy="14" r="4" fill="currentColor" stroke="none" />
        </g>

        {/* 9. Small test tube — middle */}
        <g transform="translate(190, 220) rotate(45 8 24)">
          <path d="M 4 4 L 4 38 Q 4 44 8 44 Q 12 44 12 38 L 12 4" />
          <path d="M 2 4 L 14 4" />
          <path d="M 4 32 Q 8 34 12 32" opacity="0.5" />
        </g>

        {/* 10. Tiny atom — bottom middle */}
        <g transform="translate(200, 640)">
          <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
          <ellipse cx="10" cy="10" rx="9" ry="3" />
          <ellipse cx="10" cy="10" rx="9" ry="3" transform="rotate(60 10 10)" />
        </g>

        {/* 11. DNA helix snippet — far right middle */}
        <g transform="translate(360, 420)">
          <path d="M 4 4 Q 16 14 4 24 Q 16 34 4 44" />
          <path d="M 16 4 Q 4 14 16 24 Q 4 34 16 44" />
          <line x1="6" y1="10" x2="14" y2="10" opacity="0.5" />
          <line x1="14" y1="18" x2="6" y2="18" opacity="0.5" />
          <line x1="6" y1="26" x2="14" y2="26" opacity="0.5" />
          <line x1="14" y1="34" x2="6" y2="34" opacity="0.5" />
          <line x1="6" y1="42" x2="14" y2="42" opacity="0.5" />
        </g>

        {/* 12. Small beaker — top right corner */}
        <g transform="translate(120, 130) rotate(20 14 22)">
          <path d="M 4 4 L 4 36 Q 4 42 10 42 L 22 42 Q 28 42 28 36 L 28 4" />
          <path d="M 2 4 L 30 4" />
          <path d="M 4 30 Q 16 32 28 30" opacity="0.5" />
        </g>

        {/* 13. Molecule (chain) — bottom right */}
        <g transform="translate(280, 720)">
          <line x1="4" y1="10" x2="16" y2="6" />
          <line x1="16" y1="6" x2="28" y2="12" />
          <line x1="28" y1="12" x2="40" y2="8" />
          <circle cx="4" cy="10" r="3" fill="currentColor" stroke="none" />
          <circle cx="16" cy="6" r="3" fill="currentColor" stroke="none" />
          <circle cx="28" cy="12" r="3" fill="currentColor" stroke="none" />
          <circle cx="40" cy="8" r="3" fill="currentColor" stroke="none" />
        </g>

        {/* 14. Tiny dropper — middle bottom left */}
        <g transform="translate(100, 420) rotate(30 6 20)">
          <path d="M 4 4 L 8 4 L 8 26 Q 8 32 6 32 Q 4 32 4 26 Z" />
          <path d="M 4 28 L 8 28" />
          <path d="M 6 32 L 6 42" />
        </g>
      </svg>
    </div>
  );
}

export const LabDoodles = memo(LabDoodlesComponent);
