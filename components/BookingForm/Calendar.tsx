"use client";
import { useMemo, useState } from "react";

/** Minimal month calendar showing (deterministic sample) workshop availability. */
export function availability(d: Date): "closed" | "full" | "limited" | "open" {
  if (d.getDay() === 0) return "closed";
  const h = (d.getDate() * 7 + d.getMonth() * 13) % 10;
  return h < 2 ? "full" : h < 5 ? "limited" : "open";
}

export default function Calendar({ value, onChange }: { value: string | null; onChange: (iso: string) => void }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const days = useMemo(() => {
    const first = (month.getDay() + 6) % 7; // Monday first
    const n = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="h-8 w-8 rounded-full border hair disabled:opacity-30">←</button>
        <p className="font-serif text-[22px]">{month.toLocaleString("en-GB", { month: "long", year: "numeric" })}</p>
        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="h-8 w-8 rounded-full border hair">→</button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="label py-1">{d}</span>)}
        {days.map((d, i) => {
          if (!d) return <span key={i} />;
          const a = availability(d);
          const past = d < today;
          const off = past || a === "closed" || a === "full";
          const sel = value === iso(d);
          return (
            <button type="button" key={i} disabled={off} onClick={() => onChange(iso(d))} aria-pressed={sel} aria-label={`${d.toDateString()} — ${past ? "past" : a}`}
              className={`relative grid h-10 place-items-center rounded-full num transition-colors ${sel ? "bg-ink text-gallery" : off ? "text-meta/50 line-through" : "hover:bg-surface"}`}>
              {d.getDate()}
              {!off && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${a === "limited" ? "bg-racing" : "bg-ink/40"} ${sel ? "bg-gallery" : ""}`} />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex gap-4 text-[11px] text-meta"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-ink/40" />Available</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-racing" />Limited bays</span><span className="line-through">Full / closed</span></p>
    </div>
  );
}
