import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/response";

// GET /api/countries/[id]/universities
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const countryId = parseInt(params.id);
    if (isNaN(countryId)) return error("Invalid country ID", 400);

    const universities = await prisma.university.findMany({
      where: { countryId },
      orderBy: { name: "asc" },
    });

    return success(universities);
  } catch (err) {
    return handleError(err);
  }
}
