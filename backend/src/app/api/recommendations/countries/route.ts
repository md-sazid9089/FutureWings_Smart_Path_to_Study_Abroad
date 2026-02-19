import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/recommendations/countries
// Tier rule: cgpa > 3.7 → tier 1; 3.2–3.7 → tier 2; < 3.2 → tier 3
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { cgpa: true },
    });

    if (!user || user.cgpa === null) {
      return error("Please update your CGPA in profile first", 400);
    }

    let maxTier: number;
    if (user.cgpa > 3.7) {
      maxTier = 1; // eligible for all tiers
    } else if (user.cgpa >= 3.2) {
      maxTier = 2;
    } else {
      maxTier = 3;
    }

    // Return countries where tier <= maxTier (higher tier number = less selective)
    // So a tier-1 student can see tier 1,2,3; a tier-3 student can only see tier 3.
    const countries = await prisma.country.findMany({
      where: { isActive: true, tier: { gte: maxTier } },
      orderBy: { tier: "asc" },
    });

    return success({ userTier: maxTier, countries });
  } catch (err) {
    return handleError(err);
  }
}
