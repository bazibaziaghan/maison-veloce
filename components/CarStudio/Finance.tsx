"use client";
import { useState } from "react";
import Price from "@/components/ui/Price";

export default function Finance({ price }: { price: number }) {
  const [dep, setDep] = useState(30);
  const [term, setTerm] = useState(48);
  const [apr, setApr] = useState(9.5);
  const principal = price * (1 - dep / 100);
  const r = apr / 100 / 12;
  const monthly = r ? (principal * r) / (1 - Math.pow(1 + r, -term)) : principal / term;
  const total = monthly * term + price * (dep / 100);
  const row = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, fmt: string) => (
    <label className="block border-b hair py-3">
      <span className="flex justify-between text-[12px]"><span className="label">{label}</span><span className="num">{fmt}</span></span>
      <input type="range" className="scrub mt-3 w-full" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
  return (
    <div>
      {row("Deposit", dep, setDep, 10, 70, 5, `${dep}% · `)}
      {row("Term", term, setTerm, 12, 72, 6, `${term} months`)}
      {row("Rate (APR)", apr, setApr, 3, 20, 0.5, `${apr.toFixed(1)}%`)}
      <div className="mt-5 flex items-baseline justify-between"><span className="label">Monthly payment</span><Price usd={Math.round(monthly)} className="font-serif text-[40px] text-racing" /></div>
      <div className="mt-1 flex justify-between text-[12px] text-meta"><span>Deposit <Price usd={Math.round(price * dep / 100)} /></span><span>Total payable <Price usd={Math.round(total)} /></span></div>
      <p className="mt-4 text-[11px] text-meta">Illustration only — not an offer of credit. Subject to status and lender approval.</p>
    </div>
  );
}
