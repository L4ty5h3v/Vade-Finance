"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { MyInvoiceRow } from "@/lib/app-data";
import { StatusBadge } from "./StatusBadge";

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

type Props = {
  invoices: MyInvoiceRow[];
  onOpenCreate: () => void;
  onOpenDetail: (invoiceId: string) => void;
  canCreate: boolean;
};

export function MyInvoicesView({ invoices, onOpenCreate, onOpenDetail, canCreate }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#143260]">Exporter invoice desk</h2>
          <p className="text-sm text-[#5d7598]">Create and track invoices before funding.</p>
        </div>
        {canCreate ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-4 py-2 text-sm font-semibold text-[#0f3f91]"
            onClick={onOpenCreate}
          >
            <Plus size={16} /> Create Invoice
          </button>
        ) : (
          <p className="text-xs text-[#5d7598]">Create invoice is enabled for Exporter role.</p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#c7daf4] bg-white/85">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#edf4ff] text-xs uppercase tracking-[0.13em] text-[#58729a]">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Debtor</th>
                <th className="px-4 py-3">Face Value</th>
                <th className="px-4 py-3">Purchase Price</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Funding</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((row, idx) => (
                <motion.tr
                  key={row.invoiceId}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="border-t border-[#d8e5f7] text-[#163b67]"
                >
                  <td className="px-4 py-3 font-semibold">{row.invoiceId}</td>
                  <td className="px-4 py-3">{row.debtor}</td>
                  <td className="px-4 py-3">{formatUSDT(row.faceValue)}</td>
                  <td className="px-4 py-3">{formatUSDT(row.purchasePrice)}</td>
                  <td className="px-4 py-3">{row.dueDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.verification} /></td>
                  <td className="px-4 py-3"><StatusBadge status={row.funding} /></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="rounded-lg border border-[#c4d7f3] bg-white px-3 py-1.5 text-xs font-semibold text-[#284d84]"
                      onClick={() => onOpenDetail(row.invoiceId)}
                    >
                      View
                    </button>
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
