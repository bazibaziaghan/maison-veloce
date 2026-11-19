import { CURRENCIES, type CurrencyCode } from "@/data/currency";

export const convert = (usd: number, code: CurrencyCode) => usd * CURRENCIES[code].rate;

/** Full value, e.g. "$3,825,000" / "₦ 5,909,625,000". */
export function formatFull(usd: number, code: CurrencyCode) {
  const c = CURRENCIES[code];
  const v = Math.round(convert(usd, code));
  const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.abs(v));
  return `${v < 0 ? "−" : ""}${c.symbol}${code === "NGN" ? " " : ""}${n}`;
}

/** Display value: compact for large NGN ("₦ 5.9bn", "₦ 384m"), full otherwise. */
export function formatPrice(usd: number, code: CurrencyCode) {
  const v = convert(usd, code);
  if (code === "NGN" && Math.abs(v) >= 1e7) {
    const abs = Math.abs(v);
    const [d, unit] = abs >= 1e9 ? [abs / 1e9, "bn"] : [abs / 1e6, "m"];
    return `${v < 0 ? "−" : ""}₦ ${d >= 100 ? d.toFixed(0) : d.toFixed(1)}${unit}`;
  }
  return formatFull(usd, code);
}

/** Parses "2–7 days", "3–5 weeks", "Same day" → maximum days (0 for same day). */
export function turnaroundDays(s: string | { min: number; max: number; unit: string }) {
  if (typeof s !== "string") return s.unit === "weeks" ? s.max * 7 : s.unit === "hours" ? 1 : s.max;
  const m = s.match(/(\d+)(?:\s*[–-]\s*(\d+))?\s*(day|week|hour)/i);
  if (!m) return /same/i.test(s) ? 0 : 1;
  const n = Number(m[2] ?? m[1]);
  return /week/i.test(m[3]) ? n * 7 : /hour/i.test(m[3]) ? 1 : n;
}

export function formatTurnaround(t: { min: number; max: number; unit: string; note?: string }) {
  if (t.max === 0) return t.note ?? "Same day";
  const u = t.max === 1 && t.min === 1 ? t.unit.replace(/s$/, "") : t.unit;
  return t.min === t.max ? `${t.max} ${u}` : `${t.min}–${t.max} ${u}`;
}
