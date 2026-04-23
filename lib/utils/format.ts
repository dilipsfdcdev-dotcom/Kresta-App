import { format, parseISO, isValid } from "date-fns";

/**
 * Format a number as Indian Rupees using the Indian digit grouping system
 * (lakh/crore): ₹1,23,45,678.00 — never en-US grouping.
 */
export function formatINR(value: number | string | null | undefined, opts?: { showSymbol?: boolean; decimals?: number }): string {
  const { showSymbol = true, decimals = 2 } = opts ?? {};
  if (value === null || value === undefined || value === "") return showSymbol ? "₹0.00" : "0.00";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return showSymbol ? "₹0.00" : "0.00";
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const rendered = formatter.format(n);
  return showSymbol ? `₹${rendered}` : rendered;
}

/** Compact INR for dashboards: 1.23 Cr, 45.67 L */
export function formatINRCompact(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "₹0";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)} K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

/** Display date in DD-MMM-YYYY (e.g., 23-Apr-2026). ISO strings stay ISO in DB. */
export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? parseISO(d) : d;
  if (!isValid(date)) return "";
  return format(date, "dd-MMM-yyyy");
}

export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? parseISO(d) : d;
  if (!isValid(date)) return "";
  return format(date, "dd-MMM-yyyy HH:mm");
}

/** Acres ⇄ guntas conversion. 1 acre = 40 guntas (Telangana standard). */
export const GUNTAS_PER_ACRE = 40;
export function guntasToAcres(guntas: number): number {
  return guntas / GUNTAS_PER_ACRE;
}
export function acresToGuntas(acres: number): number {
  return acres * GUNTAS_PER_ACRE;
}

/** Slugify a project name to uppercase short code used in receipt numbers.
 *  "Meadow Breeze" -> "MB", "Green Valley Phase 2" -> "GVP2" */
export function projectSlugCode(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1 && words[0]) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => {
      const m = /^[0-9]+$/.exec(w);
      return m ? w : (w[0] ?? "").toUpperCase();
    })
    .join("")
    .replace(/[^A-Z0-9]/g, "");
}
