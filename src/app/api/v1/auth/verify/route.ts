import { NextResponse } from "next/server";
import { verifyWalletChallenge } from "@/lib/server/auth";
import { apiError, badRequest } from "@/lib/server/errors";
import { serverEnv } from "@/lib/server/env";
import { authVerifySchema } from "@/lib/server/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = authVerifySchema.safeParse(body);
    if (!parsed.success) badRequest("Invalid verify payload");

    const verified = await verifyWalletChallenge(parsed.data);

    const response = NextResponse.json({
      ok: true,
      data: {
        user: {
          ...verified.user,
          role: verified.user.role[0] + verified.user.role.slice(1).toLowerCase(),
        },
        expiresAt: verified.expiresAt.toISOString(),
      },
    });

    response.cookies.set(serverEnv.SESSION_COOKIE, verified.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: verified.expiresAt,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
