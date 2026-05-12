import { apiOk } from "@/lib/server/errors";
import { serverEnv } from "@/lib/server/env";

export const runtime = "nodejs";

export async function GET() {
  return apiOk({
    service: "vade-api",
    status: "ok",
    mode: serverEnv.DEV_MODE ? "dev" : "prod",
    time: new Date().toISOString(),
  });
}
