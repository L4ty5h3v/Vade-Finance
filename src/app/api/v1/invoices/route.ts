import { InvoiceStatus, UserRole } from "@prisma/client";
import { requireSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { apiError, apiOk, badRequest } from "@/lib/server/errors";
import { enqueueVerification } from "@/lib/server/queue";
import { requireRole } from "@/lib/server/rbac";
import { serializeInvoice } from "@/lib/server/serializers";
import { createInvoiceSchema } from "@/lib/server/validators";
import { writeAuditLog, requestMeta } from "@/lib/server/audit";

export const runtime = "nodejs";

const statusMap: Record<string, InvoiceStatus> = {
  Submitted: InvoiceStatus.SUBMITTED,
  Verified: InvoiceStatus.VERIFIED,
  Listed: InvoiceStatus.LISTED,
  Funded: InvoiceStatus.FUNDED,
  Repaid: InvoiceStatus.REPAID,
  Claimed: InvoiceStatus.CLAIMED,
  Rejected: InvoiceStatus.REJECTED,
  Defaulted: InvoiceStatus.DEFAULTED,
  Cancelled: InvoiceStatus.CANCELLED,
};

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const mine = searchParams.get("mine") === "true";

    const where: {
      status?: InvoiceStatus;
      OR?: Array<{ exporterId: string } | { investorId: string }>;
    } = {};

    if (status && statusMap[status]) {
      where.status = statusMap[status];
    }

    if (mine) {
      if (user.role === UserRole.EXPORTER) {
        where.OR = [{ exporterId: user.id }];
      } else if (user.role === UserRole.INVESTOR) {
        where.OR = [{ investorId: user.id }];
      }
    }

    const rows = await prisma.invoice.findMany({
      where,
      orderBy: { createdTs: "desc" },
      take: 300,
    });

    return apiOk(rows.map(serializeInvoice));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    requireRole(user, [UserRole.EXPORTER, UserRole.ADMIN]);

    const body = await request.json();
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid invoice payload");

    if (parsed.data.purchasePrice > parsed.data.faceValue) {
      badRequest("purchasePrice cannot exceed faceValue");
    }

    if (parsed.data.dueTs.getTime() <= Date.now()) {
      badRequest("dueTs must be in the future");
    }

    const created = await prisma.invoice.create({
      data: {
        invoiceId: parsed.data.invoiceId,
        invoiceIdHash: parsed.data.invoiceIdHash,
        documentHash: parsed.data.documentHash,
        metadataHash: parsed.data.metadataHash,
        exporterId: user.id,
        debtorName: parsed.data.debtorName,
        debtorCountry: parsed.data.debtorCountry,
        goodsCategory: parsed.data.goodsCategory,
        faceValue: BigInt(parsed.data.faceValue),
        purchasePrice: BigInt(parsed.data.purchasePrice),
        repaymentAmount: BigInt(parsed.data.repaymentAmount),
        platformFeeBps: parsed.data.platformFeeBps,
        dueTs: parsed.data.dueTs,
        status: InvoiceStatus.SUBMITTED,
        riskScore: parsed.data.riskScore,
        invoicePda: parsed.data.invoicePda,
        vaultState: "initialized",
      },
    });

    await prisma.invoiceEvent.create({
      data: {
        invoiceId: created.id,
        actorId: user.id,
        actorWallet: user.wallet,
        action: "create_invoice",
        toStatus: InvoiceStatus.SUBMITTED,
      },
    });

    await enqueueVerification(created.id);

    const meta = requestMeta(request);
    await writeAuditLog({
      actorId: user.id,
      actorWallet: user.wallet,
      action: "create_invoice",
      entity: "Invoice",
      entityId: created.id,
      payload: parsed.data,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return apiOk(serializeInvoice(created), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
