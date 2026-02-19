import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/response";

// GET /api/scholarships/country/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const countryId = parseInt(params.id);
    if (isNaN(countryId)) return error("Invalid country ID", 400);

    const scholarships = await prisma.scholarship.findMany({
      where: { countryId },
      orderBy: { name: "asc" },
    });

    return success(scholarships);
  } catch (err) {
    return handleError(err);
  }
}
