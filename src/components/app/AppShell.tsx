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
import { ActionSuccessModal } from "./ActionSuccessModal";
import { CreateInvoiceModal, NewInvoiceInput } from "./CreateInvoiceModal";
import { DepositModal } from "./DepositModal";
import { FundInvoiceModal } from "./FundInvoiceModal";
import { InvoiceDetailDrawer } from "./InvoiceDetailDrawer";
import { MarketplaceView } from "./MarketplaceView";
import { HistoryView } from "./HistoryView";
import { PortfolioView } from "./PortfolioView";
import { RegistrationModal } from "./RegistrationModal";
import { SettingsView } from "./SettingsView";
import { Sidebar } from "./Sidebar";
import { ToastMessage, ToastStack } from "./ToastStack";
import { TopBar } from "./TopBar";
import { AppView, UserRole, WalletProfile } from "./types";
import { VerificationView } from "./VerificationView";
import { WithdrawModal } from "./WithdrawModal";

const titles: Record<AppView, string> = {
  Marketplace: "Invoice Marketplace",
  Portfolio: "Portfolio",
  History: "History",
  Verification: "Verification Queue",
  Settings: "Settings",
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(baseInvoices);
  const [myInvoices, setMyInvoices] = useState<MyInvoiceRow[]>(myInvoicesSeed);
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>(portfolioSeed);
  const [verificationQueue, setVerificationQueue] = useState<VerificationItem[]>(verificationSeed);

  const [createOpen, setCreateOpen] = useState(false);
  const [fundTarget, setFundTarget] = useState<InvoiceRecord | undefined>(undefined);
  const [detailTarget, setDetailTarget] = useState<InvoiceRecord | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [appBalanceUsdt, setAppBalanceUsdt] = useState(0);
  const [successModal, setSuccessModal] = useState<{ mode: "fund" | "repay"; invoiceId: string; amount: number } | null>(null);
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
  const [walletProfiles, setWalletProfiles] = useState<Record<string, WalletProfile>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("vade_wallet_profiles");
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, WalletProfile>;
    } catch {
      return {};
    }
  });

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

  const refreshAppBalance = useCallback(async () => {
    if (!anchorWallet) {
      setAppBalanceUsdt(0);
      return;
    }
    try {
      const client = createVadeClient(connection, anchorWallet);
      const balance = await client.getAppBalance();
      setAppBalanceUsdt(balance.amountUi);
    } catch {
      setAppBalanceUsdt(0);
    }
  }, [anchorWallet, connection]);

  const saveProfiles = useCallback((next: Record<string, WalletProfile>) => {
    setWalletProfiles(next);
    localStorage.setItem("vade_wallet_profiles", JSON.stringify(next));
  }, []);

  const saveMeta = useCallback((next: Record<string, InvoiceMeta>) => {
    setInvoiceMeta(next);
    localStorage.setItem("vade_invoice_meta", JSON.stringify(next));
  }, []);

  const walletAddress = publicKey?.toBase58();
  const profile = walletAddress ? walletProfiles[walletAddress] : undefined;
  const role: UserRole = profile?.role ?? "Exporter";
  const displayName = profile?.displayName ?? "Unregistered";
  const registrationOpen = Boolean(connected && walletAddress && !profile);

  const canFund = role === "Investor";
  const canCreate = role === "Exporter";
  const canManageVerification = connected;

  const visibleInvoices = useMemo(() => {
    if (role === "Verifier") return invoices;
    if (!walletAddress) return [];

    if (role === "Exporter") {
      return invoices.filter((item) => item.exporterWallet === walletAddress);
    }

    return invoices.filter((item) => {
      if (item.investorWallet !== walletAddress) return false;
      return item.status === "Funded" || item.status === "Repaid" || item.status === "Claimed" || item.status === "Defaulted";
    });
  }, [invoices, role, walletAddress]);

  const visibleVerificationQueue = useMemo(() => {
    if (role === "Verifier") return verificationQueue;
    const visibleIds = new Set(visibleInvoices.map((item) => item.id));
    return verificationQueue.filter((item) => visibleIds.has(item.invoiceId));
  }, [role, verificationQueue, visibleInvoices]);
  const effectiveActiveView: AppView =
    role === "Verifier" && (activeView === "Portfolio" || activeView === "History")
      ? "Verification"
      : role !== "Verifier" && activeView === "Verification"
        ? "Marketplace"
        : activeView;

  const getInvoiceById = (invoiceId: string): InvoiceRecord | undefined => {
    return invoices.find((item) => item.id === invoiceId || item.pubkey === invoiceId);
  };

  const syncFromChain = useCallback(async () => {
    if (!anchorWallet) return;
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
          investor: row.investor ? short(row.investor) : undefined,
          vaultState: row.vaultState,
          vaultBalance: row.vaultBalanceUi,
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
      const appBalance = await client.getAppBalance();
      setAppBalanceUsdt(appBalance.amountUi);
    } catch (error) {
      pushToast(`On-chain sync failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [anchorWallet, connection, invoiceMeta, pushToast]);

  useEffect(() => {
    if (!connected || !anchorWallet) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void syncFromChain();
  }, [anchorWallet, connected, syncFromChain]);

  const onCreateInvoice = async (input: NewInvoiceInput) => {
    if (!profile) {
      pushToast("Complete wallet registration first");
      return;
    }
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

  const saveCurrentWalletProfile = (next: WalletProfile) => {
    if (!walletAddress) return;
    saveProfiles({
      ...walletProfiles,
      [walletAddress]: next,
    });
  };

  const onRegister = (payload: WalletProfile) => {
    saveCurrentWalletProfile(payload);
    pushToast("Wallet profile saved");
  };

  const onUpdateProfile = (payload: WalletProfile) => {
    saveCurrentWalletProfile(payload);
    pushToast("Profile updated");
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
    if ((invoice.faceValue || 0) > appBalanceUsdt) {
      pushToast("Not enough app balance. Deposit to app account first.");
      return;
    }

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.repayInvoiceFromAppBalance(new PublicKey(invoice.pubkey!));
      pushToast(`Repayment posted: ${sig.slice(0, 8)}...`);
      setSuccessModal({ mode: "repay", invoiceId: invoice.id, amount: invoice.faceValue });
      await syncFromChain();
      await refreshAppBalance();
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
    if (!profile) {
      pushToast("Complete wallet registration first");
      return;
    }
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
    if ((target.purchasePrice || 0) > appBalanceUsdt) {
      pushToast("Not enough app balance. Deposit to app account first.");
      return;
    }

    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.fundInvoiceFromAppBalance(new PublicKey(target.pubkey), new PublicKey(target.exporterWallet));
      pushToast(`Funded on-chain: ${sig.slice(0, 8)}...`);
      setSuccessModal({ mode: "fund", invoiceId: target.id, amount: target.purchasePrice });
      setFundTarget(undefined);
      await syncFromChain();
      await refreshAppBalance();
    } catch (error) {
      pushToast(`Funding failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const onDepositToApp = async (amount: number) => {
    if (!anchorWallet) {
      pushToast("Connect wallet first");
      return;
    }
    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.depositToAppBalance(amount);
      pushToast(`Deposited to app: ${sig.slice(0, 8)}...`);
      setDepositOpen(false);
      await refreshAppBalance();
    } catch (error) {
      pushToast(`Deposit failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const onWithdrawFromApp = async (amount: number) => {
    if (!anchorWallet) {
      pushToast("Connect wallet first");
      return;
    }
    if (amount > appBalanceUsdt) {
      pushToast("Not enough app balance for withdraw");
      return;
    }
    try {
      const client = createVadeClient(connection, anchorWallet);
      const sig = await client.withdrawFromAppBalance(amount);
      pushToast(`Withdraw complete: ${sig.slice(0, 8)}...`);
      setWithdrawOpen(false);
      await refreshAppBalance();
    } catch (error) {
      pushToast(`Withdraw failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const openById = (id: string) => {
    const found = getInvoiceById(id);
    if (found) setDetailTarget(found);
  };

  const renderContent = () => {
    if (effectiveActiveView === "Marketplace") {
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

    if (effectiveActiveView === "Portfolio") {
      if (role === "Verifier") return null;
      return (
        <PortfolioView
          role={role}
          positions={portfolio}
          myInvoices={myInvoices}
          marketInvoices={visibleInvoices}
          canCreate={canCreate}
          onOpenCreate={() => setCreateOpen(true)}
          onOpenDetail={openById}
          onRepayInvoice={(invoiceId) => void onSimulateRepayment(invoiceId)}
        />
      );
    }

    if (effectiveActiveView === "History") {
      if (role === "Verifier") return null;
      return <HistoryView role={role} invoices={visibleInvoices} />;
    }

    if (effectiveActiveView === "Verification") {
      if (role !== "Verifier") return null;
      return (
        <VerificationView
          queue={visibleVerificationQueue}
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

    if (effectiveActiveView === "Settings") {
      return (
        <SettingsView
          key={walletAddress || "wallet-settings-empty"}
          role={role}
          displayName={displayName}
          walletLabel={walletAddress ? short(walletAddress) : "Not connected"}
          onSave={onUpdateProfile}
        />
      );
    }

    return null;
  };

  const title = effectiveActiveView === "Portfolio" && role === "Exporter" ? "Exporter Portfolio" : titles[effectiveActiveView];

  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#eff5ff_0%,#e8f0fd_55%,#eff5ff_100%)] text-[#102749]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <div className="hidden md:block">
          <Sidebar active={effectiveActiveView} role={role} onSelect={setActiveView} />
        </div>

        <main className="relative flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar
            title={title}
            connected={connected}
            role={role}
            displayName={displayName}
            isRegistered={connected ? !!profile : true}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />

          <div className="border-b border-[#d9e5f6] bg-[#f5f9ff] px-4 py-3 md:px-6">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#cddcf0] bg-[#eef3fa] px-4 py-3">
              <div>
                <p className="text-4xl font-semibold tracking-tight text-[#25313d]">
                  ${appBalanceUsdt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm font-semibold text-[#667380]">Balance</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDepositOpen(true)}
                  disabled={!connected}
                  className="rounded-xl bg-[#20262b] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#151a1f] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(true)}
                  disabled={!connected}
                  className="rounded-xl bg-[#20262b] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#151a1f] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1 p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={effectiveActiveView}
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
              <Sidebar active={effectiveActiveView} role={role} onSelect={setActiveView} onNavigate={() => setMobileNavOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={(input) => void onCreateInvoice(input)} />
      <FundInvoiceModal open={!!fundTarget} invoice={fundTarget} onClose={() => setFundTarget(undefined)} onConfirm={(id) => void onFundConfirm(id)} />
      <InvoiceDetailDrawer open={!!detailTarget} invoice={detailTarget} onClose={() => setDetailTarget(undefined)} />
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} onConfirm={(amount) => void onDepositToApp(amount)} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} onConfirm={(amount) => void onWithdrawFromApp(amount)} />
      <ActionSuccessModal
        open={!!successModal}
        mode={successModal?.mode || "fund"}
        amount={successModal?.amount || 0}
        invoiceId={successModal?.invoiceId}
        onClose={() => setSuccessModal(null)}
      />
      <RegistrationModal
        key={walletAddress || "wallet-register-empty"}
        open={registrationOpen}
        walletLabel={walletAddress ? short(walletAddress) : "Unknown"}
        defaultRole={profile?.role ?? "Exporter"}
        defaultName={profile?.displayName ?? ""}
        onSubmit={onRegister}
      />
      <ToastStack toasts={toasts} />
    </div>
  );
}
