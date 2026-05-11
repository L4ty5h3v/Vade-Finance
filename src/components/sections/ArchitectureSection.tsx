"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Cable, Database, LayoutPanelTop } from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";

const nodes = [
  {
    title: "Frontend Marketplace",
    description: "Listing, investor discovery, and ownership views.",
    icon: LayoutPanelTop,
  },
  {
    title: "Verification Backend",
    description: "Document checks, KYB/KYC-ready flow, duplicate detection.",
    icon: Database,
  },
  {
    title: "Solana Settlement Layer",
    description: "Escrow states, repayment events, and ownership trail.",
    icon: Cable,
  },
];

const chips = ["document_hash", "invoice_pda", "vault_state", "repayment_event", "tx: 8y2m...r0h5"];

export default function ArchitectureSection() {
  const reducedMotion = useReducedMotion();

  return (
    <SectionReveal className="mx-auto mt-20 max-w-7xl px-4 md:px-8" delay={0.08}>
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#43648f]">Architecture</p>
      <h3 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-[#102a55] md:text-3xl">
        Infrastructure flow from app experience to on-chain settlement
      </h3>

      <div className="relative mt-8 grid gap-4 md:grid-cols-3">
        {!reducedMotion ? (
          <svg
            className="pointer-events-none absolute left-0 top-[68px] hidden h-24 w-full md:block"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <motion.path
              d="M170,35 C260,5 310,5 410,35"
              fill="none"
              stroke="#6da3e6"
              strokeWidth="2"
              strokeDasharray="7 6"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
            <motion.path
              d="M580,35 C680,5 740,5 840,35"
              fill="none"
              stroke="#6da3e6"
              strokeWidth="2"
              strokeDasharray="7 6"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
        ) : null}

        {nodes.map((node, idx) => (
          <motion.article
            key={node.title}
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay: idx * 0.08 }}
            className="frosted relative z-10 rounded-2xl p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#bdd1ef] bg-white/80 text-[#2b5aa8]">
              <node.icon size={18} />
            </div>
            <h4 className="mt-4 text-lg font-semibold text-[#173a67]">{node.title}</h4>
            <p className="mt-2 text-sm leading-6 text-[#516a8f]">{node.description}</p>
          </motion.article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#456a9b]">
        {chips.map((chip) => (
          <span key={chip} className="rounded-full border border-[#c1d7f5] bg-[#eef6ff] px-3 py-1">
            {chip}
          </span>
        ))}
      </div>
    </SectionReveal>
  );
}
