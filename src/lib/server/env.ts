import { z } from "zod";

const envSchema = z.object({
  VADE_DEV_MODE: z.enum(["true", "false"]).optional(),
  VADE_SESSION_COOKIE: z.string().trim().min(1).optional(),
  VADE_SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).optional(),
  VADE_CHALLENGE_TTL_MINUTES: z.coerce.number().int().min(1).max(120).optional(),
  VADE_STABLE_SYMBOL: z.string().trim().min(1).max(12).optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const serverEnv = {
  // Always-on dev mode by product decision.
  DEV_MODE: parsedEnv.VADE_DEV_MODE !== "false",
  SESSION_COOKIE: parsedEnv.VADE_SESSION_COOKIE ?? "vade_session",
  SESSION_TTL_DAYS: parsedEnv.VADE_SESSION_TTL_DAYS ?? 30,
  CHALLENGE_TTL_MINUTES: parsedEnv.VADE_CHALLENGE_TTL_MINUTES ?? 10,
  STABLE_SYMBOL: parsedEnv.VADE_STABLE_SYMBOL ?? "USDT",
};

export const BASE_TOKEN_DECIMALS = 6;
export const BASE_TOKEN_MULTIPLIER = 10 ** BASE_TOKEN_DECIMALS;
