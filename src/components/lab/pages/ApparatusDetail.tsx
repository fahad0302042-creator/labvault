"use client";

import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Pencil,
  Trash2,
  History,
  Check,
  PackagePlus,
  AlertOctagon,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Apparatus, ApparatusCategory } from "@/lib/lab/types";
import { formatRelative } from "@/lib/lab/types";
import { haptic } from "@/lib/lab/haptics";
import { useLogs } from "@/hooks/lab/useLogs";
import { Modal } from "@/components/lab/shared/Modal";
import { Badge } from "@/components/lab/shared/Badge";
import { StockBar } from "@/components/lab/shared/StockBar";

const CATEGORIES: ApparatusCategory[] = [
  "glassware",
  "balances",
  "heating",
  "measurement",
  "other",
];

type ApparatusDetailProps = {
  apparatus: Apparatus | null;
  open: boolean;
  onClose: () => void;
  onLogBreakage: (id: string, note?: string, loggedAt?: string) => void;
  onRestock: (id: string, amount: number, note?: string, loggedAt?: string) => void;
  onUpdate: (id: string, patch: Partial<Apparatus>) => void;
  onDelete: (id: string) => void;
};

type Mode = "view" | "edit" | "restock" | "breakage";

export function ApparatusDetail({
  apparatus,
  open,
  onClose,
  onLogBreakage,
  onRestock,
  onUpdate,
  onDelete,
}: ApparatusDetailProps) {
  const { logs } = useLogs();
  const [mode, setMode] = useState<Mode>("view");
  const [amount, setAmount] = useState(1);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tickShown, setTickShown] = useState(false);
  const [form, setForm] = useState<Apparatus | null>(null);

  useEffect(() => {
    if (open) {
      setMode("view");
      setAmount(1);
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
      setTickShown(false);
      setForm(apparatus);
    }
  }, [open, apparatus]);

  const itemLogs = useMemo(
    () =>
      apparatus ? logs.filter((l) => l.item_id === apparatus.id).slice(0, 20) : [],
    [logs, apparatus],
  );

  if (!apparatus) return null;

  const pct =
    apparatus.initialQuantity > 0
      ? (apparatus.quantity / apparatus.initialQuantity) * 100
      : 0;

  function handleSubmit() {
    if (!apparatus) return;
    // Convert YYYY-MM-DD to ISO timestamp (noon local time to avoid TZ edge cases)
    const loggedAt = new Date(`${date}T12:00:00`).toISOString();
    if (mode === "breakage") {
      onLogBreakage(apparatus.id, note || undefined, loggedAt);
      flashTick();
      haptic("warning");
    } else if (mode === "restock") {
      onRestock(apparatus.id, amount, note || undefined, loggedAt);
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
      category: form.category,
      quantity: Number(form.quantity),
      initialQuantity: Number(form.initialQuantity),
      notes: form.notes,
    });
    setMode("view");
  }

  function handleDelete() {
    if (!apparatus) return;
    if (confirm(`Delete "${apparatus.name}"? This cannot be undone.`)) {
      onDelete(apparatus.id);
      haptic("error");
      onClose();
    }
  }

  function flashTick() {
    setTickShown(true);
    haptic("success");
    setTimeout(() => setTickShown(false), 800);
  }

  // Compute the footer content based on mode — so Cancel/Submit are always visible
  function getFooter() {
    if (mode === "breakage") {
      return (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode("view")}
            className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:bg-red-400"
          >
            Log breakage
          </button>
        </div>
      );
    }
    if (mode === "restock") {
      return (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode("view")}
            className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
          >
            Confirm restock
          </button>
        </div>
      );
    }
    if (mode === "edit") {
      return (
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
            form="edit-apparatus-form"
            className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-900/20 hover:bg-stone-800"
          >
            Save changes
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={mode === "edit" ? "Edit apparatus" : apparatus.name}
      description={
        mode === "view"
          ? `${apparatus.category} · ${apparatus.quantity} of ${apparatus.initialQuantity} units`
          : undefined
      }
      footer={getFooter()}
    >
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
          <div>
            <Badge tone="slate" className="capitalize">
              {apparatus.category}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-700">
                Units remaining
              </span>
              <span className="text-xs tabular-nums text-stone-700">
                {Math.round(pct)}%
              </span>
            </div>
            <StockBar
              value={apparatus.quantity}
              max={apparatus.initialQuantity}
              showLabel
            />
          </div>

          {apparatus.notes && (
            <div className="rounded-xl bg-stone-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-700">
                Notes
              </p>
              <p className="mt-1 text-sm text-stone-700">{apparatus.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <ActionButton
              tone="red"
              icon={<AlertOctagon className="h-5 w-5" />}
              label="Log breakage"
              sub="−1 unit"
              onClick={() => setMode("breakage")}
            />
            <ActionButton
              tone="green"
              icon={<PackagePlus className="h-5 w-5" />}
              label="Restock"
              sub="+N units"
              onClick={() => setMode("restock")}
            />
            <ActionButton
              tone="slate"
              icon={<Pencil className="h-5 w-5" />}
              label="Edit"
              sub="Details"
              onClick={() => setMode("edit")}
            />
          </div>

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
                        {l.action} · {l.quantity}
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

          <button
            onClick={handleDelete}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete apparatus
          </button>
        </div>
      )}

      {mode === "breakage" && (
        <div className="space-y-5">
          <div className="rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              About to log
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-red-900">
              −1 unit
            </p>
            <p className="mt-1 text-xs text-red-700">
              Current count: {apparatus.quantity} → {Math.max(0, apparatus.quantity - 1)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-700">
              What happened? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Cracked during Year 11 titration prac"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
            />
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
        </div>
      )}

      {mode === "restock" && (
        <div className="space-y-5">
          <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-inset ring-emerald-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Current count
            </p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-900">
              {apparatus.quantity}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-700">
              How many to add?
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAmount((a) => Math.max(1, a - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors hover:bg-stone-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                className="flex-1 rounded-xl border border-stone-200 bg-white py-3 text-center text-lg font-bold tabular-nums text-stone-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
              />
              <button
                type="button"
                onClick={() => setAmount((a) => a + 1)}
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
              placeholder="e.g. New set from science office"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
      )}

      {mode === "edit" && form && (
        <form id="edit-apparatus-form" onSubmit={handleSaveEdit} className="space-y-4">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as ApparatusCategory,
                })
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
          <div className="grid grid-cols-2 gap-3">
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
                  setForm({
                    ...form,
                    initialQuantity: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm tabular-nums outline-none focus:border-slate-400 focus:ring-2 focus:ring-stone-200"
              />
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
        </form>
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
  tone: "red" | "green" | "teal" | "slate";
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  const toneClasses = {
    red: "bg-red-50 text-red-700 hover:bg-red-100 ring-red-200/60",
    green:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-emerald-200/60",
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
