"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteApparatus,
  getApparatus,
  pushLog,
  removeLog,
  saveApparatus,
} from "@/lib/lab/storage";
import type { Apparatus, ConsumptionLog, LogAction } from "@/lib/lab/types";
import { useAuth } from "@/context/AuthContext";

export type NewApparatus = Omit<Apparatus, "id" | "created_at">;
export type ApparatusUpdate = Partial<NewApparatus>;

export function useApparatus() {
  const { user } = useAuth();
  const [apparatus, setApparatus] = useState<Apparatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getApparatus();
    setApparatus(data);
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
      item: Apparatus,
      action: LogAction,
      quantity: number,
      note?: string,
      loggedAt?: string,
    ): Promise<ConsumptionLog> => {
      return pushLog({
        item_id: item.id,
        item_type: "apparatus",
        item_name: item.name,
        action,
        quantity,
        logged_by: user?.id ?? "unknown",
        logged_by_name: user?.name ?? "Unknown",
        note,
        logged_at: loggedAt,
      });
    },
    [user],
  );

  const add = useCallback(
    async (input: NewApparatus): Promise<Apparatus> => {
      const a: Apparatus = {
        ...input,
        id: crypto.randomUUID(),
        // Apparatus doesn't get a QR code — only chemicals do
        created_at: new Date().toISOString(),
      };
      await saveApparatus(a);
      await log(a, "created", a.quantity, "Initial count");
      await refresh();
      return a;
    },
    [log, refresh],
  );

  const update = useCallback(
    async (id: string, patch: ApparatusUpdate): Promise<void> => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      const next: Apparatus = { ...current, ...patch };
      await saveApparatus(next);
      await log(next, "updated", 0);
      await refresh();
    },
    [apparatus, log, refresh],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      await deleteApparatus(id);
      await log(current, "deleted", current.quantity);
      await refresh();
    },
    [apparatus, log, refresh],
  );

  /** Log a breakage: reduce quantity by 1. Shows undo toast for 5s. */
  const logBreakage = useCallback(
    async (id: string, note?: string, loggedAt?: string): Promise<void> => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const newQty = Math.max(0, current.quantity - 1);
      const next: Apparatus = { ...current, quantity: newQty };
      await saveApparatus(next);
      const logEntry = await log(next, "broken", 1, note, loggedAt);
      await refresh();

      toast(`Logged breakage of ${current.name}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const restored: Apparatus = { ...current, quantity: prevQty };
            await saveApparatus(restored);
            await removeLog(logEntry.id);
            await refresh();
            toast("Breakage undone");
          },
        },
        duration: 5000,
      });
    },
    [apparatus, log, refresh],
  );

  /** Restock (add) units. Shows undo toast for 5s. */
  const restock = useCallback(
    async (id: string, amount: number, note?: string, loggedAt?: string): Promise<void> => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const prevInitial = current.initialQuantity;
      const next: Apparatus = {
        ...current,
        quantity: current.quantity + amount,
        initialQuantity: Math.max(current.initialQuantity, current.quantity + amount),
      };
      await saveApparatus(next);
      const logEntry = await log(next, "restocked", amount, note, loggedAt);
      await refresh();

      toast(`Restocked ${amount} × ${current.name}`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const restored: Apparatus = {
              ...current,
              quantity: prevQty,
              initialQuantity: prevInitial,
            };
            await saveApparatus(restored);
            await removeLog(logEntry.id);
            await refresh();
            toast("Restock undone");
          },
        },
        duration: 5000,
      });
    },
    [apparatus, log, refresh],
  );

  return {
    apparatus,
    loading,
    add,
    update,
    remove,
    logBreakage,
    restock,
    refresh,
  };
}
