"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import BrandLogo from "./BrandLogo";

type InfoKey = "about" | "contact" | "api" | "legal";

const infoContent: Record<InfoKey, { title: string; body: string[] }> = {
  about: {
    title: "About vade.finance",
    body: [
      "vade.finance is an invoice financing infrastructure layer for exporters and investors.",
      "The current release is focused on transparent lifecycle tracking, role-based actions, and Solana devnet settlement simulation.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "For product questions and partnership requests, the fastest channels are our X profile and GitHub repository.",
      "Use X for updates and outreach, and GitHub for issues, roadmap visibility, and technical collaboration.",
    ],
  },
  api: {
    title: "API",
    body: [
      "The backend is exposed via versioned endpoints under /api/v1 for auth, invoices, balance, and history flows.",
      "For integration details and endpoint behavior, use the docs portal and backend reference in the project repository.",
    ],
  },
  legal: {
    title: "Legal",
    body: [
      "This environment is a devnet demo and is provided for testing and product demonstration purposes.",
      "It is not financial advice, and production financing operations require jurisdiction-specific legal and compliance review.",
    ],
  },
};

export default function Footer() {
  const [activeInfo, setActiveInfo] = useState<InfoKey | null>(null);
  const modal = useMemo(() => (activeInfo ? infoContent[activeInfo] : null), [activeInfo]);

  return (
    <footer id="docs" className="mt-24 border-t border-[#c5d8f3] bg-[#0c1b38] text-[#d8e8ff]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <BrandLogo href="https://vade.finance" size="lg" theme="dark" />
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#aecaef]">
              Invoice financing infrastructure for verified exporters, powered by Solana settlement.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><a href="#marketplace-preview" className="hover:text-white">Marketplace</a></li>
              <li><a href="https://app.vade.finance" className="hover:text-white">Dashboard</a></li>
              <li><a href="#how-it-works" className="hover:text-white">Invoice Verification</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><button type="button" className="hover:text-white" onClick={() => setActiveInfo("about")}>About</button></li>
              <li><a href="#security" className="hover:text-white">Security</a></li>
              <li><button type="button" className="hover:text-white" onClick={() => setActiveInfo("contact")}>Contact</button></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Resources</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><a href="https://docs.vade.finance" className="hover:text-white">Docs</a></li>
              <li><button type="button" className="hover:text-white" onClick={() => setActiveInfo("api")}>API</button></li>
              <li><button type="button" className="hover:text-white" onClick={() => setActiveInfo("legal")}>Legal</button></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#95b3df]">Social</p>
            <ul className="mt-3 space-y-2 text-sm text-[#d4e5ff]">
              <li><a href="https://x.com/VadeFinance" target="_blank" rel="noreferrer" className="hover:text-white">X</a></li>
              <li><a href="https://github.com/L4ty5h3v/Vade-Finance" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#23406f] pt-6 text-xs text-[#a5bfdc]">
          <p>Built on Solana Devnet</p>
          <p className="mt-2">
            Not financial advice. Invoice financing is subject to regulation.
          </p>
        </div>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081226bb] px-4" onClick={() => setActiveInfo(null)}>
          <div
            className="w-full max-w-xl rounded-2xl border border-[#2e4b77] bg-[linear-gradient(180deg,#10274b_0%,#0d203f_100%)] p-6 text-[#dbe9ff] shadow-[0_24px_60px_rgba(3,12,26,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">{modal.title}</h3>
              <button
                type="button"
                aria-label="Close details"
                className="rounded-lg border border-[#3a5b8f] bg-[#112a50] p-1.5 text-[#b8d1f6] hover:text-white"
                onClick={() => setActiveInfo(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[#c7daf6]">
              {modal.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
