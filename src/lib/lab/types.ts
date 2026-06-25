/**
 * LabVault — Shared domain types.
 * Mirrors the SQL schema in the original plan so swapping the localStorage
 * layer for Supabase later is a drop-in change.
 */

export type ChemicalUnit = "g" | "mg" | "kg" | "L" | "mL" | "mol" | "items";

export type Chemical = {
  id: string;
  name: string;
  formula?: string;
  quantity: number;
  initialQuantity: number; // reference max for stock bar
  unit: ChemicalUnit;
  notes?: string;
  qr_code: string;
  created_at: string;
};

export type ApparatusCategory =
  | "glassware"
  | "balances"
  | "heating"
  | "measurement"
  | "other";

export type ApparatusCondition = "good" | "damaged" | "broken";

export type Apparatus = {
  id: string;
  name: string;
  category: ApparatusCategory;
  quantity: number;
  initialQuantity: number;
  /** @deprecated Kept for backward-compat with old seed data; new apparatus don't track condition. */
  condition?: ApparatusCondition;
  notes?: string;
  qr_code: string;
  created_at: string;
};

export type LogAction =
  | "consumed"
  | "restocked"
  | "broken"
  | "created"
  | "updated"
  | "deleted";

export type ItemType = "chemical" | "apparatus";

export type ConsumptionLog = {
  id: string;
  item_id: string;
  item_type: ItemType;
  item_name: string;
  action: LogAction;
  quantity: number;
  unit?: string;
  logged_by: string; // user id
  logged_by_name: string; // denormalized for fast display
  logged_at: string; // ISO timestamp
  note?: string;
};

export type LabUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
};

/** A minimal helper to format an ISO date as a friendly relative string. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Format a date as e.g. "Mon, 24 Jun" for headers. */
export function formatHeaderDate(d = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Friendly greeting based on local hour. */
export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
