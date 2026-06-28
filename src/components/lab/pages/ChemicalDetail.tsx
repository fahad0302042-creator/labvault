"use client";

import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Pencil,
  Trash2,
  History,
  QrCode,
  Check,
  PackagePlus,
  PackageMinus,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Chemical, ChemicalUnit } from "@/lib/lab/types";
import { formatRelative } from "@/lib/lab/types";
import { haptic } from "@/lib/lab/haptics";
import { useLogs } from "@/hooks/lab/useLogs";
import { Modal } from "@/components/lab/shared/Modal";
import { Badge } from "@/components/lab/shared/Badge";
import { StockBar } from "@/components/lab/shared/StockBar";
import { QRGenerator } from "@/components/lab/qr/QRGenerator";

const UNITS: ChemicalUnit[] = ["g", "mg", "kg", "L", "mL", "mol", "items"];

type ChemicalDetailProps = {
  chemical: Chemical | null;
  open: boolean;
  onClose: () => void;
  onConsume: (id: string, amount: number, note?: string, loggedAt?: string) => void;
  onRestock: (id: string, amount: number, note?: string, loggedAt?: string) => void;
  onUpdate: (id: string, patch: Partial<Chemical>) => void;
  onDelete: (id: string) => void;
};

type Mode = "view" | "edit" | "consume" | "restock" | "qr";

export function ChemicalDetail({
  chemical,
  open,
  onClose,
  onConsume,
  onRestock,
  onUpdate,
  onDelete,
}: ChemicalDetailProps) {
  const { logs } = useLogs();
  const [mode, setMode] = useState<Mode>("view");
  const [amount, setAmount] = useState(10);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tickShown, setTickShown] = useState(false);

  // Edit form state
  const [form, setForm] = useState<Chemical | null>(null);

  useEffect(() => {
    if (open) {
      setMode("view");
      setAmount(10);
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
      setTickShown(false);
      setForm(chemical);
    }
  }, [open, chemical]);

  const itemLogs = useMemo(
    () =>
      chemical
        ? logs.filter((l) => l.item_id === chemical.id).slice(0, 20)
        : [],
    [logs, chemical],
  );

  if (!chemical) return null;

  const stockPct =
    chemical.initialQuantity > 0
      ? (chemical.quantity / chemical.initialQuantity) * 100
      : 0;
  const stockTone =
    stockPct >= 50 ? "green" : stockPct >= 20 ? "amber" : "red";

  function handleSubmit() {
    if (!chemical) return;
    // Convert YYYY-MM-DD to ISO timestamp (noon local time to avoid TZ edge cases)
    const loggedAt = new Date(`${date}T12:00:00`).toISOString();
    if (mode === "consume") {
      onConsume(chemical.id, amount, note || undefined, loggedAt);
      flashTick();
      haptic("success");
    } else if (mode === "restock") {
      onRestock(chemical.id, amount, note || undefined, loggedAt);
      flashTick();
      haptic("success");
    }
    setMode("view");
    setNote("");
  }

  function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    onUpdate(form.id, {
      name: form.name,
      formula: form.formula,
      quantity: Number(form.quantity),
      initialQuantity: Number(form.initialQuantity),
      unit: form.unit,
      notes: form.notes,
    });
    setMode("view");
  }

  function handleDelete() {
    if (!chemical) return;
    if (confirm(`Delete "${chemical.name}"? This cannot be undone.`)) {
      onDelete(chemical.id);
      haptic("error");
      onClose();
    }
  }

  function flashTick() {
    setTickShown(true);
    haptic("success");
    setTimeout(() => setTickShown(false), 800);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={mode === "edit" ? "Edit chemical" : chemical.name}
      description={
        mode === "view"
          ? chemical.formula
            ? `${chemical.formula} · ${chemical.quantity} ${chemical.unit} of ${chemical.initialQuantity} ${chemical.unit}`
            : `${chemical.quantity} ${chemical.unit} of ${chemical.initialQuantity} ${chemical.unit}`
          : undefined
      }
    >
      {/* Tick confirmation overlay */}
      {tickShown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl"
          >
            <Check className="h-10 w-10 tick-pop" strokeWidth={3} />
          </motion.div>
        </motion.div>
      )}

      {mode === "view" && (
        <div className="space-y-5">
          {/* Stock overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-700">
                Stock remaining
              </span>
              <Badge tone={stockTone as "green" | "amber" | "red"} dot>
                {stockPct >= 50 ? "Healthy" : stockPct >= 20 ? "Low" : "Critical"}
              </Badge>
            </div>
            <StockBar
              value={chemical.quantity}
              max={chemical.initialQuantity}
              showLabel
              unit={chemical.unit}
            />
          </div>

          {/* Notes */}
          {chemical.notes && (
            <div className="rounded-xl bg-stone-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-700">
                Notes
              </p>
              <p className="mt-1 text-sm text-stone-700">{chemical.notes}</p>
            </div>
          )}

          {/* Action grid */}
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              tone="amber"
              icon={<PackageMinus className="h-5 w-5" />}
              label="Consume"
              sub={`Use ${chemical.unit}`}
              onClick={() => setMode("consume")}
            />
            <ActionButton
              tone="green"
              icon={<PackagePlus className="h-5 w-5" />}
              label="Restock"
              sub={`Add ${chemical.unit}`}
              onClick={() => setMode("restock")}
            />
            <ActionButton
              tone="teal"
              icon={<QrCode className="h-5 w-5" />}
              label="Show QR"
              sub="Print label"
              onClick={() => setMode("qr")}
            />
            <ActionButton
              tone="slate"
              icon={<Pencil className="h-5 w-5" />}
              label="Edit"
              sub="Details"
              onClick={() => setMode("edit")}
            />
          </div>

          {/* Activity */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-700">
              <History className="h-3.5 w-3.5" />
              Activity log
            </div>
            {itemLogs.length === 0 ? (
              <p className="rounded-xl bg-stone-100 p-3 text-sm text-stone-700">
                No activity recorded yet.
              </p>
            ) : (
              <ul className="max-h-44 space-y-2 overflow-y-auto no-scrollbar">
                {itemLogs.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded-xl bg-stone-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-semibold capitalize text-stone-800">
                        {l.action} · {l.quantity} {l.unit}
                      </p>
                      {l.note && (
                        <p className="text-xs text-stone-700">{l.note}</p>
                      )}
                      <p className="text-[11px] text-stone-600">
                        {l.logged_by_name} · {formatRelative(l.logged_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete chemical
          </button>
        </div>
      )}

      {/* Consume / Restock mode */}
      {(mode === "consume" || mode === "restock") && (
        <div className="space-y-5">
          <div className="rounded-xl bg-stone-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-700">
              Current stock
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-stone-900">
              {chemical.quantity}{" "}
              <span className="text-base font-normal text-stone-700">
                {chemical.unit}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-700">
              {mode === "consume" ? "Amount to use" : "Amount to add"} ({chemical.unit})
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAmount((a) => Math.max(1, a - 5))}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors hover:bg-stone-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={0}
                step={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="flex-1 rounded-xl border border-stone-200 bg-white py-3 text-center text-lg font-bold tabular-nums text-stone-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
              />
              <button
                type="button"
                onClick={() => setAmount((a) => a + 5)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors hover:bg-stone-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-700">
              Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            />
            {date !== new Date().toISOString().slice(0, 10) && (
              <p className="text-[11px] font-medium text-amber-600">
                ⚠️ Backdating — this will appear in the past activity feed
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-700">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={
                mode === "consume"
                  ? "e.g. Used in titration prac"
                  : "e.g. New bottle from stores"
              }
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode("view")}
              className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.99] ${
                mode === "consume"
                  ? "bg-amber-500 shadow-amber-500/30 hover:bg-amber-400"
                  : "bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400"
              }`}
            >
              {mode === "consume" ? "Log consumption" : "Confirm restock"}
            </button>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {mode === "edit" && form && (
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            />
          </Field>
          <Field label="Formula (optional)">
            <input
              value={form.formula ?? ""}
              onChange={(e) => setForm({ ...form, formula: e.target.value })}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Quantity">
              <input
                type="number"
                required
                min={0}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm tabular-nums outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
              />
            </Field>
            <Field label="Initial Qty">
              <input
                type="number"
                required
                min={0}
                value={form.initialQuantity}
                onChange={(e) =>
                  setForm({ ...form, initialQuantity: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm tabular-nums outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
              />
            </Field>
            <Field label="Unit">
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value as ChemicalUnit })
                }
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            />
          </Field>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("view")}
              className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 hover:bg-stone-800"
            >
              Save changes
            </button>
          </div>
        </form>
      )}

      {/* QR mode */}
      {mode === "qr" && (
        <div className="flex flex-col items-center gap-4 py-2">
          <QRGenerator value={chemical.qr_code} size={200} />
          <div className="text-center">
            <p className="text-sm font-bold text-stone-900">{chemical.name}</p>
            {chemical.formula && (
              <p className="text-xs text-stone-700">{chemical.formula}</p>
            )}
            <p className="mt-1 break-all font-mono text-[10px] text-stone-600">
              {chemical.qr_code}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 hover:bg-stone-800"
          >
            Print label
          </button>
        </div>
      )}
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

function ActionButton({
  tone,
  icon,
  label,
  sub,
  onClick,
}: {
  tone: "amber" | "green" | "teal" | "slate";
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-amber-200/60",
    green: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-emerald-200/60",
    teal: "bg-stone-100 text-stone-700 hover:bg-stone-200 ring-stone-200/60",
    slate: "bg-stone-100 text-stone-700 hover:bg-stone-100 ring-stone-200/60",
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-xl p-3 text-left ring-1 ring-inset transition-all active:scale-[0.98] ${toneClasses}`}
    >
      {icon}
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[11px] opacity-70">{sub}</span>
    </button>
  );
}
