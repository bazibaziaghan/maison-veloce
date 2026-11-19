"use client";
/**
 * PRICE LIST — cars, parts and services in one searchable list built on the Mechanic 3 grid
 * (instant re-sort). Clicking any row opens a panel with that item's full specs and price.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { CARS, type Car } from "@/data/cars";
import type { Part } from "@/data/parts";
import { SERVICES, SERVICE_CATEGORIES, LABOUR_RATES, TIER_LABEL, type Service, type Tier } from "@/data/services";
import type { SortDef } from "@/lib/shuffle";
import { formatTurnaround, turnaroundDays } from "@/lib/currency";
import { useStore } from "@/lib/store";
import ShuffleGrid from "@/components/ShuffleGrid/ShuffleGrid";
import Price from "@/components/ui/Price";
import Modal from "@/components/ui/Modal";
import CarPicture from "@/components/ui/CarPicture";
import { ServiceDetail } from "@/components/FloatingParts/FloatingParts";

type Tab = "Cars" | "Parts" | "Services";
type PartRow = Part & { car: Car; key: string; total: number };
type Selected = { kind: "car"; car: Car } | { kind: "part"; part: PartRow } | { kind: "service"; s: Service } | null;

const minPrice = (s: Service) => Math.min(...Object.values(s.priceByTier).filter((v): v is number => v != null));
const partDays = (t: string) => turnaroundDays(t);

const CAR_SORTS: SortDef<Car>[] = [
  { id: "shuffle", label: "Shuffle" },
  { id: "price-asc", label: "Price ↑", fn: (a, b) => a.basePriceUSD - b.basePriceUSD },
  { id: "price-desc", label: "Price ↓", fn: (a, b) => b.basePriceUSD - a.basePriceUSD },
  { id: "power", label: "Most Powerful", fn: (a, b) => b.hp - a.hp },
  { id: "accel", label: "Fastest 0–100", fn: (a, b) => a.zeroToHundred - b.zeroToHundred },
  { id: "marque", label: "By Marque", fn: (a, b) => a.make.localeCompare(b.make) },
];
const PART_SORTS: SortDef<PartRow>[] = [
  { id: "shuffle", label: "Shuffle" },
  { id: "price-asc", label: "Price ↑", fn: (a, b) => a.total - b.total },
  { id: "price-desc", label: "Price ↓", fn: (a, b) => b.total - a.total },
  { id: "fast", label: "Turnaround", fn: (a, b) => partDays(a.turnaround) - partDays(b.turnaround) },
  { id: "hours", label: "Labour hours", fn: (a, b) => a.labourHours - b.labourHours },
  { id: "car", label: "By Car", fn: (a, b) => a.car.make.localeCompare(b.car.make) || a.car.model.localeCompare(b.car.model) },
];
const SERVICE_SORTS: SortDef<Service>[] = [
  { id: "shuffle", label: "Shuffle" },
  { id: "price-asc", label: "Price ↑", fn: (a, b) => minPrice(a) - minPrice(b) },
  { id: "price-desc", label: "Price ↓", fn: (a, b) => minPrice(b) - minPrice(a) },
  { id: "fast", label: "Turnaround", fn: (a, b) => turnaroundDays(a.turnaround) - turnaroundDays(b.turnaround) },
  { id: "hours", label: "Labour hours", fn: (a, b) => a.labourHours.max - b.labourHours.max },
  { id: "cat", label: "Category", fn: (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name) },
];

const PARTS: PartRow[] = CARS.flatMap((car) =>
  car.layers.map((p) => ({ ...p, car, key: `${car.slug}:${p.id}`, total: p.priceUSD + p.labourHours * LABOUR_RATES[car.serviceTier] }))
);

const rowBtn = "grid w-full items-center gap-x-4 gap-y-1 px-4 py-3.5 text-left text-[12px] transition-colors hover:bg-surface focus-ring";
const head = "hidden px-4 pb-2 text-[10px] uppercase tracking-label text-meta md:grid md:gap-x-4";

/* ---------- detail panels ---------- */

function CarPanel({ car }: { car: Car }) {
  const add = useStore((s) => s.addToQuote);
  const specs: [string, string][] = [
    ["Engine", car.engine], ["Power", `${car.hp.toLocaleString()} hp`], ["Torque", `${car.torque.toLocaleString()} Nm`],
    ["0–100 km/h", `${car.zeroToHundred.toFixed(1)} s`], ["0–200 km/h", `${car.zeroToTwoHundred.toFixed(1)} s`], ["Top speed", car.topSpeed ? `${car.topSpeed} km/h` : "Limited"],
    ["Weight", `${car.weight.toLocaleString()} kg`], ["Transmission", car.transmission], ["Drivetrain", car.drivetrain],
    ...(car.range ? [["Electric range", `${car.range} km`] as [string, string]] : []),
    ...(car.mileage ? [["Mileage", `${car.mileage.toLocaleString()} km`] as [string, string]] : []),
    ["Service tier", `Tier ${car.serviceTier} · ${LABOUR_RATES[car.serviceTier]} USD/h labour`],
  ];
  return (
    <div>
      <CarPicture slug={car.slug} view="hero" alt={`${car.make} ${car.model}`} sizes="520px" className="-my-4 w-full" />
      <p className="label">{car.make} · {car.year} · {car.status}</p>
      <div className="mt-2 flex items-baseline justify-between border-b hair pb-3">
        <span className="label">Price</span>
        <Price usd={car.basePriceUSD} from className="font-serif text-[34px] text-racing" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12px]">
        {specs.map(([k, v]) => (<div key={k}><dt className="label">{k}</dt><dd className="num mt-0.5">{v}</dd></div>))}
      </dl>
      <p className="label mt-5">Options from</p>
      <p className="mt-1 text-[12px] text-meta">
        Paint <Price usd={Math.min(...car.colors.filter((c) => c.priceUSD > 0).map((c) => c.priceUSD))} /> · Wheels <Price usd={car.wheels[1].priceUSD} /> · Interior <Price usd={car.interiors[1].priceUSD} />
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href={`/cars/${car.slug}`} className="pill-dark justify-center">Open car studio</Link>
        <button className="pill-light justify-center" onClick={() => add({ type: "car", refId: car.slug, label: `${car.make} ${car.model}`, sub: `${car.year} · ${car.status}`, partsUSD: car.basePriceUSD, labourUSD: 0, hours: 0, turnaroundDays: 0 })}>Add to quote</button>
      </div>
    </div>
  );
}

function PartPanel({ p }: { p: PartRow }) {
  const add = useStore((s) => s.addToQuote);
  const rate = LABOUR_RATES[p.car.serviceTier];
  const labour = p.labourHours * rate;
  const days = partDays(p.turnaround);
  return (
    <div>
      <p className="label">{p.car.make} {p.car.model}</p>
      <p className="num mt-1 text-[12px] text-meta">OEM sample part no. {p.partNumber}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t hair pt-4 text-[12px]">
        <div><dt className="label">Material</dt><dd className="mt-0.5">{p.material}</dd></div>
        <div><dt className="label">Weight</dt><dd className="num mt-0.5">{p.weightKg} kg</dd></div>
        <div><dt className="label">New OEM part</dt><dd className="mt-0.5"><Price usd={p.priceUSD} /></dd></div>
        <div><dt className="label">Labour</dt><dd className="num mt-0.5">{p.labourHours} h × <Price usd={rate} />/h = <Price usd={labour} /></dd></div>
        <div><dt className="label">Turnaround</dt><dd className="mt-0.5">{p.turnaround}</dd></div>
        <div><dt className="label">Lifespan / interval</dt><dd className="mt-0.5">{p.lifespan}</dd></div>
      </dl>
      <div className="mt-4 flex items-baseline justify-between border-y hair py-3">
        <span className="label">Total replacement</span>
        <Price usd={p.total} className="font-serif text-[34px] text-racing" />
      </div>
      {p.refurbishOption && (
        <p className="mt-3 text-[12px]">
          <span className="label">Alternative · </span>Refurbish <Price usd={p.refurbishOption.priceUSD} /> · {p.refurbishOption.turnaround} vs replace <Price usd={p.total} /> · {p.turnaround} incl. parts shipping
        </p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button className="pill-dark justify-center" onClick={() => add({ type: "part", refId: `${p.car.slug}:part:${p.id}:replace`, label: `Replace — ${p.name}`, sub: `${p.car.make} ${p.car.model} · ${p.partNumber}`, partsUSD: p.priceUSD, labourUSD: labour, hours: p.labourHours, turnaroundDays: days, lane: p.layer.startsWith("wheel") ? "wheels" : p.layer })}>Add replacement</button>
        {p.refurbishOption ? (
          <button className="pill-light justify-center" onClick={() => add({ type: "part", refId: `${p.car.slug}:part:${p.id}:refurb`, label: `Refurbish — ${p.name}`, sub: `${p.car.make} ${p.car.model} · ${p.partNumber}`, partsUSD: p.refurbishOption!.priceUSD - labour, labourUSD: labour, hours: p.labourHours, turnaroundDays: partDays(p.refurbishOption!.turnaround), lane: p.layer.startsWith("wheel") ? "wheels" : p.layer })}>Add refurbish</button>
        ) : (
          <Link href={`/cars/${p.car.slug}`} className="pill-light justify-center">See it exploded</Link>
        )}
      </div>
    </div>
  );
}

/* ---------- list ---------- */

export default function PriceList() {
  const [tab, setTab] = useState<Tab>("Cars");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [carFilter, setCarFilter] = useState("All");
  const [sel, setSel] = useState<Selected>(null);
  const needle = q.toLowerCase();

  const cars = useMemo(() => CARS.filter((c) => `${c.make} ${c.model} ${c.engine}`.toLowerCase().includes(needle)), [needle]);
  const parts = useMemo(() => PARTS.filter((p) => (carFilter === "All" || p.car.slug === carFilter) && `${p.name} ${p.partNumber} ${p.material} ${p.car.make} ${p.car.model}`.toLowerCase().includes(needle)), [needle, carFilter]);
  const services = useMemo(() => SERVICES.filter((s) => (cat === "All" || s.category === cat) && `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(needle)), [needle, cat]);

  const count = tab === "Cars" ? cars.length : tab === "Parts" ? parts.length : services.length;
  const title = !sel ? "" : sel.kind === "car" ? sel.car.model : sel.kind === "part" ? sel.part.name : sel.s.name.split(" (")[0];

  return (
    <div>
      <div className="grid gap-px bg-line md:grid-cols-3">
        {([1, 2, 3] as Tier[]).map((t) => (
          <div key={t} className="bg-gallery p-5">
            <p className="label">Tier {t} labour</p>
            <p className="mt-1 font-serif text-[40px] leading-none"><Price usd={LABOUR_RATES[t]} /><span className="text-[16px] text-meta"> /hr</span></p>
            <p className="mt-2 text-[12px] text-meta">{TIER_LABEL[t].split("· ")[1]}</p>
          </div>
        ))}
      </div>

      <div role="tablist" aria-label="Price list sections" className="mt-10 flex gap-1 border-b hair">
        {(["Cars", "Parts", "Services"] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-4 pb-3 text-[13px] font-medium ${tab === t ? "border-racing text-ink" : "border-transparent text-meta hover:text-ink"}`}>
            {t} <span className="num text-meta">{t === "Cars" ? CARS.length : t === "Parts" ? PARTS.length : SERVICES.length}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="flex flex-1 items-center border-b border-ink">
          <span className="sr-only">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "Cars" ? "Search cars — e.g. V12, Porsche" : tab === "Parts" ? "Search parts — e.g. brakes, gearbox, part number" : "Search services — e.g. clutch, PPF, battery"} className="h-11 w-full bg-transparent text-[14px] outline-none placeholder:text-meta" />
        </label>
        {tab === "Parts" && (
          <select value={carFilter} onChange={(e) => setCarFilter(e.target.value)} aria-label="Car" className="h-11 border-b border-ink bg-transparent text-[13px] outline-none">
            <option value="All">All cars</option>{CARS.map((c) => <option key={c.slug} value={c.slug}>{c.make} {c.model}</option>)}
          </select>
        )}
        {tab === "Services" && (
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="h-11 border-b border-ink bg-transparent text-[13px] outline-none">
            <option>All</option>{SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        )}
      </div>
      <p className="mt-3 text-[12px] text-meta">Click any row for full specs and price.</p>

      <div className="mt-5" role="tabpanel" aria-label={tab}>
        {tab === "Cars" && (
          <ShuffleGrid
            key="cars" items={cars} sorts={CAR_SORTS} getKey={(c) => c.slug} label="Sort cars" className="divide-y divide-line border-y hair"
            toolbarExtra={<span className="num ml-auto text-[12px] text-meta">{count} cars</span>}
            header={<div className={`${head} md:grid-cols-[2fr_1fr_.8fr_.7fr_.8fr_.8fr_1fr]`} aria-hidden><span>Car</span><span>Engine</span><span>Power</span><span>0–100</span><span>V-max</span><span>Status</span><span className="text-right">Price</span></div>}
            render={(c) => (
              <button onClick={() => setSel({ kind: "car", car: c })} data-cursor="VIEW" className={`${rowBtn} grid-cols-2 md:grid-cols-[2fr_1fr_.8fr_.7fr_.8fr_.8fr_1fr]`}>
                <span className="col-span-2 md:col-span-1"><span className="block text-[13px] font-medium">{c.make} {c.model}</span><span className="label">{c.year}</span></span>
                <span className="text-meta">{c.engine}</span>
                <span className="num">{c.hp.toLocaleString()} hp</span>
                <span className="num">{c.zeroToHundred.toFixed(1)} s</span>
                <span className="num">{c.topSpeed ?? "—"} km/h</span>
                <span className={c.status === "Reserved" ? "text-racing" : ""}>{c.status}</span>
                <Price usd={c.basePriceUSD} className="text-[13px] text-racing md:text-right" />
              </button>
            )}
          />
        )}
        {tab === "Parts" && (
          <ShuffleGrid
            key="parts" items={parts} sorts={PART_SORTS} getKey={(p) => p.key} label="Sort parts" className="divide-y divide-line border-y hair"
            toolbarExtra={<span className="num ml-auto text-[12px] text-meta">{count} parts</span>}
            header={<div className={`${head} md:grid-cols-[2fr_1.2fr_.9fr_.6fr_.9fr_1fr_1fr]`} aria-hidden><span>Part</span><span>Car</span><span>Part price</span><span>Labour h</span><span>Labour</span><span>Turnaround</span><span className="text-right">Total</span></div>}
            render={(p) => (
              <button onClick={() => setSel({ kind: "part", part: p })} data-cursor="VIEW" className={`${rowBtn} grid-cols-2 md:grid-cols-[2fr_1.2fr_.9fr_.6fr_.9fr_1fr_1fr]`}>
                <span className="col-span-2 md:col-span-1"><span className="block text-[13px] font-medium">{p.name}</span><span className="num label">{p.partNumber}</span></span>
                <span className="text-meta">{p.car.make} {p.car.model}</span>
                <Price usd={p.priceUSD} />
                <span className="num">{p.labourHours} h</span>
                <Price usd={p.labourHours * LABOUR_RATES[p.car.serviceTier]} className="text-meta" />
                <span>{p.turnaround}</span>
                <Price usd={p.total} className="text-[13px] text-racing md:text-right" />
              </button>
            )}
          />
        )}
        {tab === "Services" && (
          <ShuffleGrid
            key="services" items={services} sorts={SERVICE_SORTS} getKey={(s) => s.id} label="Sort services" className="divide-y divide-line border-y hair"
            toolbarExtra={<span className="num ml-auto text-[12px] text-meta">{count} services</span>}
            header={<div className={`${head} md:grid-cols-[2.2fr_.6fr_repeat(3,.9fr)_1fr_.8fr]`} aria-hidden><span>Service</span><span>Labour h</span><span className="text-right">Tier 1</span><span className="text-right">Tier 2</span><span className="text-right">Tier 3</span><span>Turnaround</span><span>Warranty</span></div>}
            render={(s) => (
              <button onClick={() => setSel({ kind: "service", s })} data-cursor="VIEW" className={`${rowBtn} grid-cols-2 md:grid-cols-[2.2fr_.6fr_repeat(3,.9fr)_1fr_.8fr]`}>
                <span className="col-span-2 md:col-span-1"><span className="block text-[13px] font-medium">{s.name}</span><span className="label">{s.category}</span></span>
                <span className="num">{s.labourHours.min === s.labourHours.max ? s.labourHours.max : `${s.labourHours.min}–${s.labourHours.max}`} h</span>
                {([1, 2, 3] as Tier[]).map((t) => (
                  <span key={t} className="md:text-right">
                    <span className="label md:hidden">T{t} </span>
                    {s.priceByTier[t] != null ? <><Price usd={s.priceByTier[t]!} className={t === 2 ? "text-racing" : ""} />{s.priceIsFrom && t === 3 ? "+" : ""}</> : <span className="text-meta">—</span>}
                  </span>
                ))}
                <span>{formatTurnaround(s.turnaround)}</span>
                <span className="text-meta">{s.warranty}</span>
              </button>
            )}
          />
        )}
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title={title}>
        {sel?.kind === "car" && <CarPanel car={sel.car} />}
        {sel?.kind === "part" && <PartPanel p={sel.part} />}
        {sel?.kind === "service" && <ServiceDetail s={sel.s} />}
      </Modal>
    </div>
  );
}
