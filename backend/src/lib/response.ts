import { NextResponse } from "next/server";
import { AuthError } from "./auth";

// ─── Standard JSON response ─────────────────────────────

export function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data, error: null }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, data: null, error: message }, { status });
}

// ─── Catch-all error handler wrapper ─────────────────────

export function handleError(err: unknown) {
  if (err instanceof AuthError) {
    const status = err.message.includes("Forbidden") ? 403 : 401;
    return error(err.message, status);
  }
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return error(message, 500);
}
