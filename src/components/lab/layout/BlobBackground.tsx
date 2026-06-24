"use client";

import { memo } from "react";

/**
 * Soft, slow-drifting colored blobs behind everything.
 * Purely decorative — pointer-events: none so it never blocks interaction.
 */
function BlobBackgroundComponent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Warm-white base */}
      <div className="absolute inset-0 bg-[#F5F5F7]" />

      {/* Three drifting teal/sky blobs at very low opacity */}
      <div className="blob-1 absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-sky-400/25 blur-3xl" />
      <div className="blob-2 absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="blob-3 absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-teal-200/25 blur-3xl" />

      {/* Subtle grid wash for a "lab" feel */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0c4a6e 1px, transparent 1px), linear-gradient(to bottom, #0c4a6e 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

export const BlobBackground = memo(BlobBackgroundComponent);
