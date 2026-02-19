import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/response";

// GET /api/countries/[id]/ratings-summary
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const countryId = parseInt(params.id);
    if (isNaN(countryId)) return error("Invalid country ID", 400);

    const aggregate = await prisma.countryRating.aggregate({
      where: { countryId },
      _avg: { ratingValue: true },
      _count: { id: true },
    });

    return success({
      countryId,
      averageRating: aggregate._avg.ratingValue || 0,
      totalRatings: aggregate._count.id,
    });
  } catch (err) {
    return handleError(err);
  }
}
