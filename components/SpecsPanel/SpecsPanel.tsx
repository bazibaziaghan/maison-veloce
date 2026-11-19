"use client";
import { useEffect, useState } from "react";
import { CARS, type Car } from "@/data/cars";

type Metric = { id: string; label: string; get: (c: Car) => number; fmt: (v: number) => string; better: "high" | "low" };
const METRICS: Metric[] = [
  { id: "hp", label: "Power", get: (c) => c.hp, fmt: (v) => `${v.toLocaleString()} hp`, better: "high" },
  { id: "tq", label: "Torque", get: (c) => c.torque, fmt: (v) => `${v.toLocaleString()} Nm`, better: "high" },
  { id: "acc", label: "0–100 km/h", get: (c) => c.zeroToHundred, fmt: (v) => `${v.toFixed(1)} s`, better: "low" },
  { id: "acc2", label: "0–200 km/h", get: (c) => c.zeroToTwoHundred, fmt: (v) => `${v.toFixed(1)} s`, better: "low" },
  { id: "vmax", label: "Top speed", get: (c) => c.topSpeed ?? 0, fmt: (v) => `${v} km/h`, better: "high" },
  { id: "kg", label: "Weight", get: (c) => c.weight, fmt: (v) => `${v.toLocaleString()} kg`, better: "low" },
  { id: "pw", label: "Power-to-weight", get: (c) => Math.round((c.hp / c.weight) * 1000), fmt: (v) => `${v} hp/t`, better: "high" },
];

export default function SpecsPanel({ car }: { car: Car }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 60); return () => clearTimeout(t); }, []);
  const facts: [string, string][] = [
    ["Engine layout", car.layout], ["Engine", car.engine], ["Displacement", car.displacement], ["Power", `${car.hp.toLocaleString()} hp`],
    ["Torque", `${car.torque.toLocaleString()} Nm`], ["0–100 km/h", `${car.zeroToHundred.toFixed(1)} s`], ["0–200 km/h", `${car.zeroToTwoHundred.toFixed(1)} s`],
    ["Top speed", car.topSpeed ? `${car.topSpeed} km/h` : "Limited"], ["Weight", `${car.weight.toLocaleString()} kg`],
    ["Power-to-weight", `${Math.round((car.hp / car.weight) * 1000)} hp/tonne`], ["Transmission", car.transmission], ["Drivetrain", car.drivetrain],
    ...(car.range ? [["Electric range", `${car.range} km (WLTP)`] as [string, string]] : []),
    ["Length × width × height", `${car.dimensions.length} × ${car.dimensions.width} × ${car.dimensions.height} mm`], ["Wheelbase", `${car.dimensions.wheelbase} mm`],
    ...(car.mileage ? [["Mileage", `${car.mileage.toLocaleString()} km`] as [string, string]] : []),
  ];
  return (
    <div className="grid gap-12 pb-16 lg:grid-cols-2">
      <dl className="grid grid-cols-2 gap-px bg-line">
        {facts.map(([k, v], i) => (
          <div key={k} className="bg-gallery p-4" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)", transition: `opacity .5s ${i * 35}ms, transform .5s ${i * 35}ms` }}>
            <dt className="label">{k}</dt>
            <dd className="num mt-1.5 text-[15px]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-8">
        <p className="label">Against the other nine</p>
        {METRICS.map((m) => {
          const vals = CARS.map((c) => m.get(c)).filter((v) => v > 0);
          const max = Math.max(...vals), min = Math.min(...vals);
          const sorted = CARS.slice().filter((c) => m.get(c) > 0).sort((a, b) => (m.better === "high" ? m.get(b) - m.get(a) : m.get(a) - m.get(b)));
          const rank = sorted.findIndex((c) => c.slug === car.slug) + 1;
          return (
            <div key={m.id}>
              <div className="mb-2 flex items-baseline justify-between text-[12px]">
                <span className="font-medium">{m.label}</span>
                <span className="num text-meta">{m.fmt(m.get(car))} · <span className="text-ink">#{rank || "—"}</span> of {sorted.length}</span>
              </div>
              <div className="space-y-[3px]">
                {CARS.map((c) => {
                  const v = m.get(c);
                  const pct = v ? (m.better === "high" ? v / max : min / v) * 100 : 0;
                  const me = c.slug === car.slug;
                  return (
                    <div key={c.slug} className="flex items-center gap-2" title={`${c.make} ${c.model}: ${v ? m.fmt(v) : "n/a"}`}>
                      <div className="h-[5px] flex-1 bg-line/60">
                        <div className={`h-full ${me ? "bg-racing" : "bg-ink/25"}`} style={{ width: on ? `${pct}%` : 0, transition: "width .9s cubic-bezier(.2,.8,.2,1)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
