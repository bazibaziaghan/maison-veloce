import Link from "next/link";
import { PRICE_DISCLAIMER, RATES_LAST_UPDATED } from "@/data/currency";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="mt-24 border-t hair pt-16">
      <div className="container-site grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="label">Visit</p>
          <address className="mt-3 not-italic text-[14px] leading-relaxed">
            Maison Veloce Showroom &amp; Atelier<br />[Street address placeholder]<br />Victoria Island, Lagos, Nigeria
          </address>
          <p className="label mt-8">Opening hours</p>
          <p className="mt-3 text-[14px] leading-relaxed num">Showroom · Mon–Sat 10:00–19:00<br />Atelier · Mon–Sat 08:00–18:00<br />Sunday · By appointment</p>
        </div>
        <div>
          <p className="label">Connect</p>
          <ul className="mt-3 space-y-2 text-[14px]">
            <li><a href="https://wa.me/" className="hover:text-racing">WhatsApp</a></li>
            <li><a href="https://instagram.com/" className="hover:text-racing">Instagram</a></li>
            <li><a href="https://tiktok.com/" className="hover:text-racing">TikTok</a></li>
            <li><Link href="/booking" className="hover:text-racing">Book a viewing</Link></li>
          </ul>
        </div>
        <div>
          <p className="label">Newsletter</p>
          <p className="mt-3 text-[13px] text-meta">New arrivals before they reach the rail.</p>
          <Newsletter />
        </div>
      </div>
      <div className="container-site mt-16 flex flex-col gap-2 border-t hair py-6 text-[11px] text-meta md:flex-row md:justify-between">
        <p>{PRICE_DISCLAIMER} Exchange rates last updated {RATES_LAST_UPDATED}.</p>
        <p className="flex gap-4">
          <span>© {new Date().getFullYear()} Maison Veloce — a fictional house.</span>
          <Link href="/credits" className="underline underline-offset-2 hover:text-ink">Images: see credits</Link>
        </p>
      </div>
    </footer>
  );
}
