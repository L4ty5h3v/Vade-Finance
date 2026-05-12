import { requireSessionUser } from "@/lib/server/auth";
import { listInvoiceAction } from "@/lib/server/actions";
import { apiError, apiOk, badRequest } from "@/lib/server/errors";
import { serializeInvoice } from "@/lib/server/serializers";
import { checkRateLimit, createRateLimitResponse, getRateLimitKey } from "@/lib/server/rate-limit";
import { actionSignatureSchema } from "@/lib/server/validators";
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
    const parsed = actionSignatureSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid list payload");

    const { invoiceId } = await ctx.params;
    const updated = await listInvoiceAction({
      invoiceId,
      user,
      txSignature: parsed.data.txSignature,
      note: parsed.data.note,
    });

    const meta = requestMeta(request);
    await writeAuditLog({
      actorId: user.id,
      actorWallet: user.wallet,
      action: "list_invoice",
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
