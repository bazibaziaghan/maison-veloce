"use client";
/**
 * MECHANIC 2 — "The Garage". One inline <svg> draws a cubic-Bézier rail; cars hang from it at
 * even intervals found with path.getPointAtLength(), each rotated to the path tangent.
 * Hover/focus states are pure CSS transitions. Filtering re-spaces the survivors along the path.
 */
import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CARS, MARQUES, type Car } from "@/data/cars";
import { pointsAlong, type RailPoint } from "@/lib/rail";
import Price from "@/components/ui/Price";
import CarPicture from "@/components/ui/CarPicture";
import { useMediaQuery } from "@/components/ui/hooks";

const DESKTOP = { w: 1600, h: 640, d: "M 40 120 C 420 300, 1180 300, 1560 120" };
const MOBILE = { w: 2400, h: 560, d: "M 60 110 C 800 200, 1600 200, 2340 110" };
const MAX_PRICE = Math.max(...CARS.map((c) => c.basePriceUSD));
const PRICE_STEPS = [300000, 500000, 1000000, MAX_PRICE];

const statusColour: Record<Car["status"], string> = { New: "text-ink", "Pre-owned": "text-ink", Reserved: "text-racing", Sold: "text-meta" };

export default function CurvedRail() {
  const router = useRouter();
  const mobile = useMediaQuery("(max-width: 767px)");
  const geo = mobile ? MOBILE : DESKTOP;
  const pathRef = useRef<SVGPathElement>(null);
  const [marque, setMarque] = useState<string>("All");
  const [cond, setCond] = useState<"All" | "New" | "Pre-owned">("All");
  const [maxPrice, setMaxPrice] = useState(PRICE_STEPS.length - 1);
  const [hover, setHover] = useState<string | null>(null);
  const [pts, setPts] = useState<RailPoint[]>([]);

  const list = useMemo(
    () =>
      CARS.filter(
        (c) =>
          (marque === "All" || c.make === marque) &&
          (cond === "All" || c.status === cond) &&
          c.basePriceUSD <= PRICE_STEPS[maxPrice]
      ),
    [marque, cond, maxPrice]
  );

  // re-space the remaining cars along the path whenever the filtered list changes
  useLayoutEffect(() => {
    if (pathRef.current) setPts(pointsAlong(pathRef.current, list.length, list.length < 4 ? 0.25 : 0.075));
  }, [list.length, geo.d]);

  const posOf = (slug: string) => {
    const i = list.findIndex((c) => c.slug === slug);
    return i >= 0 ? pts[i] : undefined;
  };
  const hovered = hover ? posOf(hover) : undefined;

  return (
    <section id="garage" aria-label="The Garage" className="relative overflow-x-clip border-t hair py-20 md:py-28">
      <div className="container-site flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label">02 — The Garage</p>
          <h2 className="display mt-3 text-[48px] md:text-[80px]">On the rail.</h2>
          <p className="mt-3 max-w-md text-[14px] text-meta">Every car in residence, hung like a collection. Hover to bring one forward; click to enter its studio.</p>
        </div>
        {/* filters */}
        <div className="flex flex-col gap-3 text-[12px]" role="group" aria-label="Rail filters">
          <div className="flex flex-wrap gap-1.5">
            {["All", ...MARQUES].map((m) => (
              <button key={m} onClick={() => setMarque(m)} aria-pressed={marque === m} className={`pill-light h-8 px-3.5 ${marque === m ? "pill-active" : ""}`}>{m}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(["All", "New", "Pre-owned"] as const).map((c) => (
              <button key={c} onClick={() => setCond(c)} aria-pressed={cond === c} className={`pill-light h-8 px-3.5 ${cond === c ? "pill-active" : ""}`}>{c}</button>
            ))}
            <label className="ml-3 flex items-center gap-3">
              <span className="label">Up to</span>
              <input type="range" className="scrub w-28" min={0} max={PRICE_STEPS.length - 1} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} aria-label="Maximum price" />
              <Price usd={PRICE_STEPS[maxPrice]} className="w-24 text-ink" />
            </label>
          </div>
        </div>
      </div>

      <div className={mobile ? "no-scrollbar mt-10 overflow-x-auto snap-x snap-mandatory pb-[130px]" : "mt-6 pb-24"}>
        <div className="relative mx-auto" style={mobile ? { width: Math.max(360, list.length * 185) } : { maxWidth: 1600 }}>
          <svg viewBox={`0 0 ${geo.w} ${geo.h}`} className="block w-full" aria-hidden>
            <defs>
              <radialGradient id="spot" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--c-spot)" stopOpacity="1" />
                <stop offset="60%" stopColor="var(--c-spot)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--c-spot)" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="floor" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--c-ink)" stopOpacity="0.10" />
                <stop offset="100%" stopColor="var(--c-ink)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              rx={mobile ? 230 : 210} ry={mobile ? 150 : 170} fill="url(#spot)"
              style={{ transform: `translate(${hovered?.x ?? geo.w / 2}px, ${(hovered?.y ?? 200) + 210}px)`, opacity: hovered ? 1 : 0, transition: "transform .5s cubic-bezier(.2,.8,.2,1), opacity .4s" }}
            />
            <ellipse cx={geo.w / 2} cy={geo.h - 40} rx={geo.w * 0.45} ry={40} fill="url(#floor)" />
            {/* rail: shadow + tube + end caps */}
            <path d={geo.d} fill="none" stroke="var(--c-ink)" strokeOpacity="0.08" strokeWidth="10" transform="translate(0 8)" />
            <path ref={pathRef} d={geo.d} fill="none" stroke="var(--c-ink)" strokeWidth="2.5" strokeLinecap="round" />
            {/* hangers */}
            {list.map((c, i) => {
              const p = pts[i];
              if (!p) return null;
              return <line key={c.slug} x1={p.x} y1={p.y} x2={p.x} y2={p.y + 70} stroke="var(--c-ink)" strokeWidth="1" style={{ transition: "all .6s cubic-bezier(.2,.8,.2,1)" }} />;
            })}
          </svg>

          {/* the cars (HTML over the SVG so they can use CSS filters, focus rings and tags) */}
          {list.map((c, i) => {
            const p = pts[i];
            if (!p) return null;
            const isHover = hover === c.slug;
            const dim = hover && !isHover;
            return (
              <button
                key={c.slug}
                onMouseEnter={() => setHover(c.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(c.slug)}
                onBlur={() => setHover(null)}
                onClick={() => router.push(`/cars/${c.slug}`)}
                data-cursor="OPEN"
                aria-label={`${c.make} ${c.model}, ${c.status}. Open the car studio`}
                className={`group absolute ${mobile ? "snap-center" : ""} outline-none`}
                style={{
                  left: `${(p.x / geo.w) * 100}%`,
                  top: `${(p.y / geo.h) * 100}%`,
                  width: mobile ? 165 : "clamp(150px, 15.5vw, 240px)",
                  transform: `translate(-50%, 0) rotate(${p.angle}deg) translateY(${isHover ? 2 : 8}%) scale(${isHover ? 1.15 : 1})`,
                  transformOrigin: "50% 0",
                  opacity: dim ? 0.3 : 1,
                  filter: dim ? "grayscale(0.8)" : "none",
                  zIndex: isHover ? 20 : 10,
                  transition: "transform .5s cubic-bezier(.2,.8,.2,1), opacity .35s, filter .35s, left .6s cubic-bezier(.2,.8,.2,1), top .6s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <div className="pt-[34%]">
                  <CarPicture slug={c.slug} view="hero" alt="" sizes="220px" className="w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.06)]" />
                </div>
                {/* price tag on a thread */}
                <span aria-hidden className="mx-auto block h-4 w-px bg-ink/40" />
                <span
                  className={`mx-auto block w-max min-w-[92px] border border-ink/15 bg-surface px-2.5 py-1.5 text-left shadow-[0_6px_20px_-12px_rgba(0,0,0,.35)] transition-all duration-300 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-racing`}
                  style={{ transform: `rotate(${-p.angle}deg)` }}
                >
                  <span className="block text-[10px] font-medium leading-tight">{c.make}</span>
                  <Price usd={c.basePriceUSD} className="block text-[11px] text-racing" />
                  <span className={`grid transition-[grid-template-rows] duration-300 ${isHover ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <span className="overflow-hidden">
                      <span className="mt-1 block border-t hair pt-1 text-[11px] font-medium">{c.model}</span>
                      <span className="flex justify-between gap-3 text-[10px] text-meta">
                        <span className={statusColour[c.status]}>{c.status}</span>
                        <span className="num">0–100 {c.zeroToHundred.toFixed(1)}s</span>
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
          {list.length === 0 && <p className="absolute inset-x-0 top-1/2 text-center text-meta">No cars match these filters.</p>}
        </div>
      </div>
      <p className="container-site mt-4 text-[12px] text-meta num">{list.length} of {CARS.length} cars shown</p>
    </section>
  );
}
