"use client";
/* eslint-disable @next/next/no-img-element */
/**
 * EXTERIOR — 360° spin built from the real angles we have (front 3/4, side, rear 3/4 …),
 * mirrored to fill the other side, and interpolated into 36 virtual frames (every 10°)
 * with a crossfade + slight scale/skew. Drag maps Δx → yaw with the same hand-written
 * inertia as the Orbit Wheel. All per-frame writes go straight to the DOM via refs.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { Car, SpinKey } from "@/data/cars";
import { carImg } from "@/data/cars";
import { useOnScreen, useReducedMotion } from "@/components/ui/hooks";
import Price from "@/components/ui/Price";
import boxesJson from "@/data/image-boxes.json";

type Key = SpinKey & { id: string };
type Hotspot = { id: string; kind: "wheel" | "brakes" | "aero" | "lights"; x: number; y: number };

/**
 * Hotspot positions in % of the CAR's bounding box (measured per cutout by scripts/build-meta.py),
 * defined for a nose-LEFT image; mirrored when the key shows the car nose-right (angle > 180).
 */
const SPOTS: Record<string, Hotspot[]> = {
  side: [
    { id: "w", kind: "wheel", x: 19, y: 80 }, { id: "b", kind: "brakes", x: 79, y: 80 },
    { id: "l", kind: "lights", x: 5, y: 45 }, { id: "a", kind: "aero", x: 95, y: 32 },
  ],
  front34: [
    { id: "w", kind: "wheel", x: 27, y: 80 }, { id: "b", kind: "brakes", x: 82, y: 68 },
    { id: "l", kind: "lights", x: 12, y: 50 }, { id: "a", kind: "aero", x: 9, y: 88 },
  ],
  rear34: [
    { id: "w", kind: "wheel", x: 62, y: 80 }, { id: "b", kind: "brakes", x: 12, y: 68 },
    { id: "l", kind: "lights", x: 86, y: 45 }, { id: "a", kind: "aero", x: 80, y: 22 },
  ],
};
const BOXES = boxesJson as unknown as Record<string, Record<string, [number, number, number, number]>>;

const norm = (a: number) => ((a % 360) + 360) % 360;
const angDist = (a: number, b: number) => { const d = Math.abs(norm(a) - norm(b)); return Math.min(d, 360 - d); };

export default function SpinViewer({ car, paint, onHotspot }: { car: Car; paint: string; onHotspot?: (kind: string) => void }) {
  const reduce = useReducedMotion();
  const { ref: stage, visible } = useOnScreen<HTMLDivElement>();
  // real keys + their mirrors
  const keys: Key[] = useMemo(() => {
    const out: Key[] = [];
    for (const k of car.spin) {
      if (!car.views.includes(k.view)) continue;
      out.push({ ...k, id: `${k.view}-${k.angle}` });
      const m = norm(360 - k.angle);
      if (angDist(m, k.angle) > 20) out.push({ view: k.view, angle: m, flip: !k.flip, id: `${k.view}-${m}-m` });
    }
    return out.sort((a, b) => a.angle - b.angle);
  }, [car]);

  const yaw = useRef(keys[0]?.angle ?? 45);
  const vel = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const imgs = useRef<(HTMLDivElement | null)[]>([]);
  const frameEl = useRef<HTMLSpanElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [domKey, setDomKey] = useState<string>(keys[0]?.id ?? "");
  const [spot, setSpot] = useState<Hotspot | null>(null);

  // progressive preload of every key in the current paint, with a thin progress line
  useEffect(() => {
    let n = 0;
    setLoaded(0);
    const urls = Array.from(new Set(keys.map((k) => carImg(car.slug, k.view, 1280, paint))));
    urls.forEach((u, i) => {
      const im = new Image();
      im.onload = im.onerror = () => setLoaded(++n / urls.length);
      setTimeout(() => (im.src = u), i * 60);
    });
  }, [keys, car.slug, paint]);

  useEffect(() => {
    let raf = 0;
    let lastDom = "";
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible.current) return;
      if (!dragging.current && Math.abs(vel.current) > 0.02) {
        yaw.current += vel.current;
        vel.current *= 0.94;
      }
      const a = norm(yaw.current);
      // two nearest keys around the current yaw
      let best = 0, second = 1;
      const d = keys.map((k) => angDist(a, k.angle));
      d.forEach((v, i) => { if (v < d[best]) { second = best; best = i; } else if (i !== best && v < d[second]) second = i; });
      const d1 = d[best], d2 = d[second] ?? 999;
      const w1 = keys.length > 1 ? d2 / (d1 + d2) : 1; // weight of nearest
      const mix = 1 - w1; // 0 → sitting on a key, 0.5 → halfway
      keys.forEach((k, i) => {
        const el = imgs.current[i];
        if (!el) return;
        const w = i === best ? Math.min(1, w1 * 1.6) : i === second ? Math.max(0, (1 - w1) * 1.6 - 0.3) : 0;
        const toward = Math.sign(norm(a - k.angle + 180) - 180) || 1;
        const s = 1 - 0.05 * Math.sin(Math.PI * mix);
        const skew = (i === best ? 1 : -1) * toward * 4 * mix;
        const fx = k.flip ? -1 : 1;
        el.style.opacity = w.toFixed(3);
        el.style.transform = `matrix(${(s * fx).toFixed(4)}, 0, ${Math.tan((skew * Math.PI) / 180).toFixed(4)}, ${s.toFixed(4)}, 0, 0)`;
      });
      if (frameEl.current) frameEl.current.textContent = String(Math.round(a / 10) % 36).padStart(2, "0");
      const dom = keys[best]?.id ?? "";
      const settled = d1 < 6;
      const want = settled ? dom : "";
      if (want !== lastDom) { lastDom = want; setDomKey(want); } // only when hotspot set changes
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [keys, visible]);

  const snapToNearestKey = () => {
    if (reduce) vel.current = 0;
  };

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true; vel.current = 0;
    lastX.current = e.clientX; lastT.current = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    const now = performance.now();
    const dA = -dx * 0.45; // degrees per px
    yaw.current += dA;
    vel.current = (dA / Math.max(1, now - lastT.current)) * 16.7;
    lastX.current = e.clientX; lastT.current = now;
  };
  const onUp = () => { dragging.current = false; snapToNearestKey(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { yaw.current += 10; e.preventDefault(); }
    if (e.key === "ArrowRight") { yaw.current -= 10; e.preventDefault(); }
  };

  const dominant = keys.find((k) => k.id === domKey);
  const spotSet = dominant ? SPOTS[dominant.view === "side" ? "side" : dominant.view === "rear" ? "rear34" : "front34"] : [];
  const box = dominant ? BOXES[car.slug]?.[dominant.view] ?? [8, 12, 92, 88] : [0, 0, 0, 0];
  const mirror = dominant ? norm(dominant.angle) > 180 : false;
  const hotspots = dominant
    ? spotSet.map((s) => {
        const rx = mirror ? 100 - s.x : s.x;
        const bx = dominant.flip ? [100 - box[2], 100 - box[0]] : [box[0], box[2]];
        return { ...s, x: bx[0] + (rx / 100) * (bx[1] - bx[0]), y: box[1] + (s.y / 100) * (box[3] - box[1]) };
      })
    : [];

  const part = (kind: string) => {
    const L = car.layers;
    if (kind === "wheel") return { name: L.find((p) => p.layer === "wheel-fl")!.name, spec: L.find((p) => p.layer === "wheel-fl")!.material, price: L.find((p) => p.layer === "wheel-fl")!.priceUSD };
    if (kind === "brakes") { const b = L.find((p) => p.layer === "brakes")!; return { name: b.name, spec: b.material, price: b.priceUSD }; }
    if (kind === "aero") { const b = L.find((p) => p.layer === "bumper-rear")!; return { name: "Active aero / diffuser", spec: b.material, price: b.priceUSD }; }
    return { name: "Matrix LED headlight unit", spec: "Adaptive LED, laser high-beam (where fitted)", price: car.serviceTier === 3 ? 28000 : car.serviceTier === 2 ? 7200 : 3800 };
  };

  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-0 h-px bg-line" aria-hidden>
        <div className="h-px origin-left bg-ink transition-transform duration-300" style={{ transform: `scaleX(${loaded})`, opacity: loaded >= 1 ? 0 : 1 }} />
      </div>
      <div
        ref={stage}
        tabIndex={0}
        role="img"
        aria-label={`${car.make} ${car.model} — drag or use arrow keys to rotate 360 degrees`}
        data-cursor="DRAG"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="cove relative aspect-[2/1] w-full cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing"
      >
        {keys.map((k, i) => (
          <div key={k.id} ref={(el) => { imgs.current[i] = el; }} className="absolute inset-0 will-change-transform" style={{ opacity: i === 0 ? 1 : 0 }}>
            <img src={carImg(car.slug, k.view, 1280, paint)} alt="" draggable={false} className="h-full w-full object-contain transition-opacity duration-500" />
          </div>
        ))}
        {hotspots.map((h) => {
          const p = part(h.kind);
          return (
            <button
              key={h.id}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseEnter={() => setSpot(h)}
              onMouseLeave={() => setSpot(null)}
              onFocus={() => setSpot(h)}
              onBlur={() => setSpot(null)}
              onClick={() => onHotspot?.(h.kind)}
              aria-label={`${p.name}: replacement from ${p.price} US dollars`}
            >
              <span className="hotspot block" />
              {spot?.id === h.id && (
                <span className="absolute left-5 top-1/2 w-60 -translate-y-1/2 border border-ink/10 bg-surface/95 p-3 text-left shadow-xl backdrop-blur" style={{ animation: "fade-up .2s ease-out" }}>
                  <span className="label block">{h.kind}</span>
                  <span className="mt-1 block text-[13px] font-medium">{p.name}</span>
                  <span className="block text-[11px] text-meta">{p.spec}</span>
                  <span className="mt-2 flex items-baseline justify-between border-t hair pt-2 text-[11px]"><span className="label">Replacement</span><Price usd={p.price} className="text-racing" /></span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-meta">
        <span className="label">Drag to rotate · ← → keys</span>
        <span className="num">Frame <span ref={frameEl}>00</span> / 36 · built from {car.spin.filter((k) => car.views.includes(k.view)).length} real angles</span>
      </div>
    </div>
  );
}
