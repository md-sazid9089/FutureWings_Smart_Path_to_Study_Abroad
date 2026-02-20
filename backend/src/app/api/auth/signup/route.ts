import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// ─── Dummy signup (no DB required) ───────────────────────
let nextId = 100;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullname } = body;

    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const id = nextId++;

    const token = signToken({ userId: id, role: "USER" });

    return success(
      { token, user: { id, email: normalizedEmail, role: "USER", fullname: fullname || null } },
      201
    );
  } catch (err) {
    return handleError(err);
  }
}
