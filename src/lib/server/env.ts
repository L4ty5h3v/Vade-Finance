export const serverEnv = {
  // Always-on dev mode by product decision.
  DEV_MODE: process.env.VADE_DEV_MODE !== "false",
  SESSION_COOKIE: process.env.VADE_SESSION_COOKIE ?? "vade_session",
  SESSION_TTL_DAYS: Number(process.env.VADE_SESSION_TTL_DAYS ?? 30),
  CHALLENGE_TTL_MINUTES: Number(process.env.VADE_CHALLENGE_TTL_MINUTES ?? 10),
  STABLE_SYMBOL: process.env.VADE_STABLE_SYMBOL ?? "USDT",
};

export const BASE_TOKEN_DECIMALS = 6;
export const BASE_TOKEN_MULTIPLIER = 10 ** BASE_TOKEN_DECIMALS;
