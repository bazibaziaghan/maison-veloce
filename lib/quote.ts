export type QuoteItem = {
  key: string;
  type: "car" | "option" | "part" | "service";
  refId: string;
  label: string;
  sub?: string;
  qty: number;
  partsUSD: number;
  labourUSD: number;
  hours: number;
  /** Max turnaround in days (0 = same day). */
  turnaroundDays: number;
  /** Workshop lane: jobs in different lanes run in parallel. */
  lane?: string;
};

export const lineTotal = (i: QuoteItem) => (i.partsUSD + i.labourUSD) * i.qty;

/**
 * Critical path: jobs in the same lane (same system / same technician bay) run one
 * after another; different lanes run in parallel. Total = the longest lane.
 */
export function criticalPathDays(items: QuoteItem[]) {
  const lanes = new Map<string, number>();
  for (const i of items) {
    if (i.type === "car" || i.type === "option") continue;
    const lane = i.lane ?? i.refId;
    lanes.set(lane, (lanes.get(lane) ?? 0) + Math.max(i.turnaroundDays, i.hours > 0 ? 1 : 0) * (i.type === "part" ? 1 : 1));
  }
  let max = 0;
  lanes.forEach((v) => (max = Math.max(max, v)));
  return { days: max, lanes: lanes.size };
}

/** Adds working days (Mon–Sat workshop) to a date. */
export function addWorkingDays(from: Date, days: number) {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left--;
  }
  return d;
}
