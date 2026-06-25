"use client";

import { useState, type FormEvent } from "react";
import { FlaskConical } from "lucide-react";
import { Modal } from "@/components/lab/shared/Modal";
import { QRGenerator } from "@/components/lab/qr/QRGenerator";
import type { ChemicalUnit } from "@/lib/lab/types";
import type { NewChemical } from "@/hooks/lab/useChemicals";

const UNITS: ChemicalUnit[] = ["g", "mg", "kg", "L", "mL", "mol", "items"];

type AddChemicalModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: NewChemical) => void;
};

export function AddChemicalModal({
  open,
  onClose,
  onAdd,
}: AddChemicalModalProps) {
  const [name, setName] = useState("");
  const [formula, setFormula] = useState("");
  const [quantity, setQuantity] = useState(500);
  const [unit, setUnit] = useState<ChemicalUnit>("g");
  const [notes, setNotes] = useState("");
  // Preview QR — generated UUID for display only; replaced with real on save
  const [previewQr] = useState(() => crypto.randomUUID());

  function reset() {
    setName("");
    setFormula("");
    setQuantity(500);
    setUnit("g");
    setNotes("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      formula: formula.trim() || undefined,
      quantity: Number(quantity),
      initialQuantity: Number(quantity),
      unit,
      notes: notes.trim() || undefined,
    });
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Add Chemical"
      description="A QR code will be auto-generated on save."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-inset ring-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm text-slate-900">
            <p className="font-semibold">New inventory item</p>
            <p className="text-xs text-slate-700">
              Fill in the details — you can edit any of this later.
            </p>
          </div>
          <QRGenerator value={previewQr} size={56} />
        </div>

        <Field label="Name *">
          <input
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sodium Chloride"
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </Field>

        <Field label="Formula (optional)">
          <input
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="e.g. NaCl"
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm font-mono outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity *">
            <input
              type="number"
              required
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </Field>
          <Field label="Unit">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as ChemicalUnit)}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Storage location, hazards, supplier…"
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </Field>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800"
          >
            Add to inventory
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
