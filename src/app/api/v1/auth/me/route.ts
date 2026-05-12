import { UserRole } from "@prisma/client";
import { getSessionUser, updateSessionProfile } from "@/lib/server/auth";
import { apiError, apiOk, badRequest, unauthorized } from "@/lib/server/errors";
import { checkRateLimit, createRateLimitResponse, getRateLimitKey } from "@/lib/server/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  displayName: z.string().trim().min(2).max(80).optional(),
  companyName: z.string().trim().max(120).optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) unauthorized();
    return apiOk({
      ...user,
      role: user.role[0] + user.role.slice(1).toLowerCase(),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const rateLimit = checkRateLimit({
      key: getRateLimitKey(request, "auth_profile_update"),
      limit: 30,
      windowMs: 60_000,
    });
    if (!rateLimit.ok) return createRateLimitResponse(rateLimit.retryAfterSeconds);

    const user = await getSessionUser();
    if (!user) unauthorized();

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid profile update payload");

    const updated = await updateSessionProfile(user.id, parsed.data);
    return apiOk({
      ...updated,
      role: updated.role[0] + updated.role.slice(1).toLowerCase(),
    });
  } catch (error) {
    return apiError(error);
  }
}
