import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, handleError } from "@/lib/response";

// GET /api/admin/ratings – moderation list
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);

    const ratings = await prisma.countryRating.findMany({
      include: {
        user: { select: { id: true, email: true, fullname: true } },
        country: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(ratings);
  } catch (err) {
    return handleError(err);
  }
}
