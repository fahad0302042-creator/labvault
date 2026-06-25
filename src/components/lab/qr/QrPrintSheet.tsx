"use client";

import { QRGenerator } from "@/components/lab/qr/QRGenerator";
import type { Chemical, Apparatus } from "@/lib/lab/types";
import { FlaskConical, Beaker } from "lucide-react";

type QrPrintSheetProps = {
  chemicals: Chemical[];
  apparatus: Apparatus[];
};

/**
 * Hidden on screen, visible only when printing.
 * Renders a grid of QR labels formatted for sticker printing.
 * `window.print()` shows only this element (CSS in globals.css).
 */
export function QrPrintSheet({ chemicals, apparatus }: QrPrintSheetProps) {
  return (
    <div id="print-area" className="hidden print:block">
      <style>{`
        @page { size: A4; margin: 12mm; }
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6mm;
        }
        .qr-label {
          padding: 4mm;
          border: 0.3mm solid #cbd5e1;
          border-radius: 3mm;
          text-align: center;
          page-break-inside: avoid;
        }
        .qr-label-name { font-weight: 700; font-size: 11pt; color: #0f172a; }
        .qr-label-sub { font-size: 9pt; color: #64748b; margin-top: 1mm; }
        .qr-label-code {
          font-family: monospace;
          font-size: 7pt;
          color: #94a3b8;
          margin-top: 1mm;
          word-break: break-all;
        }
        .qr-header {
          margin-bottom: 6mm;
          text-align: center;
        }
        .qr-header h1 { font-size: 18pt; font-weight: 800; color: #0f172a; }
        .qr-header p { font-size: 10pt; color: #64748b; }
      `}</style>

      <div className="qr-header">
        <h1>LabVault — QR Label Sheet</h1>
        <p>
          {chemicals.length} chemical{chemicals.length === 1 ? "" : "s"} ·{" "}
          {apparatus.length} apparatus
        </p>
      </div>

      {chemicals.length > 0 && (
        <>
          <h2 style={{ fontSize: "14pt", fontWeight: 700, margin: "4mm 0 2mm" }}>
            Chemicals
          </h2>
          <div className="qr-grid">
            {chemicals.map((c) => (
              <div key={c.id} className="qr-label">
                <QRGenerator value={c.qr_code} size={120} plate={false} />
                <div className="qr-label-name">{c.name}</div>
                {c.formula && <div className="qr-label-sub">{c.formula}</div>}
                <div className="qr-label-code">{c.qr_code}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {apparatus.length > 0 && (
        <>
          <h2 style={{ fontSize: "14pt", fontWeight: 700, margin: "6mm 0 2mm" }}>
            Apparatus
          </h2>
          <div className="qr-grid">
            {apparatus.map((a) => (
              <div key={a.id} className="qr-label">
                <QRGenerator value={a.qr_code} size={120} plate={false} />
                <div className="qr-label-name">{a.name}</div>
                <div className="qr-label-sub">{a.category}</div>
                <div className="qr-label-code">{a.qr_code}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Small inline label for a single item — used in detail views when
 * the user clicks "Print label".
 */
export function QrSingleLabel({
  item,
  type,
}: {
  item: Chemical | Apparatus;
  type: "chemical" | "apparatus";
}) {
  return (
    <div id="print-area" className="hidden print:block">
      <style>{`
        @page { size: 50mm 30mm; margin: 2mm; }
        .single-label {
          display: flex;
          align-items: center;
          gap: 3mm;
          padding: 2mm;
        }
        .single-label-name { font-weight: 700; font-size: 11pt; color: #0f172a; }
        .single-label-sub { font-size: 8pt; color: #64748b; }
        .single-label-code {
          font-family: monospace;
          font-size: 6pt;
          color: #94a3b8;
          word-break: break-all;
        }
      `}</style>
      <div className="single-label">
        <QRGenerator value={item.qr_code} size={80} plate={false} />
        <div>
          <div className="single-label-name">{item.name}</div>
          <div className="single-label-sub">
            {type === "chemical" && "formula" in item
              ? item.formula ?? "Chemical"
              : "category" in item
                ? item.category
                : ""}
          </div>
          <div className="single-label-code">{item.qr_code}</div>
        </div>
      </div>
    </div>
  );
}

/** Tiny chip shown on cards to indicate "has QR" — purely decorative. */
export function QrChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      <FlaskConical className="h-2.5 w-2.5" />
      <Beaker className="h-2.5 w-2.5 -ml-1.5" />
      QR
    </span>
  );
}
