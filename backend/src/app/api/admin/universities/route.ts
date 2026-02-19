import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/admin/universities
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const universities = await prisma.university.findMany({
      include: { country: true },
      orderBy: { name: "asc" },
    });
    return success(universities);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/admin/universities
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const { name, countryId, location, ranking, website } = body;

    if (!name || !countryId) return error("name and countryId are required", 400);

    const university = await prisma.university.create({
      data: {
        name,
        countryId: parseInt(countryId),
        location: location || null,
        ranking: ranking ? parseInt(ranking) : null,
        website: website || null,
      },
    });

    return success(university, 201);
  } catch (err) {
    return handleError(err);
  }
}
