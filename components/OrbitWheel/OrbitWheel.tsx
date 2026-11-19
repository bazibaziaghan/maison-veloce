"use client";
/**
 * MECHANIC 1 — "The Showroom Wheel".
 * All motion state lives in refs; a single rAF loop writes one matrix() per car.
 * React state is touched only when the FRONT car changes.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CARS, carImg } from "@/data/cars";
import { easeOutCubic, frontIndex, orbitPose, snapTheta, thetaForIndex } from "@/lib/orbit";
import { useStore } from "@/lib/store";
import Price from "@/components/ui/Price";
import { useOnScreen, useReducedMotion } from "@/components/ui/hooks";
import CarPicture from "@/components/ui/CarPicture";

const N = CARS.length;
const FRICTION = 0.94;

export default function OrbitWheel() {
  const reduce = useReducedMotion();
  const { ref: stageRef, visible } = useOnScreen<HTMLDivElement>();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const theta = useRef(0);
  const vel = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastT = useRef(0);
  const downX = useRef(0);
  const snap = useRef<{ from: number; to: number; start: number; dur: number } | null>(null);
  const geom = useRef({ R: 420, r: 60 });
  const front = useRef(0);
  const lastBlur = useRef<number[]>([]);
  const [active, setActive] = useState(0);
  const setSelected = useStore((s) => s.setSelected);

  const startSnap = useCallback(
    (to: number, dur = 650) => {
      if (reduce) {
        theta.current = to;
        snap.current = null;
        return;
      }
      snap.current = { from: theta.current, to, start: performance.now(), dur };
    },
    [reduce]
  );

  const goTo = useCallback(
    (i: number) => {
      vel.current = 0;
      startSnap(thetaForIndex(((i % N) + N) % N, N, theta.current), 700);
    },
    [startSnap]
  );

  // geometry follows the stage size (tighter orbit on mobile)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const mobile = w < 768;
      geom.current = { R: mobile ? w * 0.36 : Math.min(w * 0.38, 560), r: mobile ? 34 : 70 };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [stageRef]);

  // the frame loop
  useEffect(() => {
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible.current) return;
      if (!dragging.current) {
        if (snap.current) {
          const s = snap.current;
          const p = Math.min(1, (now - s.start) / s.dur);
          theta.current = s.from + (s.to - s.from) * easeOutCubic(p);
          if (p >= 1) snap.current = null;
        } else if (Math.abs(vel.current) > 0.0004) {
          theta.current += vel.current;
          vel.current *= FRICTION;
          if (Math.abs(vel.current) <= 0.0025) {
            vel.current = 0;
            startSnap(snapTheta(theta.current, N), 520);
          }
        }
      }
      const { R, r } = geom.current;
      for (let i = 0; i < N; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const p = orbitPose(theta.current, i, N, R, r);
        el.style.transform = p.transform;
        el.style.opacity = p.opacity.toFixed(3);
        el.style.zIndex = String(p.z);
        const b = Math.round(p.blur * 4) / 4;
        if (lastBlur.current[i] !== b) {
          el.style.filter = b > 0.1 ? `blur(${b}px)` : "none";
          lastBlur.current[i] = b;
        }
        el.tabIndex = -1;
      }
      const f = frontIndex(theta.current, N);
      if (f !== front.current) {
        front.current = f;
        setActive(f); // the ONLY setState, fired when the front car changes
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [startSnap, visible]);

  useEffect(() => setSelected(CARS[active].slug), [active, setSelected]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    snap.current = null;
    vel.current = 0;
    lastX.current = downX.current = e.clientX;
    lastT.current = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    const now = performance.now();
    const dθ = dx / (geom.current.R * 1.15);
    theta.current += dθ;
    const dt = Math.max(1, now - lastT.current);
    vel.current = (dθ / dt) * 16.7; // per-frame velocity for inertia
    lastX.current = e.clientX;
    lastT.current = now;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const moved = Math.abs(e.clientX - downX.current);
    if (moved < 6) {
      // treat as click: which car was under the pointer?
      const hit = (document.elementsFromPoint(e.clientX, e.clientY) as HTMLElement[]).find((el) => el.dataset.orbitIndex);
      if (hit) return goTo(Number(hit.dataset.orbitIndex));
    }
    if (reduce || Math.abs(vel.current) < 0.003) {
      vel.current = 0;
      startSnap(snapTheta(theta.current, N), 450);
    }
  };
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && !e.shiftKey) return; // keep vertical page scroll
    const d = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
    snap.current = null;
    vel.current -= d * 0.00018;
    if (reduce) {
      vel.current = 0;
      goTo(front.current + Math.sign(d));
    }
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(front.current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(front.current - 1); }
    if (e.key === "Home") goTo(0);
  };

  const car = CARS[active];

  return (
    <section id="showroom" aria-label="The Showroom Wheel" className="relative overflow-hidden pt-24 md:pt-28">
      <div className="container-site grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="label">Showroom · {CARS.length} cars in residence</p>
          <h1 className="display mt-3 text-[56px] md:text-[104px]">Find Your Drive.</h1>
        </div>
      </div>

      <div className="container-site grid items-center gap-6 lg:grid-cols-[1fr_320px]">
        {/* stage */}
        <div
          ref={stageRef}
          role="listbox"
          aria-label="Drag, swipe or use arrow keys to rotate the showroom"
          aria-activedescendant={`orbit-${car.slug}`}
          tabIndex={0}
          data-cursor="DRAG"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          onKeyDown={onKey}
          className="cove relative h-[360px] touch-pan-y select-none outline-none md:h-[540px] cursor-grab active:cursor-grabbing"
        >
          {/* turntable floor */}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] h-[38%] w-[86%] -translate-x-1/2 rounded-[50%] border border-ink/[0.06] bg-[radial-gradient(closest-side,rgba(14,14,14,0.06),transparent)]" />
          {CARS.map((c, i) => (
            <button
              key={c.slug}
              id={`orbit-${c.slug}`}
              role="option"
              aria-selected={i === active}
              aria-label={`${c.make} ${c.model}`}
              data-orbit-index={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              onClick={(e) => e.preventDefault()}
              className="absolute left-1/2 top-1/2 -ml-[clamp(140px,19vw,260px)] -mt-[clamp(70px,9.5vw,130px)] w-[clamp(280px,38vw,520px)] will-change-transform"
              style={{ transform: "matrix(0.5,0,0,0.5,0,0)" }}
            >
              <CarPicture slug={c.slug} view="hero" alt={`${c.make} ${c.model}`} sizes="(max-width: 768px) 80vw, 600px" priority={i < 3} className="pointer-events-none w-full" />
            </button>
          ))}
          <div className="absolute bottom-2 left-1/2 z-[200] -translate-x-1/2 text-center" onPointerDown={(e) => e.stopPropagation()}>
            <Link href={`/cars/${car.slug}`} data-cursor="VIEW" className="pill-dark focus-ring">
              Explore this car <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* In this car */}
        <aside aria-live="polite" className="relative z-[300] border-t hair bg-gallery/85 pt-6 backdrop-blur-md lg:-my-6 lg:border-l lg:border-t-0 lg:py-6 lg:pl-8">
          <div className="flex items-baseline justify-between">
            <p className="label">In this car</p>
            <p className="num text-[13px] text-meta">
              <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(N).padStart(2, "0")}
            </p>
          </div>
          <p className="label mt-6">{car.make} · {car.status}</p>
          <h2 className="display mt-1 text-[40px]">{car.model}</h2>
          <dl className="mt-6 divide-y divide-line border-y hair text-[13px]">
            {[
              ["Engine", car.engine],
              ["Power", `${car.hp.toLocaleString()} hp`],
              ["0–100 km/h", `${car.zeroToHundred.toFixed(1)} s`],
              ["Top speed", car.topSpeed ? `${car.topSpeed} km/h` : "Limited"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <dt className="text-meta">{k}</dt>
                <dd className="num text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="label mt-6">Price</p>
          <Price usd={car.basePriceUSD} className="mt-1 block font-serif text-[44px] leading-none text-racing" />
          <div className="mt-6 flex gap-2">
            <button aria-label="Previous car" onClick={() => goTo(active - 1)} className="pill-light h-10 w-10 justify-center px-0">←</button>
            <button aria-label="Next car" onClick={() => goTo(active + 1)} className="pill-light h-10 w-10 justify-center px-0">→</button>
          </div>
        </aside>
      </div>
    </section>
  );
}
