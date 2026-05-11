"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { X } from "lucide-react";
import { useState } from "react";
import {
  baseInvoices,
  InvoiceRecord,
  myInvoicesSeed,
  MyInvoiceRow,
  portfolioSeed,
  PortfolioPosition,
  verificationSeed,
  VerificationItem,
} from "@/lib/app-data";
import { CreateInvoiceModal, NewInvoiceInput } from "./CreateInvoiceModal";
import { FundInvoiceModal } from "./FundInvoiceModal";
import { InvoiceDetailDrawer } from "./InvoiceDetailDrawer";
import { MarketplaceView } from "./MarketplaceView";
import { PortfolioView } from "./PortfolioView";
import { Sidebar } from "./Sidebar";
import { ToastMessage, ToastStack } from "./ToastStack";
import { TopBar } from "./TopBar";
import { AppView, UserRole } from "./types";
import { VerificationView } from "./VerificationView";

const titles: Record<AppView, string> = {
  Marketplace: "Invoice Marketplace",
  Portfolio: "Portfolio",
  Verification: "Verification Queue",
};

const mapRisk = (term: number): InvoiceRecord["risk"] => {
  if (term <= 45) return "A-";
  if (term <= 75) return "B+";
  return "B";
};

export function AppShell() {
  const { connected } = useWallet();
  const reducedMotion = useReducedMotion();
  const [activeView, setActiveView] = useState<AppView>("Marketplace");
  const [role, setRole] = useState<UserRole>("Exporter");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(baseInvoices);
  const [myInvoices, setMyInvoices] = useState<MyInvoiceRow[]>(myInvoicesSeed);
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>(portfolioSeed);
  const [verificationQueue, setVerificationQueue] = useState<VerificationItem[]>(verificationSeed);

  const [createOpen, setCreateOpen] = useState(false);
  const [fundTarget, setFundTarget] = useState<InvoiceRecord | undefined>(undefined);
  const [detailTarget, setDetailTarget] = useState<InvoiceRecord | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  };

  const canFund = role === "Investor";
  const canCreate = role === "Exporter";
  const canManageVerification = role === "Investor";

  const getInvoiceById = (invoiceId: string): InvoiceRecord | undefined => {
    const existing = invoices.find((item) => item.id === invoiceId);
    if (existing) return existing;

    const fromMy = myInvoices.find((item) => item.invoiceId === invoiceId);
    if (fromMy) {
      return {
        id: fromMy.invoiceId,
        exporter: "User Exporter",
        debtor: fromMy.debtor,
        debtorCountry: "Germany",
        faceValue: fromMy.faceValue,
        purchasePrice: fromMy.purchasePrice,
        termDays: 60,
        risk: "B+",
        status: fromMy.verification,
        expectedReturn: Number((((fromMy.faceValue - fromMy.purchasePrice) / fromMy.purchasePrice) * 100).toFixed(2)),
        dueDate: fromMy.dueDate,
        documentHash: "0xnew...a91c",
        metadataHash: "0xnew...4f2e",
        txSignature: "N/A",
        duplicateCheck: "Clean",
        goodsCategory: "General Goods",
      };
    }

    const fromQueue = verificationQueue.find((item) => item.invoiceId === invoiceId);
    if (fromQueue) {
      return {
        id: fromQueue.invoiceId,
        exporter: fromQueue.exporter,
        debtor: fromQueue.debtor,
        debtorCountry: "Germany",
        faceValue: fromQueue.amount,
        purchasePrice: Math.round(fromQueue.amount * 0.95),
        termDays: 60,
        risk: fromQueue.risk,
        status: fromQueue.status,
        expectedReturn: 5.26,
        dueDate: "2026-09-30",
        documentHash: "0xqueue...doc",
        metadataHash: "0xqueue...meta",
        txSignature: "pending",
        duplicateCheck: fromQueue.duplicateCheck,
        goodsCategory: "Unspecified",
      };
    }

    return undefined;
  };

  const onCreateInvoice = (input: NewInvoiceInput) => {
    const verification = {
      invoiceId: input.invoiceNumber,
      exporter: "User Exporter",
      debtor: input.debtorCompany,
      amount: input.faceValue,
      documents: [input.invoicePdf || "invoice.pdf", input.shipmentProof || "shipment-proof.pdf"],
      risk: mapRisk(input.paymentTerm),
      duplicateCheck: "Clean" as const,
      status: "Submitted" as const,
    };

    const marketInvoice: InvoiceRecord = {
      id: input.invoiceNumber,
      exporter: "User Exporter",
      debtor: input.debtorCompany,
      debtorCountry: input.debtorCountry,
      faceValue: input.faceValue,
      purchasePrice: Math.round(input.faceValue * 0.95),
      termDays: input.paymentTerm,
      risk: mapRisk(input.paymentTerm),
      status: "Submitted",
      expectedReturn: Number((((input.faceValue - Math.round(input.faceValue * 0.95)) / Math.round(input.faceValue * 0.95)) * 100).toFixed(2)),
      dueDate: input.dueDate,
      documentHash: "0xnew...submitted",
      metadataHash: "0xnew...meta",
      txSignature: "pending",
      duplicateCheck: "Clean",
      goodsCategory: input.goodsCategory,
    };

    setMyInvoices((prev) => [
      {
        invoiceId: input.invoiceNumber,
        debtor: input.debtorCompany,
        faceValue: input.faceValue,
        purchasePrice: Math.round(input.faceValue * 0.95),
        dueDate: input.dueDate,
        verification: "Submitted",
        funding: "Pending",
      },
      ...prev,
    ]);
    setVerificationQueue((prev) => [verification, ...prev]);
    setInvoices((prev) => [marketInvoice, ...prev]);
    pushToast("Invoice submitted for verification");
  };

  const onVerify = (invoiceId: string) => {
    setVerificationQueue((prev) => prev.map((item) => (item.invoiceId === invoiceId ? { ...item, status: "Verified" } : item)));
    setInvoices((prev) => prev.map((item) => (item.id === invoiceId ? { ...item, status: "Verified" } : item)));
    pushToast("Invoice verified and ready for marketplace");
  };

  const onReject = (invoiceId: string) => {
    setVerificationQueue((prev) => prev.map((item) => (item.invoiceId === invoiceId ? { ...item, status: "Rejected" } : item)));
    setInvoices((prev) => prev.map((item) => (item.id === invoiceId ? { ...item, status: "Rejected" } : item)));
    pushToast("Invoice rejected");
  };

  const onSimulateRepayment = (invoiceId: string) => {
    setVerificationQueue((prev) => prev.map((item) => (item.invoiceId === invoiceId ? { ...item, status: "Repaid" } : item)));
    setInvoices((prev) => prev.map((item) => (item.id === invoiceId ? { ...item, status: "Repaid" } : item)));
    setPortfolio((prev) => prev.map((item) => (item.invoiceId === invoiceId ? { ...item, status: "Repaid" } : item)));
    pushToast("Repayment simulated and repayment_event emitted");
  };

  const onMarkDefault = (invoiceId: string) => {
    setVerificationQueue((prev) => prev.map((item) => (item.invoiceId === invoiceId ? { ...item, status: "Defaulted" } : item)));
    setInvoices((prev) => prev.map((item) => (item.id === invoiceId ? { ...item, status: "Defaulted" } : item)));
    pushToast("Invoice marked as defaulted");
  };

  const onFundConfirm = (invoiceId: string) => {
    const target = invoices.find((item) => item.id === invoiceId);
    if (!target) return;
    setInvoices((prev) => prev.map((item) => (item.id === invoiceId ? { ...item, status: "Funded" } : item)));
    setPortfolio((prev) => {
      if (prev.some((item) => item.invoiceId === invoiceId)) return prev;
      return [
        {
          invoiceId,
          invested: target.purchasePrice,
          expectedRepayment: target.faceValue,
          profit: target.faceValue - target.purchasePrice,
          dueDate: target.dueDate,
          status: "Active",
        },
        ...prev,
      ];
    });
    pushToast("Invoice funded");
    setFundTarget(undefined);
  };

  const openById = (id: string) => {
    const found = getInvoiceById(id);
    if (found) setDetailTarget(found);
  };

  const renderContent = () => {
    if (activeView === "Marketplace") {
      return (
        <MarketplaceView
          invoices={invoices}
          onViewDetails={(invoice) => setDetailTarget(invoice)}
          onFundInvoice={(invoice) => {
            if (!connected) {
              pushToast("Connect wallet to fund invoices");
              return;
            }
            if (!canFund) {
              pushToast("Switch to Investor role to fund invoices");
              return;
            }
            setFundTarget(invoice);
          }}
          canFund={canFund}
        />
      );
    }

    if (activeView === "Portfolio") {
      return (
        <PortfolioView
          role={role}
          positions={portfolio}
          myInvoices={myInvoices}
          marketInvoices={invoices}
          canCreate={canCreate}
          onOpenCreate={() => setCreateOpen(true)}
          onOpenDetail={openById}
        />
      );
    }

    if (activeView === "Verification") {
      return (
        <VerificationView
          queue={verificationQueue}
          onVerify={onVerify}
          onReject={onReject}
          onSimulateRepayment={onSimulateRepayment}
          onMarkDefault={onMarkDefault}
          onOpenDetail={openById}
          canManage={canManageVerification}
        />
      );
    }

    return null;
  };

  const title = activeView === "Portfolio" && role === "Exporter" ? "Exporter Portfolio" : titles[activeView];

  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#eff5ff_0%,#e8f0fd_55%,#eff5ff_100%)] text-[#102749]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <div className="hidden md:block">
          <Sidebar active={activeView} onSelect={setActiveView} />
        </div>

        <main className="relative flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar title={title} role={role} onRoleChange={setRole} onOpenMobileNav={() => setMobileNavOpen(true)} />

          <div className="min-w-0 flex-1 p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={reducedMotion ? {} : { opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.div
            className="fixed inset-0 z-40 bg-[#08152faa] md:hidden"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={reducedMotion ? {} : { opacity: 1 }}
            exit={reducedMotion ? {} : { opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
          >
            <motion.div
              className="h-full w-[84%] max-w-[300px]"
              initial={reducedMotion ? false : { x: -24, opacity: 0 }}
              animate={reducedMotion ? {} : { x: 0, opacity: 1 }}
              exit={reducedMotion ? {} : { x: -24, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex h-14 items-center justify-end border-b border-[#c8dbf6] bg-[#f9fbff] px-3">
                <button
                  type="button"
                  className="rounded-lg border border-[#c9dcf5] bg-white p-2 text-[#355987]"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                >
                  <X size={16} />
                </button>
              </div>
              <Sidebar active={activeView} onSelect={setActiveView} onNavigate={() => setMobileNavOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={onCreateInvoice} />
      <FundInvoiceModal open={!!fundTarget} invoice={fundTarget} onClose={() => setFundTarget(undefined)} onConfirm={onFundConfirm} />
      <InvoiceDetailDrawer open={!!detailTarget} invoice={detailTarget} onClose={() => setDetailTarget(undefined)} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
