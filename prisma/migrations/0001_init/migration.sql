-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('EXPORTER', 'INVESTOR', 'VERIFIER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('SUBMITTED', 'VERIFIED', 'LISTED', 'FUNDED', 'REPAID', 'CLAIMED', 'REJECTED', 'DEFAULTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "displayName" TEXT NOT NULL,
    "companyName" TEXT,
    "kycStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalletChallenge" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuthSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "invoiceIdHash" TEXT NOT NULL,
    "documentHash" TEXT NOT NULL,
    "metadataHash" TEXT NOT NULL,
    "exporterId" TEXT NOT NULL,
    "investorId" TEXT,
    "debtorName" TEXT NOT NULL,
    "debtorCountry" TEXT NOT NULL,
    "goodsCategory" TEXT,
    "faceValue" BIGINT NOT NULL,
    "purchasePrice" BIGINT NOT NULL,
    "repaymentAmount" BIGINT NOT NULL,
    "platformFeeBps" INTEGER NOT NULL,
    "dueTs" TIMESTAMP(3) NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'SUBMITTED',
    "riskScore" TEXT NOT NULL,
    "createdTs" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedTs" TIMESTAMP(3),
    "fundedTs" TIMESTAMP(3),
    "repaidTs" TIMESTAMP(3),
    "claimedTs" TIMESTAMP(3),
    "rejectedTs" TIMESTAMP(3),
    "defaultedTs" TIMESTAMP(3),
    "cancelledTs" TIMESTAMP(3),
    "listedTs" TIMESTAMP(3),
    "invoicePda" TEXT,
    "vaultState" TEXT,
    "txSignature" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvoiceDocument" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvoiceEvent" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorWallet" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" "public"."InvoiceStatus",
    "toStatus" "public"."InvoiceStatus",
    "note" TEXT,
    "txSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Funding" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amountBaseUnits" BIGINT NOT NULL,
    "feeBaseUnits" BIGINT NOT NULL,
    "netToExporterBase" BIGINT NOT NULL,
    "fundedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Funding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Repayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "payerWallet" TEXT NOT NULL,
    "amountBaseUnits" BIGINT NOT NULL,
    "claimableBaseUnits" BIGINT NOT NULL,
    "repaymentEventRef" TEXT,
    "repaidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Repayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalletBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "availableBaseUnits" BIGINT NOT NULL DEFAULT 0,
    "lockedBaseUnits" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorWallet" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "payloadHash" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wallet_key" ON "public"."User"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "WalletChallenge_nonce_key" ON "public"."WalletChallenge"("nonce");

-- CreateIndex
CREATE INDEX "WalletChallenge_wallet_idx" ON "public"."WalletChallenge"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_token_key" ON "public"."AuthSession"("token");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "public"."AuthSession"("userId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "public"."Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_investorId_idx" ON "public"."Invoice"("investorId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceId_idx" ON "public"."Invoice"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_exporterId_invoiceIdHash_key" ON "public"."Invoice"("exporterId", "invoiceIdHash");

-- CreateIndex
CREATE INDEX "InvoiceDocument_invoiceId_idx" ON "public"."InvoiceDocument"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceEvent_invoiceId_createdAt_idx" ON "public"."InvoiceEvent"("invoiceId", "createdAt");

-- CreateIndex
CREATE INDEX "InvoiceEvent_actorWallet_idx" ON "public"."InvoiceEvent"("actorWallet");

-- CreateIndex
CREATE UNIQUE INDEX "Funding_invoiceId_key" ON "public"."Funding"("invoiceId");

-- CreateIndex
CREATE INDEX "Funding_investorId_idx" ON "public"."Funding"("investorId");

-- CreateIndex
CREATE UNIQUE INDEX "Repayment_invoiceId_key" ON "public"."Repayment"("invoiceId");

-- CreateIndex
CREATE INDEX "Repayment_payerWallet_idx" ON "public"."Repayment"("payerWallet");

-- CreateIndex
CREATE UNIQUE INDEX "WalletBalance_userId_tokenSymbol_key" ON "public"."WalletBalance"("userId", "tokenSymbol");

-- CreateIndex
CREATE INDEX "AuditLog_actorWallet_createdAt_idx" ON "public"."AuditLog"("actorWallet", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "public"."AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "public"."WalletChallenge" ADD CONSTRAINT "WalletChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_exporterId_fkey" FOREIGN KEY ("exporterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceDocument" ADD CONSTRAINT "InvoiceDocument_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceEvent" ADD CONSTRAINT "InvoiceEvent_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceEvent" ADD CONSTRAINT "InvoiceEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Funding" ADD CONSTRAINT "Funding_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Funding" ADD CONSTRAINT "Funding_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repayment" ADD CONSTRAINT "Repayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletBalance" ADD CONSTRAINT "WalletBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

