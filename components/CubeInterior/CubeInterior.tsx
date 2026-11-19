"use client";
/* eslint-disable @next/next/no-img-element */
/**
 * INTERIOR. Two renderers sharing one inertia model and one hotspot set:
 *  • PanoStrip — the best real interior photo as a drag-to-pan strip (translate + slight
 *    perspective lean from velocity). Used when we have interior photography.
 *  • Cube — six faces on a CSS 3D cube (rotateY/rotateX + translateZ, camera inside),
 *    drawn as clean illustrations in the selected trim. Used when no photo exists.
 * Gyroscope look-around on mobile for both.
 */
import { useEffect, useRef, useState } from "react";
import type { Car, InteriorTrim } from "@/data/cars";
import { interiorShots } from "@/data/cars";
import { useReducedMotion } from "@/components/ui/hooks";
import Price from "@/components/ui/Price";
import { useStore } from "@/lib/store";
import { LABOUR_RATES } from "@/data/services";

type Spot = { id: string; name: string; material: (t: InteriorTrim) => string; upgrade: number; retrim: number; hours: number; time: string; yaw: number; pitch: number; px: number; py: number };

function spots(car: Car): Spot[] {
  const k = car.serviceTier === 3 ? 3.2 : car.serviceTier === 2 ? 1.5 : 1;
  return [
    { id: "seats", name: "Seats", material: (t) => t.material, upgrade: 9800 * k, retrim: 6200 * k, hours: 24, time: "10–14 days", yaw: 150, pitch: 15, px: 68, py: 72 },
    { id: "wheel", name: "Steering wheel", material: () => "Alcantara rim, carbon shift paddles", upgrade: 3400 * k, retrim: 1400 * k, hours: 4, time: "4 days", yaw: 0, pitch: 18, px: 34, py: 52 },
    { id: "infotainment", name: "Infotainment", material: () => "Portrait touchscreen, haptic controls", upgrade: 4200 * k, retrim: 2600 * k, hours: 5, time: "3–7 days", yaw: 20, pitch: 5, px: 54, py: 42 },
    { id: "dash", name: "Dashboard", material: (t) => (t.id === "bespoke" ? "Open-pore carbon & full-grain leather" : "Carbon fibre with " + t.material.toLowerCase()), upgrade: 7600 * k, retrim: 5400 * k, hours: 20, time: "2 weeks", yaw: -25, pitch: 0, px: 44, py: 30 },
    { id: "headliner", name: "Headliner", material: () => "Alcantara (starlight optional)", upgrade: 6800 * k, retrim: 2900 * k, hours: 12, time: "5 days", yaw: 0, pitch: 80, px: 50, py: 6 },
    { id: "audio", name: "Sound system", material: () => "Bowers & Wilkins-class 12-speaker", upgrade: 8900 * k, retrim: 1800 * k, hours: 6, time: "3 days", yaw: 75, pitch: -5, px: 86, py: 58 },
  ];
}

/** Shared inertia: drag/gyro → yaw/pitch with friction 0.94. */
function useLook(onFrame: (yaw: number, pitch: number, vYaw: number) => void, limits: { pitch: number; yaw?: number }) {
  const reduce = useReducedMotion();
  const s = useRef({ yaw: 0, pitch: 0, vy: 0, vp: 0, drag: false, x: 0, y: 0, t: 0 });
  const cb = useRef(onFrame);
  cb.current = onFrame;
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const st = s.current;
      if (!st.drag && !reduce) { st.yaw += st.vy; st.pitch += st.vp; st.vy *= 0.94; st.vp *= 0.94; }
      st.pitch = Math.max(-limits.pitch, Math.min(limits.pitch, st.pitch));
      if (limits.yaw != null) st.yaw = Math.max(-limits.yaw, Math.min(limits.yaw, st.yaw));
      cb.current(st.yaw, st.pitch, st.vy);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // gyroscope look-around (mobile)
    const gyro = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      s.current.yaw = -(e.gamma ?? 0) * 2;
      s.current.pitch = ((e.beta ?? 60) - 60) * 0.8;
    };
    window.addEventListener("deviceorientation", gyro);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("deviceorientation", gyro); };
  }, [limits.pitch, limits.yaw, reduce]);
  const handlers = {
    onPointerDown: (e: React.PointerEvent) => { const st = s.current; st.drag = true; st.vy = st.vp = 0; st.x = e.clientX; st.y = e.clientY; st.t = performance.now(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); },
    onPointerMove: (e: React.PointerEvent) => {
      const st = s.current; if (!st.drag) return;
      const now = performance.now(), dt = Math.max(1, now - st.t);
      const dy = (e.clientX - st.x) * -0.18, dp = (e.clientY - st.y) * 0.18;
      st.yaw += dy; st.pitch += dp; st.vy = (dy / dt) * 16.7; st.vp = (dp / dt) * 16.7;
      st.x = e.clientX; st.y = e.clientY; st.t = now;
    },
    onPointerUp: () => { s.current.drag = false; },
    onKeyDown: (e: React.KeyboardEvent) => {
      const m: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] };
      const d = m[e.key]; if (d) { e.preventDefault(); s.current.yaw += d[0]; s.current.pitch += d[1]; }
    },
  };
  return { handlers, state: s };
}

function SpotCard({ car, s, trim, onClose }: { car: Car; s: Spot; trim: InteriorTrim; onClose: () => void }) {
  const add = useStore((st) => st.addToQuote);
  const labour = s.hours * LABOUR_RATES[car.serviceTier];
  return (
    <div className="absolute bottom-4 right-4 z-20 w-72 border border-ink/10 bg-surface/95 p-4 shadow-xl backdrop-blur" style={{ animation: "fade-up .2s ease-out" }} role="dialog" aria-label={s.name}>
      <div className="flex items-start justify-between"><p className="label">Interior · {s.name}</p><button onClick={onClose} aria-label="Close" className="text-meta hover:text-ink">×</button></div>
      <p className="mt-2 text-[13px]">{s.material(trim)}</p>
      <dl className="mt-3 space-y-1.5 border-t hair pt-3 text-[12px]">
        <div className="flex justify-between"><dt className="text-meta">Upgrade</dt><dd><Price usd={Math.round(s.upgrade / 100) * 100} /></dd></div>
        <div className="flex justify-between"><dt className="text-meta">Retrim / repair</dt><dd><Price usd={Math.round(s.retrim / 100) * 100 + labour} className="text-racing" /></dd></div>
        <div className="flex justify-between"><dt className="text-meta">Labour · time</dt><dd className="num">{s.hours} h · {s.time}</dd></div>
      </dl>
      <button
        className="pill-dark mt-3 h-9 w-full justify-center text-[12px]"
        onClick={() => add({ type: "service", refId: `${car.slug}-int-${s.id}`, label: `${s.name} retrim`, sub: `${car.make} ${car.model}`, partsUSD: Math.round(s.retrim / 100) * 100, labourUSD: labour, hours: s.hours, turnaroundDays: 14, lane: "interior" })}
      >Add retrim to quote</button>
    </div>
  );
}

function PanoStrip({ car, trim, onSpot }: { car: Car; trim: InteriorTrim; onSpot: (s: Spot) => void }) {
  const shots = interiorShots(car);
  const [shot, setShot] = useState(shots[0]);
  const strip = useRef<HTMLDivElement>(null);
  const { handlers } = useLook((yaw, pitch, v) => {
    const el = strip.current; if (!el) return;
    const max = (el.offsetWidth - (el.parentElement?.offsetWidth ?? 0)) / 2;
    const x = Math.max(-max, Math.min(max, yaw * 6));
    const y = Math.max(-40, Math.min(40, pitch * 2));
    el.style.transform = `perspective(1400px) translate3d(${-x}px, ${y}px, 0) rotateY(${Math.max(-6, Math.min(6, v * 1.2))}deg)`;
  }, { pitch: 20 });
  return (
    <div>
      <div {...handlers} tabIndex={0} data-cursor="DRAG" role="img" aria-label={`${car.model} interior — drag to look around`} className="relative aspect-[2/1] w-full cursor-grab touch-pan-y select-none overflow-hidden bg-ink outline-none active:cursor-grabbing">
        <div ref={strip} className="absolute left-[-25%] top-[-9%] h-[118%] w-[150%] will-change-transform">
          <img src={`/cars/${car.slug}/${shot}-1280.webp`} alt="" draggable={false} className="h-full w-full object-cover" />
          {/* trim visualisation tint */}
          <div className="pointer-events-none absolute inset-0 mix-blend-color transition-colors duration-500" style={{ background: trim.id === "alcantara" ? "transparent" : trim.tint, opacity: 0.35 }} />
          {spots(car).map((s) => (
            <button key={s.id} onPointerDown={(e) => e.stopPropagation()} onClick={() => onSpot(s)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${s.px}%`, top: `${s.py}%` }} aria-label={s.name}>
              <span className="hotspot block" />
              <span className="mt-1 block whitespace-nowrap rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
      {shots.length > 1 && (
        <div className="mt-2 flex gap-1.5">
          {shots.map((s, i) => (<button key={s} onClick={() => setShot(s)} className={`pill-light h-7 px-3 text-[11px] ${s === shot ? "pill-active" : ""}`}>View {i + 1}</button>))}
        </div>
      )}
      <p className="mt-2 text-[11px] text-meta">Real interior photography · trim colour shown as a visualisation · hotspot positions indicative</p>
    </div>
  );
}

/** Illustrated cube faces in the chosen trim. */
function Face({ kind, trim }: { kind: string; trim: InteriorTrim }) {
  const [a, b] = trim.swatch;
  const leather = trim.tint;
  const common = { width: "100%", height: "100%", display: "block" } as const;
  if (kind === "front")
    return (
      <svg viewBox="0 0 600 600" style={common}>
        <rect width="600" height="600" fill="#1d1d1f" />
        <path d="M0 220 Q300 120 600 220 L600 330 Q300 280 0 330Z" fill={leather} />
        <rect x="60" y="0" width="480" height="210" fill="#b9c3cc" opacity=".55" />
        <rect x="250" y="250" width="100" height="150" rx="10" fill="#0b0b0c" stroke="#555" />
        <circle cx="160" cy="400" r="120" fill="none" stroke={a} strokeWidth="26" />
        <circle cx="160" cy="400" r="34" fill="#2a2a2c" />
        <path d="M60 420 L130 405 M190 405 L260 420 M160 435 L160 515" stroke={a} strokeWidth="18" />
        <rect x="380" y="380" width="200" height="40" rx="6" fill="#2a2a2c" />
        <path d="M0 330 Q300 280 600 330" stroke={b} strokeWidth="3" fill="none" />
      </svg>
    );
  if (kind === "back")
    return (
      <svg viewBox="0 0 600 600" style={common}>
        <rect width="600" height="600" fill="#151516" />
        <rect x="80" y="0" width="440" height="180" fill="#9aa4ad" opacity=".35" />
        {[120, 330].map((x) => (
          <g key={x}><path d={`M${x} 560 L${x} 260 Q${x + 75} 200 ${x + 150} 260 L${x + 150} 560Z`} fill={leather} stroke={b} strokeWidth="3" />
            {[310, 360, 410, 460].map((y) => <path key={y} d={`M${x + 20} ${y} H${x + 130}`} stroke={b} strokeWidth="2" opacity=".6" />)}</g>
        ))}
      </svg>
    );
  if (kind === "left" || kind === "right")
    return (
      <svg viewBox="0 0 600 600" style={common}>
        <rect width="600" height="600" fill="#19191a" />
        <path d="M40 40 L560 40 L520 230 L80 230Z" fill="#a9b3bb" opacity=".45" />
        <path d="M20 250 H580 V560 H20Z" fill={leather} />
        <path d="M60 330 Q300 290 540 330" stroke={b} strokeWidth="4" fill="none" />
        <rect x="80" y="420" width="180" height="70" rx="10" fill="#2a2a2c" />
        <circle cx="470" cy="455" r="40" fill="#0d0d0d" stroke="#666" />
      </svg>
    );
  if (kind === "top")
    return (<svg viewBox="0 0 600 600" style={common}><rect width="600" height="600" fill={a} />{Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={(i * 97) % 600} cy={(i * 53) % 600} r="1.6" fill="#fff" opacity=".7" />)}</svg>);
  return (<svg viewBox="0 0 600 600" style={common}><rect width="600" height="600" fill="#101011" /><rect x="220" y="0" width="160" height="600" fill={leather} opacity=".7" /></svg>);
}

function Cube({ car, trim, onSpot }: { car: Car; trim: InteriorTrim; onSpot: (s: Spot) => void }) {
  const cube = useRef<HTMLDivElement>(null);
  const { handlers } = useLook((yaw, pitch) => {
    if (cube.current) cube.current.style.transform = `translateZ(300px) rotateX(${-pitch}deg) rotateY(${yaw}deg)`;
  }, { pitch: 70 });
  const faces: [string, string][] = [
    ["front", "rotateY(0deg) translateZ(-300px)"],
    ["back", "rotateY(180deg) translateZ(-300px)"],
    ["left", "rotateY(90deg) translateZ(-300px)"],
    ["right", "rotateY(-90deg) translateZ(-300px)"],
    ["top", "rotateX(-90deg) translateZ(-300px)"],
    ["bottom", "rotateX(90deg) translateZ(-300px)"],
  ];
  return (
    <div>
      <div {...handlers} tabIndex={0} data-cursor="DRAG" role="img" aria-label={`${car.model} cabin — drag to look around`} className="relative aspect-[2/1] w-full cursor-grab touch-none select-none overflow-hidden bg-ink outline-none active:cursor-grabbing" style={{ perspective: "300px" }}>
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2" style={{ perspective: "300px" }}>
          <div ref={cube} className="relative h-full w-full will-change-transform" style={{ transformStyle: "preserve-3d", transform: "translateZ(300px)" }}>
            {faces.map(([k, t]) => (
              <div key={k} className="absolute inset-0" style={{ transform: t, backfaceVisibility: "hidden" }}><Face kind={k} trim={trim} /></div>
            ))}
            {spots(car).map((s) => (
              <button
                key={s.id}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onSpot(s)}
                aria-label={s.name}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `rotateY(${-s.yaw}deg) rotateX(${s.pitch}deg) translateZ(-290px) translate(-50%,-50%)`, backfaceVisibility: "hidden" }}
              >
                <span className="hotspot mx-auto block" />
                <span className="mt-1 block whitespace-nowrap rounded-full bg-surface/90 px-2 py-0.5 text-[10px] font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-meta">Illustrated cabin in the selected trim — interior photography for this car is pending.</p>
    </div>
  );
}

export default function CubeInterior({ car, trim }: { car: Car; trim: InteriorTrim }) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const hasPhoto = interiorShots(car).length > 0;
  return (
    <div className="relative">
      {hasPhoto ? <PanoStrip car={car} trim={trim} onSpot={setSpot} /> : <Cube car={car} trim={trim} onSpot={setSpot} />}
      {spot && <SpotCard car={car} s={spot} trim={trim} onClose={() => setSpot(null)} />}
    </div>
  );
}
