"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileLock2, FileSearch, Landmark, LockKeyhole, Shield, UserRoundCheck } from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";

const controls = [
  { icon: FileSearch, title: "Off-chain legal documents" },
  { icon: FileLock2, title: "On-chain document hashes" },
  { icon: UserRoundCheck, title: "KYB/KYC-ready architecture" },
  { icon: Landmark, title: "Licensed factoring partner ready" },
  { icon: LockKeyhole, title: "No sensitive data stored on-chain" },
  { icon: Shield, title: "Pilot deployment for hackathon" },
];

export default function SecuritySection() {
  const reducedMotion = useReducedMotion();

  return (
    <SectionReveal id="security" className="mx-auto mt-20 max-w-7xl px-4 md:px-8" delay={0.1}>
      <div className="relative overflow-hidden rounded-3xl border border-[#c6d8f1] bg-[linear-gradient(160deg,#f3f8ff,#edf3fc_45%,#e8eff9)] p-7 shadow-[0_16px_45px_rgba(22,53,97,0.14)] md:p-10">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#d6e8ff]/60 blur-2xl" />

        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#45658f]">Security and compliance</p>
        <h3 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-[#102b56] md:text-3xl">
          Institutional posture by design, with legal records off-chain and settlement proof on-chain
        </h3>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {controls.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.52, delay: idx * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-[#c9dcf7] bg-white/70 px-4 py-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#bfd2ef] bg-white text-[#2856a7]">
                <item.icon size={15} />
              </div>
              <p className="text-sm font-medium text-[#1f3d66]">{item.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
