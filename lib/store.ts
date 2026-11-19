"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyCode } from "@/data/currency";
import type { QuoteItem } from "./quote";

type State = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  selectedSlug: string | null;
  setSelected: (s: string | null) => void;
  quote: QuoteItem[];
  bump: number; // increments on add → drives the basket bounce
  addToQuote: (item: Omit<QuoteItem, "key" | "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  removeFromQuote: (key: string) => void;
  clearQuote: () => void;
  quoteOpen: boolean;
  setQuoteOpen: (o: boolean) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      currency: "USD",
      setCurrency: (currency) => set({ currency }),
      selectedSlug: null,
      setSelected: (selectedSlug) => set({ selectedSlug }),
      quote: [],
      bump: 0,
      addToQuote: (item) =>
        set((s) => {
          const key = `${item.type}:${item.refId}`;
          const existing = s.quote.find((q) => q.key === key);
          const quote = existing
            ? s.quote.map((q) => (q.key === key ? { ...q, qty: q.qty + (item.qty ?? 1) } : q))
            : [...s.quote, { ...item, key, qty: item.qty ?? 1 }];
          return { quote, bump: s.bump + 1 };
        }),
      setQty: (key, qty) => set((s) => ({ quote: s.quote.map((q) => (q.key === key ? { ...q, qty: Math.max(1, qty) } : q)) })),
      removeFromQuote: (key) => set((s) => ({ quote: s.quote.filter((q) => q.key !== key) })),
      clearQuote: () => set({ quote: [] }),
      quoteOpen: false,
      setQuoteOpen: (quoteOpen) => set({ quoteOpen }),
    }),
    { name: "maison-veloce", partialize: (s) => ({ currency: s.currency, quote: s.quote }) }
  )
);
