import { NextResponse } from "next/server";
import type { AppErrorCode } from "./types";

export class AppError extends Error {
  constructor(
    public code: AppErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function badRequest(message: string): never {
  throw new AppError("BAD_REQUEST", message, 400);
}

export function unauthorized(message = "Unauthorized"): never {
  throw new AppError("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden"): never {
  throw new AppError("FORBIDDEN", message, 403);
}

export function notFound(message = "Not found"): never {
  throw new AppError("NOT_FOUND", message, 404);
}

export function conflict(message: string): never {
  throw new AppError("CONFLICT", message, 409);
}

export function insufficientBalance(message = "Insufficient balance"): never {
  throw new AppError("INSUFFICIENT_BALANCE", message, 409);
}

export function invalidStatus(message = "Invalid status transition"): never {
  throw new AppError("INVALID_STATUS", message, 409);
}

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function apiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL",
        message: "Internal server error",
      },
    },
    { status: 500 },
  );
}
