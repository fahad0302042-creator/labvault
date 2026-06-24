"use client";

import { QRCodeSVG } from "qrcode.react";

type QRGeneratorProps = {
  value: string;
  /** Size in pixels */
  size?: number;
  /** Show a white rounded plate behind the QR (recommended for stickers) */
  plate?: boolean;
  className?: string;
};

/**
 * Pure presentational QR code. Auto-generated UUIDs are passed in as `value`.
 */
export function QRGenerator({
  value,
  size = 160,
  plate = true,
  className,
}: QRGeneratorProps) {
  return (
    <div
      className={
        plate
          ? `inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 ${className ?? ""}`
          : className
      }
    >
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#FFFFFF"
        fgColor="#0f172a"
        level="M"
        marginSize={0}
      />
    </div>
  );
}
