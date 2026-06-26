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
 * All operations are async (Supabase is network-based).
 * Consume + restock show an undo toast for 5 seconds.
 */
export function useChemicals() {
  const { user } = useAuth();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getChemicals();
    setChemicals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const log = useCallback(
    async (
      item: Chemical,
      action: LogAction,
      quantity: number,
      note?: string,
      loggedAt?: string,
    ): Promise<ConsumptionLog> => {
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
        logged_at: loggedAt,
      });
    },
    [user],
  );

  const add = useCallback(
    async (input: NewChemical): Promise<Chemical> => {
      const c: Chemical = {
        ...input,
        id: crypto.randomUUID(),
        qr_code: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      await saveChemical(c);
      await log(c, "created", c.quantity, "Initial stock");
      await refresh();
      return c;
    },
    [log, refresh],
  );

  const update = useCallback(
    async (id: string, patch: ChemicalUpdate): Promise<void> => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const next: Chemical = { ...current, ...patch };
      await saveChemical(next);
      await log(next, "updated", 0);
      await refresh();
    },
    [chemicals, log, refresh],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      await deleteChemical(id);
      await log(current, "deleted", current.quantity);
      await refresh();
    },
    [chemicals, log, refresh],
  );

  /** Consume `amount` units; clamps at 0. Shows undo toast for 5s. */
  const consume = useCallback(
    async (id: string, amount: number, note?: string, loggedAt?: string): Promise<void> => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const next: Chemical = {
        ...current,
        quantity: Math.max(0, current.quantity - amount),
      };
      await saveChemical(next);
      const logEntry = await log(next, "consumed", amount, note, loggedAt);
      await refresh();

      toast(`Consumed ${amount} ${current.unit} of ${current.name}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const restored: Chemical = { ...current, quantity: prevQty };
            await saveChemical(restored);
            await removeLog(logEntry.id);
            await refresh();
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
    async (id: string, amount: number, note?: string, loggedAt?: string): Promise<void> => {
      const current = chemicals.find((c) => c.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const prevInitial = current.initialQuantity;
      const next: Chemical = {
        ...current,
        quantity: current.quantity + amount,
        initialQuantity: Math.max(current.initialQuantity, current.quantity + amount),
      };
      await saveChemical(next);
      const logEntry = await log(next, "restocked", amount, note, loggedAt);
      await refresh();

      toast(`Restocked ${amount} ${current.unit} of ${current.name}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const restored: Chemical = {
              ...current,
              quantity: prevQty,
              initialQuantity: prevInitial,
            };
            await saveChemical(restored);
            await removeLog(logEntry.id);
            await refresh();
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
