"use client";
/**
 * MECHANIC 3 — the Shuffle Grid. Clicking a pill INSTANTLY re-orders the array
 * (Fisher–Yates for Shuffle, Array.sort for the rest) and React re-renders with stable keys.
 * No transition, no animation library, no physics — just a reshuffle function.
 * Reused for cars, services (Price List / Atelier) and parts.
 */
import { useMemo, useState, type ReactNode } from "react";
import { reshuffle, type SortDef } from "@/lib/shuffle";

export default function ShuffleGrid<T>({
  items, sorts, getKey, render, className = "grid grid-cols-2 gap-px bg-line md:grid-cols-3 xl:grid-cols-5", toolbarExtra, label = "Sort", header,
}: {
  items: T[];
  sorts: SortDef<T>[];
  getKey: (t: T) => string;
  render: (t: T, index: number) => ReactNode;
  className?: string;
  toolbarExtra?: ReactNode;
  label?: string;
  header?: ReactNode;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);

  // keep the user's chosen order, but let filtered-out / new items through
  const view = useMemo(() => {
    if (!order) return items;
    const idx = new Map(order.map((k, i) => [k, i]));
    return items.slice().sort((a, b) => (idx.get(getKey(a)) ?? 1e9) - (idx.get(getKey(b)) ?? 1e9));
  }, [items, order, getKey]);

  const apply = (def: SortDef<T>) => {
    setActive(def.id);
    setOrder(reshuffle(items, def).map(getKey));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-1.5" role="toolbar" aria-label={label}>
        {sorts.map((s) => (
          <button
            key={s.id}
            onClick={() => apply(s)}
            aria-pressed={active === s.id}
            className={`pill-light h-8 px-3.5 text-[12px] ${active === s.id ? "pill-active" : ""}`}
          >
            {s.label}
          </button>
        ))}
        {toolbarExtra}
      </div>
      {header}
      <ul className={className} aria-live="polite">
        {view.map((t, i) => (
          <li key={getKey(t)} className="bg-gallery">
            {render(t, i)}
          </li>
        ))}
      </ul>
    </div>
  );
}
