import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/admin/scholarships
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const scholarships = await prisma.scholarship.findMany({
      include: { country: true },
      orderBy: { name: "asc" },
    });
    return success(scholarships);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/admin/scholarships
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const { name, countryId, amount, eligibility, deadline } = body;

    if (!name || !countryId) return error("name and countryId are required", 400);

    const scholarship = await prisma.scholarship.create({
      data: {
        name,
        countryId: parseInt(countryId),
        amount: amount ? parseFloat(amount) : null,
        eligibility: eligibility || null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return success(scholarship, 201);
  } catch (err) {
    return handleError(err);
  }
}
