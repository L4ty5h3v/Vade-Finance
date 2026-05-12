import { requireSessionUser } from "@/lib/server/auth";
import { defaultInvoiceAction } from "@/lib/server/actions";
import { apiError, apiOk, badRequest } from "@/lib/server/errors";
import { serializeInvoice } from "@/lib/server/serializers";
import { actionSignatureSchema } from "@/lib/server/validators";
import { requestMeta, writeAuditLog } from "@/lib/server/audit";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: { params: Promise<{ invoiceId: string }> }) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const parsed = actionSignatureSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid default payload");

    const { invoiceId } = await ctx.params;
    const updated = await defaultInvoiceAction({
      invoiceId,
      user,
      txSignature: parsed.data.txSignature,
      note: parsed.data.note,
    });

    const meta = requestMeta(request);
    await writeAuditLog({
      actorId: user.id,
      actorWallet: user.wallet,
      action: "mark_default",
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
