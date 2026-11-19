"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-[500] transition-[background,backdrop-filter,border-color] duration-300 ${scrolled ? "border-b border-line bg-gallery/75 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-ink focus:px-3 focus:py-2 focus:text-gallery">Skip to content</a>
      <nav className="container-site flex h-16 items-center gap-6" aria-label="Main">
        <Link href="/" className="font-serif text-[22px] tracking-[0.18em]" aria-label="Maison Veloce home">MAISON&nbsp;VELOCE</Link>
        <ul className="ml-4 hidden gap-5 text-[12px] xl:flex">
          {LINKS.map(([l, h]) => (
            <li key={l}><Link href={h} className="text-ink/70 transition-colors hover:text-ink">{l}</Link></li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block"><CurrencyToggle /></div>
          <QuoteButton />
          <Link href="/booking" className="pill-dark hidden h-9 text-[12px] sm:inline-flex">Book a Viewing</Link>
          <button className="pill-light h-9 px-3 xl:hidden" aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(!menu)}>Menu</button>
        </div>
      </nav>
      {menu && (
        <div id="mobile-menu" className="border-t hair bg-gallery/95 backdrop-blur-xl xl:hidden">
          <ul className="container-site flex flex-col py-4 text-[15px]">
            {LINKS.map(([l, h]) => (
              <li key={l}><Link href={h} onClick={() => setMenu(false)} className="block border-b hair py-3">{l}</Link></li>
            ))}
            <li className="pt-4"><CurrencyToggle /></li>
          </ul>
        </div>
      )}
    </header>
  );
}
