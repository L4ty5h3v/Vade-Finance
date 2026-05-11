"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionReveal } from "@/components/ui/SectionReveal";

const metrics = [
  { label: "Volume", value: "$10M" },
  { label: "Day Avg Terms", value: "60" },
  { label: "Solana Settlement", value: "1.2s" },
  { label: "Ownership Trail", value: "100%" },
];

export default function MetricsSection() {
  const reducedMotion = useReducedMotion();

  return (
    <SectionReveal className="mx-auto mt-16 max-w-7xl px-4 md:px-8" delay={0.05}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#43648f]">Performance Signals</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#132c57] md:text-3xl">
            Financing metrics built for institutional trust
          </h3>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.55, delay: idx * 0.06 }}
            className="frosted rounded-2xl p-6"
          >
            <p className="text-xs uppercase tracking-[0.17em] text-[#5c7396]">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#112a52] md:text-4xl">{metric.value}</p>
          </motion.div>
        ))}
      </div>
    </SectionReveal>
  );
}
