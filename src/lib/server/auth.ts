import { UserRole } from "@prisma/client";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { cookies } from "next/headers";
import { PublicKey } from "@solana/web3.js";
import { prisma } from "./db";
import { serverEnv } from "./env";
import { badRequest, unauthorized } from "./errors";
import type { SessionUser } from "./types";

function challengeMessage(wallet: string, nonce: string) {
  return [
    "vade.finance sign-in",
    "",
    `Wallet: ${wallet}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
    "Statement: Sign this message to authenticate in dev mode.",
  ].join("\n");
}

export async function createWalletChallenge(wallet: string) {
  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + serverEnv.CHALLENGE_TTL_MINUTES * 60 * 1000);
  const message = challengeMessage(wallet, nonce);

  await prisma.walletChallenge.create({
    data: {
      wallet,
      nonce,
      message,
      expiresAt,
    },
  });

  return { nonce, message, expiresAt };
}

type VerifyChallengeInput = {
  wallet: string;
  nonce: string;
  signature: string;
  role?: UserRole;
  displayName?: string;
  companyName?: string;
};

export async function verifyWalletChallenge(input: VerifyChallengeInput) {
  const challenge = await prisma.walletChallenge.findUnique({
    where: { nonce: input.nonce },
  });

  if (!challenge || challenge.wallet !== input.wallet) {
    unauthorized("Challenge is missing or mismatched");
  }
  if (challenge.expiresAt.getTime() < Date.now()) {
    unauthorized("Challenge expired");
  }
  if (challenge.usedAt) {
    unauthorized("Challenge already used");
  }

  const signatureBytes = bs58.decode(input.signature);
  const pubkeyBytes = new PublicKey(input.wallet).toBytes();
  const messageBytes = new TextEncoder().encode(challenge.message);
  const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
  if (!isValid) {
    unauthorized("Invalid wallet signature");
  }

  const role = input.role ?? UserRole.EXPORTER;
  const displayName = input.displayName ?? input.wallet.slice(0, 8);

  const user = await prisma.user.upsert({
    where: { wallet: input.wallet },
    update: {
      role,
      displayName,
      companyName: input.companyName,
    },
    create: {
      wallet: input.wallet,
      role,
      displayName,
      companyName: input.companyName,
    },
  });

  await prisma.walletChallenge.update({
    where: { id: challenge.id },
    data: {
      usedAt: new Date(),
      userId: user.id,
    },
  });

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + serverEnv.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.authSession.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      wallet: user.wallet,
      role: user.role,
      displayName: user.displayName,
    } satisfies SessionUser,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(serverEnv.SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.authSession.delete({ where: { token } }).catch(() => undefined);
    return null;
  }

  return {
    id: session.user.id,
    wallet: session.user.wallet,
    role: session.user.role,
    displayName: session.user.displayName,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) unauthorized();
  return user;
}

export async function updateSessionProfile(userId: string, updates: { role?: UserRole; displayName?: string; companyName?: string }) {
  const payload: { role?: UserRole; displayName?: string; companyName?: string } = {};
  if (updates.role) payload.role = updates.role;
  if (updates.displayName) payload.displayName = updates.displayName;
  if (updates.companyName !== undefined) payload.companyName = updates.companyName;

  if (Object.keys(payload).length === 0) {
    badRequest("Nothing to update");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: payload,
  });

  return {
    id: updated.id,
    wallet: updated.wallet,
    role: updated.role,
    displayName: updated.displayName,
  } satisfies SessionUser;
}
