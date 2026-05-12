"use client";

import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { InvoiceRecord } from "@/lib/app-data";
import { UserRole } from "./types";

const formatUSDT = (amount: number) => `${amount.toLocaleString("en-US")} USDT`;

type HistoryItem = {
  id: string;
  invoiceId: string;
  title: string;
  subtitle: string;
  amount?: string;
  status: string;
  tone: "blue" | "emerald" | "amber" | "rose";
};

function buildHistory(role: UserRole, invoices: InvoiceRecord[]): HistoryItem[] {
  const items = invoices
    .map((invoice) => {
      if (role === "Exporter") {
        if (invoice.status === "Funded") {
          return {
            id: `${invoice.id}-funded`,
            invoiceId: invoice.id,
            title: "Funding received",
            subtitle: `Investor funded this invoice`,
            amount: formatUSDT(invoice.purchasePrice),
            status: "Funded",
            tone: "emerald" as const,
          };
        }
        if (invoice.status === "Repaid") {
          return {
            id: `${invoice.id}-repaid`,
            invoiceId: invoice.id,
            title: "Repayment posted",
            subtitle: "Repayment transaction submitted",
            amount: formatUSDT(invoice.faceValue),
            status: "Repaid",
            tone: "blue" as const,
          };
        }
        if (invoice.status === "Claimed") {
          return {
            id: `${invoice.id}-claimed`,
            invoiceId: invoice.id,
            title: "Claim completed",
            subtitle: "Investor claim finalized",
            status: "Claimed",
            tone: "blue" as const,
          };
        }
      }

      if (role === "Investor") {
        if (invoice.status === "Funded") {
          return {
            id: `${invoice.id}-funded`,
            invoiceId: invoice.id,
            title: "Invoice funded",
            subtitle: "Position opened",
            amount: formatUSDT(invoice.purchasePrice),
            status: "Funded",
            tone: "blue" as const,
          };
        }
        if (invoice.status === "Repaid") {
          return {
            id: `${invoice.id}-repaid`,
            invoiceId: invoice.id,
            title: "Repayment arrived",
            subtitle: "Funds are in vault, ready to claim",
            amount: formatUSDT(invoice.faceValue),
            status: "Repaid",
            tone: "emerald" as const,
          };
        }
        if (invoice.status === "Claimed") {
          return {
            id: `${invoice.id}-claimed`,
            invoiceId: invoice.id,
            title: "Repayment claimed",
            subtitle: "Funds moved to your account",
            amount: formatUSDT(invoice.faceValue),
            status: "Claimed",
            tone: "emerald" as const,
          };
        }
        if (invoice.status === "Defaulted") {
          return {
            id: `${invoice.id}-defaulted`,
            invoiceId: invoice.id,
            title: "Default event",
            subtitle: "Position marked as defaulted",
            status: "Defaulted",
            tone: "rose" as const,
          };
        }
      }

      return {
        id: `${invoice.id}-status`,
        invoiceId: invoice.id,
        title: "Status update",
        subtitle: `Current stage: ${invoice.status}`,
        status: invoice.status,
        tone: "amber" as const,
      };
    })
    .slice(0, 20);

  return items;
}

function ToneBadge({ tone, status }: { tone: HistoryItem["tone"]; status: string }) {
  const styleMap = {
    blue: "border-[#bdd2f5] bg-[#edf4ff] text-[#295fa6]",
    emerald: "border-[#bde8d7] bg-[#eafaf3] text-[#1e7556]",
    amber: "border-[#f0d7a8] bg-[#fff5e6] text-[#8b6427]",
    rose: "border-[#f3c4cc] bg-[#fff0f3] text-[#9a3342]",
  } as const;

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styleMap[tone]}`}>{status}</span>;
}

type Props = {
  role: UserRole;
  invoices: InvoiceRecord[];
};

export function HistoryView({ role, invoices }: Props) {
  const items = buildHistory(role, invoices);

  return (
    <section>
      <h2 className="text-lg font-semibold text-[#143260]">History</h2>
      <p className="mt-1 text-sm text-[#5d7598]">Timeline of funding and settlement activity for your account.</p>

      <div className="mt-4 grid gap-3">
        {items.length ? (
          items.map((item) => {
            const Icon = item.status === "Funded"
              ? ArrowUpFromLine
              : item.status === "Repaid"
                ? ArrowDownToLine
                : item.status === "Claimed"
                  ? CheckCircle2
                  : item.status === "Defaulted"
                    ? XCircle
                    : Clock3;

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#cfe0f6] bg-[linear-gradient(160deg,#ffffff,#f5f9ff)] p-4 shadow-[0_8px_18px_rgba(21,56,108,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="rounded-xl border border-[#c7daf4] bg-white p-2 text-[#3567ae]">
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#173f74]">{item.title}</p>
                      <p className="mt-1 text-xs text-[#5f7ea6]">{item.subtitle}</p>
                    </div>
                  </div>
                  <ToneBadge tone={item.tone} status={item.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#deebfa] pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.11em] text-[#5f7ba2]">{item.invoiceId}</p>
                  {item.amount ? <p className="text-sm font-semibold text-[#1a4f94]">{item.amount}</p> : null}
                </div>
              </article>
            );
          })
        ) : (
          <article className="rounded-2xl border border-[#d3e2f6] bg-[#f7fbff] p-4 text-sm text-[#5f7ba2]">
            No activity yet.
          </article>
        )}
      </div>
    </section>
  );
}
