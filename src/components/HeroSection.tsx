"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import SloganReveal from "./SloganReveal";

const Dither = dynamic(() => import("@/components/Dither/Dither"), { ssr: false });

export default function HeroSection() {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section
      id="product"
      className="relative flex min-h-screen items-end overflow-hidden bg-[#08152f] pt-28 md:items-center"
    >
      <Dither
        waveColor={[0.12, 0.35, 0.95]}
        waveSpeed={0.04}
        waveFrequency={3}
        waveAmplitude={isMobile ? 0.2 : 0.28}
        colorNum={5}
        pixelSize={isMobile ? 3 : 2}
        enableMouseInteraction={!isMobile}
        mouseRadius={0.35}
        reducedMotion={!!reducedMotion}
      />

      <div className="absolute inset-0 bg-radial-[circle_at_50%_30%] from-[#193b83b3] via-[#07132cc7] to-[#060e1fcc]" />
      <div className="grid-overlay" />
      <div className="noise-overlay" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
        <SloganReveal
          text="From invoice to liquidity instantly"
          className="mt-2 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        />

        <motion.h2
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.95 }}
          className="mt-6 max-w-3xl text-xl leading-snug text-[#d7e7ff] sm:text-2xl md:text-3xl"
        >
          Turn unpaid export invoices into instant liquidity
        </motion.h2>

        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 1.15 }}
          className="mt-4 max-w-2xl text-sm leading-7 text-[#acc7e8] sm:text-base"
        >
          A Solana-powered financing layer for verified Turkish exporters and global investors.
        </motion.p>

      </div>

      <div className="pointer-events-none absolute inset-0 z-20 mx-auto hidden max-w-7xl px-8 lg:block">
        <motion.article
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 1.4 }}
          className="float-anim pointer-events-auto absolute right-[6%] top-[26%] w-56 rounded-2xl border border-[#a7c8ff70] bg-[#f6fbffdd] p-4 text-[#173b76] shadow-[0_26px_45px_rgba(12,34,77,0.25)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#436ba7]">Invoice</p>
          <p className="mt-2 text-sm font-semibold">INV-2026-001</p>
          <p className="mt-2 text-lg font-semibold">10,000 USDT</p>
          <div className="mt-3 flex items-center justify-between text-xs text-[#426699]">
            <span>Net 60</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700">
              <CheckCircle2 size={12} />
              Verified
            </span>
          </div>
        </motion.article>

        <motion.article
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 1.65 }}
          className="float-anim pointer-events-auto absolute bottom-[16%] right-[14%] w-52 rounded-2xl border border-[#b8d7ff73] bg-[#edf6ffdb] p-4 text-[#173b76] shadow-[0_16px_40px_rgba(13,37,86,0.22)]"
          style={{ animationDelay: "2.4s" }}
        >
          <p className="text-sm font-semibold">On-chain ownership trail</p>
          <p className="mt-2 text-xs text-[#5578a8]">Solana Devnet</p>
          <p className="mt-3 rounded-lg bg-[#d8e9ff] px-2 py-1 text-[11px] font-medium text-[#2455a0]">Tx: 3m9p...x8k2</p>
        </motion.article>
      </div>
    </section>
  );
}
