"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { MARQUES } from "@/data/cars";
import { useRollUp } from "@/components/ui/hooks";

function Counter({ to, suffix = "", decimals = 0, label }: { to: number; suffix?: string; decimals?: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setGo(true), { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const v = useRollUp(go ? to : 0, 1400);
  return (
    <div ref={ref} className="border-t hair pt-5">
      <p className="num font-serif text-[64px] leading-none md:text-[88px]">{v.toFixed(decimals)}{suffix}</p>
      <p className="label mt-3">{label}</p>
    </div>
  );
}

const TESTIMONIALS = [
  { q: "They found a Tourbillon allocation when the factory list was closed, then handled shipping and clearing to Lagos without a single surprise.", a: "Private collector, Lagos" },
  { q: "Carbon-ceramics, clutch pack and a full PPF in nine days. The car came back better than it left Maranello.", a: "SF90 owner, Abuja" },
  { q: "Transparent pricing in naira and dollars, line by line. That alone made me move my cars here.", a: "GT3 RS & Spectre owner, Port Harcourt" },
];

export default function Heritage() {
  return (
    <section id="heritage" aria-label="Heritage and trust" className="border-t hair py-20 md:py-28">
      <div className="container-site">
        <p className="label">Heritage</p>
        <h2 className="display mt-3 max-w-4xl text-[48px] md:text-[80px]">Twelve years of hypercars, delivered and maintained.</h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          <Counter to={140} suffix="+" label="Hypercars delivered" />
          <Counter to={18} label="Factory-trained technicians" />
          <Counter to={4.2} decimals={1} suffix="d" label="Average workshop turnaround" />
        </div>
      </div>

      <div className="mt-20 overflow-hidden border-y hair py-6" aria-label="Marques we sell and service">
        <div className="flex w-max gap-16 whitespace-nowrap font-serif text-[44px] font-light md:text-[64px]" style={{ animation: "marquee 38s linear infinite" }}>
          {[...MARQUES, ...MARQUES, ...MARQUES, ...MARQUES].map((m, i) => (
            <span key={i} className={i % 2 ? "text-meta" : ""} aria-hidden={i >= MARQUES.length}>{m}</span>
          ))}
        </div>
      </div>

      <div className="container-site mt-20 grid gap-10 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.a} className="border-t hair pt-5">
            <span className="label !text-racing">Sample testimonial</span>
            <blockquote className="mt-3 font-serif text-[22px] leading-snug">“{t.q}”</blockquote>
            <figcaption className="label mt-4">{t.a}</figcaption>
          </figure>
        ))}
      </div>

      <div className="container-site mt-20">
        <p className="label mb-4">The workshop</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {["workshop-1", "workshop-2", "workshop-4", "workshop-5"].map((w, i) => (
            <img key={w} src={`/workshop/${w}-1280.webp`} alt="Supercar workshop interior" loading="lazy" className={`h-full w-full object-cover ${i === 0 ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto" : i === 3 ? "col-span-2 aspect-[8/3]" : "aspect-[4/3]"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
