import { UserRole } from "@prisma/client";
import { serverEnv } from "./env";
import { forbidden } from "./errors";
import type { SessionUser } from "./types";

export function requireRole(user: SessionUser, allowed: UserRole[]) {
  if (serverEnv.DEV_MODE) return;
  if (!allowed.includes(user.role)) {
    forbidden("Role is not allowed to perform this action");
  }
}
