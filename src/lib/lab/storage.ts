"use client";

import { v4 as uuid } from "uuid";
import type {
  Apparatus,
  Chemical,
  ConsumptionLog,
  LabUser,
} from "./types";

/**
 * Mock data layer that mimics Supabase's table-per-entity model.
 *
 * When you wire up Supabase later, replace the body of each function with
 * a `supabase.from('table').select()...` call — the function signatures
 * are intentionally shaped to match.
 *
 * NOTE: No seed data. The app starts empty so the user adds their own
 * chemicals and apparatus.
 */

const KEYS = {
  chemicals: "labvault.chemicals",
  apparatus: "labvault.apparatus",
  logs: "labvault.logs",
  user: "labvault.user",
} as const;

// ---------- Low-level helpers ----------

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Backward-compat: older versions wrote a `labvault.seeded.v1` flag.
 * We don't seed anymore, but we honor the flag so existing users
 * don't lose their data on upgrade. New users start with empty tables.
 */
export function ensureSeed(): void {
  // No-op — app starts empty. Kept for AuthContext compatibility.
  return;
}

// ---------- Chemicals ----------

export function getChemicals(): Chemical[] {
  return read<Chemical[]>(KEYS.chemicals, []).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export function saveChemical(c: Chemical): void {
  const all = read<Chemical[]>(KEYS.chemicals, []);
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  write(KEYS.chemicals, all);
}

export function deleteChemical(id: string): void {
  write(
    KEYS.chemicals,
    read<Chemical[]>(KEYS.chemicals, []).filter((c) => c.id !== id),
  );
}

// ---------- Apparatus ----------

export function getApparatus(): Apparatus[] {
  return read<Apparatus[]>(KEYS.apparatus, []).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export function saveApparatus(a: Apparatus): void {
  const all = read<Apparatus[]>(KEYS.apparatus, []);
  const idx = all.findIndex((x) => x.id === a.id);
  if (idx >= 0) all[idx] = a;
  else all.unshift(a);
  write(KEYS.apparatus, all);
}

export function deleteApparatus(id: string): void {
  write(
    KEYS.apparatus,
    read<Apparatus[]>(KEYS.apparatus, []).filter((a) => a.id !== id),
  );
}

// ---------- Logs ----------

export function getLogs(): ConsumptionLog[] {
  return read<ConsumptionLog[]>(KEYS.logs, []).sort(
    (a, b) => +new Date(b.logged_at) - +new Date(a.logged_at),
  );
}

export function pushLog(
  log: Omit<ConsumptionLog, "id" | "logged_at"> & { logged_at?: string },
): ConsumptionLog {
  const entry: ConsumptionLog = {
    ...log,
    id: uuid(),
    logged_at: log.logged_at ?? new Date().toISOString(),
  };
  const all = read<ConsumptionLog[]>(KEYS.logs, []);
  all.unshift(entry);
  write(KEYS.logs, all);
  return entry;
}

/** Remove a log entry by id — used by the Undo toast. */
export function removeLog(id: string): void {
  write(
    KEYS.logs,
    read<ConsumptionLog[]>(KEYS.logs, []).filter((l) => l.id !== id),
  );
}

// ---------- Auth (mock) ----------

export function getCurrentUser(): LabUser | null {
  return read<LabUser | null>(KEYS.user, null);
}

export function setCurrentUser(u: LabUser | null): void {
  if (u) write(KEYS.user, u);
  else if (typeof window !== "undefined") localStorage.removeItem(KEYS.user);
}

// ---------- Lookup ----------

/**
 * Find a CHEMICAL by QR code.
 * Apparatus doesn't have QR codes — only chemicals do.
 */
export function findByQr(
  qr: string,
): { type: "chemical"; item: Chemical } | null {
  const c = read<Chemical[]>(KEYS.chemicals, []).find((x) => x.qr_code === qr);
  return c ? { type: "chemical", item: c } : null;
}

/** Cross-table id lookup — used by the scanner result view. */
export function findById(
  id: string,
): { type: "chemical"; item: Chemical } | { type: "apparatus"; item: Apparatus } | null {
  const c = read<Chemical[]>(KEYS.chemicals, []).find((x) => x.id === id);
  if (c) return { type: "chemical", item: c };
  const a = read<Apparatus[]>(KEYS.apparatus, []).find((x) => x.id === id);
  if (a) return { type: "apparatus", item: a };
  return null;
}

// ---------- Reset ----------

/** Wipe all inventory data (keeps the user session). */
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.chemicals);
  localStorage.removeItem(KEYS.apparatus);
  localStorage.removeItem(KEYS.logs);
  localStorage.removeItem("labvault.recentlyScanned");
}
