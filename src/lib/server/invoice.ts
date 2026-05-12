import { InvoiceStatus } from "@prisma/client";
import { serverEnv } from "./env";
import { invalidStatus, conflict, insufficientBalance } from "./errors";

export const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  SUBMITTED: ["VERIFIED", "REJECTED", "CANCELLED"],
  VERIFIED: ["LISTED", "REJECTED", "CANCELLED"],
  LISTED: ["FUNDED", "CANCELLED"],
  FUNDED: ["REPAID", "DEFAULTED"],
  REPAID: ["CLAIMED"],
  CLAIMED: [],
  REJECTED: [],
  DEFAULTED: [],
  CANCELLED: [],
};

export function assertTransition(current: InvoiceStatus, next: InvoiceStatus) {
  if (!allowedTransitions[current].includes(next)) {
    invalidStatus(`Cannot move ${current} -> ${next}`);
  }
}

export function assertFundOwnInvoice(exporterId: string, investorId: string) {
  if (serverEnv.DEV_MODE) return;
  if (exporterId === investorId) {
    conflict("Exporter cannot fund own invoice");
  }
}

export function assertSufficientBalance(available: bigint, needed: bigint) {
  if (available < needed) {
    insufficientBalance("Not enough app balance");
  }
}

export function feeSplit(purchasePrice: bigint, feeBps: number) {
  const fee = (purchasePrice * BigInt(feeBps)) / BigInt(10_000);
  const net = purchasePrice - fee;
  return { fee, net };
}
