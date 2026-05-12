import { CircleCheckBig, Database, FileCheck2, KeyRound, ShieldCheck, Workflow } from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const sections = [
  {
    title: "Overview",
    text: "vade is an invoice financing infrastructure layer for exporters and investors. Exporters list verified receivables, investors fund discounted invoices, and settlement events are tracked transparently.",
    icon: CircleCheckBig,
  },
  {
    title: "System Architecture",
    text: "The stack is split into marketplace frontend, verification backend workflows, and settlement event tracking for ownership and repayment states.",
    icon: Workflow,
  },
  {
    title: "Data and State Model",
    text: "Core objects include invoice records, funding offers, repayment schedules, verification statuses, and immutable document hash references.",
    icon: Database,
  },
  {
    title: "Verification Flow",
    text: "Invoices are submitted with trade documentation, checked for consistency and duplicates, risk-scored, then approved or rejected before listing.",
    icon: FileCheck2,
  },
  {
    title: "Security",
    text: "Sensitive documents remain off-chain, while hash references and lifecycle events provide auditability. Role-based operations separate exporter and investor actions.",
    icon: ShieldCheck,
  },
  {
    title: "Access and Integrations",
    text: "Planned integrations include wallet identity, partner compliance providers, and API endpoints for institutional onboarding and reporting.",
    icon: KeyRound,
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef5ff_0%,#e7f0fd_55%,#eef5ff_100%)] text-[#102749]">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-8">
        <Link href="https://vade.finance" className="text-sm font-medium text-[#2b5ba8] hover:text-[#173f82]">
          ← Back to landing
        </Link>

        <header className="mt-5 rounded-3xl border border-[#c6d8f2] bg-white/80 p-6 md:p-8">
          <div className="mb-3">
            <BrandLogo href="https://vade.finance" size="lg" />
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#5c769b]">Documentation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102b56] md:text-4xl">vade Protocol & Product Docs</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4f678e] md:text-base">
            This document provides a concise technical and product baseline for partners, auditors, and contributors evaluating vade.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-[#c6d8f2] bg-white/82 p-5 shadow-[0_10px_24px_rgba(20,52,99,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#bfd3f0] bg-[#f2f7ff] text-[#2858a7]">
                <section.icon size={18} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#13315e]">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#4e678f]">{section.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-[#c6d8f2] bg-white/85 p-6">
          <h2 className="text-lg font-semibold text-[#12305c]">API Baseline (Planned)</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#3f5d88]">
            <li><code>POST /invoices</code> create invoice submission</li>
            <li><code>GET /marketplace</code> list verified opportunities</li>
            <li><code>POST /funding/:id</code> confirm funding commitment</li>
            <li><code>POST /verification/:id/approve</code> approve invoice</li>
            <li><code>POST /repayments/:id/claim</code> claim settled repayment</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
