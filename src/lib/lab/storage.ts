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
 */

const KEYS = {
  chemicals: "labvault.chemicals",
  apparatus: "labvault.apparatus",
  logs: "labvault.logs",
  user: "labvault.user",
  seeded: "labvault.seeded.v1",
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

// ---------- Seed ----------

const SEED_CHEMICALS: Chemical[] = [
  {
    id: uuid(),
    name: "Sodium Chloride",
    formula: "NaCl",
    quantity: 480,
    initialQuantity: 500,
    unit: "g",
    notes: "Standard salt — restock from cabinet B2.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: uuid(),
    name: "Hydrochloric Acid",
    formula: "HCl",
    quantity: 950,
    initialQuantity: 1000,
    unit: "mL",
    notes: "1M solution. Fume hood use only.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
  },
  {
    id: uuid(),
    name: "Sodium Hydroxide",
    formula: "NaOH",
    quantity: 120,
    initialQuantity: 500,
    unit: "g",
    notes: "Hygroscopic — keep sealed.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: uuid(),
    name: "Ethanol",
    formula: "C2H5OH",
    quantity: 180,
    initialQuantity: 1000,
    unit: "mL",
    notes: "95% denatured. Flammable.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: uuid(),
    name: "Copper(II) Sulfate",
    formula: "CuSO4",
    quantity: 65,
    initialQuantity: 250,
    unit: "g",
    notes: "Anhydrous. Blue crystals when hydrated.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: uuid(),
    name: "Potassium Permanganate",
    formula: "KMnO4",
    quantity: 38,
    initialQuantity: 100,
    unit: "g",
    notes: "Strong oxidiser.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const SEED_APPARATUS: Apparatus[] = [
  {
    id: uuid(),
    name: "250 mL Erlenmeyer Flask",
    category: "glassware",
    quantity: 24,
    initialQuantity: 30,
    condition: "good",
    notes: "Borosilicate.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
  },
  {
    id: uuid(),
    name: "10 mL Pipette",
    category: "glassware",
    quantity: 8,
    initialQuantity: 20,
    condition: "damaged",
    notes: "Two have chipped tips — flagged for replacement.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
  },
  {
    id: uuid(),
    name: "Analytical Balance",
    category: "balances",
    quantity: 3,
    initialQuantity: 3,
    condition: "good",
    notes: "Calibrated 2026-06-01. Sartorius & Mettler units.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: uuid(),
    name: "Hot Plate Stirrer",
    category: "heating",
    quantity: 5,
    initialQuantity: 6,
    condition: "good",
    notes: "One unit has a faulty speed dial.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  },
  {
    id: uuid(),
    name: "Thermometer (−10 to 110 °C)",
    category: "measurement",
    quantity: 4,
    initialQuantity: 12,
    condition: "broken",
    notes: "Eight broken this term — students handling issue.",
    qr_code: uuid(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
];

function seedLogs(chemicals: Chemical[], apparatus: Apparatus[]): ConsumptionLog[] {
  const logs: ConsumptionLog[] = [];
  const now = Date.now();
  const pushLog = (
    item_id: string,
    item_type: "chemical" | "apparatus",
    item_name: string,
    action: ConsumptionLog["action"],
    quantity: number,
    unit: string | undefined,
    ageMinutes: number,
    note?: string,
  ) => {
    logs.push({
      id: uuid(),
      item_id,
      item_type,
      item_name,
      action,
      quantity,
      unit,
      logged_by: "seed-user",
      logged_by_name: "Dr. Chen",
      logged_at: new Date(now - ageMinutes * 60 * 1000).toISOString(),
      note,
    });
  };

  pushLog(chemicals[0].id, "chemical", chemicals[0].name, "consumed", 20, "g", 22);
  pushLog(chemicals[2].id, "chemical", chemicals[2].name, "consumed", 30, "g", 95);
  pushLog(apparatus[4].id, "apparatus", apparatus[4].name, "broken", 1, undefined, 180, "Snapped during titration prac.");
  pushLog(chemicals[3].id, "chemical", chemicals[3].name, "restocked", 500, "mL", 240, "New bottle from stores.");
  pushLog(chemicals[5].id, "chemical", chemicals[5].name, "consumed", 12, "g", 320);
  pushLog(chemicals[1].id, "chemical", chemicals[1].name, "consumed", 50, "mL", 480);
  pushLog(apparatus[1].id, "apparatus", apparatus[1].name, "consumed", 1, undefined, 600, "Set aside for repair.");
  pushLog(chemicals[4].id, "chemical", chemicals[4].name, "consumed", 35, "g", 720);
  pushLog(chemicals[0].id, "chemical", chemicals[0].name, "consumed", 15, "g", 1440);
  pushLog(apparatus[3].id, "apparatus", apparatus[3].name, "broken", 1, undefined, 2880, "Burnt out motor.");

  return logs;
}

/** Run once on first load so the prototype has plausible data. */
export function ensureSeed(): void {
  if (typeof window === "undefined") return;
  if (read(KEYS.seeded, false)) return;
  write(KEYS.chemicals, SEED_CHEMICALS);
  write(KEYS.apparatus, SEED_APPARATUS);
  write(KEYS.logs, seedLogs(SEED_CHEMICALS, SEED_APPARATUS));
  write(KEYS.seeded, true);
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

export function pushLog(log: Omit<ConsumptionLog, "id" | "logged_at">): ConsumptionLog {
  const entry: ConsumptionLog = {
    ...log,
    id: uuid(),
    logged_at: new Date().toISOString(),
  };
  const all = read<ConsumptionLog[]>(KEYS.logs, []);
  all.unshift(entry);
  write(KEYS.logs, all);
  return entry;
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

/** Find an item by QR code across both tables. */
export function findByQr(
  qr: string,
): { type: "chemical"; item: Chemical } | { type: "apparatus"; item: Apparatus } | null {
  const c = read<Chemical[]>(KEYS.chemicals, []).find((x) => x.qr_code === qr);
  if (c) return { type: "chemical", item: c };
  const a = read<Apparatus[]>(KEYS.apparatus, []).find((x) => x.qr_code === qr);
  if (a) return { type: "apparatus", item: a };
  return null;
}

/** Cross-table id lookup for the scanner result view. */
export function findById(
  id: string,
): { type: "chemical"; item: Chemical } | { type: "apparatus"; item: Apparatus } | null {
  const c = read<Chemical[]>(KEYS.chemicals, []).find((x) => x.id === id);
  if (c) return { type: "chemical", item: c };
  const a = read<Apparatus[]>(KEYS.apparatus, []).find((x) => x.id === id);
  if (a) return { type: "apparatus", item: a };
  return null;
}
