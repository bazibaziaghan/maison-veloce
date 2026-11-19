"use client";
import { motion } from "framer-motion";

/** Route transition (Framer Motion is used ONLY here and in modals/drawers). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
