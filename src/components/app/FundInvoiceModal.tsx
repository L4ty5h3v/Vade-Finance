"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InvoiceRecord } from "@/lib/app-data";

type Props = {
  open: boolean;
  invoice?: InvoiceRecord;
  onClose: () => void;
  onConfirm: (invoiceId: string) => void;
};

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

export function FundInvoiceModal({ open, invoice, onClose, onConfirm }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && invoice ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#08152faa] p-4"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={reducedMotion ? {} : { opacity: 1 }}
          exit={reducedMotion ? {} : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            initial={reducedMotion ? false : { y: 16, opacity: 0 }}
            animate={reducedMotion ? {} : { y: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { y: 16, opacity: 0 }}
            className="w-full max-w-lg rounded-3xl border border-[#bfd4ef] bg-[#f9fbff] p-5"
          >
            <h2 className="text-lg font-semibold text-[#13315e]">Fund Invoice</h2>
            <p className="mt-1 text-sm text-[#5f7799]">{invoice.id} • {invoice.exporter}</p>

            <div className="mt-4 space-y-2 rounded-xl border border-[#c7daf4] bg-white/85 p-4 text-sm text-[#22426d]">
              <Row label="Investor pays" value={formatUSDT(invoice.purchasePrice)} />
              <Row label="Expected repayment" value={formatUSDT(invoice.faceValue)} />
              <Row label="Platform fee" value={formatUSDT(Math.round((invoice.purchasePrice * 0.01) * 100) / 100)} />
            </div>

            <p className="mt-4 rounded-xl border border-[#d5e3f7] bg-[#f1f7ff] px-3 py-2 text-xs text-[#4e6e99]">
              Confirmation updates interface state and portfolio tracking.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-[#c4d7f3] bg-white px-4 py-2 text-sm font-semibold text-[#305480]">Cancel</button>
              <button
                type="button"
                onClick={() => onConfirm(invoice.id)}
                className="rounded-xl border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-4 py-2 text-sm font-semibold text-[#0f3f91]"
              >
                Confirm Funding
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#537096]">{label}</span>
      <span className="font-semibold text-[#14335f]">{value}</span>
    </div>
  );
}
