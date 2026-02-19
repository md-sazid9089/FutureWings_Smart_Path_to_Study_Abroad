import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/user/me – get current user profile
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullname: true,
        cgpa: true,
        degreeLevel: true,
        major: true,
        fundScore: true,
        createdAt: true,
      },
    });
    if (!user) return error("User not found", 404);
    return success(user);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/user/me – update profile
export async function PUT(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    const { fullname, cgpa, degreeLevel, major, fundScore } = body;

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(fullname !== undefined && { fullname }),
        ...(cgpa !== undefined && { cgpa: parseFloat(cgpa) }),
        ...(degreeLevel !== undefined && { degreeLevel }),
        ...(major !== undefined && { major }),
        ...(fundScore !== undefined && { fundScore: parseFloat(fundScore) }),
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        cgpa: true,
        degreeLevel: true,
        major: true,
        fundScore: true,
      },
    });

    return success(user);
  } catch (err) {
    return handleError(err);
  }
}
