import type { InvoiceStatus, UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  wallet: string;
  role: UserRole;
  displayName: string;
};

export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INSUFFICIENT_BALANCE"
  | "INVALID_STATUS";

export type InvoiceTransition = {
  from: InvoiceStatus;
  to: InvoiceStatus;
};
