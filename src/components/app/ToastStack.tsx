"use client";

import { AnimatePresence, motion } from "framer-motion";

export type ToastMessage = {
  id: number;
  text: string;
};

export function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-xl border border-[#b9d3f9] bg-[linear-gradient(160deg,#f8fbff,#e4efff)] px-4 py-3 text-sm font-medium text-[#123f8f] shadow-[0_12px_22px_rgba(16,59,140,0.18)]"
          >
            {toast.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
