/** Editable FX constants. Prices are stored in USD and converted at render time. */
export type CurrencyCode = "USD" | "NGN" | "EUR" | "GBP";

export const RATES_LAST_UPDATED = "18 Nov 2026";

export const CURRENCIES: Record<CurrencyCode, { symbol: string; rate: number; locale: string; label: string }> = {
  USD: { symbol: "$", rate: 1, locale: "en-US", label: "US Dollar" },
  NGN: { symbol: "₦", rate: 1545, locale: "en-NG", label: "Nigerian Naira" },
  EUR: { symbol: "€", rate: 0.93, locale: "de-DE", label: "Euro" },
  GBP: { symbol: "£", rate: 0.79, locale: "en-GB", label: "Pound Sterling" },
};

export const VAT_RATE = 0.075; // Nigerian VAT, applied in the quote drawer when toggled

export const PRICE_DISCLAIMER =
  "Prices are indicative and exclude duties, shipping, clearing and VAT. Final quote on enquiry.";
