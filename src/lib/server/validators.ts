import { UserRole } from "@prisma/client";
import { z } from "zod";

const nonEmpty = z.string().trim().min(1);
const hashLike = z.string().trim().min(8).max(256);

export const walletSchema = z.string().trim().min(32).max(64);

export const authChallengeSchema = z.object({
  wallet: walletSchema,
});

export const authVerifySchema = z.object({
  wallet: walletSchema,
  nonce: nonEmpty,
  signature: nonEmpty,
  role: z.nativeEnum(UserRole).optional(),
  displayName: z.string().trim().min(2).max(80).optional(),
  companyName: z.string().trim().min(2).max(120).optional(),
});

export const createInvoiceSchema = z.object({
  invoiceId: z.string().trim().min(3).max(64),
  invoiceIdHash: hashLike,
  documentHash: hashLike,
  metadataHash: hashLike,
  debtorName: z.string().trim().min(2).max(120),
  debtorCountry: z.string().trim().min(2).max(80),
  goodsCategory: z.string().trim().min(2).max(120).optional(),
  faceValue: z.number().int().positive(),
  purchasePrice: z.number().int().positive(),
  repaymentAmount: z.number().int().positive(),
  platformFeeBps: z.number().int().min(0).max(1000),
  dueTs: z.coerce.date(),
  riskScore: z.string().trim().min(1).max(16),
  invoicePda: z.string().trim().min(16).max(64).optional(),
});

export const actionSignatureSchema = z.object({
  txSignature: z.string().trim().min(8).max(140).optional(),
  note: z.string().trim().max(250).optional(),
});

export const fundInvoiceSchema = actionSignatureSchema.extend({
  amount: z.number().int().positive().optional(),
});

export const repayInvoiceSchema = actionSignatureSchema.extend({
  amount: z.number().int().positive().optional(),
});

export const setBalanceSchema = z.object({
  amount: z.number().int().min(0),
});
