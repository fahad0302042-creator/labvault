"use client";

import { QRGenerator } from "@/components/lab/qr/QRGenerator";
import type { Chemical } from "@/lib/lab/types";

type QrPrintSheetProps = {
  chemicals: Chemical[];
};

/**
 * Printable QR label sheet — CHEMICALS ONLY.
 *
 * Formatted for small 1-inch square stickers:
 *   - 4 columns × 10 rows = 40 labels per A4 page
 *   - Each label: ~1 inch (25mm) square
 *   - QR code is small but scannable
 *   - Name + formula below the QR
 *   - Cut marks for easy trimming
 *
 * Hidden on screen, visible only when printing (CSS in globals.css
 * isolates #print-area via window.print()).
 */
export function QrPrintSheet({ chemicals }: QrPrintSheetProps) {
  return (
    <div id="print-area" className="hidden print:block">
      <style>{`
        @page { size: A4; margin: 8mm; }
        .qr-sheet-header {
          margin-bottom: 4mm;
          text-align: center;
          border-bottom: 0.5mm solid #cbd5e1;
          padding-bottom: 2mm;
        }
        .qr-sheet-header h1 {
          font-size: 14pt;
          font-weight: 800;
          color: #292524;
          margin: 0;
        }
        .qr-sheet-header p {
          font-size: 9pt;
          color: #57534E;
          margin: 1mm 0 0;
        }
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3mm;
        }
        .qr-label {
          padding: 2mm;
          border: 0.2mm dashed #94a3b8;
          border-radius: 2mm;
          text-align: center;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 25mm;
        }
        .qr-label-name {
          font-weight: 700;
          font-size: 7pt;
          color: #292524;
          line-height: 1.1;
          margin-top: 1mm;
          word-break: break-word;
          max-width: 100%;
        }
        .qr-label-formula {
          font-family: monospace;
          font-size: 6pt;
          color: #57534E;
          margin-top: 0.5mm;
        }
        .qr-empty {
          text-align: center;
          padding: 40mm 0;
          color: #94a3b8;
          font-size: 12pt;
        }
      `}</style>

      <div className="qr-sheet-header">
        <h1>LabVault — Chemical QR Labels</h1>
        <p>
          {chemicals.length} chemical{chemicals.length === 1 ? "" : "s"} ·
          1-inch square stickers · Cut along dashed lines
        </p>
      </div>

      {chemicals.length === 0 ? (
        <div className="qr-empty">
          No chemicals yet — add some first, then print this sheet.
        </div>
      ) : (
        <div className="qr-grid">
          {chemicals.map((c) => (
            <div key={c.id} className="qr-label">
              <QRGenerator value={c.qr_code} size={60} plate={false} />
              <div className="qr-label-name">{c.name}</div>
              {c.formula && (
                <div className="qr-label-formula">{c.formula}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Small inline label for a single chemical — used in detail views
 * when the user clicks "Print label".
 */
export function QrSingleLabel({ chemical }: { chemical: Chemical }) {
  return (
    <div id="print-area" className="hidden print:block">
      <style>{`
        @page { size: 25mm 25mm; margin: 1mm; }
        .single-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1mm;
          text-align: center;
        }
        .single-label-name {
          font-weight: 700;
          font-size: 7pt;
          color: #292524;
          margin-top: 1mm;
        }
        .single-label-formula {
          font-family: monospace;
          font-size: 6pt;
          color: #57534E;
        }
      `}</style>
      <div className="single-label">
        <QRGenerator value={chemical.qr_code} size={60} plate={false} />
        <div className="single-label-name">{chemical.name}</div>
        {chemical.formula && (
          <div className="single-label-formula">{chemical.formula}</div>
        )}
      </div>
    </div>
  );
}
