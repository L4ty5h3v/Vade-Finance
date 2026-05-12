import type { PrismaClient, Prisma } from "@prisma/client";
import { serverEnv } from "./env";

type DbLike = PrismaClient | Prisma.TransactionClient;

export async function getOrCreateBalance(db: DbLike, userId: string) {
  const existing = await db.walletBalance.findUnique({
    where: {
      userId_tokenSymbol: {
        userId,
        tokenSymbol: serverEnv.STABLE_SYMBOL,
      },
    },
  });

  if (existing) return existing;

  return db.walletBalance.create({
    data: {
      userId,
      tokenSymbol: serverEnv.STABLE_SYMBOL,
      availableBaseUnits: BigInt(0),
      lockedBaseUnits: BigInt(0),
    },
  });
}

export async function setBalance(db: DbLike, userId: string, amount: bigint) {
  return db.walletBalance.upsert({
    where: {
      userId_tokenSymbol: {
        userId,
        tokenSymbol: serverEnv.STABLE_SYMBOL,
      },
    },
    update: {
      availableBaseUnits: amount,
    },
    create: {
      userId,
      tokenSymbol: serverEnv.STABLE_SYMBOL,
      availableBaseUnits: amount,
      lockedBaseUnits: BigInt(0),
    },
  });
}
