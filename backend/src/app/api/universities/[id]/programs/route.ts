import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/response";

// GET /api/universities/[id]/programs
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const universityId = parseInt(params.id);
    if (isNaN(universityId)) return error("Invalid university ID", 400);

    const programs = await prisma.program.findMany({
      where: { universityId },
      orderBy: { name: "asc" },
    });

    return success(programs);
  } catch (err) {
    return handleError(err);
  }
}
