"use client";
import Link from "next/link";
import { CARS, type Car } from "@/data/cars";
import type { SortDef } from "@/lib/shuffle";
import ShuffleGrid from "./ShuffleGrid";
import Price from "@/components/ui/Price";
import CarPicture from "@/components/ui/CarPicture";

const SORTS: SortDef<Car>[] = [
  { id: "shuffle", label: "Shuffle" },
  { id: "price-asc", label: "Price ↑", fn: (a, b) => a.basePriceUSD - b.basePriceUSD },
  { id: "price-desc", label: "Price ↓", fn: (a, b) => b.basePriceUSD - a.basePriceUSD },
  { id: "power", label: "Most Powerful", fn: (a, b) => b.hp - a.hp },
  { id: "accel", label: "Fastest 0–100", fn: (a, b) => a.zeroToHundred - b.zeroToHundred },
  { id: "vmax", label: "Top Speed", fn: (a, b) => (b.topSpeed ?? 0) - (a.topSpeed ?? 0) },
  { id: "newest", label: "Newest", fn: (a, b) => b.arrived.localeCompare(a.arrived) },
  { id: "marque", label: "By Marque", fn: (a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model) },
];

export function CarCard({ car }: { car: Car }) {
  return (
    <Link href={`/cars/${car.slug}`} data-cursor="VIEW" className="group block h-full p-4 focus-ring md:p-5">
      <div className="flex items-start justify-between">
        <span className="label">{car.make}</span>
        <span className={`label ${car.status === "Reserved" ? "!text-racing" : ""}`}>{car.status === "New" && car.arrived > "2026-10-01" ? "New arrival" : car.status}</span>
      </div>
      <div className="relative -mx-2 my-2 transition-transform duration-500 group-hover:-translate-y-1">
        <CarPicture slug={car.slug} view="hero" alt={`${car.make} ${car.model}`} sizes="(max-width: 768px) 50vw, 20vw" className="w-full" />
      </div>
      <h3 className="font-serif text-[22px] leading-tight">{car.model}</h3>
      <Price usd={car.basePriceUSD} className="mt-1 block text-[15px] text-racing" />
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t hair pt-3 text-[11px]">
        <div><dt className="label !text-[9px]">Power</dt><dd className="num">{car.hp.toLocaleString()} hp</dd></div>
        <div><dt className="label !text-[9px]">0–100</dt><dd className="num">{car.zeroToHundred.toFixed(1)} s</dd></div>
        <div><dt className="label !text-[9px]">V-max</dt><dd className="num">{car.topSpeed ?? "—"} km/h</dd></div>
      </dl>
    </Link>
  );
}

export default function AllCars() {
  return (
    <section id="all-cars" aria-label="All cars" className="border-t hair py-20 md:py-28">
      <div className="container-site">
        <p className="label">03 — All Cars</p>
        <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[48px] md:text-[80px]">Compare all ten.</h2>
          <p className="max-w-sm text-[13px] text-meta">Re-order the collection instantly. Every figure is live in your chosen currency.</p>
        </div>
        <ShuffleGrid items={CARS} sorts={SORTS} getKey={(c) => c.slug} render={(c) => <CarCard car={c} />} label="Sort cars" />
      </div>
    </section>
  );
}
