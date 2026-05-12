"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { InvoiceRecord, invoiceTimeline } from "@/lib/app-data";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";
import { useEffect, useMemo, useState } from "react";

type Props = {
  invoice?: InvoiceRecord;
  open: boolean;
  onClose: () => void;
};

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

const statusToTimelineIndex: Partial<Record<InvoiceRecord["status"], number>> = {
  Submitted: 0,
  Verified: 2,
  Listed: 3,
  Funded: 4,
  Repaid: 5,
  Claimed: 6,
  Rejected: 1,
  Defaulted: 4,
  Pending: 0,
};

export function InvoiceDetailDrawer({ invoice, open, onClose }: Props) {
  const reducedMotion = useReducedMotion();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const onChainRows = useMemo(
    () =>
      invoice
        ? [
            { key: "invoice_pda", label: "invoice_pda", value: invoice.pubkey || "inv_8Kx...92a" },
            { key: "vault_state", label: "vault_state", value: invoice.vaultState || "initialized" },
            { key: "document_hash", label: "document_hash", value: invoice.documentHash },
            { key: "metadata_hash", label: "metadata_hash", value: invoice.metadataHash },
            { key: "tx_signature", label: "tx_signature", value: invoice.txSignature },
            { key: "network", label: "network", value: "Solana Devnet" },
          ]
        : [],
    [invoice],
  );

  const currentTimelineStep = invoice ? (statusToTimelineIndex[invoice.status] ?? 0) : 0;
  const isNegativeTerminal = invoice?.status === "Rejected" || invoice?.status === "Defaulted";
  const showInvestor =
    !!invoice?.investor && !!invoice?.investorWallet && (invoice.status === "Funded" || invoice.status === "Repaid" || invoice.status === "Claimed" || invoice.status === "Defaulted");

  useEffect(() => {
    if (!copiedKey) return;
    const timer = window.setTimeout(() => setCopiedKey(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
    } catch {
      setCopiedKey(null);
    }
  };

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
              {showInvestor ? <Panel title="Investor" value={invoice.investor!} /> : null}
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
                {onChainRows.map((row) => {
                  const isCopied = copiedKey === row.key;
                  return (
                    <li key={row.key}>
                      <button
                        type="button"
                        onClick={() => handleCopy(row.key, row.value)}
                        className="group flex w-full items-center justify-between gap-3 rounded-lg border border-[#d2e2f7] bg-[#f4f9ff] px-3 py-2 text-left transition-colors hover:border-[#a7c8f6] hover:bg-[#ecf5ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7bb6ff]"
                      >
                        <span className="break-all pr-2">
                          {row.label}: {row.value}
                        </span>
                        <AnimatePresence mode="wait" initial={false}>
                          {isCopied ? (
                            <motion.span
                              key="copied"
                              initial={reducedMotion ? false : { opacity: 0, y: 2 }}
                              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                              exit={reducedMotion ? {} : { opacity: 0, y: -2 }}
                              className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600"
                            >
                              Copied
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mt-6 rounded-2xl border border-[#c7daf4] bg-white/85 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#45658f]">Activity timeline</h3>
              <ul className="mt-3">
                {invoiceTimeline.map((entry, idx) => (
                  <motion.li
                    key={entry}
                    initial={reducedMotion ? false : { opacity: 0, x: -6 }}
                    animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    <span
                      aria-hidden
                      className={`absolute left-[6px] top-4 h-[calc(100%-6px)] w-[2px] rounded-full ${
                        idx < invoiceTimeline.length - 1
                          ? idx < currentTimelineStep
                            ? "bg-emerald-400"
                            : "bg-[#c6d9f3]"
                          : "bg-transparent"
                      }`}
                    />
                    <span
                      className={`relative z-[1] mt-[2px] inline-block h-3.5 w-3.5 shrink-0 rounded-full border ${
                        idx <= currentTimelineStep ? "border-emerald-500 bg-emerald-400" : "border-[#7ea8e0] bg-[#dbe9fb]"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className={`text-sm ${idx <= currentTimelineStep ? "text-[#1f6b4f]" : "text-[#24446f]"}`}>{entry}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
              {isNegativeTerminal ? (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  Lifecycle ended with status: {invoice?.status}
                </p>
              ) : null}
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
