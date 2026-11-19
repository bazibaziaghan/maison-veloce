"use client";
import { useMemo, useState } from "react";
import type { Car } from "@/data/cars";
import { SERVICES } from "@/data/services";
import Price from "@/components/ui/Price";
import { formatTurnaround } from "@/lib/currency";

const svc = (id: string) => SERVICES.find((s) => s.id === id)!;
const COLOURS = ["var(--c-ink)", "#B3121B", "#5B5B5B", "#8A8A8A", "#B8B6B0", "#D9D7D1"];

export function annualCosts(car: Car, km: number) {
  const t = car.serviceTier;
  const tyreLife = car.powertrain === "EV" ? 16000 : 12000;
  const tyres = (svc("tyres").priceByTier[t] ?? 0) * (km / tyreLife);
  const brakePerKm = (svc("brakes-ccm").priceByTier[t] ?? 9500) * 2 / 80000;
  const deprecRate = car.make === "Bugatti" ? 0.04 : car.status === "Pre-owned" ? 0.08 : 0.12;
  return [
    { id: "insurance", label: "Insurance (est.)", usd: car.basePriceUSD * (car.make === "Bugatti" ? 0.011 : 0.021) },
    { id: "service", label: "Scheduled service", usd: svc("annual-service").priceByTier[t] ?? 0 },
    { id: "tyres", label: "Tyres", usd: tyres },
    { id: "brakes", label: "Brakes", usd: brakePerKm * km },
    { id: "detailing", label: "Detailing & PPF care", usd: (svc("detailing").priceByTier[t] ?? 0) * 2 },
    { id: "depreciation", label: "Depreciation (yr 1)", usd: car.basePriceUSD * deprecRate },
  ];
}

export default function OwnershipCost({ car }: { car: Car }) {
  const [km, setKm] = useState(8000);
  const rows = useMemo(() => annualCosts(car, km), [car, km]);
  const year = rows.reduce((n, r) => n + r.usd, 0);
  const max = Math.max(...rows.map((r) => r.usd));
  const tco = (years: number) => {
    const deprec = rows.find((r) => r.id === "depreciation")!.usd;
    const running = year - deprec;
    const rate = deprec / car.basePriceUSD;
    const value = car.basePriceUSD * Math.pow(1 - rate, years);
    const major = Math.floor(years / 3) * ((svc("major-service").priceByTier[car.serviceTier] ?? 0) - (svc("annual-service").priceByTier[car.serviceTier] ?? 0));
    return running * years + (car.basePriceUSD - value) + major;
  };
  const schedule = [1, 2, 3, 4, 5].map((y) => {
    const major = y % 3 === 0;
    const s = svc(major ? "major-service" : "annual-service");
    return { y, name: major ? "Major service" : "Annual service", usd: s.priceByTier[car.serviceTier] ?? 0, time: formatTurnaround(s.turnaround) };
  });

  const W = 640, rowH = 46;
  return (
    <div className="grid gap-12 pb-16 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="flex items-end justify-between">
          <div>
            <p className="label">Annual running cost</p>
            <Price usd={year} className="mt-1 block font-serif text-[48px] leading-none" />
          </div>
          <label className="w-56 text-right">
            <span className="label">Distance per year</span>
            <input type="range" min={1000} max={30000} step={500} value={km} onChange={(e) => setKm(Number(e.target.value))} className="scrub mt-3 w-full" aria-label="Kilometres per year" />
            <span className="num mt-1 block text-[13px]">{km.toLocaleString()} km</span>
          </label>
        </div>
        <svg viewBox={`0 0 ${W} ${rows.length * rowH}`} className="mt-8 w-full" role="img" aria-label="Annual running cost breakdown">
          {rows.map((r, i) => {
            const w = Math.max(2, (r.usd / max) * (W - 220));
            return (
              <g key={r.id} transform={`translate(0 ${i * rowH})`}>
                <text x={0} y={22} fontSize={12} fill="var(--c-ink)">{r.label}</text>
                <rect x={170} y={10} width={w} height={16} fill={COLOURS[i]} style={{ transition: "width .6s cubic-bezier(.2,.8,.2,1)" }} />
                <line x1={0} x2={W} y1={rowH - 4} y2={rowH - 4} stroke="var(--c-line)" />
              </g>
            );
          })}
        </svg>
        <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] md:grid-cols-3">
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-center justify-between gap-2 border-b hair py-1.5">
              <span className="flex items-center gap-2"><span className="h-2 w-2" style={{ background: COLOURS[i] }} />{r.label.split(" (")[0]}</span>
              <Price usd={Math.round(r.usd)} />
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-px bg-line">
          {[3, 5].map((y) => (
            <div key={y} className="bg-gallery p-5">
              <p className="label">{y}-year total cost of ownership</p>
              <Price usd={Math.round(tco(y))} className="mt-2 block font-serif text-[34px] text-racing" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-meta">Estimates for illustration: insurance varies by driver and location; depreciation is a market assumption, not advice.</p>
      </div>
      <div>
        <p className="label">Service schedule</p>
        <ol className="relative mt-6 border-l border-ink/20 pl-6">
          {schedule.map((s) => (
            <li key={s.y} className="relative pb-7 last:pb-0">
              <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-gallery ${s.name.startsWith("Major") ? "bg-racing" : "bg-ink"}`} />
              <p className="label">Year {s.y}</p>
              <p className="mt-1 text-[14px]">{s.name} · <Price usd={s.usd} /> · {s.time}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
