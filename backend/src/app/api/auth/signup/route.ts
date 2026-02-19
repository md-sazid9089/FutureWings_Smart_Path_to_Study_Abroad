import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullname } = body;

    // ── Validation ──
    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Check duplicate ──
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return error("Email already registered", 409);
    }

    // ── Hash & create ──
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullname: fullname || null,
      },
    });

    // ── Issue token ──
    const token = signToken({ userId: user.id, role: user.role });

    return success({ token, user: { id: user.id, email: user.email, role: user.role } }, 201);
  } catch (err) {
    return handleError(err);
  }
}
