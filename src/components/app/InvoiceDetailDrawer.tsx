"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { InvoiceRecord, invoiceTimeline } from "@/lib/app-data";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

type Props = {
  invoice?: InvoiceRecord;
  open: boolean;
  onClose: () => void;
};

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

export function InvoiceDetailDrawer({ invoice, open, onClose }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && invoice ? (
        <motion.div
          className="fixed inset-0 z-50 bg-[#08152faa]"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={reducedMotion ? {} : { opacity: 1 }}
          exit={reducedMotion ? {} : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-[#bdd3ef] bg-[#f8fbff] p-5 md:p-6"
            initial={reducedMotion ? false : { x: 40, opacity: 0 }}
            animate={reducedMotion ? {} : { x: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { x: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            aria-label="Invoice detail drawer"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#5a759b]">Invoice detail</p>
                <h2 className="mt-1 text-xl font-semibold text-[#123160]">{invoice.id}</h2>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg border border-[#c9dcf5] bg-white p-2 text-[#355987]">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Panel title="Exporter" value={invoice.exporter} />
              <Panel title="Debtor" value={invoice.debtor} />
              <Panel title="Face value" value={formatUSDT(invoice.faceValue)} />
              <Panel title="Purchase price" value={formatUSDT(invoice.purchasePrice)} />
              <Panel title="Term" value={`${invoice.termDays} days`} />
              <Panel title="Due date" value={invoice.dueDate} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <RiskBadge risk={invoice.risk} />
              <StatusBadge status={invoice.status} />
              <span className="rounded-full border border-[#c5daf7] bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#325f97]">
                expected return {invoice.expectedReturn.toFixed(2)}%
              </span>
            </div>

            <section className="mt-6 rounded-2xl border border-[#c7daf4] bg-white/85 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#45658f]">On-chain data</h3>
              <ul className="mt-3 space-y-2 font-mono text-xs text-[#24446f]">
                <li className="rounded-lg border border-[#d2e2f7] bg-[#f4f9ff] px-3 py-2">invoice_pda: inv_8Kx...92a</li>
                <li className="rounded-lg border border-[#d2e2f7] bg-[#f4f9ff] px-3 py-2">vault_state: initialized</li>
                <li className="rounded-lg border border-[#d2e2f7] bg-[#f4f9ff] px-3 py-2">document_hash: {invoice.documentHash}</li>
                <li className="rounded-lg border border-[#d2e2f7] bg-[#f4f9ff] px-3 py-2">metadata_hash: {invoice.metadataHash}</li>
                <li className="rounded-lg border border-[#d2e2f7] bg-[#f4f9ff] px-3 py-2">tx_signature: {invoice.txSignature}</li>
                <li className="rounded-lg border border-[#d2e2f7] bg-[#f4f9ff] px-3 py-2">network: Solana Devnet</li>
              </ul>
            </section>

            <section className="mt-6 rounded-2xl border border-[#c7daf4] bg-white/85 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#45658f]">Activity timeline</h3>
              <ul className="mt-3 space-y-2">
                {invoiceTimeline.map((entry, idx) => (
                  <motion.li
                    key={entry}
                    initial={reducedMotion ? false : { opacity: 0, x: -6 }}
                    animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="flex items-center gap-2 text-sm text-[#24446f]"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#2b66d8]" />
                    {entry}
                  </motion.li>
                ))}
              </ul>
            </section>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Panel({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#cbddf6] bg-white/85 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-[#5f7aa2]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-[#14335f]">{value}</p>
    </article>
  );
}
