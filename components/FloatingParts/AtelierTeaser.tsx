import Link from "next/link";
import FloatingParts from "./FloatingParts";
import { LABOUR_RATES } from "@/data/services";

export default function AtelierTeaser() {
  return (
    <section aria-label="The Atelier" className="border-t hair pt-20 md:pt-28">
      <div className="container-site flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label">04 — Service &amp; Repair</p>
          <h2 className="display mt-3 text-[48px] md:text-[80px]">The Atelier.</h2>
          <p className="mt-2 font-serif text-[22px] italic text-meta">Precision care for exceptional machines.</p>
        </div>
        <div className="flex items-center gap-6 text-[12px]">
          <p className="num text-meta">Labour from ${LABOUR_RATES[1]}/h</p>
          <Link href="/atelier" className="pill-dark">Enter the Atelier →</Link>
        </div>
      </div>
      <FloatingParts />
    </section>
  );
}
