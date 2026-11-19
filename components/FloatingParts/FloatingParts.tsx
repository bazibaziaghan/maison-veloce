"use client";
/**
 * Floating 2D part cutouts at different depths. Each bobs on its own CSS keyframe timing
 * (applied with `translate`), and parallaxes with the mouse through ONE matrix() per element
 * (applied with `transform`) — far parts are smaller, slower and blurred.
 */
import { useEffect, useRef, useState } from "react";
import { SERVICES, type Service, LABOUR_RATES, TIER_LABEL, type Tier } from "@/data/services";
import { formatTurnaround } from "@/lib/currency";
import { useStore } from "@/lib/store";
import Price from "@/components/ui/Price";
import { useReducedMotion } from "@/components/ui/hooks";
import PartArt from "./PartArt";
import BeforeAfter from "./BeforeAfter";
import Modal from "@/components/ui/Modal";

type Floater = { id: string; label: string; service: string; x: number; y: number; depth: number; size: number; dur: number };
export const FLOATERS: Floater[] = [
  { id: "wheel", label: "Forged wheel", service: "wheel-refurb", x: 12, y: 22, depth: 0.9, size: 210, dur: 6.2 },
  { id: "caliper", label: "Carbon-ceramic brakes", service: "brakes-ccm", x: 33, y: 60, depth: 1, size: 190, dur: 5.1 },
  { id: "engine-w16", label: "W16 engine", service: "engine-full", x: 53, y: 18, depth: 0.75, size: 300, dur: 7.4 },
  { id: "engine-v12", label: "V12 engine", service: "engine-top-end", x: 80, y: 30, depth: 0.45, size: 210, dur: 8.1 },
  { id: "engine-v8", label: "V8 engine", service: "major-service", x: 22, y: 78, depth: 0.5, size: 180, dur: 6.8 },
  { id: "gearbox", label: "Gearbox", service: "gearbox-rebuild", x: 70, y: 66, depth: 0.85, size: 230, dur: 5.7 },
  { id: "turbo", label: "Turbocharger", service: "turbos", x: 88, y: 76, depth: 0.65, size: 170, dur: 4.9 },
  { id: "exhaust", label: "Titanium exhaust", service: "exhaust", x: 46, y: 82, depth: 0.55, size: 240, dur: 7.0 },
  { id: "coilover", label: "Coilover", service: "suspension", x: 6, y: 52, depth: 0.4, size: 120, dur: 6.0 },
  { id: "ecu", label: "ECU", service: "ecu-tune", x: 92, y: 12, depth: 0.35, size: 120, dur: 5.4 },
  { id: "battery", label: "Hybrid battery", service: "battery-module", x: 62, y: 44, depth: 0.3, size: 140, dur: 7.9 },
  { id: "steering", label: "Steering wheel", service: "retrim", x: 38, y: 34, depth: 0.6, size: 170, dur: 6.6 },
  { id: "paint-gun", label: "Paint gun", service: "repaint", x: 78, y: 8, depth: 0.25, size: 110, dur: 5.9 },
  { id: "coating", label: "Ceramic coating", service: "ceramic", x: 4, y: 10, depth: 0.2, size: 90, dur: 6.4 },
];

const svc = (id: string) => SERVICES.find((s) => s.id === id)!;
export const fromPrice = (s: Service) => Math.min(...Object.values(s.priceByTier).filter((v): v is number => v != null));
const BA_IMG: Record<string, string> = { "Paint & Body": "/workshop/workshop-1-1280.webp", Interior: "/cars/mclaren-750s/interior-1-1280.webp" };

export function ServiceDetail({ s }: { s: Service }) {
  const add = useStore((st) => st.addToQuote);
  const tiers = ([1, 2, 3] as Tier[]).filter((t) => s.priceByTier[t] != null);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="text-[14px]">{s.description}</p>
        <table className="mt-5 w-full text-[12px]">
          <thead><tr className="border-b hair text-left"><th className="label py-2 font-medium">Tier</th><th className="label py-2 font-medium">Labour</th><th className="label py-2 text-right font-medium">Price</th><th /></tr></thead>
          <tbody>
            {tiers.map((t) => (
              <tr key={t} className="border-b hair">
                <td className="py-2.5" title={TIER_LABEL[t]}>Tier {t}</td>
                <td className="num py-2.5">{s.labourHours.min === s.labourHours.max ? s.labourHours.max : `${s.labourHours.min}–${s.labourHours.max}`} h · <Price usd={LABOUR_RATES[t]} />/h</td>
                <td className="py-2.5 text-right"><Price usd={s.priceByTier[t]!} className="text-racing" />{s.priceIsFrom && t === tiers[tiers.length - 1] ? "+" : ""}</td>
                <td className="py-2.5 pl-3 text-right">
                  <button className="text-[11px] underline underline-offset-2 hover:text-racing" onClick={() => add({ type: "service", refId: `${s.id}:t${t}`, label: s.name, sub: `Tier ${t}`, partsUSD: Math.max(0, s.priceByTier[t]! - s.labourHours.max * LABOUR_RATES[t]), labourUSD: Math.min(s.priceByTier[t]!, s.labourHours.max * LABOUR_RATES[t]), hours: s.labourHours.max, turnaroundDays: s.turnaround.unit === "weeks" ? s.turnaround.max * 7 : s.turnaround.max, lane: s.zones[0] ?? s.id })}>Add</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
          <div><dt className="label">Turnaround</dt><dd className="mt-1">{formatTurnaround(s.turnaround)}{s.turnaround.note && s.turnaround.max ? ` · ${s.turnaround.note}` : ""}</dd></div>
          <div><dt className="label">Warranty</dt><dd className="mt-1">{s.warranty}</dd></div>
        </dl>
        <p className="label mt-5">Included</p>
        <ul className="mt-2 space-y-1 text-[13px]">{s.includes.map((i) => <li key={i} className="flex gap-2"><span className="text-racing">✓</span>{i}</li>)}</ul>
      </div>
      <div>
        <BeforeAfter src={BA_IMG[s.category] ?? "/workshop/workshop-2-1280.webp"} alt={s.name} />
        <a href={`/booking?type=service&service=${s.id}`} className="pill-dark mt-4 w-full justify-center">Book this service</a>
      </div>
    </div>
  );
}

export default function FloatingParts() {
  const reduce = useReducedMotion();
  const els = useRef<(HTMLButtonElement | null)[]>([]);
  const mouse = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const [hover, setHover] = useState<Floater | null>(null);
  const [open, setOpen] = useState<Floater | null>(null);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const move = (e: PointerEvent) => { mouse.current.x = e.clientX / innerWidth - 0.5; mouse.current.y = e.clientY / innerHeight - 0.5; };
    const loop = () => {
      const m = mouse.current;
      m.cx += (m.x - m.cx) * 0.06; m.cy += (m.y - m.cy) * 0.06;
      FLOATERS.forEach((f, i) => {
        const el = els.current[i]; if (!el) return;
        const s = 0.55 + 0.45 * f.depth;
        const tx = -m.cx * 80 * f.depth, ty = -m.cy * 50 * f.depth;
        el.style.transform = `matrix(${s},0,0,${s},${tx.toFixed(2)},${ty.toFixed(2)})`;
      });
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [reduce]);

  const active = hover ?? open;
  return (
    <div className="relative h-[620px] overflow-hidden md:h-[760px]">
      {/* big label */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[60] -translate-y-1/2 text-center" aria-live="polite">
        {active && (
          <div key={active.id} style={{ animation: "fade-up .3s ease-out" }}>
            <p className="display text-[40px] md:text-[76px]">{svc(active.service).name.split(" (")[0]}</p>
            <p className="mt-2 text-[14px]">from <Price usd={fromPrice(svc(active.service))} className="text-racing" /> · {formatTurnaround(svc(active.service).turnaround)}</p>
          </div>
        )}
      </div>
      {FLOATERS.map((f, i) => {
        const dim = open ? open.id !== f.id : false;
        return (
          <button
            key={f.id}
            ref={(el) => { els.current[i] = el; }}
            data-cursor="OPEN"
            aria-label={`${f.label} — ${svc(f.service).name}`}
            onMouseEnter={() => setHover(f)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(f)}
            onBlur={() => setHover(null)}
            onClick={() => setOpen(f)}
            className="absolute will-change-transform"
            style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.size, height: f.size, marginLeft: -f.size / 2, marginTop: -f.size / 2, zIndex: Math.round(f.depth * 50), opacity: dim ? 0.08 : hover && hover.id !== f.id ? 0.35 : 1, filter: `blur(${((1 - f.depth) * 3).toFixed(1)}px)`, transition: "opacity .4s, filter .4s" }}
          >
            <span className="block h-full w-full" style={{ animation: `bob ${f.dur}s ease-in-out ${-i * 0.7}s infinite` }}>
              <PartArt id={f.id} alt={f.label} />
            </span>
          </button>
        );
      })}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? svc(open.service).name.split(" (")[0] : ""}>
        {open && <ServiceDetail s={svc(open.service)} />}
      </Modal>
    </div>
  );
}
