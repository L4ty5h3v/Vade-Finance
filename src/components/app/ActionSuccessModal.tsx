"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

type Mode = "fund" | "repay";

type Props = {
  open: boolean;
  mode: Mode;
  amount: number;
  invoiceId?: string;
  onClose: () => void;
};

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`;

const titleMap: Record<Mode, string> = {
  fund: "Invoice Funded Successfully",
  repay: "Repayment Submitted Successfully",
};

const subtitleMap: Record<Mode, string> = {
  fund: "Liquidity moved to exporter flow",
  repay: "Repayment moved into invoice vault",
};

export function ActionSuccessModal({ open, mode, amount, invoiceId, onClose }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#08152fcc] p-4"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={reducedMotion ? {} : { opacity: 1 }}
          exit={reducedMotion ? {} : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            initial={reducedMotion ? false : { y: 20, opacity: 0, scale: 0.97 }}
            animate={reducedMotion ? {} : { y: 0, opacity: 1, scale: 1 }}
            exit={reducedMotion ? {} : { y: 16, opacity: 0, scale: 0.98 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#9dc3f7] bg-[radial-gradient(120%_120%_at_50%_0%,#e9f3ff_0%,#dcecff_35%,#cfe6ff_75%,#b4d8ff_100%)] p-6 shadow-[0_30px_60px_rgba(17,72,145,0.35)]"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#6db2ff55] blur-2xl" />
            <div className="pointer-events-none absolute -left-6 bottom-2 h-32 w-32 rounded-full bg-[#7af2d655] blur-2xl" />

            <div className="relative z-[1] flex items-start gap-4">
              <motion.div
                initial={reducedMotion ? false : { rotate: -8, scale: 0.8 }}
                animate={reducedMotion ? {} : { rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="rounded-2xl border border-[#7fb0ec] bg-white/75 p-3 text-[#1a5ec2]"
              >
                <CheckCircle2 size={28} />
              </motion.div>
              <div>
                <p className="inline-flex items-center gap-1 rounded-full border border-[#8ab7f1] bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#245aa7]">
                  <Sparkles size={12} />
                  Confirmed
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#123d81]">{titleMap[mode]}</h3>
                <p className="mt-1 text-sm font-medium text-[#295f9f]">{subtitleMap[mode]}</p>
              </div>
            </div>

            <div className="relative z-[1] mt-5 rounded-2xl border border-[#a2c6f1] bg-white/70 p-4 text-[#1c4b88]">
              <p className="text-xs uppercase tracking-[0.12em] text-[#5174a5]">Transaction summary</p>
              <div className="mt-2 space-y-1 text-sm">
                {invoiceId ? <p>Invoice: <span className="font-semibold">{invoiceId}</span></p> : null}
                <p>Amount: <span className="font-semibold">{formatUSDT(amount)}</span></p>
              </div>
            </div>

            <div className="relative z-[1] mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#79aef4] bg-[linear-gradient(160deg,#2e83fa,#246be0)] px-4 py-2 text-sm font-semibold text-white"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
