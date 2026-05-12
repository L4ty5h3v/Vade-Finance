"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
};

export function WithdrawModal({ open, onClose, onConfirm }: Props) {
  const reducedMotion = useReducedMotion();
  const [amount, setAmount] = useState("100");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onConfirm(parsed);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#08152faa] p-4"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={reducedMotion ? {} : { opacity: 1 }}
          exit={reducedMotion ? {} : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={submit}
            onClick={(event) => event.stopPropagation()}
            initial={reducedMotion ? false : { y: 16, opacity: 0 }}
            animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { y: 16, opacity: 0 }}
            className="w-full max-w-md rounded-3xl border border-[#bfd4ef] bg-[#f9fbff] p-5"
          >
            <h2 className="text-lg font-semibold text-[#13315e]">Withdraw from app balance</h2>
            <p className="mt-1 text-sm text-[#5f7799]">Funds will be moved from app account back to your wallet token account.</p>

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#537198]">Amount (USDT)</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                className="w-full rounded-xl border border-[#bfd4ef] bg-white px-3 py-2.5 text-sm font-semibold text-[#14335f] outline-none transition focus:border-[#8fb6ec] focus:ring-2 focus:ring-[#8fb6ec55]"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-[#c4d7f3] bg-white px-4 py-2 text-sm font-semibold text-[#305480]">
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl border border-[#8aa0bc] bg-[#28323d] px-4 py-2 text-sm font-semibold text-white"
              >
                Withdraw
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
