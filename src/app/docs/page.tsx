import { ArrowLeft, BadgeCheck, CircleHelp, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";

const quickStart = [
  "Open /app and connect your wallet.",
  "If this is your first login, complete a short profile setup.",
  "Deposit funds into app balance.",
  "Choose your workflow: Exporter or Investor.",
] as const;

const exporterSteps = [
  "Create invoice from Portfolio.",
  "Wait until invoice appears as listed/funded in your views.",
  "Use Repay for funded invoices when you want to simulate repayment.",
] as const;

const investorSteps = [
  "Open Marketplace and review listed invoices.",
  "Fund available invoices from app balance.",
  "When invoice becomes Repaid, claim repayment from Portfolio.",
] as const;

const statuses = [
  ["Submitted", "Invoice has been created and is waiting for verification."],
  ["Verified", "Invoice passed verification checks."],
  ["Listed", "Invoice is available for funding in Marketplace."],
  ["Funded", "Funding is completed."],
  ["Repaid", "Repayment was submitted and can be claimed."],
  ["Claimed", "Repayment has been claimed."],
  ["Defaulted", "Invoice was marked as defaulted."],
] as const;

const faq = [
  {
    q: "Why can't I fund some invoices?",
    a: "Funding is available only for invoices in Listed status and only if your app balance is enough.",
  },
  {
    q: "Why can't I repay an invoice?",
    a: "Repay is available for funded invoices and requires enough app balance.",
  },
  {
    q: "Why can't I claim repayment?",
    a: "Claim is available only when invoice status is Repaid.",
  },
  {
    q: "What's the difference between wallet balance and app balance?",
    a: "Wallet balance is in your wallet token account. App balance is the balance used directly by app actions (fund/repay).",
  },
] as const;

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff6ff_0%,#e8f1ff_55%,#eef5ff_100%)] text-[#102749]">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2b5ba8] hover:text-[#173f82]">
          <ArrowLeft size={14} /> Back to landing
        </Link>

        <header className="mt-4 rounded-3xl border border-[#c6d8f2] bg-white/85 p-6 shadow-[0_16px_34px_rgba(19,52,98,0.08)] md:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#5c769b]">User Documentation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102b56] md:text-4xl">How to use vade.finance</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4f678e] md:text-base">
            This guide is written for end users. It explains what you can do in the app and how each action works.
          </p>
        </header>

        <section className="mt-6 rounded-3xl border border-[#c6d8f2] bg-white/82 p-6">
          <div className="flex items-center gap-2 text-[#214f95]">
            <BadgeCheck size={18} />
            <h2 className="text-xl font-semibold text-[#12305c]">Quick Start</h2>
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#4e678f]">
            {quickStart.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-[#c6d8f2] bg-white/82 p-6">
            <div className="flex items-center gap-2 text-[#214f95]">
              <Wallet size={18} />
              <h2 className="text-xl font-semibold text-[#12305c]">Exporter Flow</h2>
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#4e678f]">
              {exporterSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>

          <article className="rounded-3xl border border-[#c6d8f2] bg-white/82 p-6">
            <div className="flex items-center gap-2 text-[#214f95]">
              <ShieldCheck size={18} />
              <h2 className="text-xl font-semibold text-[#12305c]">Investor Flow</h2>
            </div>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#4e678f]">
              {investorSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>

        <section className="mt-6 rounded-3xl border border-[#c6d8f2] bg-white/82 p-6">
          <h2 className="text-xl font-semibold text-[#12305c]">Status Meanings</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#edf4ff] text-xs uppercase tracking-[0.13em] text-[#58729a]">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map(([name, meaning]) => (
                  <tr key={name} className="border-t border-[#d8e5f7] text-[#163b67]">
                    <td className="px-4 py-3 font-semibold">{name}</td>
                    <td className="px-4 py-3">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#c6d8f2] bg-white/82 p-6">
          <div className="flex items-center gap-2 text-[#214f95]">
            <CircleHelp size={18} />
            <h2 className="text-xl font-semibold text-[#12305c]">FAQ</h2>
          </div>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-[#d0e1f7] bg-[#f7fbff] p-4">
                <p className="text-sm font-semibold text-[#163b67]">{item.q}</p>
                <p className="mt-1 text-sm text-[#4e678f]">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#c6d8f2] bg-white/82 p-6">
          <h2 className="text-xl font-semibold text-[#12305c]">Important Note</h2>
          <p className="mt-3 text-sm leading-7 text-[#4e678f]">
            This is a demo environment. Transactions are simulated on devnet using a mock stablecoin.
            Use this app for product demonstration and testing only.
          </p>
        </section>
      </div>
    </main>
  );
}
