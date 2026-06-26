"use client";

import { Modal } from "@/components/lab/shared/Modal";
import { QRGenerator } from "@/components/lab/qr/QRGenerator";
import { Beaker } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { ApparatusCategory } from "@/lib/lab/types";
import type { NewApparatus } from "@/hooks/lab/useApparatus";

const CATEGORIES: ApparatusCategory[] = [
  "glassware",
  "balances",
  "heating",
  "measurement",
  "other",
];

type AddApparatusModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: NewApparatus) => void;
};

export function AddApparatusModal({
  open,
  onClose,
  onAdd,
}: AddApparatusModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ApparatusCategory>("glassware");
  const [quantity, setQuantity] = useState(12);
  const [notes, setNotes] = useState("");
  const [previewQr] = useState(() => crypto.randomUUID());

  function reset() {
    setName("");
    setCategory("glassware");
    setQuantity(12);
    setNotes("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      category,
      quantity: Number(quantity),
      initialQuantity: Number(quantity),
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
      title="Add Apparatus"
      description="A QR code will be auto-generated on save."
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-apparatus-form"
            className="flex-1 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500"
          >
            Add to inventory
          </button>
        </div>
      }
    >
      <form id="add-apparatus-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-stone-100 p-3 ring-1 ring-inset ring-stone-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
            <Beaker className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm text-stone-900">
            <p className="font-semibold">New apparatus entry</p>
            <p className="text-xs text-stone-700">
              Glassware, balances, heaters — anything reusable.
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
            placeholder="e.g. 250 mL Erlenmeyer Flask"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ApparatusCategory)
              }
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm capitalize outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantity *">
            <input
              type="number"
              required
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm tabular-nums outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            />
          </Field>
        </div>

        <Field label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Location, calibration date, supplier…"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
          />
        </Field>
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
      <label className="text-xs font-semibold uppercase tracking-wide text-stone-700">
        {label}
      </label>
      {children}
    </div>
  );
}
