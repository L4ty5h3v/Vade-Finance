import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

import { VadeFinance } from "../target/types/vade_finance";

const BN = anchor.BN;

describe("vade_finance", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VadeFinance as Program<VadeFinance>;
  const connection = provider.connection;

  const admin = (provider.wallet as anchor.Wallet).payer;
  const verifier = Keypair.generate();
  const exporter = Keypair.generate();
  const investor = Keypair.generate();
  const payer = Keypair.generate();
  const randomWallet = Keypair.generate();

  let stableMint: PublicKey;
  let treasuryAta: PublicKey;
  let exporterAta: PublicKey;
  let investorAta: PublicKey;
  let payerAta: PublicKey;

  const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);

  const oneUnit = 1_000_000; // 6 decimals

  const airdrop = async (wallet: PublicKey, sol = 5) => {
    const sig = await connection.requestAirdrop(wallet, sol * anchor.web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
  };

  const mkHash = (seed: string): number[] => {
    const bytes = Buffer.alloc(32, 0);
    Buffer.from(seed).copy(bytes);
    return [...bytes];
  };

  const statusName = (status: unknown): string => {
    if (typeof status === "object" && status !== null) {
      return Object.keys(status as Record<string, unknown>)[0] ?? "unknown";
    }
    return "unknown";
  };

  const createLifecycleInvoice = async (seed: string) => {
    const invoiceIdHash = mkHash(`invoice-${seed}`);
    const documentHash = mkHash(`doc-${seed}`);
    const metadataHash = mkHash(`meta-${seed}`);

    const [invoicePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("invoice"), exporter.publicKey.toBuffer(), Buffer.from(invoiceIdHash)],
      program.programId,
    );
    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_authority"), invoicePda.toBuffer()],
      program.programId,
    );
    const [invoiceVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("invoice_vault"), invoicePda.toBuffer()],
      program.programId,
    );

    const now = Math.floor(Date.now() / 1000);
    const faceValue = new BN(10_000 * oneUnit);
    const purchasePrice = new BN(9_500 * oneUnit);
    const repaymentAmount = new BN(10_000 * oneUnit);

    await program.methods
      .createInvoice(
        invoiceIdHash,
        documentHash,
        metadataHash,
        faceValue,
        purchasePrice,
        repaymentAmount,
        new BN(now + 60 * 60 * 24 * 30),
        55,
      )
      .accounts({
        config: configPda,
        exporter: exporter.publicKey,
        invoice: invoicePda,
        vaultAuthority,
        invoiceVault,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([exporter])
      .rpc();

    return { invoicePda, invoiceVault, vaultAuthority, purchasePrice, repaymentAmount };
  };

  before(async () => {
    await Promise.all([
      airdrop(verifier.publicKey),
      airdrop(exporter.publicKey),
      airdrop(investor.publicKey),
      airdrop(payer.publicKey),
      airdrop(randomWallet.publicKey),
    ]);

    stableMint = await createMint(connection, admin, admin.publicKey, null, 6);

    treasuryAta = await createAssociatedTokenAccount(connection, admin, stableMint, admin.publicKey);
    exporterAta = await createAssociatedTokenAccount(connection, admin, stableMint, exporter.publicKey);
    investorAta = await createAssociatedTokenAccount(connection, admin, stableMint, investor.publicKey);
    payerAta = await createAssociatedTokenAccount(connection, admin, stableMint, payer.publicKey);

    await mintTo(connection, admin, stableMint, investorAta, admin, 1_000_000 * oneUnit);
    await mintTo(connection, admin, stableMint, payerAta, admin, 1_000_000 * oneUnit);

    await program.methods
      .initializePlatform(150)
      .accounts({
        config: configPda,
        admin: admin.publicKey,
        verifier: verifier.publicKey,
        treasury: treasuryAta,
        stableMint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  });

  it("1) full happy path: initialize -> create -> verify -> list -> fund -> repay -> claim", async () => {
    const { invoicePda, invoiceVault, vaultAuthority, purchasePrice, repaymentAmount } = await createLifecycleInvoice("happy");

    await program.methods
      .verifyInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .listInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    const investorBefore = Number((await getAccount(connection, investorAta)).amount);
    const exporterBefore = Number((await getAccount(connection, exporterAta)).amount);
    const treasuryBefore = Number((await getAccount(connection, treasuryAta)).amount);

    await program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: investor.publicKey,
        invoice: invoicePda,
        investorTokenAccount: investorAta,
        exporterTokenAccount: exporterAta,
        treasuryTokenAccount: treasuryAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investor])
      .rpc();

    const feeAmount = Math.floor((purchasePrice.toNumber() * 150) / 10_000);
    const exporterAmount = purchasePrice.toNumber() - feeAmount;

    const investorAfterFund = Number((await getAccount(connection, investorAta)).amount);
    const exporterAfterFund = Number((await getAccount(connection, exporterAta)).amount);
    const treasuryAfterFund = Number((await getAccount(connection, treasuryAta)).amount);

    assert.equal(investorAfterFund, investorBefore - purchasePrice.toNumber());
    assert.equal(exporterAfterFund, exporterBefore + exporterAmount);
    assert.equal(treasuryAfterFund, treasuryBefore + feeAmount);

    await program.methods
      .repayInvoice()
      .accounts({
        config: configPda,
        payer: payer.publicKey,
        invoice: invoicePda,
        invoiceVault,
        payerTokenAccount: payerAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();

    const payerAfterRepay = Number((await getAccount(connection, payerAta)).amount);
    const vaultAfterRepay = Number((await getAccount(connection, invoiceVault)).amount);
    assert.equal(vaultAfterRepay, repaymentAmount.toNumber());

    await program.methods
      .claimRepayment()
      .accounts({
        config: configPda,
        investor: investor.publicKey,
        invoice: invoicePda,
        vaultAuthority,
        invoiceVault,
        investorTokenAccount: investorAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investor])
      .rpc();

    const investorAfterClaim = Number((await getAccount(connection, investorAta)).amount);
    const vaultAfterClaim = Number((await getAccount(connection, invoiceVault)).amount);

    assert.equal(payerAfterRepay, 1_000_000 * oneUnit - repaymentAmount.toNumber());
    assert.equal(vaultAfterClaim, 0);
    assert.equal(investorAfterClaim, investorAfterFund + repaymentAmount.toNumber());

    const invoice = await program.account.invoice.fetch(invoicePda);
    assert.equal(statusName(invoice.status), "claimed");
  });

  it("2) random wallet cannot verify", async () => {
    const { invoicePda } = await createLifecycleInvoice("random-verify");

    try {
      await program.methods
        .verifyInvoice()
        .accounts({ config: configPda, authority: randomWallet.publicKey, invoice: invoicePda })
        .signers([randomWallet])
        .rpc();
      assert.fail("expected verify to fail");
    } catch (e) {
      assert.include(String(e), "Unauthorized");
    }
  });

  it("3) exporter can fund own invoice in demo mode", async () => {
    const { invoicePda } = await createLifecycleInvoice("self-fund");

    await program.methods
      .verifyInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .listInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: exporter.publicKey,
        invoice: invoicePda,
        investorTokenAccount: exporterAta,
        exporterTokenAccount: exporterAta,
        treasuryTokenAccount: treasuryAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([exporter])
      .rpc();

    const invoice = await program.account.invoice.fetch(invoicePda);
    assert.equal(statusName(invoice.status), "funded");
  });

  it("4) cannot fund invoice twice", async () => {
    const { invoicePda } = await createLifecycleInvoice("double-fund");

    await program.methods
      .verifyInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .listInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: investor.publicKey,
        invoice: invoicePda,
        investorTokenAccount: investorAta,
        exporterTokenAccount: exporterAta,
        treasuryTokenAccount: treasuryAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investor])
      .rpc();

    try {
      await program.methods
        .fundInvoice()
        .accounts({
          config: configPda,
          investor: investor.publicKey,
          invoice: invoicePda,
          investorTokenAccount: investorAta,
          exporterTokenAccount: exporterAta,
          treasuryTokenAccount: treasuryAta,
          stableMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investor])
        .rpc();
      assert.fail("expected second funding to fail");
    } catch (e) {
      assert.include(String(e), "AlreadyFunded");
    }
  });

  it("5) cannot claim before repayment", async () => {
    const { invoicePda, invoiceVault, vaultAuthority } = await createLifecycleInvoice("claim-before-repay");

    await program.methods
      .verifyInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .listInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: investor.publicKey,
        invoice: invoicePda,
        investorTokenAccount: investorAta,
        exporterTokenAccount: exporterAta,
        treasuryTokenAccount: treasuryAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investor])
      .rpc();

    try {
      await program.methods
        .claimRepayment()
        .accounts({
          config: configPda,
          investor: investor.publicKey,
          invoice: invoicePda,
          vaultAuthority,
          invoiceVault,
          investorTokenAccount: investorAta,
          stableMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([investor])
        .rpc();
      assert.fail("expected pre-repayment claim to fail");
    } catch (e) {
      assert.include(String(e), "NotRepaid");
    }
  });

  it("6) wrong investor cannot claim", async () => {
    const wrongInvestor = Keypair.generate();
    await airdrop(wrongInvestor.publicKey);
    const wrongInvestorAta = await createAssociatedTokenAccount(connection, admin, stableMint, wrongInvestor.publicKey);

    const { invoicePda, invoiceVault, vaultAuthority } = await createLifecycleInvoice("wrong-investor-claim");

    await program.methods
      .verifyInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .listInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: investor.publicKey,
        invoice: invoicePda,
        investorTokenAccount: investorAta,
        exporterTokenAccount: exporterAta,
        treasuryTokenAccount: treasuryAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investor])
      .rpc();

    await program.methods
      .repayInvoice()
      .accounts({
        config: configPda,
        payer: payer.publicKey,
        invoice: invoicePda,
        invoiceVault,
        payerTokenAccount: payerAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([payer])
      .rpc();

    try {
      await program.methods
        .claimRepayment()
        .accounts({
          config: configPda,
          investor: wrongInvestor.publicKey,
          invoice: invoicePda,
          vaultAuthority,
          invoiceVault,
          investorTokenAccount: wrongInvestorAta,
          stableMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([wrongInvestor])
        .rpc();
      assert.fail("expected wrong investor claim to fail");
    } catch (e) {
      assert.include(String(e), "Unauthorized");
    }
  });

  it("7) invalid amount fails", async () => {
    const invoiceIdHash = mkHash("invalid-amount");
    const documentHash = mkHash("invalid-amount-doc");
    const metadataHash = mkHash("invalid-amount-meta");

    const [invoicePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("invoice"), exporter.publicKey.toBuffer(), Buffer.from(invoiceIdHash)],
      program.programId,
    );
    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_authority"), invoicePda.toBuffer()],
      program.programId,
    );
    const [invoiceVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("invoice_vault"), invoicePda.toBuffer()],
      program.programId,
    );

    const now = Math.floor(Date.now() / 1000);

    try {
      await program.methods
        .createInvoice(
          invoiceIdHash,
          documentHash,
          metadataHash,
          new BN(0),
          new BN(1_000 * oneUnit),
          new BN(1_100 * oneUnit),
          new BN(now + 1000),
          40,
        )
        .accounts({
          config: configPda,
          exporter: exporter.publicKey,
          invoice: invoicePda,
          vaultAuthority,
          invoiceVault,
          stableMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([exporter])
        .rpc();
      assert.fail("expected invalid amount to fail");
    } catch (e) {
      assert.include(String(e), "InvalidAmount");
    }
  });

  it("8) past due date fails", async () => {
    const invoiceIdHash = mkHash("past-due");
    const documentHash = mkHash("past-due-doc");
    const metadataHash = mkHash("past-due-meta");

    const [invoicePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("invoice"), exporter.publicKey.toBuffer(), Buffer.from(invoiceIdHash)],
      program.programId,
    );
    const [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault_authority"), invoicePda.toBuffer()],
      program.programId,
    );
    const [invoiceVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("invoice_vault"), invoicePda.toBuffer()],
      program.programId,
    );

    const now = Math.floor(Date.now() / 1000);

    try {
      await program.methods
        .createInvoice(
          invoiceIdHash,
          documentHash,
          metadataHash,
          new BN(10_000 * oneUnit),
          new BN(9_500 * oneUnit),
          new BN(10_000 * oneUnit),
          new BN(now - 10),
          40,
        )
        .accounts({
          config: configPda,
          exporter: exporter.publicKey,
          invoice: invoicePda,
          vaultAuthority,
          invoiceVault,
          stableMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([exporter])
        .rpc();
      assert.fail("expected past due date to fail");
    } catch (e) {
      assert.include(String(e), "InvalidDueDate");
    }
  });

  it("9) mark_default works from Funded", async () => {
    const { invoicePda } = await createLifecycleInvoice("default");

    await program.methods
      .verifyInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .listInvoice()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    await program.methods
      .fundInvoice()
      .accounts({
        config: configPda,
        investor: investor.publicKey,
        invoice: invoicePda,
        investorTokenAccount: investorAta,
        exporterTokenAccount: exporterAta,
        treasuryTokenAccount: treasuryAta,
        stableMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([investor])
      .rpc();

    await program.methods
      .markDefault()
      .accounts({ config: configPda, authority: verifier.publicKey, invoice: invoicePda })
      .signers([verifier])
      .rpc();

    const invoice = await program.account.invoice.fetch(invoicePda);
    assert.equal(statusName(invoice.status), "defaulted");
  });
});
