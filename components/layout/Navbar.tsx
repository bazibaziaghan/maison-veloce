"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CURRENCIES, type CurrencyCode } from "@/data/currency";
import { useStore } from "@/lib/store";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  ["Showroom", "/#showroom"],
  ["The Garage", "/#garage"],
  ["All Cars", "/#all-cars"],
  ["Atelier", "/atelier"],
  ["Price List", "/price-list"],
  ["Heritage", "/#heritage"],
  ["Contact", "/booking"],
] as const;

function QuoteButton() {
  const count = useStore((s) => s.quote.reduce((n, q) => n + q.qty, 0));
  const bump = useStore((s) => s.bump);
  const open = useStore((s) => s.setQuoteOpen);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button onClick={() => open(true)} className="pill-light h-9 px-4 text-[12px]" aria-label={`Open quote, ${mounted ? count : 0} items`}>
      Quote
      <span key={bump} className={`num inline-grid h-5 min-w-5 place-items-center rounded-full bg-racing px-1.5 text-[10px] text-white ${bump ? "bounce" : ""}`}>
        {mounted ? count : 0}
      </span>
    </button>
  );
}

export function CurrencyToggle() {
  const currency = useStore((s) => s.currency);
  const set = useStore((s) => s.setCurrency);
  const codes = Object.keys(CURRENCIES) as CurrencyCode[];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div role="radiogroup" aria-label="Currency" className="flex rounded-full border border-ink/15 p-0.5 text-[11px]">
      {codes.map((c) => {
        const on = mounted && currency === c;
        return (
          <button key={c} role="radio" aria-checked={on} onClick={() => set(c)} className={`h-7 rounded-full px-2.5 font-medium transition-colors ${on ? "bg-ink text-gallery" : "text-meta hover:text-ink"}`}>
            {c}
          </button>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const drawer = useRef<HTMLElement>(null);
  useEffect(() => { drawer.current?.toggleAttribute("inert", !menu); }, [menu]);
  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [menu]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
    <header className={`fixed inset-x-0 top-0 z-[500] transition-[background,backdrop-filter,border-color] duration-300 ${scrolled ? "border-b border-line bg-gallery/75 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-ink focus:px-3 focus:py-2 focus:text-gallery">Skip to content</a>
      <nav className="container-site flex h-16 items-center gap-6" aria-label="Main">
        <Link href="/" className="shrink-0 whitespace-nowrap font-serif text-[22px] tracking-[0.18em]" aria-label="Maison Veloce home">MAISON&nbsp;VELOCE</Link>
        <ul className="ml-4 hidden gap-5 whitespace-nowrap text-[12px] min-[1360px]:flex">
          {LINKS.map(([l, h]) => (
            <li key={l}><Link href={h} className="text-ink/70 transition-colors hover:text-ink">{l}</Link></li>
          ))}
        </ul>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block"><CurrencyToggle /></div>
          <QuoteButton />
          <Link href="/booking" className="pill-dark hidden h-9 text-[12px] sm:inline-flex">Book a Viewing</Link>
          <button className="pill-light h-9 px-3 min-[1360px]:hidden" aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(!menu)}>Menu</button>
        </div>
      </nav>
    </header>

    {/* side drawer menu */}
    <div
      aria-hidden
      onClick={() => setMenu(false)}
      className={`fixed inset-0 z-[590] bg-ink/25 backdrop-blur-[2px] transition-opacity duration-300 min-[1360px]:hidden ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`}
    />
    <aside
      id="mobile-menu"
      aria-label="Menu"
      aria-hidden={!menu}
      ref={drawer}
      data-lenis-prevent
      className={`fixed bottom-0 right-0 top-0 z-[600] flex w-[min(320px,86vw)] flex-col border-l hair bg-gallery shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] min-[1360px]:hidden ${menu ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center border-b hair px-6 py-4">
        {/* only when the navbar hides its own currency switch (phones) */}
        <div className="md:hidden"><CurrencyToggle /></div>
        <button onClick={() => setMenu(false)} aria-label="Close menu" className="ml-auto text-[24px] leading-none text-meta hover:text-ink">×</button>
      </div>
      <ul className="flex flex-col overflow-y-auto px-6 py-2 text-[15px]">
        {LINKS.map(([l, h]) => (
          <li key={l}><Link href={h} onClick={() => setMenu(false)} className="block border-b hair py-3.5 hover:text-racing">{l}</Link></li>
        ))}
      </ul>
      <div className="mt-auto px-6 pb-6 sm:hidden">
        <Link href="/booking" onClick={() => setMenu(false)} className="pill-dark w-full justify-center">Book a Viewing</Link>
      </div>
    </aside>
    </>
  );
}
