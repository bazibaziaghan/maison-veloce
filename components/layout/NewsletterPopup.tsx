"use client";
/* eslint-disable @next/next/no-img-element */
/**
 * First-visit "Join the Maison" popup. Opens a few seconds after the first page load,
 * once per visitor: closing it hides it for 14 days, signing up hides it for good.
 * No mailing service is connected yet — the address is only kept in this browser.
 */
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const KEY = "mv-newsletter";
const SNOOZE_DAYS = 14;
const DELAY_MS = 3500;
const CODE = "VELOCE25";

export default function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pathname?.startsWith("/booking")) return; // don't interrupt someone booking
    let seen: string | null = null;
    try { seen = localStorage.getItem(KEY); } catch {}
    if (seen === "joined") return;
    if (seen && Date.now() - Number(seen) < SNOOZE_DAYS * 864e5) return;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
    // only on the first page of the visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    const f = setTimeout(() => input.current?.focus(), 400);
    return () => { window.removeEventListener("keydown", k); clearTimeout(f); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    if (!done) try { localStorage.setItem(KEY, String(Date.now())); } catch {}
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Enter a valid email address.");
    setError("");
    setDone(true);
    try { localStorage.setItem(KEY, "joined"); } catch {}
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[850] grid place-items-center bg-black/45 p-5 backdrop-blur-[2px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="nl-title"
            className="relative w-full max-w-[520px]"
            initial={{ y: 28, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden text-white shadow-2xl">
              <img src="/workshop/workshop-2-1280.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" aria-hidden />
              <div className="relative px-6 pb-8 pt-10 text-center sm:px-10 sm:pb-10 sm:pt-12">
                {done ? (
                  <div aria-live="polite">
                    <p className="label text-white/60">Welcome to the Maison</p>
                    <h2 id="nl-title" className="display mt-3 text-[40px] sm:text-[48px]">You&rsquo;re on the list.</h2>
                    <p className="mx-auto mt-3 max-w-sm text-[14px] text-white/75">Use this code on your first Atelier booking for 2.5% off labour.</p>
                    <p className="num mx-auto mt-6 w-max border border-white/40 px-5 py-2.5 text-[18px] tracking-[0.3em]">{CODE}</p>
                    <button onClick={close} className="mt-7 h-11 w-full bg-white text-[13px] font-medium text-[#0E0E0E] transition-opacity hover:opacity-90">Continue browsing</button>
                  </div>
                ) : (
                  <>
                    <p className="label text-white/60">Maison Veloce · Private list</p>
                    <h2 id="nl-title" className="display mt-3 text-[40px] leading-[1.05] sm:text-[48px]">Join the Maison</h2>
                    <p className="mx-auto mt-3 max-w-sm text-[14px] italic text-white/80">
                      Sign up &amp; get <strong className="font-semibold not-italic">2.5% off</strong> your first Atelier service, plus early word on new arrivals, private viewings and allocations.
                    </p>
                    <form onSubmit={submit} noValidate className="mt-7 space-y-3 text-left">
                      <label className="relative block">
                        <span className="sr-only">Email address</span>
                        <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6b6b6b]" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m3.5 6 8.5 7 8.5-7" /></svg>
                        <input
                          ref={input} type="email" inputMode="email" autoComplete="email" required
                          value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                          placeholder="Enter email"
                          aria-invalid={!!error} aria-describedby={error ? "nl-err" : undefined}
                          className="h-12 w-full bg-white pl-12 pr-4 text-[15px] text-[#0E0E0E] placeholder:text-[#8a8a8a] outline-none focus-visible:ring-2 focus-visible:ring-racing"
                        />
                      </label>
                      {error && <p id="nl-err" className="text-[12px] text-[#ff8a8a]">{error}</p>}
                      <button type="submit" className="h-12 w-full bg-racing text-[14px] font-medium tracking-wide text-white transition-[filter] hover:brightness-110">Submit</button>
                    </form>
                    <p className="mt-4 text-[11px] text-white/50">No spam. Unsubscribe any time.</p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={close} aria-label="Close"
              className="absolute -right-3 -top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-[#0E0E0E] shadow-lg transition-transform hover:scale-105"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
