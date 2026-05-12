import { requireSessionUser } from "@/lib/server/auth";
import { getOrCreateBalance, setBalance } from "@/lib/server/balance";
import { prisma } from "@/lib/server/db";
import { apiError, apiOk, badRequest, insufficientBalance } from "@/lib/server/errors";
import { requestMeta, writeAuditLog } from "@/lib/server/audit";
import { setBalanceSchema } from "@/lib/server/validators";
import { z } from "zod";

export const runtime = "nodejs";

const changeSchema = z.object({
  action: z.enum(["deposit", "withdraw", "set"]),
  amount: z.number().int().min(0),
});

export async function GET() {
  try {
    const user = await requireSessionUser();
    const balance = await getOrCreateBalance(prisma, user.id);

    return apiOk({
      token: balance.tokenSymbol,
      availableBaseUnits: Number(balance.availableBaseUnits),
      lockedBaseUnits: Number(balance.lockedBaseUnits),
      updatedAt: balance.updatedAt.toISOString(),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const parsed = changeSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid balance payload");

    let nextBalance = await getOrCreateBalance(prisma, user.id);

    if (parsed.data.action === "set") {
      setBalanceSchema.parse({ amount: parsed.data.amount });
      nextBalance = await setBalance(prisma, user.id, BigInt(parsed.data.amount));
    }

    if (parsed.data.action === "deposit") {
      nextBalance = await prisma.walletBalance.update({
        where: { id: nextBalance.id },
        data: { availableBaseUnits: nextBalance.availableBaseUnits + BigInt(parsed.data.amount) },
      });
    }

    if (parsed.data.action === "withdraw") {
      const amount = BigInt(parsed.data.amount);
      if (nextBalance.availableBaseUnits < amount) {
        insufficientBalance("Cannot withdraw more than current available balance");
      }
      nextBalance = await prisma.walletBalance.update({
        where: { id: nextBalance.id },
        data: { availableBaseUnits: nextBalance.availableBaseUnits - amount },
      });
    }

    const meta = requestMeta(request);
    await writeAuditLog({
      actorId: user.id,
      actorWallet: user.wallet,
      action: `balance_${parsed.data.action}`,
      entity: "WalletBalance",
      entityId: nextBalance.id,
      payload: parsed.data,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return apiOk({
      token: nextBalance.tokenSymbol,
      availableBaseUnits: Number(nextBalance.availableBaseUnits),
      lockedBaseUnits: Number(nextBalance.lockedBaseUnits),
      updatedAt: nextBalance.updatedAt.toISOString(),
    });
  } catch (error) {
    return apiError(error);
  }
}
