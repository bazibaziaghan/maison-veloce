"use client";
import { useEffect, useState } from "react";

/** A thin line draws across, then the wordmark — gone in < 1.5 s. Shown once per session. */
export default function Preloader() {
  const [phase, setPhase] = useState<"line" | "word" | "out" | "done">("line");
  useEffect(() => {
    try {
      if (sessionStorage.getItem("mv-pre")) return setPhase("done");
      sessionStorage.setItem("mv-pre", "1");
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setPhase("done");
    const t = [setTimeout(() => setPhase("word"), 550), setTimeout(() => setPhase("out"), 1150), setTimeout(() => setPhase("done"), 1450)];
    return () => t.forEach(clearTimeout);
  }, []);
  if (phase === "done") return null;
  return (
    <div aria-hidden className={`fixed inset-0 z-[10000] grid place-items-center bg-gallery transition-opacity duration-300 ${phase === "out" ? "opacity-0" : ""}`}>
      <div className="absolute left-0 right-0 top-1/2 h-px origin-left bg-ink" style={{ animation: "draw-line .55s cubic-bezier(.7,0,.2,1) forwards" }} />
      <p className={`relative bg-gallery px-6 font-serif text-[34px] tracking-[0.3em] transition-all duration-500 md:text-[52px] ${phase === "line" ? "translate-y-2 opacity-0" : "opacity-100"}`}>MAISON VELOCE</p>
    </div>
  );
}
