"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/** Drag/keyboard before–after slider. "Before" is the same photo, graded flat and dusty. */
export default function BeforeAfter({ src, alt }: { src: string; alt: string }) {
  const [x, setX] = useState(50);
  return (
    <div className="relative aspect-[16/10] w-full select-none overflow-hidden bg-ink">
      <img src={src} alt={`${alt} — after`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
        <img src={src} alt={`${alt} — before`} className="absolute inset-0 h-full w-full object-cover" style={{ filter: "grayscale(.6) contrast(.75) brightness(.85) sepia(.35) blur(.6px)" }} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-surface" style={{ left: `${x}%` }} />
      <span className="label absolute left-3 top-3 !text-white">Before</span>
      <span className="label absolute right-3 top-3 !text-white">After</span>
      <input type="range" min={0} max={100} value={x} onChange={(e) => setX(Number(e.target.value))} aria-label="Before and after comparison" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  );
}
