"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteChemical,
  getChemicals,
  pushLog,
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
    // Listen for cross-tab changes
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

  /** Consume `amount` units; clamps at 0. */
  const consume = useCallback(
    (id: string, amount: number, note?: string): void => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const next = {
        ...current,
        quantity: Math.max(0, current.quantity - amount),
      };
      saveChemical(next);
      log(next, "consumed", amount, note);
      refresh();
    },
    [chemicals, log, refresh],
  );

  /** Restock `amount` units (does not change initialQuantity). */
  const restock = useCallback(
    (id: string, amount: number, note?: string): void => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const next = {
        ...current,
        quantity: current.quantity + amount,
        initialQuantity: Math.max(current.initialQuantity, current.quantity + amount),
      };
      saveChemical(next);
      log(next, "restocked", amount, note);
      refresh();
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
