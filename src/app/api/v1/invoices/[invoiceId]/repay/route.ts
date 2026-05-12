import { requireSessionUser } from "@/lib/server/auth";
import { repayInvoiceAction } from "@/lib/server/actions";
import { apiError, apiOk, badRequest } from "@/lib/server/errors";
import { serializeInvoice } from "@/lib/server/serializers";
import { checkRateLimit, createRateLimitResponse, getRateLimitKey } from "@/lib/server/rate-limit";
import { repayInvoiceSchema } from "@/lib/server/validators";
import { requestMeta, writeAuditLog } from "@/lib/server/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, ctx: { params: Promise<{ invoiceId: string }> }) {
  try {
    const rateLimit = checkRateLimit({
      key: getRateLimitKey(request, "invoice_action"),
      limit: 30,
      windowMs: 60_000,
    });
    if (!rateLimit.ok) return createRateLimitResponse(rateLimit.retryAfterSeconds);

    const user = await requireSessionUser();
    const body = await request.json();
    const parsed = repayInvoiceSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid repay payload");

    const { invoiceId } = await ctx.params;
    const updated = await repayInvoiceAction({
      invoiceId,
      user,
      txSignature: parsed.data.txSignature,
      note: parsed.data.note,
      amountOverride: parsed.data.amount,
    });

    const meta = requestMeta(request);
    await writeAuditLog({
      actorId: user.id,
      actorWallet: user.wallet,
      action: "repay_invoice",
      entity: "Invoice",
      entityId: updated.id,
      payload: parsed.data,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return apiOk(serializeInvoice(updated));
  } catch (error) {
    return apiError(error);
  }
}
