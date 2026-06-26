"use client";

import { v4 as uuid } from "uuid";
import type {
  Apparatus,
  Chemical,
  ConsumptionLog,
  LabUser,
} from "./types";
import { supabase, isSupabaseEnabled } from "./supabase";

/**
 * Data access layer — uses Supabase when configured, falls back to
 * localStorage for offline/prototype mode.
 *
 * All functions are async (Supabase is network-based). The hooks call
 * these and update local React state from the results.
 */

// ---------- Low-level localStorage helpers (used as fallback + for undo) ----------

const KEYS = {
  chemicals: "labvault.chemicals",
  apparatus: "labvault.apparatus",
  logs: "labvault.logs",
  user: "labvault.user",
  cacheChemicals: "labvault.cache.chemicals",
  cacheApparatus: "labvault.cache.apparatus",
  cacheLogs: "labvault.cache.logs",
  pendingWrites: "labvault.pendingWrites",
} as const;

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/** Check if we're online */
function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/** Cache data for offline reads */
function cacheData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage might be full — ignore
  }
}

/** Read cached data for offline mode */
function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Convert snake_case DB row → camelCase Chemical */
function rowToChemical(row: any): Chemical {
  return {
    id: row.id,
    name: row.name,
    formula: row.formula ?? undefined,
    quantity: Number(row.quantity),
    initialQuantity: Number(row.initial_quantity),
    unit: row.unit,
    notes: row.notes ?? undefined,
    qr_code: row.qr_code,
    created_at: row.created_at,
  };
}

/** Convert camelCase Chemical → snake_case DB row */
function chemicalToRow(c: Chemical) {
  return {
    id: c.id,
    name: c.name,
    formula: c.formula ?? null,
    quantity: c.quantity,
    initial_quantity: c.initialQuantity,
    unit: c.unit,
    notes: c.notes ?? null,
    qr_code: c.qr_code,
  };
}

function rowToApparatus(row: any): Apparatus {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: Number(row.quantity),
    initialQuantity: Number(row.initial_quantity),
    notes: row.notes ?? undefined,
    created_at: row.created_at,
  };
}

function apparatusToRow(a: Apparatus) {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    quantity: a.quantity,
    initial_quantity: a.initialQuantity,
    notes: a.notes ?? null,
  };
}

function rowToLog(row: any): ConsumptionLog {
  return {
    id: row.id,
    item_id: row.item_id,
    item_type: row.item_type,
    item_name: row.item_name,
    action: row.action,
    quantity: Number(row.quantity),
    unit: row.unit ?? undefined,
    note: row.note ?? undefined,
    logged_by: row.logged_by ?? "unknown",
    logged_by_name: row.logged_by_name ?? "Unknown",
    logged_at: row.logged_at,
  };
}

// ---------- Seed (no-op) ----------

export function ensureSeed(): void {
  return;
}

// ---------- Chemicals ----------

export async function getChemicals(): Promise<Chemical[]> {
  if (isSupabaseEnabled && supabase) {
    if (!isOnline()) {
      // Offline — read from cache
      const cached = readCache<Chemical[]>(KEYS.cacheChemicals);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from("chemicals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("getChemicals error:", error);
      // Fall back to cache on error
      const cached = readCache<Chemical[]>(KEYS.cacheChemicals);
      return cached ?? [];
    }
    const chemicals = (data ?? []).map(rowToChemical);
    cacheData(KEYS.cacheChemicals, chemicals); // cache for offline
    return chemicals;
  }
  return readLocal<Chemical[]>(KEYS.chemicals, []).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export async function saveChemical(c: Chemical): Promise<void> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase
      .from("chemicals")
      .upsert(chemicalToRow(c));
    if (error) console.error("saveChemical error:", error);
    return;
  }
  const all = readLocal<Chemical[]>(KEYS.chemicals, []);
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  writeLocal(KEYS.chemicals, all);
}

export async function deleteChemical(id: string): Promise<void> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from("chemicals").delete().eq("id", id);
    if (error) console.error("deleteChemical error:", error);
    return;
  }
  writeLocal(
    KEYS.chemicals,
    readLocal<Chemical[]>(KEYS.chemicals, []).filter((c) => c.id !== id),
  );
}

// ---------- Apparatus ----------

export async function getApparatus(): Promise<Apparatus[]> {
  if (isSupabaseEnabled && supabase) {
    if (!isOnline()) {
      const cached = readCache<Apparatus[]>(KEYS.cacheApparatus);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from("apparatus")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("getApparatus error:", error);
      const cached = readCache<Apparatus[]>(KEYS.cacheApparatus);
      return cached ?? [];
    }
    const apparatus = (data ?? []).map(rowToApparatus);
    cacheData(KEYS.cacheApparatus, apparatus);
    return apparatus;
  }
  return readLocal<Apparatus[]>(KEYS.apparatus, []).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export async function saveApparatus(a: Apparatus): Promise<void> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase
      .from("apparatus")
      .upsert(apparatusToRow(a));
    if (error) console.error("saveApparatus error:", error);
    return;
  }
  const all = readLocal<Apparatus[]>(KEYS.apparatus, []);
  const idx = all.findIndex((x) => x.id === a.id);
  if (idx >= 0) all[idx] = a;
  else all.unshift(a);
  writeLocal(KEYS.apparatus, all);
}

export async function deleteApparatus(id: string): Promise<void> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase.from("apparatus").delete().eq("id", id);
    if (error) console.error("deleteApparatus error:", error);
    return;
  }
  writeLocal(
    KEYS.apparatus,
    readLocal<Apparatus[]>(KEYS.apparatus, []).filter((a) => a.id !== id),
  );
}

// ---------- Logs ----------

export async function getLogs(): Promise<ConsumptionLog[]> {
  if (isSupabaseEnabled && supabase) {
    if (!isOnline()) {
      const cached = readCache<ConsumptionLog[]>(KEYS.cacheLogs);
      if (cached) return cached;
    }
    const { data, error } = await supabase
      .from("consumption_logs")
      .select("*")
      .order("logged_at", { ascending: false });
    if (error) {
      console.error("getLogs error:", error);
      const cached = readCache<ConsumptionLog[]>(KEYS.cacheLogs);
      return cached ?? [];
    }
    const logs = (data ?? []).map(rowToLog);
    cacheData(KEYS.cacheLogs, logs);
    return logs;
  }
  return readLocal<ConsumptionLog[]>(KEYS.logs, []).sort(
    (a, b) => +new Date(b.logged_at) - +new Date(a.logged_at),
  );
}

export async function pushLog(
  log: Omit<ConsumptionLog, "id" | "logged_at"> & { logged_at?: string },
): Promise<ConsumptionLog> {
  const entry: ConsumptionLog = {
    ...log,
    id: uuid(),
    logged_at: log.logged_at ?? new Date().toISOString(),
  };

  if (isSupabaseEnabled && supabase) {
    const row = {
      id: entry.id,
      item_id: entry.item_id,
      item_type: entry.item_type,
      item_name: entry.item_name,
      action: entry.action,
      quantity: entry.quantity,
      unit: entry.unit ?? null,
      note: entry.note ?? null,
      logged_by: entry.logged_by,
      logged_by_name: entry.logged_by_name,
      logged_at: entry.logged_at,
    };
    const { error } = await supabase.from("consumption_logs").insert(row);
    if (error) console.error("pushLog error:", error);
    return entry;
  }

  const all = readLocal<ConsumptionLog[]>(KEYS.logs, []);
  all.unshift(entry);
  writeLocal(KEYS.logs, all);
  return entry;
}

export async function removeLog(id: string): Promise<void> {
  if (isSupabaseEnabled && supabase) {
    const { error } = await supabase
      .from("consumption_logs")
      .delete()
      .eq("id", id);
    if (error) console.error("removeLog error:", error);
    return;
  }
  writeLocal(
    KEYS.logs,
    readLocal<ConsumptionLog[]>(KEYS.logs, []).filter((l) => l.id !== id),
  );
}

// ---------- Auth (mock fallback) ----------

export function getCurrentUser(): LabUser | null {
  return readLocal<LabUser | null>(KEYS.user, null);
}

export function setCurrentUser(u: LabUser | null): void {
  if (u) writeLocal(KEYS.user, u);
  else if (typeof window !== "undefined") localStorage.removeItem(KEYS.user);
}

// ---------- Lookup ----------

/** Find a chemical by QR code. Apparatus doesn't have QR codes. */
export async function findByQr(
  qr: string,
): Promise<{ type: "chemical"; item: Chemical } | null> {
  if (isSupabaseEnabled && supabase) {
    const { data, error } = await supabase
      .from("chemicals")
      .select("*")
      .eq("qr_code", qr)
      .maybeSingle();
    if (error || !data) return null;
    return { type: "chemical", item: rowToChemical(data) };
  }
  const c = readLocal<Chemical[]>(KEYS.chemicals, []).find(
    (x) => x.qr_code === qr,
  );
  return c ? { type: "chemical", item: c } : null;
}

export async function findById(
  id: string,
): Promise<
  { type: "chemical"; item: Chemical } | { type: "apparatus"; item: Apparatus } | null
> {
  if (isSupabaseEnabled && supabase) {
    const { data: c } = await supabase
      .from("chemicals")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (c) return { type: "chemical", item: rowToChemical(c) };
    const { data: a } = await supabase
      .from("apparatus")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (a) return { type: "apparatus", item: rowToApparatus(a) };
    return null;
  }
  const c = readLocal<Chemical[]>(KEYS.chemicals, []).find((x) => x.id === id);
  if (c) return { type: "chemical", item: c };
  const a = readLocal<Apparatus[]>(KEYS.apparatus, []).find((x) => x.id === id);
  if (a) return { type: "apparatus", item: a };
  return null;
}

// ---------- Reset ----------

/** Wipe ALL data — chemicals, apparatus, and logs. Use with caution. */
export async function clearAllData(): Promise<void> {
  if (isSupabaseEnabled && supabase) {
    await supabase.from("consumption_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("chemicals").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("apparatus").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    return;
  }
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.chemicals);
  localStorage.removeItem(KEYS.apparatus);
  localStorage.removeItem(KEYS.logs);
  localStorage.removeItem("labvault.recentlyScanned");
}

/** Clear only the activity logs (consumption/restock/breakage history).
 *  Keeps all chemicals and apparatus — just resets the activity feed + reports. */
export async function clearRecentData(): Promise<void> {
  if (isSupabaseEnabled && supabase) {
    await supabase.from("consumption_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    return;
  }
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.logs);
  localStorage.removeItem("labvault.recentlyScanned");
}
