"use client";
/* eslint-disable @next/next/no-img-element */
/**
 * DISASSEMBLE — exploded view. Aligned per-part photo layers don't exist publicly, so each
 * car's parts are drawn as SVG technical illustrations on one shared viewBox. At 0% the real
 * cutout photo sits on top; it crossfades into the illustration as the slider moves.
 * For slider value p, every layer gets ONE matrix() built from p × its explodeVector with a
 * staggered ease. Disassemble/Reassemble tween p in a hand-written rAF loop.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Car } from "@/data/cars";
import { carImg, hasView } from "@/data/cars";
import type { LayerKey, Part } from "@/data/parts";
import { LABOUR_RATES } from "@/data/services";
import { easeInOutCubic, easeOutCubic } from "@/lib/orbit";
import { useStore } from "@/lib/store";
import { formatFull } from "@/lib/currency";
import Price from "@/components/ui/Price";
import { useMediaQuery, useReducedMotion } from "@/components/ui/hooks";

const INK = "var(--c-ink)";
const FILL = "var(--c-fill)";
const FILL2 = "var(--c-fill2)";

/** Shared-viewBox drawings (1200 × 520, nose left, ground y = 440). */
function Drawing({ layer, hot, isEV }: { layer: LayerKey; hot: boolean; isEV: boolean }) {
  const st = { stroke: hot ? "#B3121B" : INK, strokeWidth: hot ? 2.2 : 1.2, strokeLinejoin: "round" as const, vectorEffect: "non-scaling-stroke" as const };
  const wheel = (cx: number, cy: number, far = false) => (
    <g opacity={far ? 0.55 : 1}>
      <circle cx={cx} cy={cy} r={64} fill="var(--c-tyre)" {...st} />
      <circle cx={cx} cy={cy} r={44} fill={FILL} {...st} />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <line key={i} x1={cx + Math.cos(a) * 9} y1={cy + Math.sin(a) * 9} x2={cx + Math.cos(a) * 42} y2={cy + Math.sin(a) * 42} {...st} strokeWidth={hot ? 2 : 1} />;
      })}
      <circle cx={cx} cy={cy} r={8} fill={INK} />
    </g>
  );
  switch (layer) {
    case "body":
      return (
        <g>
          <path d="M95 398 L90 362 Q92 332 130 318 L330 280 Q430 256 472 222 Q545 160 640 155 Q765 158 850 214 L1040 250 Q1096 258 1106 300 L1110 370 Q1106 396 1080 398 L976 398 A76 76 0 0 0 824 398 L376 398 A76 76 0 0 0 224 398 Z" fill={FILL} {...st} />
          <path d="M484 228 Q548 176 640 170 Q742 172 812 214 L770 230 Z" fill="var(--c-glass)" {...st} />
          <path d="M200 340 L1080 330" {...st} fill="none" strokeDasharray="4 6" opacity=".4" />
        </g>
      );
    case "door":
      return <path d="M478 238 L742 234 Q766 300 742 386 L452 388 Q440 300 478 238 Z" fill={FILL2} {...st} />;
    case "hood":
      return <path d="M138 320 L330 284 Q420 262 462 232 L470 252 Q380 292 152 338 Z" fill={FILL2} {...st} />;
    case "bumper-front":
      return <path d="M92 362 Q92 334 128 321 L152 338 L166 398 L95 398 Z M86 402 L176 402" fill={FILL2} {...st} />;
    case "bumper-rear":
      return <g><path d="M1040 300 L1108 300 L1110 372 Q1106 398 1080 398 L1040 398 Z" fill={FILL2} {...st} /><path d="M1050 398 L1060 418 M1072 398 L1082 418 M1094 398 L1100 414" {...st} /></g>;
    case "wheel-fl": return wheel(300, 398);
    case "wheel-rl": return wheel(900, 398);
    case "wheel-fr": return wheel(318, 388, true);
    case "wheel-rr": return wheel(918, 388, true);
    case "brakes":
      return <g><circle cx={300} cy={398} r={38} fill="none" {...st} strokeDasharray="3 3" /><path d="M262 372 A44 44 0 0 1 300 352 L304 366 A30 30 0 0 0 276 380 Z" fill="#B3121B" stroke={INK} strokeWidth={1} /></g>;
    case "engine":
      return isEV ? (
        <g><rect x={830} y={310} width={140} height={70} rx={30} fill={FILL2} {...st} /><circle cx={870} cy={345} r={22} fill="none" {...st} /><circle cx={930} cy={345} r={22} fill="none" {...st} /></g>
      ) : (
        <g>
          <rect x={760} y={262} width={200} height={92} rx={6} fill={FILL2} {...st} />
          {[780, 815, 850, 885, 920].map((x) => <rect key={x} x={x} y={248} width={26} height={22} fill={FILL} {...st} />)}
          <path d="M770 300 H950 M770 320 H950" {...st} opacity=".5" />
          <circle cx={800} cy={354} r={14} fill="none" {...st} />
        </g>
      );
    case "gearbox":
      return <g><path d="M962 282 L1036 290 L1036 350 L962 356 Z" fill={FILL2} {...st} /><path d="M975 300 V340 M995 298 V342 M1015 296 V344" {...st} opacity=".6" /></g>;
    case "suspension":
      return <g><path d="M300 330 L300 350" {...st} />{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M286 ${286 + i * 8} L314 ${290 + i * 8}`} {...st} />)}<rect x={293} y={272} width={14} height={16} fill={FILL2} {...st} /><path d="M240 360 L300 352 L360 362" {...st} fill="none" /></g>;
    case "seats":
      return <g><path d="M560 372 L560 300 Q566 236 600 232 Q626 236 628 262 L622 330 L690 330 Q700 334 698 350 L690 372 Z" fill="#2E2E30" {...st} /><path d="M574 262 Q596 252 612 262" stroke="#B3121B" strokeWidth={2} fill="none" /></g>;
    case "exhaust":
      return <g><path d="M950 360 Q1020 366 1060 352 L1096 350" fill="none" {...st} strokeWidth={hot ? 6 : 5} stroke={hot ? "#B3121B" : "#8A8A8A"} /><ellipse cx={1098} cy={350} rx={6} ry={10} fill="#5A5A5A" {...st} /></g>;
    case "battery":
      return <g><rect x={420} y={378} width={400} height={18} rx={3} fill="#3D4B57" {...st} />{[460, 520, 580, 640, 700, 760].map((x) => <path key={x} d={`M${x} 378 V396`} stroke={FILL} strokeWidth={1} />)}</g>;
  }
}

function centreOf(layer: LayerKey): [number, number] {
  const c: Partial<Record<LayerKey, [number, number]>> = {
    body: [600, 280], door: [600, 310], hood: [300, 285], "bumper-front": [130, 360], "bumper-rear": [1075, 350],
    "wheel-fl": [300, 398], "wheel-rl": [900, 398], "wheel-fr": [318, 388], "wheel-rr": [918, 388], brakes: [300, 398],
    engine: [860, 305], gearbox: [1000, 320], suspension: [300, 320], seats: [630, 300], exhaust: [1020, 355], battery: [620, 387],
  };
  return c[layer] ?? [600, 300];
}

/** p ∈ [0,1] → matrix() for a layer, staggered by its index. */
function layerMatrix(part: Part, idx: number, n: number, p: number) {
  const delay = (idx / n) * 0.35;
  const local = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
  const e = easeInOutCubic(local);
  const v = part.explodeVector;
  const r = ((v.rotate * e) * Math.PI) / 180;
  const s = 1 + (v.scale - 1) * e;
  const [cx, cy] = centreOf(part.layer);
  const a = s * Math.cos(r), b = s * Math.sin(r), c = -s * Math.sin(r), d = s * Math.cos(r);
  // rotate/scale about the layer's centre, then translate along the vector
  const tx = cx - a * cx - c * cy + v.x * e;
  const ty = cy - b * cx - d * cy + v.y * e;
  return `matrix(${a.toFixed(4)} ${b.toFixed(4)} ${c.toFixed(4)} ${d.toFixed(4)} ${tx.toFixed(2)} ${ty.toFixed(2)})`;
}

export default function ExplodedLayers({ car }: { car: Car }) {
  const reduce = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 767px)");
  const parts = useMemo(() => [...car.layers].sort((a, b) => a.zIndex - b.zIndex), [car]);
  const order = useMemo(() => new Map(car.layers.map((p, i) => [p.id, i])), [car]);
  const groups = useRef<Map<string, SVGGElement>>(new Map());
  const photo = useRef<HTMLDivElement>(null);
  const pRef = useRef(0);
  const [pUi, setPUi] = useState(0); // slider value (updated at most per frame)
  const [sel, setSel] = useState<Part | null>(null);
  const [inspected, setInspected] = useState<Set<string>>(new Set());
  const quote = useStore((s) => s.quote);
  const add = useStore((s) => s.addToQuote);
  const currency = useStore((s) => s.currency);
  const tween = useRef(0);

  const paint = (p: number) => {
    pRef.current = p;
    const n = car.layers.length;
    for (const part of parts) {
      const g = groups.current.get(part.id);
      if (g) g.setAttribute("transform", layerMatrix(part, order.get(part.id) ?? 0, n, p));
    }
    if (photo.current) photo.current.style.opacity = String(Math.max(0, 1 - p / 0.14));
  };

  useEffect(() => { paint(pRef.current); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [car]);

  const animateTo = (target: number) => {
    cancelAnimationFrame(tween.current);
    if (reduce) { paint(target); setPUi(target); return; }
    const from = pRef.current, start = performance.now(), dur = 1400 * Math.abs(target - from) + 200;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const v = from + (target - from) * easeOutCubic(t);
      paint(v);
      setPUi(v);
      if (t < 1) tween.current = requestAnimationFrame(step);
    };
    tween.current = requestAnimationFrame(step);
  };

  const choose = (part: Part) => {
    setSel(part);
    setInspected((s) => new Set(s).add(part.id));
    if (pRef.current < 0.5) animateTo(1);
  };

  const rate = LABOUR_RATES[car.serviceTier];
  const studioTotal = quote.filter((q) => q.refId.startsWith(`${car.slug}:part:`)).reduce((n, q) => n + (q.partsUSD + q.labourUSD) * q.qty, 0);
  const photoView = hasView(car, "side") ? "side" : "hero";

  const addPart = (part: Part, mode: "replace" | "refurb") => {
    const labour = part.labourHours * rate;
    add({
      type: "part",
      refId: `${car.slug}:part:${part.id}:${mode}`,
      label: `${mode === "refurb" ? "Refurbish" : "Replace"} — ${part.name}`,
      sub: `${car.make} ${car.model} · ${part.partNumber}`,
      partsUSD: mode === "refurb" ? (part.refurbishOption?.priceUSD ?? part.priceUSD) - labour : part.priceUSD,
      labourUSD: labour,
      hours: part.labourHours,
      turnaroundDays: Math.max(1, parseInt((mode === "refurb" ? part.refurbishOption?.turnaround : part.turnaround) ?? "7") * (/week/.test((mode === "refurb" ? part.refurbishOption?.turnaround : part.turnaround) ?? "") ? 7 : 1)),
      lane: part.layer.startsWith("wheel") ? "wheels" : part.layer,
    });
  };

  return (
    <div className="pb-20">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="relative" data-cursor="EXPLODE">
            <svg viewBox={mobile ? "40 120 1120 360" : "-260 -60 1720 640"} className="block w-full" role="group" aria-label={`Exploded view of the ${car.make} ${car.model}`}>
              <ellipse cx={600} cy={445} rx={520} ry={14} fill="var(--c-ink)" opacity={0.08} />
              {parts.map((part) => {
                const hot = sel?.id === part.id;
                const dim = sel && !hot;
                return (
                  <g
                    key={part.id}
                    ref={(el) => { if (el) groups.current.set(part.id, el); }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${part.name}, ${formatFull(part.priceUSD, currency)}`}
                    onClick={() => choose(part)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), choose(part))}
                    className="cursor-pointer outline-none [&:focus-visible]:opacity-100"
                    style={{ opacity: dim ? 0.3 : 1, filter: dim ? "grayscale(0.8)" : "none", transition: "opacity .3s, filter .3s" }}
                  >
                    <Drawing layer={part.layer} hot={hot} isEV={car.powertrain === "EV"} />
                  </g>
                );
              })}
            </svg>
            {/* real photo at 0% — crossfades out as the car comes apart */}
            <div ref={photo} className="pointer-events-none absolute inset-0 grid place-items-center transition-none" aria-hidden>
              <img src={carImg(car.slug, photoView, 1280)} alt="" className={mobile ? "hidden" : "w-[72%] translate-y-[-10%]"} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button className="pill-dark" onClick={() => animateTo(pRef.current > 0.5 ? 0 : 1)}>{pUi > 0.5 ? "Reassemble" : "Disassemble"}</button>
            <label className="flex flex-1 items-center gap-4">
              <span className="label">Explode</span>
              <input type="range" className="scrub flex-1" min={0} max={100} value={Math.round(pUi * 100)} onChange={(e) => { cancelAnimationFrame(tween.current); const v = Number(e.target.value) / 100; paint(v); setPUi(v); }} aria-label="Explode amount" />
              <span className="num w-12 text-right text-[13px]">{Math.round(pUi * 100)}%</span>
            </label>
          </div>
          <p className="mt-2 text-[11px] text-meta">Illustrated layers — technical drawing, not to scale. Click any part for prices, labour and turnaround.</p>
        </div>

        {/* side panel */}
        <aside className="border-t hair pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-live="polite">
          {!sel ? (
            <div>
              <p className="label">Parts · {car.layers.length}</p>
              <ul className="mt-3 divide-y divide-line border-y hair text-[13px]">
                {car.layers.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => choose(p)} className="flex w-full justify-between gap-3 py-2.5 text-left hover:text-racing">
                      <span>{p.name}</span><Price usd={p.priceUSD} className="shrink-0 text-meta" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ animation: "fade-up .25s ease-out" }}>
              <button className="label hover:text-ink" onClick={() => setSel(null)}>← All parts</button>
              <h3 className="mt-3 font-serif text-[28px] leading-tight">{sel.name}</h3>
              <p className="num mt-1 text-[12px] text-meta">OEM sample part no. {sel.partNumber}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t hair pt-4 text-[12px]">
                <div><dt className="label">Material</dt><dd className="mt-1">{sel.material}</dd></div>
                <div><dt className="label">Weight</dt><dd className="num mt-1">{sel.weightKg} kg</dd></div>
                <div><dt className="label">New OEM part</dt><dd className="mt-1"><Price usd={sel.priceUSD} /></dd></div>
                <div><dt className="label">Labour</dt><dd className="num mt-1">{sel.labourHours} h × <Price usd={rate} />/h</dd></div>
                <div><dt className="label">Labour cost</dt><dd className="mt-1"><Price usd={sel.labourHours * rate} /></dd></div>
                <div><dt className="label">Lifespan</dt><dd className="mt-1">{sel.lifespan}</dd></div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-y hair py-3">
                <span className="label">Total replacement</span>
                <Price usd={sel.priceUSD + sel.labourHours * rate} className="font-serif text-[30px] text-racing" />
              </div>
              <div className="mt-4 grid gap-2">
                {sel.refurbishOption && (
                  <button onClick={() => addPart(sel, "refurb")} className="flex items-center justify-between border hair px-4 py-3 text-left text-[12px] hover:border-ink">
                    <span><span className="label block">Refurbish</span><Price usd={sel.refurbishOption.priceUSD} /> · {sel.refurbishOption.turnaround}</span><span>+ Quote</span>
                  </button>
                )}
                <button onClick={() => addPart(sel, "replace")} className="flex items-center justify-between bg-ink px-4 py-3 text-left text-[12px] text-gallery hover:bg-racing">
                  <span><span className="label block !text-gallery/60">Replace</span><Price usd={sel.priceUSD + sel.labourHours * rate} /> · {sel.turnaround} incl. parts shipping</span><span>+ Quote</span>
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* sticky inspection bar */}
      <div className="sticky bottom-4 z-30 mx-auto mt-8 flex max-w-xl items-center justify-between rounded-full bg-ink px-6 py-3 text-[12px] text-gallery shadow-2xl">
        <span className="num">Parts inspected · {inspected.size} / {car.layers.length}</span>
        <span className="flex items-baseline gap-2"><span className="label !text-gallery/60">Running quote</span><Price usd={studioTotal} className="text-[15px]" /></span>
      </div>
    </div>
  );
}
