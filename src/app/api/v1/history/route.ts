import { UserRole } from "@prisma/client";
import { requireSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { apiError, apiOk } from "@/lib/server/errors";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";

    const rows = await prisma.invoiceEvent.findMany({
      where: mine
        ? {
            OR:
              user.role === UserRole.VERIFIER || user.role === UserRole.ADMIN
                ? [{ actorId: user.id }]
                : [{ actorId: user.id }, { invoice: { exporterId: user.id } }, { invoice: { investorId: user.id } }],
          }
        : undefined,
      include: {
        invoice: {
          select: {
            invoiceId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return apiOk(
      rows.map((item) => ({
        id: item.id,
        invoiceDbId: item.invoiceId,
        invoiceId: item.invoice.invoiceId,
        action: item.action,
        actorWallet: item.actorWallet,
        fromStatus: item.fromStatus,
        toStatus: item.toStatus,
        txSignature: item.txSignature,
        note: item.note,
        createdAt: item.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return apiError(error);
  }
}
