"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[800] grid place-items-center bg-ink/30 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label={title} className="max-h-[88vh] w-full max-w-2xl overflow-y-auto bg-gallery p-6 shadow-2xl md:p-8" data-lenis-prevent initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="display text-[36px]">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="text-[22px] text-meta hover:text-ink" autoFocus>×</button>
            </div>
            <div className="mt-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
