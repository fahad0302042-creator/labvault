"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteChemical,
  getChemicals,
  pushLog,
  removeLog,
  saveChemical,
} from "@/lib/lab/storage";
import type { Chemical, ConsumptionLog, LogAction } from "@/lib/lab/types";
import { useAuth } from "@/context/AuthContext";

export type NewChemical = Omit<
  Chemical,
  "id" | "qr_code" | "created_at"
>;

export type ChemicalUpdate = Partial<NewChemical>;

/**
 * CRUD hook for chemicals.
 * Each mutating op also writes a consumption_log entry so the activity
 * feed and reports reflect reality.
 * Consume + restock show an undo toast for 5 seconds.
 */
export function useChemicals() {
  const { user } = useAuth();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setChemicals(getChemicals());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const log = useCallback(
    (
      item: Chemical,
      action: LogAction,
      quantity: number,
      note?: string,
    ): ConsumptionLog => {
      return pushLog({
        item_id: item.id,
        item_type: "chemical",
        item_name: item.name,
        action,
        quantity,
        unit: item.unit,
        logged_by: user?.id ?? "unknown",
        logged_by_name: user?.name ?? "Unknown",
        note,
      });
    },
    [user],
  );

  const add = useCallback(
    (input: NewChemical): Chemical => {
      const c: Chemical = {
        ...input,
        id: crypto.randomUUID(),
        qr_code: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      saveChemical(c);
      log(c, "created", c.quantity, "Initial stock");
      refresh();
      return c;
    },
    [log, refresh],
  );

  const update = useCallback(
    (id: string, patch: ChemicalUpdate): void => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const next: Chemical = { ...current, ...patch };
      saveChemical(next);
      log(next, "updated", 0);
      refresh();
    },
    [chemicals, log, refresh],
  );

  const remove = useCallback(
    (id: string): void => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      deleteChemical(id);
      log(current, "deleted", current.quantity);
      refresh();
    },
    [chemicals, log, refresh],
  );

  /** Consume `amount` units; clamps at 0. Shows undo toast for 5s. */
  const consume = useCallback(
    (id: string, amount: number, note?: string): void => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const next: Chemical = {
        ...current,
        quantity: Math.max(0, current.quantity - amount),
      };
      saveChemical(next);
      const logEntry = log(next, "consumed", amount, note);
      refresh();

      // Undo toast
      toast(`Consumed ${amount} ${current.unit} of ${current.name}`, {
        action: {
          label: "Undo",
          onClick: () => {
            const restored: Chemical = { ...current, quantity: prevQty };
            saveChemical(restored);
            removeLog(logEntry.id);
            refresh();
            toast("Consumption undone");
          },
        },
        duration: 5000,
      });
    },
    [chemicals, log, refresh],
  );

  /** Restock `amount` units. Shows undo toast for 5s. */
  const restock = useCallback(
    (id: string, amount: number, note?: string): void => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const prevInitial = current.initialQuantity;
      const next: Chemical = {
        ...current,
        quantity: current.quantity + amount,
        initialQuantity: Math.max(current.initialQuantity, current.quantity + amount),
      };
      saveChemical(next);
      const logEntry = log(next, "restocked", amount, note);
      refresh();

      toast(`Restocked ${amount} ${current.unit} of ${current.name}`, {
        action: {
          label: "Undo",
          onClick: () => {
            const restored: Chemical = {
              ...current,
              quantity: prevQty,
              initialQuantity: prevInitial,
            };
            saveChemical(restored);
            removeLog(logEntry.id);
            refresh();
            toast("Restock undone");
          },
        },
        duration: 5000,
      });
    },
    [chemicals, log, refresh],
  );

  return {
    chemicals,
    loading,
    add,
    update,
    remove,
    consume,
    restock,
    refresh,
  };
}
