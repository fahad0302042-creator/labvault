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

  const refresh = useCallback(() => {
    setApparatus(getApparatus());
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
      item: Apparatus,
      action: LogAction,
      quantity: number,
      note?: string,
    ): ConsumptionLog => {
      return pushLog({
        item_id: item.id,
        item_type: "apparatus",
        item_name: item.name,
        action,
        quantity,
        logged_by: user?.id ?? "unknown",
        logged_by_name: user?.name ?? "Unknown",
        note,
      });
    },
    [user],
  );

  const add = useCallback(
    (input: NewApparatus): Apparatus => {
      const a: Apparatus = {
        ...input,
        id: crypto.randomUUID(),
        // Note: apparatus doesn't get a QR code — only chemicals do
        created_at: new Date().toISOString(),
      };
      saveApparatus(a);
      log(a, "created", a.quantity, "Initial count");
      refresh();
      return a;
    },
    [log, refresh],
  );

  const update = useCallback(
    (id: string, patch: ApparatusUpdate): void => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      const next: Apparatus = { ...current, ...patch };
      saveApparatus(next);
      log(next, "updated", 0);
      refresh();
    },
    [apparatus, log, refresh],
  );

  const remove = useCallback(
    (id: string): void => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      deleteApparatus(id);
      log(current, "deleted", current.quantity);
      refresh();
    },
    [apparatus, log, refresh],
  );

  /** Log a breakage: reduce quantity by 1. Shows undo toast for 5s. */
  const logBreakage = useCallback(
    (id: string, note?: string): void => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const newQty = Math.max(0, current.quantity - 1);
      const next: Apparatus = { ...current, quantity: newQty };
      saveApparatus(next);
      const logEntry = log(next, "broken", 1, note);
      refresh();

      toast(`Logged breakage of ${current.name}`, {
        action: {
          label: "Undo",
          onClick: () => {
            const restored: Apparatus = { ...current, quantity: prevQty };
            saveApparatus(restored);
            removeLog(logEntry.id);
            refresh();
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
    (id: string, amount: number, note?: string): void => {
      const current = apparatus.find((a) => a.id === id);
      if (!current) return;
      const prevQty = current.quantity;
      const prevInitial = current.initialQuantity;
      const next: Apparatus = {
        ...current,
        quantity: current.quantity + amount,
        initialQuantity: Math.max(current.initialQuantity, current.quantity + amount),
      };
      saveApparatus(next);
      const logEntry = log(next, "restocked", amount, note);
      refresh();

      toast(`Restocked ${amount} × ${current.name}`, {
        action: {
          label: "Undo",
          onClick: () => {
            const restored: Apparatus = {
              ...current,
              quantity: prevQty,
              initialQuantity: prevInitial,
            };
            saveApparatus(restored);
            removeLog(logEntry.id);
            refresh();
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
