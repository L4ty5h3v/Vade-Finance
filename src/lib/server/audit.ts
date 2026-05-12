import { createHash } from "node:crypto";
import { prisma } from "./db";

type AuditInput = {
  actorId?: string;
  actorWallet?: string;
  action: string;
  entity: string;
  entityId?: string;
  payload?: unknown;
  ip?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(input: AuditInput) {
  let payloadHash: string | undefined;
  if (input.payload !== undefined) {
    const serialized = JSON.stringify(input.payload);
    payloadHash = createHash("sha256").update(serialized).digest("hex");
  }

  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      actorWallet: input.actorWallet,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      payloadHash,
      ip: input.ip ?? undefined,
      userAgent: input.userAgent ?? undefined,
    },
  });
}

export function requestMeta(request: Request) {
  return {
    ip: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
  };
}
