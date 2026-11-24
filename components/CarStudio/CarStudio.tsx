"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { detailShots, type Car } from "@/data/cars";
import { PRICE_DISCLAIMER } from "@/data/currency";
import { useStore } from "@/lib/store";
import Price from "@/components/ui/Price";
import Modal from "@/components/ui/Modal";
import CarPicture from "@/components/ui/CarPicture";
import SpinViewer from "@/components/SpinViewer/SpinViewer";
import CubeInterior from "@/components/CubeInterior/CubeInterior";
import ExplodedLayers from "@/components/ExplodedLayers/ExplodedLayers";
import SpecsPanel from "@/components/SpecsPanel/SpecsPanel";
import OwnershipCost from "@/components/OwnershipCost/OwnershipCost";
import Finance from "./Finance";

const MODES = ["Exterior", "Interior", "Disassemble", "Specs", "Ownership cost"] as const;
type Mode = (typeof MODES)[number];

export default function CarStudio({ car }: { car: Car }) {
  const [mode, setMode] = useState<Mode>("Exterior");
  const [paint, setPaint] = useState(car.colors[0]?.id ?? "factory");
  const [wheel, setWheel] = useState(car.wheels[0].id);
  const [trim, setTrim] = useState(car.interiors[0].id);
  const [doors, setDoors] = useState(false);
  const [entering, setEntering] = useState(false);
  const [modal, setModal] = useState<null | "finance" | "reserve">(null);
  const add = useStore((s) => s.addToQuote);

  const P = car.colors.find((c) => c.id === paint) ?? car.colors[0];
  const W = car.wheels.find((w) => w.id === wheel)!;
  const T = car.interiors.find((t) => t.id === trim)!;
  const configured = car.basePriceUSD + (P?.priceUSD ?? 0) + W.priceUSD + T.priceUSD;
  const hasDoors = car.views.includes("doors");

  const switchMode = (m: Mode) => {
    if (m === "Interior" && mode === "Exterior" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntering(true); // exterior zooms toward the door, then crossfades into the cabin
      setTimeout(() => { setMode(m); setEntering(false); }, 650);
      return;
    }
    setMode(m);
  };

  const addCar = () => {
    add({ type: "car", refId: car.slug, label: `${car.make} ${car.model}`, sub: `${car.year} · ${car.status}`, partsUSD: car.basePriceUSD, labourUSD: 0, hours: 0, turnaroundDays: 0 });
    for (const [o, name] of [[P, `Paint — ${P?.name}`], [W, `Wheels — ${W.name}`], [T, `Interior — ${T.name}`]] as const) {
      if (o && o.priceUSD > 0) add({ type: "option", refId: `${car.slug}:${o.id}`, label: name, sub: `${car.make} ${car.model}`, partsUSD: o.priceUSD, labourUSD: 0, hours: 0, turnaroundDays: 0 });
    }
  };

  const onHotspot = useMemo(() => () => setMode("Disassemble"), []);

  return (
    <div className="pt-20">
      <div className="container-site">
        <nav aria-label="Breadcrumb" className="label py-4"><Link href="/cars" className="hover:text-ink">All cars</Link> / {car.make}</nav>
        <div className="flex flex-col gap-6 border-b hair pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">{car.make} · {car.year} · {car.status}{car.mileage ? ` · ${car.mileage.toLocaleString()} km` : ""}</p>
            <h1 className="display mt-2 text-[52px] md:text-[96px]">{car.model}</h1>
            <p className="mt-2 max-w-lg text-[14px] text-meta">{car.tagline}</p>
          </div>
          <div className="md:text-right">
            <Price usd={car.basePriceUSD} from className="block text-[15px] text-meta" />
            <p className="label mt-3">As configured</p>
            <Price usd={configured} className="block font-serif text-[46px] leading-none text-racing" />
          </div>
        </div>

        {/* mode switcher */}
        <div role="tablist" aria-label="Studio modes" className="no-scrollbar sticky top-16 z-40 -mx-5 flex gap-1 overflow-x-auto bg-gallery/80 px-5 py-3 backdrop-blur md:mx-0 md:justify-center md:px-0">
          <div className="flex rounded-full border border-ink/10 bg-surface/70 p-1">
            {MODES.map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={`h-9 whitespace-nowrap rounded-full px-4 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${mode === m ? "bg-ink text-gallery" : "text-meta hover:text-ink"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-site mt-6" role="tabpanel" aria-label={mode}>
        {mode === "Exterior" && (
          <div className={`grid gap-8 lg:grid-cols-[1fr_300px] ${entering ? "pointer-events-none" : ""}`}>
            <div style={{ transform: entering ? "scale(2.2) translate(-6%, 4%)" : "none", opacity: entering ? 0 : 1, transition: "transform .65s cubic-bezier(.6,0,.2,1), opacity .65s ease-in", transformOrigin: "45% 55%" }}>
              {doors && hasDoors ? (
                <div className="cove relative">
                  <CarPicture slug={car.slug} view="doors" alt={`${car.model} with ${car.doorType.toLowerCase()} doors open`} priority className="w-full" />
                  <p className="label mt-2">{car.doorType} doors · open</p>
                </div>
              ) : (
                <SpinViewer car={car} paint={paint} onHotspot={onHotspot} />
              )}
              {detailShots(car).length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {detailShots(car).map((d) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={d} src={`/cars/${car.slug}/${d}-640.webp`} alt={`${car.model} detail`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  ))}
                </div>
              )}
            </div>
            <aside className="space-y-6">
              <fieldset>
                <legend className="label">Paint · {P?.name}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {car.colors.map((c) => (
                    <button key={c.id} onClick={() => setPaint(c.id)} aria-pressed={paint === c.id} title={`${c.name} ${c.priceUSD ? "" : "(no cost)"}`} aria-label={c.name} className={`h-9 w-9 rounded-full border-2 transition-transform ${paint === c.id ? "scale-110 border-racing" : "border-surface"} shadow`} style={{ background: c.hex }} />
                  ))}
                </div>
                <p className="mt-2 text-[12px]">{P?.name} <Price usd={P?.priceUSD ?? 0} plus className="text-racing" /></p>
                {paint !== "factory" && <p className="text-[11px] text-meta">Colour shown as a digital visualisation.</p>}
              </fieldset>
              <fieldset>
                <legend className="label">Wheels &amp; calipers</legend>
                <div className="mt-3 divide-y divide-line border-y hair">
                  {car.wheels.map((w) => (
                    <label key={w.id} className="flex cursor-pointer items-center justify-between gap-3 py-2.5 text-[12px]">
                      <span className="flex items-center gap-2"><input type="radio" name="wheel" checked={wheel === w.id} onChange={() => setWheel(w.id)} className="accent-[#B3121B]" />{w.name}<span className="text-meta">· {w.caliper} calipers</span></span>
                      <Price usd={w.priceUSD} plus />
                    </label>
                  ))}
                </div>
              </fieldset>
              <button onClick={() => setDoors(!doors)} disabled={!hasDoors} className="pill-light w-full justify-center disabled:opacity-40" title={hasDoors ? "" : "Door-open photography pending for this car"}>
                {doors ? "Close doors" : `Open doors (${car.doorType.toLowerCase()})`}
              </button>
              {!hasDoors && <p className="-mt-4 text-[11px] text-meta">Door-open frames pending for this car.</p>}
            </aside>
          </div>
        )}

        {mode === "Interior" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]" style={{ animation: "fade-up .5s ease-out" }}>
            <CubeInterior car={car} trim={T} />
            <aside>
              <p className="label">Interior trim</p>
              <div className="mt-3 divide-y divide-line border-y hair">
                {car.interiors.map((t) => (
                  <button key={t.id} onClick={() => setTrim(t.id)} aria-pressed={trim === t.id} className={`flex w-full items-center gap-3 py-3 text-left text-[12px] ${trim === t.id ? "" : "text-meta"}`}>
                    <span className="flex overflow-hidden rounded-full border border-surface shadow"><span className="h-7 w-3.5" style={{ background: t.swatch[0] }} /><span className="h-7 w-3.5" style={{ background: t.swatch[1] }} /></span>
                    <span className="flex-1"><span className="block font-medium text-ink">{t.name}</span>{t.material}</span>
                    <Price usd={t.priceUSD} plus />
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}

        {mode === "Disassemble" && <ExplodedLayers car={car} />}
        {mode === "Specs" && <SpecsPanel car={car} />}
        {mode === "Ownership cost" && <OwnershipCost car={car} />}

        {/* studio CTAs */}
        <div className="mt-10 grid gap-2 border-t hair pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <button className="pill-dark justify-center" onClick={() => setModal("reserve")}>Reserve with deposit · <Price usd={Math.round(configured * 0.1)} /></button>
          <Link href={`/booking?type=viewing&car=${car.slug}`} className="pill-light justify-center">Book private viewing</Link>
          <button className="pill-light justify-center" onClick={() => setModal("finance")}>Finance calculator</button>
          <button className="pill-light justify-center" onClick={addCar}>Add to quote</button>
        </div>
        <p className="mt-3 text-[11px] text-meta">{PRICE_DISCLAIMER}</p>
      </div>

      <Modal open={modal === "finance"} onClose={() => setModal(null)} title="Finance">
        <Finance price={configured} />
      </Modal>
      <Modal open={modal === "reserve"} onClose={() => setModal(null)} title="Reserve">
        <p className="text-[14px]">Hold this {car.model} as configured with a refundable 10% deposit while we prepare your final quote.</p>
        <div className="mt-5 flex items-baseline justify-between border-y hair py-4"><span className="label">Deposit (10%)</span><Price usd={Math.round(configured * 0.1)} className="font-serif text-[36px] text-racing" /></div>
        <p className="mt-3 text-[12px] text-meta">Deposits are taken by bank transfer after a call with your sales advisor — nothing is charged online.</p>
        <Link href={`/booking?type=purchase&car=${car.slug}`} className="pill-dark mt-5 w-full justify-center" onClick={() => setModal(null)}>Continue to reservation</Link>
      </Modal>
    </div>
  );
}
