"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, CircleCheckBig, Landmark, ShieldCheck, WalletCards } from "lucide-react";
import { SectionReveal } from "@/components/ui/SectionReveal";

const badges = [
  { icon: BadgeCheck, label: "Verified invoices" },
  { icon: WalletCards, label: "USDT settlement" },
  { icon: CircleCheckBig, label: "On-chain audit trail" },
  { icon: ShieldCheck, label: "Compliance-ready" },
  { icon: Landmark, label: "Solana devnet" },
];

export default function TrustBadges() {
  const reducedMotion = useReducedMotion();

  return (
    <SectionReveal className="mx-auto mt-12 max-w-7xl px-4 md:px-8" delay={0.1}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {badges.map((badge, idx) => (
          <motion.div
            key={badge.label}
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: idx * 0.06 }}
            className="group frosted flex items-center gap-3 rounded-xl px-4 py-3"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#b8cff0] bg-white/80 text-[#2453a8]">
              <badge.icon size={17} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-sm font-medium text-[#1f3960] transition group-hover:text-[#103f8f]">{badge.label}</p>
          </motion.div>
        ))}
      </div>
    </SectionReveal>
  );
}
