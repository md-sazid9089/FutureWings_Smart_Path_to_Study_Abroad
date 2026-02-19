import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/admin/countries – list all countries (including inactive)
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const countries = await prisma.country.findMany({ orderBy: { name: "asc" } });
    return success(countries);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/admin/countries – create country
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const { name, code, description, tier, isActive } = body;

    if (!name || !code) return error("name and code are required", 400);

    const country = await prisma.country.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || null,
        tier: tier ? parseInt(tier) : 1,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return success(country, 201);
  } catch (err) {
    return handleError(err);
  }
}
