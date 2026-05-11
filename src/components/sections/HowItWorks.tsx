"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, FileCheck2, Landmark, ScanSearch } from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";

const steps = [
  {
    title: "Exporter submits invoice",
    text: "Upload invoice and shipment documents.",
    icon: FileCheck2,
    chip: "invoice_id: INV-2026-001",
  },
  {
    title: "Platform verifies documents",
    text: "Off-chain verification, KYB/KYC-ready flow, duplicate check.",
    icon: ScanSearch,
    chip: "document_hash: 0x7c4a...e91",
  },
  {
    title: "Investor funds invoice",
    text: "Verified invoices are funded with USDT.",
    icon: Landmark,
    chip: "escrow_state: active",
  },
  {
    title: "Repayment settles on-chain",
    text: "Ownership, repayment, and claim events are tracked through Solana.",
    icon: BadgeCheck,
    chip: "repayment_event: emitted",
  },
];

export default function HowItWorks() {
  const reducedMotion = useReducedMotion();

  return (
    <SectionReveal id="how-it-works" className="mx-auto mt-20 max-w-7xl px-4 md:px-8" delay={0.08}>
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#43648f]">How it works</p>
      <h3 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-[#112b56] md:text-3xl">
        A clear pipeline from invoice upload to settled repayment
      </h3>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {steps.map((step, idx) => (
          <motion.article
            key={step.title}
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{ duration: 0.58, delay: idx * 0.08 }}
            className="frosted group rounded-2xl p-6 transition hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#b8d0ef] bg-white/80 text-[#2857a7]">
                <step.icon size={20} />
              </div>
              <span className="rounded-full border border-[#bdd2ef] bg-[#eaf3ff] px-2.5 py-1 text-[11px] font-medium text-[#446b9f]">
                {step.chip}
              </span>
            </div>
            <h4 className="mt-5 text-lg font-semibold text-[#153360]">{step.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[#4c668e]">{step.text}</p>
          </motion.article>
        ))}
      </div>
    </SectionReveal>
  );
}
