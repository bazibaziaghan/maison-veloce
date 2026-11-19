"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addWorkingDays, criticalPathDays, lineTotal } from "@/lib/quote";
import { formatFull } from "@/lib/currency";
import { CURRENCIES, PRICE_DISCLAIMER, VAT_RATE, type CurrencyCode } from "@/data/currency";
import Price from "@/components/ui/Price";
import { CurrencyToggle } from "@/components/layout/Navbar";

export default function QuoteDrawer() {
  const { quote, quoteOpen, setQuoteOpen, setQty, removeFromQuote, clearQuote, currency } = useStore();
  const [vat, setVat] = useState(false);
  const [drop, setDrop] = useState(() => new Date().toISOString().slice(0, 10));
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (!quoteOpen) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setQuoteOpen(false);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [quoteOpen, setQuoteOpen]);

  const sub = quote.reduce((n, q) => n + lineTotal(q), 0);
  const vatAmt = vat ? sub * VAT_RATE : 0;
  const total = sub + vatAmt;
  const workshop = quote.filter((q) => q.type === "part" || q.type === "service");
  const hours = workshop.reduce((n, q) => n + q.hours * q.qty, 0);
  const cp = useMemo(() => criticalPathDays(quote), [quote]);
  const ready = addWorkingDays(new Date(drop), cp.days);

  const summary = () =>
    [
      "MAISON VELOCE — Quote request",
      ...quote.map((q) => `• ${q.qty}× ${q.label}${q.sub ? ` (${q.sub})` : ""} — ${formatFull(lineTotal(q), currency)}`),
      `Subtotal: ${formatFull(sub, currency)}`,
      vat ? `VAT ${(VAT_RATE * 100).toFixed(1)}%: ${formatFull(vatAmt, currency)}` : "VAT not included",
      `Total: ${formatFull(total, currency)}`,
      workshop.length ? `Workshop: ${hours} h labour, est. ${cp.days} working days (critical path), ready ~${ready.toDateString()} from drop-off ${new Date(drop).toDateString()}` : "",
    ].filter(Boolean).join("\n");

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      const { renderQuotePdf } = await import("./QuotePdf");
      const blob = await renderQuotePdf({ items: quote, currency: currency as CurrencyCode, vat, sub, vatAmt, total, days: cp.days, hours, drop, ready: ready.toDateString() });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `maison-veloce-quote-${Date.now()}.pdf`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally { setPdfBusy(false); }
  };

  return (
    <AnimatePresence>
      {quoteOpen && (
        <>
          <motion.div className="fixed inset-0 z-[700] bg-ink/25 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuoteOpen(false)} />
          <motion.aside role="dialog" aria-modal="true" aria-label="Your quote" data-lenis-prevent className="fixed bottom-0 right-0 top-0 z-[710] flex w-full max-w-[480px] flex-col bg-gallery shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}>
            <header className="flex items-center justify-between border-b hair px-6 py-5">
              <div><p className="label">Quote builder</p><h2 className="display text-[34px]">Your quote</h2></div>
              <button onClick={() => setQuoteOpen(false)} aria-label="Close quote" className="text-[24px] text-meta hover:text-ink" autoFocus>×</button>
            </header>
            <div className="flex-1 overflow-y-auto px-6">
              {quote.length === 0 ? (
                <p className="py-16 text-center text-[14px] text-meta">Nothing here yet. Add a car, an option, a part or a service from anywhere on the site.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {quote.map((q) => (
                    <li key={q.key} className="py-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="label">{q.type}</p>
                          <p className="mt-0.5 text-[13px] font-medium">{q.label}</p>
                          {q.sub && <p className="text-[11px] text-meta">{q.sub}</p>}
                        </div>
                        <Price usd={lineTotal(q)} className="shrink-0 text-[14px]" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-meta">
                        <span className="num">
                          {q.type === "part" || q.type === "service" ? <>Parts <Price usd={q.partsUSD} /> · Labour <Price usd={q.labourUSD} /> · {q.hours} h</> : <>Unit <Price usd={q.partsUSD} /></>}
                        </span>
                        <span className="flex items-center gap-2">
                          <button aria-label="Decrease quantity" onClick={() => setQty(q.key, q.qty - 1)} className="h-6 w-6 rounded-full border hair">−</button>
                          <span className="num w-4 text-center text-ink">{q.qty}</span>
                          <button aria-label="Increase quantity" onClick={() => setQty(q.key, q.qty + 1)} className="h-6 w-6 rounded-full border hair">+</button>
                          <button onClick={() => removeFromQuote(q.key)} className="ml-2 underline">Remove</button>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {quote.length > 0 && (
              <footer className="border-t hair px-6 py-5">
                {workshop.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-3 border-b hair pb-4 text-[12px]">
                    <div><p className="label">Workshop time</p><p className="num mt-1">{hours} h labour · {cp.days} days<span className="block text-meta">critical path across {cp.lanes} parallel {cp.lanes === 1 ? "job" : "jobs"}</span></p></div>
                    <label><span className="label">Drop-off</span><input type="date" value={drop} onChange={(e) => setDrop(e.target.value)} className="mt-1 w-full bg-transparent text-[12px] outline-none" /><span className="block text-meta">Ready ≈ <span className="text-ink">{ready.toDateString()}</span></span></label>
                  </div>
                )}
                <div className="flex items-center justify-between text-[12px]">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} className="accent-[#B3121B]" /> Include VAT ({(VAT_RATE * 100).toFixed(1)}%)</label>
                  <CurrencyToggle />
                </div>
                <div className="mt-4 space-y-1 text-[12px]">
                  <div className="flex justify-between"><span className="text-meta">Subtotal</span><Price usd={sub} /></div>
                  {vat && <div className="flex justify-between"><span className="text-meta">VAT</span><Price usd={vatAmt} /></div>}
                  <div className="flex items-baseline justify-between pt-2"><span className="label">Total · {CURRENCIES[currency].label}</span><Price usd={total} className="font-serif text-[36px] text-racing" /></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={downloadPdf} disabled={pdfBusy} className="pill-dark justify-center">{pdfBusy ? "Preparing…" : "Download PDF"}</button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(summary())}`} target="_blank" rel="noopener noreferrer" className="pill-light justify-center">Send via WhatsApp</a>
                </div>
                <button onClick={clearQuote} className="label mt-3 underline">Clear quote</button>
                <p className="mt-2 text-[10px] text-meta">{PRICE_DISCLAIMER}</p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
