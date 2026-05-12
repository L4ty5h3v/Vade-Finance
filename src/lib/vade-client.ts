"use client";

import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  ACCOUNT_SIZE,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { AnchorProvider, BN, Program, type Idl } from "@coral-xyz/anchor";
import idlJson from "@/lib/vade_finance_idl.json";

const VADE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_VADE_PROGRAM_ID || "3bto824ndCi9jr1zpYrkhUTtGz8JpCvNV2d5ExzdpUqJ",
);

const idl = idlJson as Idl;
const MICRO = 1_000_000;
const APP_BALANCE_SEED = "vade-app-balance-v1";

export type OnchainCreateInput = {
  invoiceNumber: string;
  debtor: string;
  debtorCountry: string;
  faceValueUi: number;
  paymentTermDays: number;
  goodsCategory: string;
  dueDate: string;
};

export type OnchainInvoice = {
  pubkey: string;
  invoiceId: string;
  exporter: string;
  investor?: string;
  faceValueUi: number;
  purchasePriceUi: number;
  repaymentAmountUi: number;
  dueDate: string;
  risk: "A-" | "B+" | "B";
  status: "Submitted" | "Verified" | "Listed" | "Funded" | "Repaid" | "Claimed" | "Defaulted";
  vaultState: string;
  vaultBalanceUi: number;
  documentHash: string;
  metadataHash: string;
  createdTs: number;
};

type ConfigAccount = {
  admin: PublicKey;
  verifier: PublicKey;
  treasury: PublicKey;
  stableMint: PublicKey;
  platformFeeBps: number;
  paused: boolean;
  bump: number;
};

type InvoiceAccount = {
  exporter: PublicKey;
  investor: PublicKey | null;
  faceValue: BN;
  purchasePrice: BN;
  repaymentAmount: BN;
  dueTs: BN;
  createdTs: BN;
  riskScore: number;
  status: unknown;
  documentHash: number[];
  metadataHash: number[];
  invoiceIdHash: number[];
};

function ensureBufferGlobal() {
  if (typeof window !== "undefined" && !(window as { Buffer?: typeof Buffer }).Buffer) {
    (window as { Buffer?: typeof Buffer }).Buffer = Buffer;
  }
}

function toUiAmount(amount: BN): number {
  return Number(amount.toString()) / MICRO;
}

function statusToLabel(status: unknown): OnchainInvoice["status"] {
  if (!status || typeof status !== "object") return "Submitted";
  const key = Object.keys(status as Record<string, unknown>)[0] || "submitted";
  const normalized = key.toLowerCase();
  switch (normalized) {
    case "verified":
      return "Verified";
    case "listed":
      return "Listed";
    case "funded":
      return "Funded";
    case "repaid":
      return "Repaid";
    case "claimed":
      return "Claimed";
    case "defaulted":
      return "Defaulted";
    default:
      return "Submitted";
  }
}

function deriveVaultState(status: OnchainInvoice["status"], vaultBalanceUi: number): string {
  if (status === "Defaulted") return "defaulted";
  if (status === "Repaid") return vaultBalanceUi > 0 ? "ready_to_claim" : "repaid_pending_sync";
  if (status === "Claimed") return vaultBalanceUi > 0 ? "claim_processing" : "claimed_out";
  if (status === "Funded") return vaultBalanceUi > 0 ? "funds_in_vault" : "awaiting_repayment";
  return "initialized";
}

function riskFromScore(score: number): "A-" | "B+" | "B" {
  if (score <= 35) return "A-";
  if (score <= 70) return "B+";
  return "B";
}

function bytesToHexPreview(bytes: number[]): string {
  const hex = Buffer.from(bytes).toString("hex");
  return `0x${hex.slice(0, 8)}...${hex.slice(-4)}`;
}

async function hash32(input: string): Promise<number[]> {
  const encoded = new TextEncoder().encode(input);
  const bytes = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest));
}

function mapTermToRiskScore(termDays: number): number {
  if (termDays <= 45) return 25;
  if (termDays <= 75) return 55;
  return 80;
}

function deriveConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], VADE_PROGRAM_ID);
}

function deriveInvoicePda(exporter: PublicKey, invoiceIdHashBytes: number[]): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("invoice"), exporter.toBuffer(), Buffer.from(invoiceIdHashBytes)],
    VADE_PROGRAM_ID,
  );
}

function deriveVaultAuthority(invoicePubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("vault_authority"), invoicePubkey.toBuffer()], VADE_PROGRAM_ID);
}

function deriveInvoiceVault(invoicePubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("invoice_vault"), invoicePubkey.toBuffer()], VADE_PROGRAM_ID);
}

async function deriveAppBalanceAccount(owner: PublicKey): Promise<PublicKey> {
  return PublicKey.createWithSeed(owner, APP_BALANCE_SEED, TOKEN_PROGRAM_ID);
}

async function maybeCreateAtaIx(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
): Promise<{ ata: PublicKey; ix?: TransactionInstruction }> {
  const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  const info = await connection.getAccountInfo(ata);
  if (info) {
    return { ata };
  }
  const ix = createAssociatedTokenAccountInstruction(
    payer,
    ata,
    owner,
    mint,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return { ata, ix };
}

export function createVadeClient(connection: Connection, wallet: AnchorWallet) {
  ensureBufferGlobal();

  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed", preflightCommitment: "confirmed" });
  const program = new Program(idl, provider) as Program;

  const getConfig = async (): Promise<{ configPda: PublicKey; config: ConfigAccount }> => {
    const [configPda] = deriveConfigPda();
    const config = (await (program.account as Record<string, { fetch: (key: PublicKey) => Promise<unknown> }>).platformConfig.fetch(
      configPda,
    )) as ConfigAccount;
    return { configPda, config };
  };

  const ensureAppBalanceAccount = async (mint: PublicKey): Promise<PublicKey> => {
    const appAccount = await deriveAppBalanceAccount(wallet.publicKey);
    const existing = await connection.getAccountInfo(appAccount, "confirmed");
    if (existing) return appAccount;

    const lamports = await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);
    const tx = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: appAccount,
        basePubkey: wallet.publicKey,
        seed: APP_BALANCE_SEED,
        lamports,
        space: ACCOUNT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeAccountInstruction(appAccount, mint, wallet.publicKey, TOKEN_PROGRAM_ID),
    );

    await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
    return appAccount;
  };

  const getAppBalance = async (): Promise<{ account: PublicKey; amountUi: number }> => {
    const appAccount = await deriveAppBalanceAccount(wallet.publicKey);
    try {
      const balance = await connection.getTokenAccountBalance(appAccount, "confirmed");
      return { account: appAccount, amountUi: Number(balance.value.amount) / MICRO };
    } catch {
      return { account: appAccount, amountUi: 0 };
    }
  };

  const depositToAppBalance = async (amountUi: number) => {
    if (!(amountUi > 0)) throw new Error("Deposit amount must be greater than zero");
    const { config } = await getConfig();
    const appAccount = await ensureAppBalanceAccount(config.stableMint);
    const sourceAtaResult = await maybeCreateAtaIx(connection, config.stableMint, wallet.publicKey, wallet.publicKey);

    const amountBaseUnits = Math.round(amountUi * MICRO);
    const ixs: TransactionInstruction[] = [];
    if (sourceAtaResult.ix) ixs.push(sourceAtaResult.ix);
    ixs.push(
      createTransferInstruction(
        sourceAtaResult.ata,
        appAccount,
        wallet.publicKey,
        amountBaseUnits,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    const tx = new Transaction().add(...ixs);
    return provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
  };

  const withdrawFromAppBalance = async (amountUi: number) => {
    if (!(amountUi > 0)) throw new Error("Withdraw amount must be greater than zero");
    const { config } = await getConfig();
    const appAccount = await ensureAppBalanceAccount(config.stableMint);
    const destinationAtaResult = await maybeCreateAtaIx(connection, config.stableMint, wallet.publicKey, wallet.publicKey);
    const amountBaseUnits = Math.round(amountUi * MICRO);

    const ixs: TransactionInstruction[] = [];
    if (destinationAtaResult.ix) ixs.push(destinationAtaResult.ix);
    ixs.push(
      createTransferInstruction(
        appAccount,
        destinationAtaResult.ata,
        wallet.publicKey,
        amountBaseUnits,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    const tx = new Transaction().add(...ixs);
    return provider.sendAndConfirm(tx, [], { commitment: "confirmed" });
  };

  const fetchInvoices = async (): Promise<OnchainInvoice[]> => {
    const rows = (await (program.account as Record<string, { all: () => Promise<unknown> }>).invoice.all()) as Array<{
      publicKey: PublicKey;
      account: InvoiceAccount;
    }>;
    const mapped = await Promise.all(
      rows.map(async (row) => {
        const account = row.account;
        const status = statusToLabel(account.status);
        const [vaultPk] = deriveInvoiceVault(row.publicKey);
        let vaultBalanceUi = 0;

        try {
          const vaultBalance = await connection.getTokenAccountBalance(vaultPk, "confirmed");
          vaultBalanceUi = Number(vaultBalance.value.amount) / MICRO;
        } catch {
          vaultBalanceUi = 0;
        }

        return {
          pubkey: row.publicKey.toBase58(),
          invoiceId: bytesToHexPreview(account.invoiceIdHash),
          exporter: account.exporter.toBase58(),
          investor: account.investor?.toBase58(),
          faceValueUi: toUiAmount(account.faceValue),
          purchasePriceUi: toUiAmount(account.purchasePrice),
          repaymentAmountUi: toUiAmount(account.repaymentAmount),
          dueDate: new Date(Number(account.dueTs.toString()) * 1000).toISOString().slice(0, 10),
          risk: riskFromScore(account.riskScore),
          status,
          vaultState: deriveVaultState(status, vaultBalanceUi),
          vaultBalanceUi,
          documentHash: bytesToHexPreview(account.documentHash),
          metadataHash: bytesToHexPreview(account.metadataHash),
          createdTs: Number(account.createdTs.toString()),
        };
      }),
    );

    return mapped.sort((a, b) => b.createdTs - a.createdTs);
  };

  const createInvoice = async (input: OnchainCreateInput) => {
    const { configPda, config } = await getConfig();

    const invoiceIdHash = await hash32(input.invoiceNumber.trim());
    const documentHash = await hash32(`${input.invoiceNumber}-document`);
    const metadataHash = await hash32(JSON.stringify({
      debtor: input.debtor,
      debtorCountry: input.debtorCountry,
      goodsCategory: input.goodsCategory,
    }));

    const [invoicePda] = deriveInvoicePda(wallet.publicKey, invoiceIdHash);
    const [vaultAuthority] = deriveVaultAuthority(invoicePda);
    const [invoiceVault] = deriveInvoiceVault(invoicePda);

    const faceValue = new BN(Math.round(input.faceValueUi * MICRO));
    const purchasePrice = new BN(Math.round(input.faceValueUi * 0.95 * MICRO));
    const repaymentAmount = new BN(Math.round(input.faceValueUi * MICRO));
    const dueTs = new BN(Math.floor(new Date(input.dueDate).getTime() / 1000));
    const riskScore = mapTermToRiskScore(input.paymentTermDays);

    const sig = await program.methods
      .createInvoice(
        invoiceIdHash,
        documentHash,
        metadataHash,
        faceValue,
        purchasePrice,
        repaymentAmount,
        dueTs,
        riskScore,
      )
      .accounts({
        config: configPda,
        exporter: wallet.publicKey,
        invoice: invoicePda,
        vaultAuthority,
        invoiceVault,
        stableMint: config.stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return { signature: sig, invoicePda };
  };

  const verifyInvoice = async (invoicePubkey: PublicKey) => {
    const { configPda } = await getConfig();
    return program.methods.verifyInvoice().accounts({ config: configPda, authority: wallet.publicKey, invoice: invoicePubkey }).rpc();
  };

  const listInvoice = async (invoicePubkey: PublicKey) => {
    const { configPda } = await getConfig();
    return program.methods.listInvoice().accounts({ config: configPda, authority: wallet.publicKey, invoice: invoicePubkey }).rpc();
  };

  const fundInvoice = async (invoicePubkey: PublicKey, exporterPubkey: PublicKey) => {
    const { configPda, config } = await getConfig();

    const investorAtaResult = await maybeCreateAtaIx(connection, config.stableMint, wallet.publicKey, wallet.publicKey);
    const exporterAtaResult = await maybeCreateAtaIx(connection, config.stableMint, exporterPubkey, wallet.publicKey);

    const preIxs = [investorAtaResult.ix, exporterAtaResult.ix].filter((ix): ix is TransactionInstruction => !!ix);

    return program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: wallet.publicKey,
        invoice: invoicePubkey,
        investorTokenAccount: investorAtaResult.ata,
        exporterTokenAccount: exporterAtaResult.ata,
        treasuryTokenAccount: config.treasury,
        stableMint: config.stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(preIxs)
      .rpc();
  };

  const fundInvoiceFromAppBalance = async (invoicePubkey: PublicKey, exporterPubkey: PublicKey) => {
    const { configPda, config } = await getConfig();
    const appAccount = await ensureAppBalanceAccount(config.stableMint);
    const exporterAtaResult = await maybeCreateAtaIx(connection, config.stableMint, exporterPubkey, wallet.publicKey);

    return program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: wallet.publicKey,
        invoice: invoicePubkey,
        investorTokenAccount: appAccount,
        exporterTokenAccount: exporterAtaResult.ata,
        treasuryTokenAccount: config.treasury,
        stableMint: config.stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(exporterAtaResult.ix ? [exporterAtaResult.ix] : [])
      .rpc();
  };

  const repayInvoice = async (invoicePubkey: PublicKey) => {
    const { configPda, config } = await getConfig();
    const [invoiceVault] = deriveInvoiceVault(invoicePubkey);

    const payerAtaResult = await maybeCreateAtaIx(connection, config.stableMint, wallet.publicKey, wallet.publicKey);

    return program.methods
      .repayInvoice()
      .accounts({
        config: configPda,
        payer: wallet.publicKey,
        invoice: invoicePubkey,
        invoiceVault,
        payerTokenAccount: payerAtaResult.ata,
        stableMint: config.stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(payerAtaResult.ix ? [payerAtaResult.ix] : [])
      .rpc();
  };

  const repayInvoiceFromAppBalance = async (invoicePubkey: PublicKey) => {
    const { configPda, config } = await getConfig();
    const [invoiceVault] = deriveInvoiceVault(invoicePubkey);
    const appAccount = await ensureAppBalanceAccount(config.stableMint);

    return program.methods
      .repayInvoice()
      .accounts({
        config: configPda,
        payer: wallet.publicKey,
        invoice: invoicePubkey,
        invoiceVault,
        payerTokenAccount: appAccount,
        stableMint: config.stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  };

  const claimRepayment = async (invoicePubkey: PublicKey) => {
    const { configPda, config } = await getConfig();
    const [vaultAuthority] = deriveVaultAuthority(invoicePubkey);
    const [invoiceVault] = deriveInvoiceVault(invoicePubkey);

    const investorAtaResult = await maybeCreateAtaIx(connection, config.stableMint, wallet.publicKey, wallet.publicKey);

    return program.methods
      .claimRepayment()
      .accounts({
        config: configPda,
        investor: wallet.publicKey,
        invoice: invoicePubkey,
        vaultAuthority,
        invoiceVault,
        investorTokenAccount: investorAtaResult.ata,
        stableMint: config.stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(investorAtaResult.ix ? [investorAtaResult.ix] : [])
      .rpc();
  };

  const markDefault = async (invoicePubkey: PublicKey) => {
    const { configPda } = await getConfig();
    return program.methods.markDefault().accounts({ config: configPda, authority: wallet.publicKey, invoice: invoicePubkey }).rpc();
  };

  return {
    programId: VADE_PROGRAM_ID,
    getConfig,
    getAppBalance,
    depositToAppBalance,
    withdrawFromAppBalance,
    ensureAppBalanceAccount,
    fetchInvoices,
    createInvoice,
    verifyInvoice,
    listInvoice,
    fundInvoice,
    fundInvoiceFromAppBalance,
    repayInvoice,
    repayInvoiceFromAppBalance,
    claimRepayment,
    markDefault,
  };
}

export function toPublicKey(value: string): PublicKey {
  return new PublicKey(value);
}
