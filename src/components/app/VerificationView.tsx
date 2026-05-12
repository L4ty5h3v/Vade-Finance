"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { VerificationItem } from "@/lib/app-data";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

const canRun = (
  status: VerificationItem["status"],
  action: "verify" | "list" | "repay" | "claim" | "reject" | "default",
) => {
  switch (action) {
    case "verify":
      return status === "Submitted";
    case "list":
      return status === "Verified";
    case "repay":
      return status === "Funded";
    case "claim":
      return status === "Repaid";
    case "reject":
      return status === "Submitted" || status === "Verified" || status === "Listed";
    case "default":
      return status === "Funded";
    default:
      return false;
  }
};

type Props = {
  queue: VerificationItem[];
  onVerify: (invoiceId: string) => void;
  onList: (invoiceId: string) => void;
  onReject: (invoiceId: string) => void;
  onSimulateRepayment: (invoiceId: string) => void;
  onClaim: (invoiceId: string) => void;
  onMarkDefault: (invoiceId: string) => void;
  onOpenDetail: (invoiceId: string) => void;
  canManage: boolean;
};

export function VerificationView({
  queue,
  onVerify,
  onList,
  onReject,
  onSimulateRepayment,
  onClaim,
  onMarkDefault,
  onOpenDetail,
  canManage,
}: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#143260]">Verification queue</h2>
        <p className="text-sm text-[#5d7598]">
          Submitted invoices waiting for legal and risk checks.
          {!canManage ? " Connect wallet to run on-chain actions." : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#c7daf4] bg-white/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead className="bg-[#edf4ff] text-xs uppercase tracking-[0.13em] text-[#58729a]">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Exporter</th>
                <th className="px-4 py-3">Debtor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item, idx) => (
                <motion.tr
                  key={item.invoiceId}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="border-t border-[#d8e5f7] text-[#163b67]"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.invoiceId}</p>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item.invoiceId)}
                      className="mt-1 inline-flex items-center rounded-md border border-[#bfd4f5] bg-[#f1f7ff] px-2 py-0.5 text-[11px] font-semibold text-[#2b5ea8] transition-colors duration-200 hover:border-[#9ebfe9] hover:bg-[#eaf3ff] hover:text-[#234f95]"
                    >
                      View details
                    </button>
                  </td>
                  <td className="px-4 py-3">{item.exporter}</td>
                  <td className="px-4 py-3">{item.debtor}</td>
                  <td className="px-4 py-3">{formatUSDT(item.amount)}</td>
                  <td className="px-4 py-3 text-xs text-[#5d7598]">{item.documents.join(", ")}</td>
                  <td className="px-4 py-3"><RiskBadge risk={item.risk} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      {item.status === "Repaid" ? (
                        <span className="rounded-full border border-cyan-300 bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-800">repayment_event</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          disabled={!canManage || !canRun(item.status, "verify")}
                          onClick={() => onVerify(item.invoiceId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Play size={10} />
                          Verify
                        </button>
                        <span className="text-[11px] text-[#7a93b3]">→</span>
                        <button
                          type="button"
                          disabled={!canManage || !canRun(item.status, "list")}
                          onClick={() => onList(item.invoiceId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-800 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Play size={10} />
                          List
                        </button>
                        <span className="text-[11px] text-[#7a93b3]">→</span>
                        <button
                          type="button"
                          disabled={!canManage || !canRun(item.status, "repay")}
                          onClick={() => onSimulateRepayment(item.invoiceId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-cyan-300 bg-cyan-100 px-2 py-1 text-[11px] font-semibold text-cyan-800 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Play size={10} />
                          Repay
                        </button>
                        <span className="text-[11px] text-[#7a93b3]">→</span>
                        <button
                          type="button"
                          disabled={!canManage || !canRun(item.status, "claim")}
                          onClick={() => onClaim(item.invoiceId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-teal-300 bg-teal-100 px-2 py-1 text-[11px] font-semibold text-teal-800 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Play size={10} />
                          Claim
                        </button>
                      </div>
                      <details className="group">
                        <summary className="cursor-pointer select-none text-[11px] font-semibold text-[#5579a9] transition hover:text-[#2f5d9d]">
                          More actions
                        </summary>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={!canManage || !canRun(item.status, "reject")}
                            onClick={() => onReject(item.invoiceId)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-800 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <Play size={10} />
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={!canManage || !canRun(item.status, "default")}
                            onClick={() => onMarkDefault(item.invoiceId)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-800 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <Play size={10} />
                            Mark Default
                          </button>
                        </div>
                      </details>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
