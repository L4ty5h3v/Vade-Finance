import { InvoiceStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "./db";
import { assertFundOwnInvoice, assertSufficientBalance, assertTransition, feeSplit } from "./invoice";
import { invalidStatus, notFound, unauthorized } from "./errors";
import { getOrCreateBalance } from "./balance";
import { requireRole } from "./rbac";
import type { SessionUser } from "./types";

type CommonAction = {
  invoiceId: string;
  user: SessionUser;
  txSignature?: string;
  note?: string;
};

async function getInvoiceOrFail(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) notFound("Invoice not found");
  return invoice;
}

export async function verifyInvoiceAction({ invoiceId, user, txSignature, note }: CommonAction) {
  requireRole(user, [UserRole.VERIFIER, UserRole.ADMIN]);
  const invoice = await getInvoiceOrFail(invoiceId);
  assertTransition(invoice.status, InvoiceStatus.VERIFIED);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.VERIFIED,
        verifiedTs: new Date(),
        txSignature: txSignature ?? invoice.txSignature,
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        actorId: user.id,
        actorWallet: user.wallet,
        action: "verify_invoice",
        fromStatus: invoice.status,
        toStatus: InvoiceStatus.VERIFIED,
        note,
        txSignature,
      },
    });

    return updated;
  });
}

export async function listInvoiceAction({ invoiceId, user, txSignature, note }: CommonAction) {
  requireRole(user, [UserRole.VERIFIER, UserRole.ADMIN]);
  const invoice = await getInvoiceOrFail(invoiceId);
  assertTransition(invoice.status, InvoiceStatus.LISTED);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.LISTED,
        listedTs: new Date(),
        txSignature: txSignature ?? invoice.txSignature,
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        actorId: user.id,
        actorWallet: user.wallet,
        action: "list_invoice",
        fromStatus: invoice.status,
        toStatus: InvoiceStatus.LISTED,
        note,
        txSignature,
      },
    });

    return updated;
  });
}

export async function fundInvoiceAction({ invoiceId, user, txSignature, note, amountOverride }: CommonAction & { amountOverride?: number }) {
  requireRole(user, [UserRole.INVESTOR, UserRole.ADMIN]);

  const invoice = await getInvoiceOrFail(invoiceId);
  assertTransition(invoice.status, InvoiceStatus.FUNDED);
  assertFundOwnInvoice(invoice.exporterId, user.id);

  const purchasePrice = amountOverride !== undefined ? BigInt(amountOverride) : invoice.purchasePrice;
  if (purchasePrice <= 0) invalidStatus("Funding amount must be positive");
  const { fee, net } = feeSplit(purchasePrice, invoice.platformFeeBps);

  return prisma.$transaction(async (tx) => {
    const investorBalance = await getOrCreateBalance(tx, user.id);
    assertSufficientBalance(investorBalance.availableBaseUnits, purchasePrice);

    const exporterBalance = await getOrCreateBalance(tx, invoice.exporterId);

    const adminUser = await tx.user.findFirst({ where: { role: UserRole.ADMIN } });
    const treasuryOwnerId = adminUser?.id ?? invoice.exporterId;
    const treasuryBalance = await getOrCreateBalance(tx, treasuryOwnerId);

    await tx.walletBalance.update({
      where: { id: investorBalance.id },
      data: { availableBaseUnits: investorBalance.availableBaseUnits - purchasePrice },
    });

    await tx.walletBalance.update({
      where: { id: exporterBalance.id },
      data: { availableBaseUnits: exporterBalance.availableBaseUnits + net },
    });

    await tx.walletBalance.update({
      where: { id: treasuryBalance.id },
      data: { availableBaseUnits: treasuryBalance.availableBaseUnits + fee },
    });

    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.FUNDED,
        fundedTs: new Date(),
        investorId: user.id,
        txSignature: txSignature ?? invoice.txSignature,
      },
    });

    await tx.funding.create({
      data: {
        invoiceId: invoice.id,
        investorId: user.id,
        amountBaseUnits: purchasePrice,
        feeBaseUnits: fee,
        netToExporterBase: net,
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        actorId: user.id,
        actorWallet: user.wallet,
        action: "fund_invoice",
        fromStatus: invoice.status,
        toStatus: InvoiceStatus.FUNDED,
        note,
        txSignature,
      },
    });

    return updated;
  });
}

export async function repayInvoiceAction({ invoiceId, user, txSignature, note, amountOverride }: CommonAction & { amountOverride?: number }) {
  const invoice = await getInvoiceOrFail(invoiceId);
  if (invoice.exporterId !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.VERIFIER) {
    unauthorized("Only exporter/verifier/admin can repay");
  }

  assertTransition(invoice.status, InvoiceStatus.REPAID);

  const repaymentAmount = amountOverride !== undefined ? BigInt(amountOverride) : invoice.repaymentAmount;

  return prisma.$transaction(async (tx) => {
    const payerBalance = await getOrCreateBalance(tx, user.id);
    assertSufficientBalance(payerBalance.availableBaseUnits, repaymentAmount);

    await tx.walletBalance.update({
      where: { id: payerBalance.id },
      data: { availableBaseUnits: payerBalance.availableBaseUnits - repaymentAmount },
    });

    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.REPAID,
        repaidTs: new Date(),
        vaultState: "funded",
        txSignature: txSignature ?? invoice.txSignature,
      },
    });

    await tx.repayment.upsert({
      where: { invoiceId: invoice.id },
      update: {
        amountBaseUnits: repaymentAmount,
        claimableBaseUnits: repaymentAmount,
        repaymentEventRef: txSignature,
        repaidAt: new Date(),
      },
      create: {
        invoiceId: invoice.id,
        payerWallet: user.wallet,
        amountBaseUnits: repaymentAmount,
        claimableBaseUnits: repaymentAmount,
        repaymentEventRef: txSignature,
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        actorId: user.id,
        actorWallet: user.wallet,
        action: "repay_invoice",
        fromStatus: invoice.status,
        toStatus: InvoiceStatus.REPAID,
        note,
        txSignature,
      },
    });

    return updated;
  });
}

export async function claimInvoiceAction({ invoiceId, user, txSignature, note }: CommonAction) {
  requireRole(user, [UserRole.INVESTOR, UserRole.ADMIN]);
  const invoice = await getInvoiceOrFail(invoiceId);
  assertTransition(invoice.status, InvoiceStatus.CLAIMED);

  if (!invoice.investorId) {
    invalidStatus("Invoice has no investor");
  }

  if (invoice.investorId !== user.id && user.role !== UserRole.ADMIN) {
    unauthorized("Only funded investor can claim");
  }

  return prisma.$transaction(async (tx) => {
    const repayment = await tx.repayment.findUnique({ where: { invoiceId: invoice.id } });
    if (!repayment || repayment.claimableBaseUnits <= BigInt(0)) {
      invalidStatus("Repayment is not available");
    }

    const investorBalance = await getOrCreateBalance(tx, user.id);
    await tx.walletBalance.update({
      where: { id: investorBalance.id },
      data: { availableBaseUnits: investorBalance.availableBaseUnits + repayment.claimableBaseUnits },
    });

    await tx.repayment.update({
      where: { invoiceId: invoice.id },
      data: {
        claimableBaseUnits: BigInt(0),
        claimedAt: new Date(),
      },
    });

    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.CLAIMED,
        claimedTs: new Date(),
        vaultState: "empty",
        txSignature: txSignature ?? invoice.txSignature,
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        actorId: user.id,
        actorWallet: user.wallet,
        action: "claim_repayment",
        fromStatus: invoice.status,
        toStatus: InvoiceStatus.CLAIMED,
        note,
        txSignature,
      },
    });

    return updated;
  });
}

export async function defaultInvoiceAction({ invoiceId, user, txSignature, note }: CommonAction) {
  requireRole(user, [UserRole.VERIFIER, UserRole.ADMIN]);
  const invoice = await getInvoiceOrFail(invoiceId);
  assertTransition(invoice.status, InvoiceStatus.DEFAULTED);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.DEFAULTED,
        defaultedTs: new Date(),
        txSignature: txSignature ?? invoice.txSignature,
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        actorId: user.id,
        actorWallet: user.wallet,
        action: "mark_default",
        fromStatus: invoice.status,
        toStatus: InvoiceStatus.DEFAULTED,
        note,
        txSignature,
      },
    });

    return updated;
  });
}

export function withPrismaConflictGuard(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    invalidStatus("Entity already exists or was processed");
  }
  throw error;
}
