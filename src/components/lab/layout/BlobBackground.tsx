"use client";

import { memo } from "react";
import { LabDoodles } from "./LabDoodles";

/**
 * Soft, slow-drifting colored blobs behind everything.
 * Purely decorative — pointer-events: none so it never blocks interaction.
 *
 * Layered with LabDoodles (flask + bubble sketches) at -z-20 beneath the
 * blobs (-z-10) so the doodles peek through the frosted glass subtly.
 */
function BlobBackgroundComponent() {
  return (
    <>
      <LabDoodles />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* No opaque bg here — body already has #F5F5F7, so the LabDoodles
            at -z-20 show through the transparent gaps between blobs. */}

        {/* Three drifting neutral-grey blobs at very low opacity — pure white feel */}
        <div className="blob-1 absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-slate-300/30 blur-3xl" />
        <div className="blob-2 absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full bg-slate-400/20 blur-3xl" />
        <div className="blob-3 absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-zinc-300/30 blur-3xl" />

        {/* Subtle grid wash for a "lab" feel */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #1D1D1F 1px, transparent 1px), linear-gradient(to bottom, #1D1D1F 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
    </>
  );
}

export const BlobBackground = memo(BlobBackgroundComponent);
