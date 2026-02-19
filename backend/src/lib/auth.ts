import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// ─── Token types ─────────────────────────────────────────

export interface TokenPayload {
  userId: number;
  role: "USER" | "ADMIN";
}

// ─── Sign a JWT ──────────────────────────────────────────

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// ─── Verify and decode JWT ───────────────────────────────

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Extract auth from request ───────────────────────────

export function getAuth(req: NextRequest): TokenPayload | null {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.split(" ")[1];
  return verifyToken(token);
}

// ─── Require authenticated user ──────────────────────────

export function requireAuth(req: NextRequest): TokenPayload {
  const auth = getAuth(req);
  if (!auth) throw new AuthError("Unauthorized");
  return auth;
}

// ─── Require admin role ──────────────────────────────────

export function requireAdmin(req: NextRequest): TokenPayload {
  const auth = requireAuth(req);
  if (auth.role !== "ADMIN") throw new AuthError("Forbidden – admin only");
  return auth;
}

// ─── Custom error class ─────────────────────────────────

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
