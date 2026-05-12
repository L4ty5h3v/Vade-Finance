"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { InvoiceRecord, MyInvoiceRow, PortfolioPosition } from "@/lib/app-data";
import { StatusBadge } from "./StatusBadge";
import { UserRole } from "./types";

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

type Props = {
  role: UserRole;
  positions: PortfolioPosition[];
  myInvoices: MyInvoiceRow[];
  marketInvoices: InvoiceRecord[];
  canCreate: boolean;
  onOpenCreate: () => void;
  onOpenDetail: (invoiceId: string) => void;
};

export function PortfolioView({
  role,
  positions,
  myInvoices,
  marketInvoices,
  canCreate,
  onOpenCreate,
  onOpenDetail,
}: Props) {
  const reducedMotion = useReducedMotion();

  if (role === "Exporter") {
    const totals = myInvoices.reduce(
      (acc, item) => {
        acc.face += item.faceValue;
        acc.receives += item.purchasePrice;
        if (item.funding === "Funded") acc.funded += 1;
        return acc;
      },
      { face: 0, receives: 0, funded: 0 },
    );

    const awaiting = Math.max(myInvoices.length - totals.funded, 0);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#143260]">Exporter portfolio</h2>
            <p className="text-sm text-[#5d7598]">Funding outcomes and liquidity progress for your invoices.</p>
          </div>
          {canCreate ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-4 py-2 text-sm font-semibold text-[#0f3f91]"
              onClick={onOpenCreate}
            >
              <Plus size={16} /> Create Invoice
            </button>
          ) : null}
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Receivables", formatUSDT(totals.face)],
            ["Liquidity Received", formatUSDT(totals.receives)],
            ["Funded Invoices", `${totals.funded}`],
            ["Awaiting Funding", `${awaiting}`],
          ].map(([label, value], idx) => (
            <motion.article
              key={label}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="rounded-2xl border border-[#c7daf4] bg-white/85 p-4"
            >
              <p className="text-xs uppercase tracking-[0.13em] text-[#5f7ba2]">{label}</p>
              <p className="mt-2 text-xl font-semibold text-[#123462]">{value}</p>
            </motion.article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#c7daf4] bg-white/85">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#edf4ff] text-xs uppercase tracking-[0.13em] text-[#58729a]">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Face Value</th>
                  <th className="px-4 py-3">Company Receives</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Funding Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {myInvoices.map((row, idx) => (
                  <motion.tr
                    key={row.invoiceId}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    className="border-t border-[#d8e5f7] text-[#163b67]"
                  >
                    <td className="px-4 py-3 font-semibold">{row.invoiceId}</td>
                    <td className="px-4 py-3">{formatUSDT(row.faceValue)}</td>
                    <td className="px-4 py-3 font-semibold text-[#1b4c99]">{formatUSDT(row.purchasePrice)}</td>
                    <td className="px-4 py-3">{row.dueDate}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.funding} /></td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded-lg border border-[#c4d7f3] bg-white px-3 py-1.5 text-xs font-semibold text-[#284d84]"
                        onClick={() => onOpenDetail(row.invoiceId)}
                      >
                        View details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  const totals = positions.reduce(
    (acc, item) => {
      acc.invested += item.invested;
      acc.repayment += item.expectedRepayment;
      acc.profit += item.profit;
      if (item.status === "Pending") acc.pending += item.expectedRepayment;
      return acc;
    },
    { invested: 0, repayment: 0, profit: 0, pending: 0 },
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#143260]">Investor portfolio</h2>
        <p className="text-sm text-[#5d7598]">Portfolio characteristics and full invoice deal flow.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Active positions", positions.filter((i) => i.status === "Active").length.toString()],
          ["Total Invested", formatUSDT(totals.invested)],
          ["Expected Repayment", formatUSDT(totals.repayment)],
          ["Expected Profit", formatUSDT(totals.profit)],
          ["Pending Claims", formatUSDT(totals.pending)],
        ].map(([label, value], idx) => (
          <motion.article
            key={label}
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.04 }}
            className="rounded-2xl border border-[#c7daf4] bg-white/85 p-4"
          >
            <p className="text-xs uppercase tracking-[0.13em] text-[#5f7ba2]">{label}</p>
            <p className="mt-2 text-xl font-semibold text-[#123462]">{value}</p>
          </motion.article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#c7daf4] bg-white/85">
        <div className="border-b border-[#d8e5f7] bg-[#f7fbff] px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.13em] text-[#58729a]">Deal Book</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#edf4ff] text-xs uppercase tracking-[0.13em] text-[#58729a]">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Exporter</th>
                <th className="px-4 py-3">Debtor</th>
                <th className="px-4 py-3">Face Value</th>
                <th className="px-4 py-3">Purchase Price</th>
                <th className="px-4 py-3">Expected Return</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {marketInvoices.map((row, idx) => {
                return (
                  <motion.tr
                    key={`deal-${row.id}`}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    className="border-t border-[#d8e5f7] text-[#163b67]"
                  >
                    <td className="px-4 py-3 font-semibold">{row.id}</td>
                    <td className="px-4 py-3">{row.exporter}</td>
                    <td className="px-4 py-3">{row.debtor}</td>
                    <td className="px-4 py-3">{formatUSDT(row.faceValue)}</td>
                    <td className="px-4 py-3">{formatUSDT(row.purchasePrice)}</td>
                    <td className="px-4 py-3 font-semibold text-[#1b4c99]">{row.expectedReturn.toFixed(2)}%</td>
                    <td className="px-4 py-3">{row.dueDate}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded-lg border border-[#c4d7f3] bg-white px-3 py-1.5 text-xs font-semibold text-[#284d84]"
                        onClick={() => onOpenDetail(row.id)}
                      >
                        View details
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
