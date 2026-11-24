/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import CarPicture from "@/components/ui/CarPicture";
import { CARS } from "@/data/cars";
import { SERVICES, LABOUR_RATES } from "@/data/services";

type Card = { href: string; eyebrow: string; meta: string; title: string; text: string; cta: string } & (
  | { slug: string; view: string }
  | { img: string }
);

const CARDS: Card[] = [
  { href: "/garage", eyebrow: "The Garage", meta: `${CARS.length} cars`, title: "On the rail.", text: "Every car in residence, hung like a collection. Filter by marque, condition and price.", cta: "Open The Garage", slug: "bugatti-tourbillon", view: "side" },
  { href: "/cars", eyebrow: "All Cars", meta: `${CARS.length} cars`, title: "Compare all ten.", text: "Re-order the collection by price, power, 0–100, top speed or arrival.", cta: "Open All Cars", slug: "ferrari-sf90-stradale", view: "hero" },
  { href: "/atelier", eyebrow: "The Atelier", meta: `${SERVICES.length} services · from $${LABOUR_RATES[1]}/h`, title: "Precision care.", text: "Service and repair for exceptional machines, priced per marque, with a diagnostic visualiser.", cta: "Enter the Atelier", img: "/parts/engine-w16-640.webp" },
];

export default function ExploreLinks() {
  return (
    <section aria-label="Explore Maison Veloce" className="border-t hair py-20 md:py-28">
      <div className="container-site">
        <div className="grid gap-px border hair bg-line md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="group flex flex-col bg-gallery p-6 transition-colors hover:bg-surface focus-ring md:p-8">
              <p className="label">{c.eyebrow} · {c.meta}</p>
              <h2 className="display mt-3 text-[40px] md:text-[52px]">{c.title}</h2>
              <p className="mt-3 max-w-sm text-[14px] text-meta">{c.text}</p>
              <div className="my-4 grid aspect-[2/1] place-items-center transition-transform duration-500 group-hover:-translate-y-1">
                {"slug" in c ? (
                  <CarPicture slug={c.slug} view={c.view} alt="" sizes="(max-width: 768px) 90vw, 30vw" className="w-full" />
                ) : (
                  <img src={c.img} alt="" loading="lazy" className="h-full w-auto object-contain" />
                )}
              </div>
              <span className="pill-dark mt-auto self-start">{c.cta} <span aria-hidden>→</span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
