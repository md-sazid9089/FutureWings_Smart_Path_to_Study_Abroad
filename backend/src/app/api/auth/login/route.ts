import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// ─── Dummy users (no DB required) ────────────────────────
const DUMMY_USERS = [
  { id: 1, email: "demo@futurewings.com", password: "demo123", role: "USER" as const, fullname: "Demo User" },
  { id: 2, email: "admin@futurewings.com", password: "admin123", role: "ADMIN" as const, fullname: "Admin User" },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = DUMMY_USERS.find(u => u.email === normalizedEmail);
    if (!user || user.password !== password) {
      return error("Invalid email or password", 401);
    }

    const token = signToken({ userId: user.id, role: user.role });

    return success({
      token,
      user: { id: user.id, email: user.email, role: user.role, fullname: user.fullname },
    });
  } catch (err) {
    return handleError(err);
  }
}
