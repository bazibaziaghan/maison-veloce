"use client";
import { useState } from "react";
import { SERVICES, LABOUR_RATES, type Service } from "@/data/services";
import type { SortDef } from "@/lib/shuffle";
import { formatTurnaround, turnaroundDays } from "@/lib/currency";
import ShuffleGrid from "@/components/ShuffleGrid/ShuffleGrid";
import Price from "@/components/ui/Price";
import Modal from "@/components/ui/Modal";
import FloatingParts, { ServiceDetail, fromPrice } from "./FloatingParts";

const SORTS: SortDef<Service>[] = [
  { id: "shuffle", label: "Shuffle" },
  { id: "price-asc", label: "Price ↑", fn: (a, b) => fromPrice(a) - fromPrice(b) },
  { id: "price-desc", label: "Price ↓", fn: (a, b) => fromPrice(b) - fromPrice(a) },
  { id: "turn", label: "Turnaround", fn: (a, b) => turnaroundDays(a.turnaround) - turnaroundDays(b.turnaround) },
  { id: "cat", label: "Category", fn: (a, b) => a.category.localeCompare(b.category) },
];

export default function AtelierView() {
  const [grid, setGrid] = useState(false);
  const [open, setOpen] = useState<Service | null>(null);
  return (
    <section aria-label="The Atelier">
      <div className="container-site flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label">Service &amp; repair</p>
          <h1 className="display mt-3 text-[56px] md:text-[104px]">The Atelier.</h1>
          <p className="mt-2 font-serif text-[24px] italic text-meta">Precision care for exceptional machines.</p>
          <p className="num mt-4 text-[12px] text-meta">Labour <Price usd={LABOUR_RATES[1]} />/h Tier 1 · <Price usd={LABOUR_RATES[2]} />/h Tier 2 · <Price usd={LABOUR_RATES[3]} />/h Tier 3</p>
        </div>
        <div role="radiogroup" aria-label="View" className="flex rounded-full border border-ink/15 p-0.5 text-[12px]">
          {["Floating parts", "Grid view"].map((v, i) => (
            <button key={v} role="radio" aria-checked={grid === !!i} onClick={() => setGrid(!!i)} className={`h-8 rounded-full px-4 ${grid === !!i ? "bg-ink text-gallery" : "text-meta"}`}>{v}</button>
          ))}
        </div>
      </div>
      {!grid ? <FloatingParts /> : (
        <div className="container-site mt-10 pb-20">
          <ShuffleGrid items={SERVICES} sorts={SORTS} getKey={(s) => s.id} label="Sort services" className="grid grid-cols-2 gap-px bg-line md:grid-cols-3 xl:grid-cols-4"
            render={(s) => (
              <button onClick={() => setOpen(s)} data-cursor="OPEN" className="block h-full w-full p-5 text-left hover:bg-surface">
                <p className="label">{s.category}</p>
                <p className="mt-2 font-serif text-[22px] leading-tight">{s.name.split(" (")[0]}</p>
                <p className="mt-3 text-[13px]">from <Price usd={fromPrice(s)} className="text-racing" /></p>
                <p className="mt-1 text-[12px] text-meta">{s.labourHours.max} h · {formatTurnaround(s.turnaround)} · {s.warranty}</p>
              </button>
            )} />
        </div>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name.split(" (")[0] ?? ""}>{open && <ServiceDetail s={open} />}</Modal>
    </section>
  );
}
