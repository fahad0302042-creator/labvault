"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "labvault.recentlyScanned";

export type RecentScan = {
  id: string;
  type: "chemical" | "apparatus";
  name: string;
  scannedAt: string;
};

/**
 * Tracks the last 5 scanned items across sessions.
 * Used by the Scanner tab to show quick-tap chips.
 */
export function useRecentlyScanned() {
  const [recent, setRecent] = useState<RecentScan[]>([]);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRecent(raw ? JSON.parse(raw) : []);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addScan = useCallback(
    (entry: Omit<RecentScan, "scannedAt">) => {
      if (typeof window === "undefined") return;
      const newEntry: RecentScan = { ...entry, scannedAt: new Date().toISOString() };
      // Remove any existing entry with the same id, then prepend
      const next = [newEntry, ...recent.filter((r) => r.id !== entry.id)].slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRecent(next);
    },
    [recent],
  );

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    setRecent([]);
  }, []);

  return { recent, addScan, clear, refresh };
}
