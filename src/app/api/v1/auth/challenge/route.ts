import { createWalletChallenge } from "@/lib/server/auth";
import { apiError, apiOk, badRequest } from "@/lib/server/errors";
import { authChallengeSchema } from "@/lib/server/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = authChallengeSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid challenge payload");

    const challenge = await createWalletChallenge(parsed.data.wallet);
    return apiOk(challenge);
  } catch (error) {
    return apiError(error);
  }
}
