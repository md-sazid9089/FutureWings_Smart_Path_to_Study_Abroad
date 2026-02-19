import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, handleError } from "@/lib/response";

// GET /api/admin/applications – list all applications
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const apps = await prisma.application.findMany({
      include: {
        user: { select: { id: true, email: true, fullname: true } },
        status: true,
        country: true,
        program: { include: { university: true } },
        visaOutcome: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return success(apps);
  } catch (err) {
    return handleError(err);
  }
}
