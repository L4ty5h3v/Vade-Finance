import { Queue } from "bullmq";
import IORedis from "ioredis";

let verificationQueue: Queue | null = null;

export function getVerificationQueue() {
  if (verificationQueue) return verificationQueue;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  verificationQueue = new Queue("invoice-verification", { connection });
  return verificationQueue;
}

export async function enqueueVerification(invoiceId: string) {
  const queue = getVerificationQueue();
  if (!queue) return;
  await queue.add("verify-documents", { invoiceId });
}
