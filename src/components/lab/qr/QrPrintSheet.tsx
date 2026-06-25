"use client";

import { QRGenerator } from "@/components/lab/qr/QRGenerator";
import type { Chemical } from "@/lib/lab/types";

type QrPrintSheetProps = {
  chemicals: Chemical[];
};

/**
 * Printable QR label sheet — CHEMICALS ONLY.
 *
 * Formatted for sticking on chemical storage boxes:
 *   - 2 columns of large labels on A4
 *   - Each label: big QR + chemical name + formula + current stock
 *   - Cut marks for easy trimming
 *
 * Hidden on screen, visible only when printing (CSS in globals.css
 * isolates #print-area via window.print()).
 */
export function QrPrintSheet({ chemicals }: QrPrintSheetProps) {
  return (
    <div id="print-area" className="hidden print:block">
      <style>{`
        @page { size: A4; margin: 10mm; }
        .qr-sheet-header {
          margin-bottom: 6mm;
          text-align: center;
          border-bottom: 0.5mm solid #cbd5e1;
          padding-bottom: 4mm;
        }
        .qr-sheet-header h1 {
          font-size: 18pt;
          font-weight: 800;
          color: #1D1D1F;
          margin: 0;
        }
        .qr-sheet-header p {
          font-size: 10pt;
          color: #64748b;
          margin: 1mm 0 0;
        }
        .qr-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5mm;
        }
        .qr-label {
          padding: 5mm;
          border: 0.3mm dashed #94a3b8;
          border-radius: 3mm;
          display: flex;
          align-items: center;
          gap: 4mm;
          page-break-inside: avoid;
          min-height: 35mm;
        }
        .qr-label-qr { flex-shrink: 0; }
        .qr-label-info { flex: 1; min-width: 0; }
        .qr-label-name {
          font-weight: 800;
          font-size: 13pt;
          color: #1D1D1F;
          line-height: 1.2;
          word-break: break-word;
        }
        .qr-label-formula {
          font-family: monospace;
          font-size: 11pt;
          color: #2A2520;
          margin-top: 1mm;
          font-weight: 600;
        }
        .qr-label-stock {
          font-size: 9pt;
          color: #64748b;
          margin-top: 1mm;
        }
        .qr-label-code {
          font-family: monospace;
          font-size: 6pt;
          color: #94a3b8;
          margin-top: 2mm;
          word-break: break-all;
          opacity: 0.7;
        }
        .qr-empty {
          text-align: center;
          padding: 20mm 0;
          color: #94a3b8;
          font-size: 12pt;
        }
      `}</style>

      <div className="qr-sheet-header">
        <h1>LabVault — Chemical QR Labels</h1>
        <p>
          {chemicals.length} chemical{chemicals.length === 1 ? "" : "s"} ·
          Print on A4, cut along dashed lines, stick on storage boxes
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
              <div className="qr-label-qr">
                <QRGenerator value={c.qr_code} size={100} plate={false} />
              </div>
              <div className="qr-label-info">
                <div className="qr-label-name">{c.name}</div>
                {c.formula && (
                  <div className="qr-label-formula">{c.formula}</div>
                )}
                <div className="qr-label-stock">
                  Current stock: {c.quantity} {c.unit}
                </div>
                <div className="qr-label-code">{c.qr_code}</div>
              </div>
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
        @page { size: 70mm 40mm; margin: 2mm; }
        .single-label {
          display: flex;
          align-items: center;
          gap: 3mm;
          padding: 3mm;
        }
        .single-label-name {
          font-weight: 800;
          font-size: 12pt;
          color: #1D1D1F;
          line-height: 1.2;
        }
        .single-label-formula {
          font-family: monospace;
          font-size: 10pt;
          color: #2A2520;
          margin-top: 1mm;
          font-weight: 600;
        }
        .single-label-code {
          font-family: monospace;
          font-size: 6pt;
          color: #94a3b8;
          word-break: break-all;
          margin-top: 1mm;
          opacity: 0.7;
        }
      `}</style>
      <div className="single-label">
        <QRGenerator value={chemical.qr_code} size={90} plate={false} />
        <div>
          <div className="single-label-name">{chemical.name}</div>
          {chemical.formula && (
            <div className="single-label-formula">{chemical.formula}</div>
          )}
          <div className="single-label-code">{chemical.qr_code}</div>
        </div>
      </div>
    </div>
  );
}
