import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return error("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
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
