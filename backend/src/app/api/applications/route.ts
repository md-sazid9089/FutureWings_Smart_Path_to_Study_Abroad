import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// POST /api/applications – create application
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    const { countryId, programId, intakeApplied } = body;

    if (!countryId || !programId || !intakeApplied) {
      return error("countryId, programId, and intakeApplied are required", 400);
    }

    // Get "Pending" status ID
    const pendingStatus = await prisma.applicationStatus.findUnique({
      where: { name: "Pending" },
    });
    if (!pendingStatus) {
      return error("Application statuses not seeded", 500);
    }

    const application = await prisma.application.create({
      data: {
        userId: auth.userId,
        countryId: parseInt(countryId),
        programId: parseInt(programId),
        statusId: pendingStatus.id,
        intakeApplied,
      },
      include: { status: true, country: true, program: true },
    });

    return success(application, 201);
  } catch (err) {
    return handleError(err);
  }
}

// GET /api/applications – list user's applications
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    const applications = await prisma.application.findMany({
      where: { userId: auth.userId },
      include: { status: true, country: true, program: true, visaOutcome: true },
      orderBy: { createdAt: "desc" },
    });

    return success(applications);
  } catch (err) {
    return handleError(err);
  }
}
