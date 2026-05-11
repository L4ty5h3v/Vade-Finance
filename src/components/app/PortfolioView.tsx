"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PortfolioPosition } from "@/lib/app-data";
import { StatusBadge } from "./StatusBadge";

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

type Props = {
  positions: PortfolioPosition[];
  onClaim: (invoiceId: string) => void;
  onOpenDetail: (invoiceId: string) => void;
};

export function PortfolioView({ positions, onClaim, onOpenDetail }: Props) {
  const reducedMotion = useReducedMotion();
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
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Active positions", positions.filter((i) => i.status === "Active").length.toString()],
          ["Total Invested", formatUSDT(totals.invested)],
          ["Expected Repayment", formatUSDT(totals.repayment)],
          ["Realized Profit", formatUSDT(totals.profit)],
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#edf4ff] text-xs uppercase tracking-[0.13em] text-[#58729a]">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Invested</th>
                <th className="px-4 py-3">Expected Repayment</th>
                <th className="px-4 py-3">Profit</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((row, idx) => (
                <motion.tr
                  key={row.invoiceId}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="border-t border-[#d8e5f7] text-[#163b67]"
                >
                  <td className="px-4 py-3 font-semibold">{row.invoiceId}</td>
                  <td className="px-4 py-3">{formatUSDT(row.invested)}</td>
                  <td className="px-4 py-3">{formatUSDT(row.expectedRepayment)}</td>
                  <td className="px-4 py-3">{formatUSDT(row.profit)}</td>
                  <td className="px-4 py-3">{row.dueDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#c4d7f3] bg-white px-3 py-1.5 text-xs font-semibold text-[#284d84]"
                        onClick={() => onOpenDetail(row.invoiceId)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        disabled={row.status !== "Repaid"}
                        onClick={() => onClaim(row.invoiceId)}
                        className="rounded-lg border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-3 py-1.5 text-xs font-semibold text-[#0f3f91] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Claim
                      </button>
                    </div>
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
