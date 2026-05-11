"use client";

import { motion, useReducedMotion } from "framer-motion";
import { VerificationItem } from "@/lib/app-data";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

type Props = {
  queue: VerificationItem[];
  onVerify: (invoiceId: string) => void;
  onReject: (invoiceId: string) => void;
  onSimulateRepayment: (invoiceId: string) => void;
  onMarkDefault: (invoiceId: string) => void;
  onOpenDetail: (invoiceId: string) => void;
  canManage: boolean;
};

export function VerificationView({
  queue,
  onVerify,
  onReject,
  onSimulateRepayment,
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
          {!canManage ? " Action controls are enabled for Investor role." : ""}
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
                  <td className="px-4 py-3 font-semibold">{item.invoiceId}</td>
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
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" onClick={() => onOpenDetail(item.invoiceId)} className="rounded-lg border border-[#c4d7f3] bg-white px-2 py-1 text-[11px] font-semibold text-[#284d84]">Details</button>
                      <button type="button" disabled={!canManage} onClick={() => onVerify(item.invoiceId)} className="rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-45">Verify</button>
                      <button type="button" disabled={!canManage} onClick={() => onReject(item.invoiceId)} className="rounded-lg border border-rose-300 bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-800 disabled:cursor-not-allowed disabled:opacity-45">Reject</button>
                      <button type="button" disabled={!canManage} onClick={() => onSimulateRepayment(item.invoiceId)} className="rounded-lg border border-cyan-300 bg-cyan-100 px-2 py-1 text-[11px] font-semibold text-cyan-800 disabled:cursor-not-allowed disabled:opacity-45">Simulate Repayment</button>
                      <button type="button" disabled={!canManage} onClick={() => onMarkDefault(item.invoiceId)} className="rounded-lg border border-red-300 bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-800 disabled:cursor-not-allowed disabled:opacity-45">Mark Default</button>
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
