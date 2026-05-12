import { createWalletChallenge } from "@/lib/server/auth";
import { apiError, apiOk, badRequest } from "@/lib/server/errors";
import { checkRateLimit, createRateLimitResponse, getRateLimitKey } from "@/lib/server/rate-limit";
import { authChallengeSchema } from "@/lib/server/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit({
      key: getRateLimitKey(request, "auth_challenge"),
      limit: 15,
      windowMs: 60_000,
    });
    if (!rateLimit.ok) return createRateLimitResponse(rateLimit.retryAfterSeconds);

    const body = await request.json();
    const parsed = authChallengeSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid challenge payload");

    const challenge = await createWalletChallenge(parsed.data.wallet);
    return apiOk(challenge);
  } catch (error) {
    return apiError(error);
  }
}
