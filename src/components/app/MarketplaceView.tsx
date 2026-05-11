"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Filter, Globe, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import { InvoiceRecord } from "@/lib/app-data";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

type Props = {
  invoices: InvoiceRecord[];
  onViewDetails: (invoice: InvoiceRecord) => void;
  onFundInvoice: (invoice: InvoiceRecord) => void;
  canFund: boolean;
};

export function MarketplaceView({ invoices, onViewDetails, onFundInvoice, canFund }: Props) {
  const reducedMotion = useReducedMotion();
  const [risk, setRisk] = useState<string>("All");
  const [term, setTerm] = useState<string>("All");
  const [amount, setAmount] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [country, setCountry] = useState<string>("All");

  const filtered = useMemo(() => {
    return invoices.filter((item) => {
      const riskOk = risk === "All" || item.risk === risk;
      const termOk =
        term === "All" ||
        (term === "<=60" ? item.termDays <= 60 : term === "61-90" ? item.termDays >= 61 && item.termDays <= 90 : item.termDays > 90);
      const amountOk =
        amount === "All" ||
        (amount === "<=20k" ? item.faceValue <= 20000 : amount === "20k-40k" ? item.faceValue > 20000 && item.faceValue <= 40000 : item.faceValue > 40000);
      const statusOk = status === "All" || item.status === status;
      const countryOk = country === "All" || item.debtorCountry === country;
      return riskOk && termOk && amountOk && statusOk && countryOk;
    });
  }, [amount, country, invoices, risk, status, term]);

  const filters = [
    { label: "Risk", value: risk, set: setRisk, options: ["All", "A-", "B+", "B"] },
    { label: "Term", value: term, set: setTerm, options: ["All", "<=60", "61-90", ">90"] },
    { label: "Amount", value: amount, set: setAmount, options: ["All", "<=20k", "20k-40k", ">40k"] },
    { label: "Status", value: status, set: setStatus, options: ["All", "Verified", "Listed", "Funded"] },
    { label: "Debtor country", value: country, set: setCountry, options: ["All", "Germany"] },
  ] as const;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#c7daf4] bg-white/80 p-4 md:p-5">
        <div className="mb-3 flex items-center gap-2 text-[#2b5285]">
          <Filter size={15} />
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em]">Filters</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {filters.map((item) => (
            <label key={item.label} className="space-y-1 text-xs text-[#58729a]">
              <span>{item.label}</span>
              <select
                value={item.value}
                onChange={(event) => item.set(event.target.value)}
                className="w-full rounded-xl border border-[#c7daf4] bg-[#f9fbff] px-3 py-2 text-sm text-[#203f6a] outline-none focus:border-[#8fb5f0]"
              >
                {item.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-[#c7daf4] bg-white/80 xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#edf4ff] text-xs uppercase tracking-[0.13em] text-[#58729a]">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Face Value</th>
                <th className="px-4 py-3">Purchase</th>
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Return</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice, idx) => (
                <motion.tr
                  key={invoice.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="border-t border-[#d8e5f7] text-[#163b67]"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold">{invoice.id}</p>
                    <p className="text-xs text-[#5c7498]">{invoice.exporter} → {invoice.debtor}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#5f7aa0]"><Globe size={12} /> {invoice.debtorCountry}</p>
                  </td>
                  <td className="px-4 py-4 font-medium">{formatUSDT(invoice.faceValue)}</td>
                  <td className="px-4 py-4 font-medium">{formatUSDT(invoice.purchasePrice)}</td>
                  <td className="px-4 py-4">{invoice.termDays} days</td>
                  <td className="px-4 py-4"><RiskBadge risk={invoice.risk} /></td>
                  <td className="px-4 py-4"><StatusBadge status={invoice.status} /></td>
                  <td className="px-4 py-4 font-semibold text-[#1b4c99]">{invoice.expectedReturn.toFixed(2)}%</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#c4d7f3] bg-white px-3 py-1.5 text-xs font-semibold text-[#284d84] hover:bg-[#f1f6ff]"
                        onClick={() => onViewDetails(invoice)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        disabled={!canFund}
                        className="rounded-lg border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-3 py-1.5 text-xs font-semibold text-[#0f3f91] hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                        onClick={() => onFundInvoice(invoice)}
                      >
                        Fund Invoice
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 xl:hidden">
        {filtered.map((invoice, idx) => (
          <motion.article
            key={invoice.id}
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.04 }}
            className="rounded-2xl border border-[#c7daf4] bg-white/85 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#153966]">{invoice.id}</p>
                <p className="text-xs text-[#5a7298]">{invoice.exporter} → {invoice.debtor}</p>
              </div>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#3a5b88]">
              <p>Face: <span className="font-semibold">{formatUSDT(invoice.faceValue)}</span></p>
              <p>Purchase: <span className="font-semibold">{formatUSDT(invoice.purchasePrice)}</span></p>
              <p>Term: <span className="font-semibold">{invoice.termDays} days</span></p>
              <p>Return: <span className="font-semibold">{invoice.expectedReturn.toFixed(2)}%</span></p>
              <p>Due: <span className="font-semibold">{invoice.dueDate}</span></p>
              <p>Risk: <RiskBadge risk={invoice.risk} /></p>
            </div>
            <div className="mt-3 rounded-lg border border-[#d3e1f5] bg-[#f5f9ff] px-2.5 py-2 text-xs font-mono text-[#4e6e99]">
              <ReceiptText size={12} className="mr-1 inline" /> {invoice.documentHash}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-[#c4d7f3] bg-white px-3 py-2 text-xs font-semibold text-[#284d84]"
                onClick={() => onViewDetails(invoice)}
              >
                View Details
              </button>
              <button
                type="button"
                disabled={!canFund}
                className="flex-1 rounded-lg border border-[#b8d3ff] bg-[linear-gradient(160deg,#f8fbff,#dce9ff)] px-3 py-2 text-xs font-semibold text-[#0f3f91] disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => onFundInvoice(invoice)}
              >
                Fund Invoice
              </button>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
