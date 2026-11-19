"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CARS } from "@/data/cars";
import { SERVICES } from "@/data/services";
import { useStore } from "@/lib/store";
import { lineTotal } from "@/lib/quote";
import Price from "@/components/ui/Price";
import Calendar from "./Calendar";

type Kind = "purchase" | "service" | "viewing";
const STEPS = ["Type", "Car", "Date", "Contact", "Summary"];

export default function BookingForm() {
  const params = useSearchParams();
  const quote = useStore((s) => s.quote);
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind | null>((params.get("type") as Kind) ?? null);
  const [car, setCar] = useState<string | null>(params.get("car"));
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState("10:00");
  const [c, setC] = useState({ name: "", email: "", phone: "", notes: params.get("service") ? `Service: ${SERVICES.find((s) => s.id === params.get("service"))?.name ?? ""}` : "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);

  const errors = {
    name: c.name.trim().length < 2 ? "Please enter your full name" : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) ? "" : "Enter a valid email address",
    phone: /^\+?[\d\s()-]{7,}$/.test(c.phone) ? "" : "Enter a phone number with country code, e.g. +234…",
  };
  const canNext = [!!kind, !!car, !!date, !errors.name && !errors.email && !errors.phone, true][step];
  const total = quote.reduce((n, q) => n + lineTotal(q), 0);
  const selCar = CARS.find((x) => x.slug === car);

  const submit = () => {
    const payload = { kind, car, date, slot, contact: c, quote, quoteTotalUSD: total, createdAt: new Date().toISOString() };
    console.log("Booking payload", payload);
    // TODO: POST payload to an email API (e.g. Resend / Postmark) from a route handler.
    setDone(true);
  };

  if (done)
    return (
      <div className="py-16 text-center" role="status">
        <p className="label !text-racing">Request received</p>
        <h2 className="display mt-3 text-[56px]">Thank you, {c.name.split(" ")[0]}.</h2>
        <p className="mx-auto mt-4 max-w-md text-[14px] text-meta">Your {kind} request for the {selCar ? `${selCar.make} ${selCar.model}` : "car"} on {date && new Date(date).toDateString()} at {slot} is with our team. We’ll confirm by email and WhatsApp within two working hours.</p>
      </div>
    );

  const field = (k: keyof typeof c, label: string, type = "text") => (
    <label className="block">
      <span className="label">{label}</span>
      <input type={type} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} onBlur={() => setTouched({ ...touched, [k]: true })}
        aria-invalid={!!(touched[k] && (errors as Record<string, string>)[k])} aria-describedby={`${k}-err`}
        className="mt-1 h-11 w-full border-b border-ink bg-transparent text-[15px] outline-none aria-[invalid=true]:border-racing" />
      <span id={`${k}-err`} className="block min-h-4 text-[11px] text-racing">{touched[k] ? (errors as Record<string, string>)[k] : ""}</span>
    </label>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (step < 4 && canNext) setStep(step + 1); else if (step === 4) submit(); }} noValidate>
      <ol className="mb-10 flex gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <span className={`block h-px ${i <= step ? "bg-ink" : "bg-line"}`} />
            <span className={`label mt-2 block ${i === step ? "!text-ink" : ""}`} aria-current={i === step ? "step" : undefined}>{String(i + 1).padStart(2, "0")} {s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset><legend className="display text-[40px]">What can we arrange?</legend>
          <div className="mt-6 grid gap-2 md:grid-cols-3">
            {([["purchase", "Purchase", "Reserve, finance and deliver a car"], ["service", "Service", "Book the Atelier for work"], ["viewing", "Private viewing", "See a car in the showroom"]] as const).map(([k, t, d]) => (
              <button type="button" key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`border p-5 text-left transition-colors ${kind === k ? "border-ink bg-ink text-gallery" : "hair hover:border-ink"}`}>
                <span className="font-serif text-[26px]">{t}</span><span className={`mt-1 block text-[12px] ${kind === k ? "text-gallery/70" : "text-meta"}`}>{d}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {step === 1 && (
        <fieldset><legend className="display text-[40px]">Which car?</legend>
          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-5">
            {CARS.map((x) => (
              <button type="button" key={x.slug} onClick={() => setCar(x.slug)} aria-pressed={car === x.slug} className={`border p-3 text-left text-[12px] ${car === x.slug ? "border-racing" : "hair hover:border-ink"}`}>
                <span className="label block">{x.make}</span><span className="font-medium">{x.model}</span>
              </button>
            ))}
            {kind === "service" && <button type="button" onClick={() => setCar("other")} aria-pressed={car === "other"} className={`border p-3 text-left text-[12px] ${car === "other" ? "border-racing" : "hair"}`}><span className="label block">Other</span>Another make / model</button>}
          </div>
        </fieldset>
      )}
      {step === 2 && (
        <fieldset className="grid gap-10 md:grid-cols-2"><legend className="display mb-6 text-[40px] md:col-span-2">When suits you?</legend>
          <Calendar value={date} onChange={setDate} />
          <div><p className="label">Time</p><div className="mt-3 flex flex-wrap gap-1.5">{["09:00", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30"].map((t) => <button type="button" key={t} onClick={() => setSlot(t)} aria-pressed={slot === t} className={`pill-light h-9 num ${slot === t ? "pill-active" : ""}`}>{t}</button>)}</div></div>
        </fieldset>
      )}
      {step === 3 && (
        <fieldset className="grid max-w-xl gap-4"><legend className="display mb-4 text-[40px]">Your details</legend>
          {field("name", "Full name")}{field("email", "Email", "email")}{field("phone", "Phone / WhatsApp", "tel")}
          <label><span className="label">Notes (optional)</span><textarea value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} rows={3} className="mt-1 w-full border-b border-ink bg-transparent text-[14px] outline-none" /></label>
        </fieldset>
      )}
      {step === 4 && (
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="display text-[40px]">Summary</h2>
            <dl className="mt-6 divide-y divide-line border-y hair text-[13px]">
              {[["Request", kind], ["Car", selCar ? `${selCar.make} ${selCar.model}` : "Other make / model"], ["Date", date && `${new Date(date).toDateString()} · ${slot}`], ["Name", c.name], ["Email", c.email], ["Phone", c.phone], ["Notes", c.notes || "—"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-2.5"><dt className="text-meta">{k}</dt><dd className="text-right capitalize-first">{v}</dd></div>
              ))}
            </dl>
          </div>
          <div>
            <p className="label">Attached quote</p>
            {quote.length === 0 ? <p className="mt-3 text-[13px] text-meta">No quote items attached.</p> : (
              <ul className="mt-3 divide-y divide-line border-y hair text-[12px]">{quote.map((q) => <li key={q.key} className="flex justify-between py-2"><span>{q.qty}× {q.label}</span><Price usd={lineTotal(q)} /></li>)}
                <li className="flex justify-between py-3"><span className="label">Total</span><Price usd={total} className="font-serif text-[24px] text-racing" /></li></ul>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-between border-t hair pt-6">
        <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="pill-light disabled:opacity-30">← Back</button>
        <button type="submit" disabled={!canNext} onClick={() => step === 3 && setTouched({ name: true, email: true, phone: true })} className="pill-dark disabled:bg-meta">{step === 4 ? "Send request" : "Continue →"}</button>
      </div>
    </form>
  );
}
