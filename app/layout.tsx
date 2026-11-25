import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/layout/Preloader";
import SmoothScroll from "@/components/layout/SmoothScroll";
import QuoteDrawer from "@/components/QuoteDrawer/QuoteDrawer";
import NewsletterPopup from "@/components/layout/NewsletterPopup";
import { themeScript } from "@/lib/theme";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Maison Veloce — Hypercars, sold and serviced", template: "%s · Maison Veloce" },
  description: "A fictional luxury automobile house in Lagos that sells and repairs hypercars and supercars. Transparent prices, labour and turnaround.",
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0C0D" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans text-ink">
        <Preloader />
        <SmoothScroll />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <QuoteDrawer />
        <NewsletterPopup />
      </body>
    </html>
  );
}
