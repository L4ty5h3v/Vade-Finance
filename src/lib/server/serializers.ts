import type { Invoice, InvoiceEvent, InvoiceStatus, UserRole } from "@prisma/client";

export function serializeInvoiceStatus(status: InvoiceStatus) {
  return status[0] + status.slice(1).toLowerCase();
}

export function serializeRole(role: UserRole) {
  return role[0] + role.slice(1).toLowerCase();
}

export function serializeInvoice(invoice: Invoice) {
  return {
    id: invoice.id,
    invoiceId: invoice.invoiceId,
    invoiceIdHash: invoice.invoiceIdHash,
    documentHash: invoice.documentHash,
    metadataHash: invoice.metadataHash,
    exporterId: invoice.exporterId,
    investorId: invoice.investorId,
    debtorName: invoice.debtorName,
    debtorCountry: invoice.debtorCountry,
    goodsCategory: invoice.goodsCategory,
    faceValue: Number(invoice.faceValue),
    purchasePrice: Number(invoice.purchasePrice),
    repaymentAmount: Number(invoice.repaymentAmount),
    platformFeeBps: invoice.platformFeeBps,
    dueTs: invoice.dueTs.toISOString(),
    status: serializeInvoiceStatus(invoice.status),
    riskScore: invoice.riskScore,
    createdTs: invoice.createdTs.toISOString(),
    verifiedTs: invoice.verifiedTs?.toISOString() ?? null,
    listedTs: invoice.listedTs?.toISOString() ?? null,
    fundedTs: invoice.fundedTs?.toISOString() ?? null,
    repaidTs: invoice.repaidTs?.toISOString() ?? null,
    claimedTs: invoice.claimedTs?.toISOString() ?? null,
    rejectedTs: invoice.rejectedTs?.toISOString() ?? null,
    defaultedTs: invoice.defaultedTs?.toISOString() ?? null,
    cancelledTs: invoice.cancelledTs?.toISOString() ?? null,
    invoicePda: invoice.invoicePda,
    vaultState: invoice.vaultState,
    txSignature: invoice.txSignature,
  };
}

export function serializeEvent(event: InvoiceEvent) {
  return {
    id: event.id,
    invoiceId: event.invoiceId,
    actorId: event.actorId,
    actorWallet: event.actorWallet,
    action: event.action,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    note: event.note,
    txSignature: event.txSignature,
    createdAt: event.createdAt.toISOString(),
  };
}
