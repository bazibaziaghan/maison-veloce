"use client";
import { useStore } from "@/lib/store";
import { formatFull, formatPrice } from "@/lib/currency";
import { CURRENCIES } from "@/data/currency";
import { useRollUp } from "./hooks";

/** Price that rolls up whenever the value or currency changes. Full value on hover for compact NGN. */
export default function Price({ usd, className = "", from = false, plus = false }: { usd: number; className?: string; from?: boolean; plus?: boolean }) {
  const currency = useStore((s) => s.currency);
  const rate = CURRENCIES[currency].rate;
  // roll in the display currency so a currency switch also rolls (e.g. $3.8m → ₦ 5.9bn)
  const v = useRollUp(usd * rate);
  const shown = formatPrice(v / rate, currency);
  return (
    <span className={`num ${className}`} title={formatFull(usd, currency)} aria-label={`${from ? "From " : ""}${formatFull(usd, currency)}`}>
      {from && <span className="label mr-1.5 align-middle">From</span>}
      {plus && usd > 0 ? "+" : ""}
      {usd === 0 && plus ? "Included" : shown}
    </span>
  );
}
