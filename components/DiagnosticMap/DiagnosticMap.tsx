"use client";
/** Top-down blueprint SVG with clickable zones; symptoms light up the likely zones and services. */
import { useMemo, useState } from "react";
import { CARS } from "@/data/cars";
import { SERVICES, LABOUR_RATES, type Tier } from "@/data/services";
import { formatTurnaround } from "@/lib/currency";
import { useStore } from "@/lib/store";
import Price from "@/components/ui/Price";

const ZONES: { id: string; label: string; shape: JSX.Element }[] = [
  { id: "engine", label: "Engine bay", shape: <rect x="250" y="440" width="200" height="190" rx="10" /> },
  { id: "brakes-front", label: "Front brakes", shape: <g><circle cx="200" cy="200" r="34" /><circle cx="500" cy="200" r="34" /></g> },
  { id: "brakes-rear", label: "Rear brakes", shape: <g><circle cx="200" cy="640" r="34" /><circle cx="500" cy="640" r="34" /></g> },
  { id: "suspension", label: "Suspension", shape: <g><rect x="236" y="170" width="40" height="60" /><rect x="424" y="170" width="40" height="60" /><rect x="236" y="610" width="40" height="60" /><rect x="424" y="610" width="40" height="60" /></g> },
  { id: "gearbox", label: "Gearbox", shape: <rect x="300" y="640" width="100" height="70" rx="8" /> },
  { id: "exhaust", label: "Exhaust", shape: <path d="M300 720 L290 790 M400 720 L410 790 M280 790 h30 M390 790 h30" strokeWidth="16" /> },
  { id: "electrics", label: "Electrics", shape: <rect x="290" y="110" width="120" height="70" rx="6" /> },
  { id: "interior", label: "Interior", shape: <rect x="240" y="280" width="220" height="150" rx="16" /> },
  { id: "bodywork", label: "Bodywork", shape: <path d="M350 30 C470 30 540 80 545 180 L560 700 C560 780 480 820 350 820 C220 820 140 780 140 700 L155 180 C160 80 230 30 350 30 Z" fill="none" strokeWidth="18" /> },
  { id: "wheels", label: "Wheels & tyres", shape: <g><rect x="130" y="150" width="46" height="100" rx="12" /><rect x="524" y="150" width="46" height="100" rx="12" /><rect x="130" y="590" width="46" height="100" rx="12" /><rect x="524" y="590" width="46" height="100" rx="12" /></g> },
];

const SYMPTOMS: { id: string; label: string; zones: string[]; services: string[] }[] = [
  { id: "grind", label: "Grinding when braking", zones: ["brakes-front", "brakes-rear"], services: ["brakes-ccm", "brakes-steel", "diagnostic"] },
  { id: "cel", label: "Check engine light", zones: ["engine", "electrics"], services: ["diagnostic", "turbos", "engine-top-end"] },
  { id: "jerk", label: "Gearbox jerks", zones: ["gearbox"], services: ["clutch", "gearbox-rebuild", "diagnostic"] },
  { id: "ac", label: "AC not cooling", zones: ["interior", "electrics"], services: ["ac", "diagnostic"] },
  { id: "scratch", label: "Scratch on door", zones: ["bodywork"], services: ["repaint", "ceramic", "ppf"] },
  { id: "pull", label: "Pulls to one side", zones: ["suspension", "wheels"], services: ["alignment", "suspension", "tyres"] },
  { id: "clunk", label: "Clunk over bumps", zones: ["suspension"], services: ["suspension", "nose-lift"] },
  { id: "range", label: "Hybrid range dropping", zones: ["electrics"], services: ["battery-check", "battery-module"] },
  { id: "drone", label: "Exhaust rattle / drone", zones: ["exhaust"], services: ["exhaust", "diagnostic"] },
  { id: "curb", label: "Kerbed wheel", zones: ["wheels"], services: ["wheel-refurb", "alignment"] },
];

export default function DiagnosticMap() {
  const [carSlug, setCar] = useState<string>(CARS[0].slug);
  const [picked, setPicked] = useState<string[]>([]);
  const [zone, setZone] = useState<string | null>(null);
  const add = useStore((s) => s.addToQuote);
  const tier: Tier = carSlug === "other" ? 2 : CARS.find((c) => c.slug === carSlug)!.serviceTier;

  const glow = useMemo(() => new Set([...picked.flatMap((p) => SYMPTOMS.find((s) => s.id === p)!.zones), ...(zone ? [zone] : [])]), [picked, zone]);
  const services = useMemo(() => {
    const ids = new Set(picked.flatMap((p) => SYMPTOMS.find((s) => s.id === p)!.services));
    if (zone) SERVICES.filter((s) => s.zones.includes(zone)).forEach((s) => ids.add(s.id));
    return SERVICES.filter((s) => ids.has(s.id) && s.priceByTier[tier] != null);
  }, [picked, zone, tier]);

  const priceFor = (s: (typeof SERVICES)[number]) => s.priceByTier[tier] ?? 0;

  return (
    <section id="diagnostic" aria-label="Diagnostic visualiser" className="border-t hair py-20">
      <div className="container-site">
        <p className="label">Diagnostic visualiser</p>
        <h2 className="display mt-3 text-[44px] md:text-[72px]">Tell us what it’s doing.</h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-[380px_1fr_360px]">
          <div>
            <label className="label" htmlFor="diag-car">Your car</label>
            <select id="diag-car" value={carSlug} onChange={(e) => setCar(e.target.value)} className="mt-2 h-11 w-full border-b border-ink bg-transparent text-[14px] outline-none">
              {CARS.map((c) => <option key={c.slug} value={c.slug}>{c.make} {c.model}</option>)}
              <option value="other">Other make / model (Tier 2 estimate)</option>
            </select>
            <p className="label mt-8">Symptoms</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SYMPTOMS.map((s) => {
                const on = picked.includes(s.id);
                return <button key={s.id} aria-pressed={on} onClick={() => setPicked(on ? picked.filter((x) => x !== s.id) : [...picked, s.id])} className={`pill-light h-8 px-3.5 text-[12px] ${on ? "!border-racing bg-racing text-white" : ""}`}>{s.label}</button>;
              })}
            </div>
            {(picked.length > 0 || zone) && <button onClick={() => { setPicked([]); setZone(null); }} className="label mt-4 underline">Clear</button>}
          </div>

          <svg viewBox="0 0 700 850" className="mx-auto w-full max-w-[420px]" role="group" aria-label="Car blueprint, top-down. Select a zone.">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0 H0 V20" fill="none" stroke="var(--c-ink)" strokeOpacity=".05" /></pattern>
              <filter id="g"><feGaussianBlur stdDeviation="8" /></filter>
            </defs>
            <rect width="700" height="850" fill="url(#grid)" />
            <path d="M350 30 C470 30 540 80 545 180 L560 700 C560 780 480 820 350 820 C220 820 140 780 140 700 L155 180 C160 80 230 30 350 30 Z" fill="var(--c-surface)" stroke="var(--c-ink)" strokeWidth="1.5" />
            <path d="M230 270 Q350 230 470 270 L460 300 Q350 270 240 300 Z M240 440 Q350 470 460 440 L470 470 Q350 500 230 470Z" fill="var(--c-glass)" stroke="var(--c-ink)" />
            {ZONES.map((z) => {
              const on = glow.has(z.id);
              return (
                <g key={z.id} role="button" tabIndex={0} aria-pressed={zone === z.id} aria-label={z.label}
                  onClick={() => setZone(zone === z.id ? null : z.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setZone(zone === z.id ? null : z.id))}
                  className="cursor-pointer outline-none [&:focus-visible>g.base]:stroke-racing">
                  {on && <g fill="#B3121B" stroke="#B3121B" filter="url(#g)" style={{ animation: "glow 1.6s ease-in-out infinite" }}>{z.shape}</g>}
                  <g className="base" fill={on ? "#B3121B" : "var(--c-fill)"} fillOpacity={on ? 0.85 : 1} stroke={on ? "#B3121B" : "var(--c-ink)"} strokeWidth="1.5" style={{ transition: "fill .3s, stroke .3s" }}>{z.shape}</g>
                  <title>{z.label}</title>
                </g>
              );
            })}
            <text x="350" y="20" textAnchor="middle" fontSize="11" letterSpacing="3" fill="#8A8A8A">FRONT</text>
          </svg>

          <div aria-live="polite">
            <p className="label">Likely work {zone ? `· ${ZONES.find((z) => z.id === zone)?.label}` : ""}</p>
            {services.length === 0 ? (
              <p className="mt-3 text-[14px] text-meta">Tap a symptom or a zone on the blueprint.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-y hair">
                {services.map((s) => {
                  const p = priceFor(s);
                  const lo = Math.round(p * 0.85 / 50) * 50, hi = Math.round(p * 1.2 / 50) * 50;
                  return (
                    <li key={s.id} className="py-3">
                      <p className="text-[13px] font-medium">{s.name}</p>
                      <p className="mt-1 text-[12px] text-meta"><Price usd={lo} /> – <Price usd={hi} /> · {s.labourHours.max} h · {formatTurnaround(s.turnaround)}</p>
                      <button className="mt-2 text-[11px] underline underline-offset-2 hover:text-racing" onClick={() => add({ type: "service", refId: `${s.id}:t${tier}`, label: s.name, sub: `Tier ${tier} · from diagnosis`, partsUSD: Math.max(0, p - s.labourHours.max * LABOUR_RATES[tier]), labourUSD: Math.min(p, s.labourHours.max * LABOUR_RATES[tier]), hours: s.labourHours.max, turnaroundDays: s.turnaround.unit === "weeks" ? s.turnaround.max * 7 : s.turnaround.max, lane: s.zones[0] ?? s.id })}>Add to quote</button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-meta">Ranges are indicative until a technician inspects the car. A full diagnostic scan is credited against any resulting repair.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
