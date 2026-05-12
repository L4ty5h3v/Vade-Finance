"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useConnection, useWallet, type AnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { createVadeClient } from "@/lib/vade-client";
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

const short = (value: string) => `${value.slice(0, 4)}...${value.slice(-4)}`;

type InvoiceMeta = {
  debtor: string;
  debtorCountry: string;
  goodsCategory: string;
};

export function AppShell() {
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction, signAllTransactions } = useWallet();
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
  const [invoiceMeta, setInvoiceMeta] = useState<Record<string, InvoiceMeta>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("vade_invoice_meta");
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, InvoiceMeta>;
    } catch {
      return {};
    }
  });
  const [syncing, setSyncing] = useState(false);

  const anchorWallet = useMemo<AnchorWallet | null>(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    return { publicKey, signTransaction, signAllTransactions };
  }, [publicKey, signAllTransactions, signTransaction]);

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const saveMeta = useCallback((next: Record<string, InvoiceMeta>) => {
    setInvoiceMeta(next);
    localStorage.setItem("vade_invoice_meta", JSON.stringify(next));
  }, []);

  const canFund = role === "Investor";
  const canCreate = role === "Exporter";
  const canManageVerification = connected;

  const getInvoiceById = (invoiceId: string): InvoiceRecord | undefined => {
    return invoices.find((item) => item.id === invoiceId || item.pubkey === invoiceId);
  };

  const syncFromChain = useCallback(async () => {
    if (!anchorWallet) return;

    setSyncing(true);
    try {
      const client = createVadeClient(connection, anchorWallet);
      const rows = await client.fetchInvoices();

      const marketInvoices: InvoiceRecord[] = rows.map((row) => {
        const meta = row.pubkey ? invoiceMeta[row.pubkey] : undefined;
        const termDays = Math.max(Math.round((new Date(row.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 1);

        return {
          pubkey: row.pubkey,
          exporterWallet: row.exporter,
          investorWallet: row.investor,
          id: row.invoiceId,
          exporter: short(row.exporter),
          debtor: meta?.debtor || "Off-chain debtor",
          debtorCountry: meta?.debtorCountry || "N/A",
          faceValue: row.faceValueUi,
          purchasePrice: row.purchasePriceUi,
          termDays,
          risk: row.risk,
          status: row.status,
          expectedReturn: row.purchasePriceUi > 0 ? ((row.faceValueUi - row.purchasePriceUi) / row.purchasePriceUi) * 100 : 0,
          dueDate: row.dueDate,
          documentHash: row.documentHash,
          metadataHash: row.metadataHash,
          txSignature: row.pubkey,
          duplicateCheck: "Clean",
          goodsCategory: meta?.goodsCategory || "General Goods",
        };
      });

      const ownWallet = anchorWallet.publicKey.toBase58();

      const ownInvoices = marketInvoices.filter((item) => item.exporterWallet === ownWallet);
      const myRows: MyInvoiceRow[] = ownInvoices.map((item) => ({
        invoiceId: item.id,
        debtor: item.debtor,
        faceValue: item.faceValue,
        purchasePrice: item.purchasePrice,
        dueDate: item.dueDate,
        verification: item.status === "Rejected" ? "Rejected" : item.status === "Submitted" ? "Submitted" : "Verified",
        funding: item.status === "Funded" || item.status === "Repaid" || item.status === "Claimed" ? "Funded" : item.status === "Submitted" ? "Pending" : "Open",
      }));

      const ownPositions = marketInvoices
        .filter((item) => item.investorWallet === ownWallet)
        .map((item) => ({
          invoiceId: item.id,
          invested: item.purchasePrice,
          expectedRepayment: item.faceValue,
          profit: item.faceValue - item.purchasePrice,
          dueDate: item.dueDate,
          status: item.status === "Repaid" || item.status === "Claimed" ? "Repaid" : item.status === "Funded" ? "Active" : "Pending",
        })) as PortfolioPosition[];

      const queue: VerificationItem[] = marketInvoices.map((item) => ({
        pubkey: item.pubkey,
        exporterWallet: item.exporterWallet,
        investorWallet: item.investorWallet,
        invoiceId: item.id,
        exporter: item.exporter,
        debtor: item.debtor,
        amount: item.faceValue,
        documents: [item.documentHash, item.metadataHash],
        risk: item.risk,
        duplicateCheck: "Clean",
        status: item.status as VerificationItem["status"],
      }));

      setInvoices(marketInvoices);
      setMyInvoices(myRows);
      setPortfolio(ownPositions);
      setVerificationQueue(queue);
    } catch (error) {
      pushToast(`On-chain sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSyncing(false);
    }
  }, [anchorWallet, connection, invoiceMeta, pushToast]);

  useEffect(() => {
    if (!connected || !anchorWallet) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void syncFromChain();
  }, [anchorWallet, connected, syncFromChain]);

  const onCreateInvoice = async (input: NewInvoiceInput) => {
    if (!connected || !anchorWallet) {
      pushToast("Connect wallet to create invoice");
      return;
    }

    try {
      const client = createVadeClient(connection, anchorWallet);
      const { signature, invoicePda } = await client.createInvoice({
        invoiceNumber: input.invoiceNumber,
        debtor: input.debtorCompany,
        debtorCountry: input.debtorCountry,
        faceValueUi: input.faceValue,
        paymentTermDays: input.paymentTerm,
        goodsCategory: input.goodsCategory,
        dueDate: input.dueDate,
      });

      const nextMeta = {
        ...invoiceMeta,
        [invoicePda.toBase58()]: {
          debtor: input.debtorCompany,
          debtorCountry: input.debtorCountry,
          goodsCategory: input.goodsCategory,
        },
      };
      saveMeta(nextMeta);

      pushToast(`Invoice created on-chain: ${signature.slice(0, 8)}...`);
      await syncFromChain();
    } catch (error) {
      pushToast(`Create failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const withInvoice = (invoiceId: string): InvoiceRecord | undefined => {
    const invoice = getInvoiceById(invoiceId);
    if (!invoice?.pubkey) {
      pushToast("Invoice is not mapped to an on-chain record");
      return undefined;
    }
    return invoice;
  };

  const onVerify = async (invoiceId: string) => {
    if (!anchorWallet) return pushToast("Connect wallet first");
    const invoice = withInvoice(invoiceId);
    if (!invoice) return;

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.verifyInvoice(new PublicKey(invoice.pubkey!));
      pushToast(`Verified on-chain: ${sig.slice(0, 8)}...`);
      await syncFromChain();
    } catch (error) {
      pushToast(`Verify failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const onList = async (invoiceId: string) => {
    if (!anchorWallet) return pushToast("Connect wallet first");
    const invoice = withInvoice(invoiceId);
    if (!invoice) return;

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.listInvoice(new PublicKey(invoice.pubkey!));
      pushToast(`Listed on-chain: ${sig.slice(0, 8)}...`);
      await syncFromChain();
    } catch (error) {
      pushToast(`List failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const onReject = () => {
    pushToast("Reject is not implemented in Phase 1 contract scope");
  };

  const onSimulateRepayment = async (invoiceId: string) => {
    if (!anchorWallet) return pushToast("Connect wallet first");
    const invoice = withInvoice(invoiceId);
    if (!invoice) return;

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.repayInvoice(new PublicKey(invoice.pubkey!));
      pushToast(`Repayment posted: ${sig.slice(0, 8)}...`);
      await syncFromChain();
    } catch (error) {
      pushToast(`Repayment failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const onClaim = async (invoiceId: string) => {
    if (!anchorWallet) return pushToast("Connect wallet first");
    const invoice = withInvoice(invoiceId);
    if (!invoice) return;

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.claimRepayment(new PublicKey(invoice.pubkey!));
      pushToast(`Claim complete: ${sig.slice(0, 8)}...`);
      await syncFromChain();
    } catch (error) {
      pushToast(`Claim failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const onMarkDefault = async (invoiceId: string) => {
    if (!anchorWallet) return pushToast("Connect wallet first");
    const invoice = withInvoice(invoiceId);
    if (!invoice) return;

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.markDefault(new PublicKey(invoice.pubkey!));
      pushToast(`Marked default: ${sig.slice(0, 8)}...`);
      await syncFromChain();
    } catch (error) {
      pushToast(`Default failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const onFundConfirm = async (invoiceId: string) => {
    if (!connected || !anchorWallet) {
      pushToast("Connect wallet to fund invoices");
      return;
    }

    if (!canFund) {
      pushToast("Switch to Investor role to fund invoices");
      return;
    }

    const target = invoices.find((item) => item.id === invoiceId);
    if (!target?.pubkey || !target.exporterWallet) {
      pushToast("Invoice missing on-chain mapping");
      return;
    }

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.fundInvoice(new PublicKey(target.pubkey), new PublicKey(target.exporterWallet));
      pushToast(`Funded on-chain: ${sig.slice(0, 8)}...`);
      setFundTarget(undefined);
      await syncFromChain();
    } catch (error) {
      pushToast(`Funding failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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
          onList={onList}
          onReject={onReject}
          onSimulateRepayment={onSimulateRepayment}
          onClaim={onClaim}
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

          <div className="border-b border-[#d5e3f6] bg-[#f7fbff] px-4 py-2 text-xs text-[#537198] md:px-6">
            Mode: On-chain devnet {syncing ? "• syncing..." : "• synced"}
          </div>

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

      <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={(input) => void onCreateInvoice(input)} />
      <FundInvoiceModal open={!!fundTarget} invoice={fundTarget} onClose={() => setFundTarget(undefined)} onConfirm={(id) => void onFundConfirm(id)} />
      <InvoiceDetailDrawer open={!!detailTarget} invoice={detailTarget} onClose={() => setDetailTarget(undefined)} />
      <ToastStack toasts={toasts} />
    </div>
  );
}
