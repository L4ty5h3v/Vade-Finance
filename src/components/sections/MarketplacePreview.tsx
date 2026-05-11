"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarClock, ReceiptText } from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function MarketplacePreview() {
  const reducedMotion = useReducedMotion();

  return (
    <SectionReveal id="marketplace-preview" className="mx-auto mt-20 max-w-7xl px-4 md:px-8" delay={0.06}>
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#43648f]">Marketplace Preview</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#102a56] md:text-3xl">
        Verified invoice opportunity feed with audit-ready metadata
      </h3>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, delay: 0.1 }}
        className="frosted mt-8 rounded-3xl p-5 md:p-7"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#c6d8f2] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5a77a0]">Exporter</p>
            <p className="mt-2 text-sm font-semibold text-[#173866]">Anatolia Olive Export Ltd</p>
          </div>
          <div className="rounded-2xl border border-[#c6d8f2] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5a77a0]">Debtor</p>
            <p className="mt-2 text-sm font-semibold text-[#173866]">Berlin Gourmet GmbH</p>
          </div>
          <div className="rounded-2xl border border-[#c6d8f2] bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5a77a0]">Settlement</p>
            <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#173866]">
              <CalendarClock size={15} className="text-[#2d64cc]" />
              60 days
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#c6d8f2] bg-white/78">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#e9f2ff] text-xs uppercase tracking-[0.14em] text-[#5d7494]">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Face Value</th>
                <th className="px-4 py-3">Purchase Price</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#d4e2f6] text-[#173866]">
                <td className="px-4 py-4">
                  <p className="font-semibold">INV-2026-001</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#4f6d95]">
                    <ReceiptText size={12} />
                    Due: Aug 10, 2026
                  </p>
                </td>
                <td className="px-4 py-4 font-medium">10,000 USDT</td>
                <td className="px-4 py-4 font-medium">9,500 USDT</td>
                <td className="px-4 py-4">
                  <RiskBadge risk="B+" />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status="Verified" />
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#9ec2f4] bg-[#1e57dd] px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1c4fc8]"
                  >
                    Fund Invoice <ArrowRight size={13} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#c2d7f5] bg-[#f0f7ff] px-3 py-1 text-[#416b9f]">tx: 4uv2...8as1</span>
          <span className="rounded-full border border-[#c2d7f5] bg-[#f0f7ff] px-3 py-1 text-[#416b9f]">due: 2026-08-10</span>
          <span className="rounded-full border border-[#c2d7f5] bg-[#f0f7ff] px-3 py-1 text-[#416b9f]">vault_state: funded</span>
        </div>
      </motion.div>
    </SectionReveal>
  );
}
