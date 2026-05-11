"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CircleCheckBig, Clock3, FileClock, Landmark, Link2 } from "lucide-react";
import { auditTrailPreview, overviewMetrics, pipelineBars, recentActivity } from "@/lib/app-data";
import { UserRole } from "./types";
import { StatusBadge } from "./StatusBadge";

const metricToneMap: Record<string, string> = {
  blue: "from-[#edf4ff] to-[#dfeaff] text-[#123f8f] border-[#c5d9f7]",
  cyan: "from-[#ebfbff] to-[#dcf5ff] text-[#0f5c72] border-[#bce3f4]",
  emerald: "from-[#ecfcf5] to-[#dcf8ea] text-[#17644e] border-[#bde7d8]",
  purple: "from-[#f0edff] to-[#e4ddff] text-[#3f328f] border-[#d3c8ff]",
};

const roleNotes: Record<UserRole, string> = {
  Exporter: "Focus: create and list invoices with faster liquidity access.",
  Investor: "Focus: evaluate verified deals and monitor repayment events.",
};

export function DashboardOverview({ role }: { role: UserRole }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-[#5d7598]">{roleNotes[role]}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {overviewMetrics.map((metric, idx) => (
            <motion.article
              key={metric.label}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className={`rounded-2xl border bg-gradient-to-br p-4 shadow-[0_10px_26px_rgba(21,50,96,0.08)] ${metricToneMap[metric.tone]}`}
            >
              <p className="text-xs uppercase tracking-[0.14em] opacity-80">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold tracking-tight">{metric.value}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <motion.article
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="rounded-2xl border border-[#c7daf4] bg-white/80 p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#45658f]">Funding pipeline</h2>
            <StatusBadge status="Pending" />
          </div>
          <div className="mt-5 space-y-3">
            {pipelineBars.map((bar) => (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#55729b]">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="h-2 rounded-full bg-[#e7f0ff]">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(120deg,#1f59f0,#2c83de)]"
                    initial={reducedMotion ? false : { width: 0 }}
                    animate={reducedMotion ? { width: `${bar.value * 2.2}%` } : { width: `${bar.value * 2.2}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="rounded-2xl border border-[#c7daf4] bg-white/80 p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#45658f]">Recent activity</h2>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((item, idx) => (
              <motion.li
                key={item.text}
                initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                animate={reducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 + 0.22 }}
                className="flex gap-3"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[#2b66d8]" />
                <div>
                  <p className="text-sm font-medium text-[#173a67]">{item.text}</p>
                  <p className="text-xs text-[#6780a3]">{item.time}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <motion.article
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="rounded-2xl border border-[#c7daf4] bg-white/80 p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#45658f]">Repayment statuses</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#c8daf4] bg-[#f4f8ff] p-3">
              <p className="text-xs text-[#6180a8]">Upcoming</p>
              <p className="mt-1 text-lg font-semibold text-[#153d80]">18,400 USDT</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#5b7598]"><Clock3 size={13} /> Due in 7 days</p>
            </div>
            <div className="rounded-xl border border-[#bee6d6] bg-[#edfbf4] p-3">
              <p className="text-xs text-[#4f8f74]">Repaid</p>
              <p className="mt-1 text-lg font-semibold text-[#17644e]">44,200 USDT</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#4f8f74]"><CircleCheckBig size={13} /> Settlement complete</p>
            </div>
            <div className="rounded-xl border border-[#f2d4b4] bg-[#fff6ea] p-3">
              <p className="text-xs text-[#976b31]">Pending claim</p>
              <p className="mt-1 text-lg font-semibold text-[#7c5728]">8,950 USDT</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#8f652f]"><FileClock size={13} /> Awaiting investor claim</p>
            </div>
            <div className="rounded-xl border border-[#c7daf4] bg-[#f4f8ff] p-3">
              <p className="text-xs text-[#6180a8]">Platform fees</p>
              <p className="mt-1 text-lg font-semibold text-[#153d80]">1,240 USDT</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-[#5b7598]"><Landmark size={13} /> Ledger settled</p>
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="rounded-2xl border border-[#c7daf4] bg-white/80 p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#45658f]">Audit trail preview</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#20436f]">
            {auditTrailPreview.map((chip) => (
              <li key={chip} className="inline-flex w-full items-center gap-2 rounded-lg border border-[#d0e1f7] bg-[#f7fbff] px-3 py-2 font-mono text-xs">
                <Link2 size={13} className="text-[#2a61c6]" />
                {chip}
              </li>
            ))}
          </ul>
        </motion.article>
      </section>
    </div>
  );
}
