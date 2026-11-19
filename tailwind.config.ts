import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        gallery: "rgb(var(--gallery) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        meta: "rgb(var(--meta) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        racing: "rgb(var(--racing) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
      },
      letterSpacing: { label: "0.22em" },
      maxWidth: { site: "1440px" },
    },
  },
  plugins: [],
} satisfies Config;
