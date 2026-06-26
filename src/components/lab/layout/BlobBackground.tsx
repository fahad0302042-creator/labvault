"use client";

import { memo } from "react";

/**
 * Clean white background — no blobs, no doodles.
 * Maximum text readability. Matches the minimalist UNIX-style aesthetic.
 */
function BlobBackgroundComponent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[#FAFAF8]"
    />
  );
}

export const BlobBackground = memo(BlobBackgroundComponent);
