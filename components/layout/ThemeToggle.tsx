"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Light / dark switch. Saved per visitor; first visit follows the OS setting. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => setTheme((document.documentElement.dataset.theme as Theme) ?? "light"), []);
  const flip = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("mv-theme", next); } catch {}
    setTheme(next);
  };
  const dark = theme === "dark";
  return (
    <button onClick={flip} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={dark} title={dark ? "Light mode" : "Dark mode"} className="pill-light h-9 w-9 justify-center px-0">
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="4.2" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M12 2.5v2.2" transform={`rotate(${a} 12 12)`} />)}</svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></svg>
      )}
    </button>
  );
}
