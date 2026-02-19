import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/admin/programs
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const programs = await prisma.program.findMany({
      include: { university: { include: { country: true } } },
      orderBy: { name: "asc" },
    });
    return success(programs);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/admin/programs
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const { name, universityId, degreeLevel, duration, tuitionFee, description } = body;

    if (!name || !universityId || !degreeLevel) {
      return error("name, universityId, and degreeLevel are required", 400);
    }

    const program = await prisma.program.create({
      data: {
        name,
        universityId: parseInt(universityId),
        degreeLevel,
        duration: duration || null,
        tuitionFee: tuitionFee ? parseFloat(tuitionFee) : null,
        description: description || null,
      },
    });

    return success(program, 201);
  } catch (err) {
    return handleError(err);
  }
}
