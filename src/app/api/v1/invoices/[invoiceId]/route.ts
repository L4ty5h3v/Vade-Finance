import { requireSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { apiError, apiOk, notFound } from "@/lib/server/errors";
import { serializeEvent, serializeInvoice } from "@/lib/server/serializers";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ invoiceId: string }> }) {
  try {
    await requireSessionUser();
    const { invoiceId } = await ctx.params;

    const row = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        events: { orderBy: { createdAt: "asc" } },
        documents: true,
        funding: true,
        repayment: true,
      },
    });

    if (!row) notFound("Invoice not found");

    return apiOk({
      invoice: serializeInvoice(row),
      documents: row.documents,
      events: row.events.map(serializeEvent),
      funding: row.funding
        ? {
            ...row.funding,
            amountBaseUnits: Number(row.funding.amountBaseUnits),
            feeBaseUnits: Number(row.funding.feeBaseUnits),
            netToExporterBase: Number(row.funding.netToExporterBase),
          }
        : null,
      repayment: row.repayment
        ? {
            ...row.repayment,
            amountBaseUnits: Number(row.repayment.amountBaseUnits),
            claimableBaseUnits: Number(row.repayment.claimableBaseUnits),
          }
        : null,
    });
  } catch (error) {
    return apiError(error);
  }
}
