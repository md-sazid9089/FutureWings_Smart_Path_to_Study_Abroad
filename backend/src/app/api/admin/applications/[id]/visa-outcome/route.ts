import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// POST /api/admin/applications/[id]/visa-outcome
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const appId = parseInt(params.id);
    if (isNaN(appId)) return error("Invalid application ID", 400);

    const body = await req.json();
    const { outcome, note } = body;

    if (!outcome || !["Approved", "Denied"].includes(outcome)) {
      return error("outcome must be 'Approved' or 'Denied'", 400);
    }

    // Check if outcome already exists (unique constraint)
    const existing = await prisma.visaOutcome.findUnique({
      where: { applicationId: appId },
    });
    if (existing) {
      return error("Visa outcome already exists for this application", 409);
    }

    const visaOutcome = await prisma.visaOutcome.create({
      data: {
        applicationId: appId,
        outcome,
        note: note || null,
      },
    });

    return success(visaOutcome, 201);
  } catch (err) {
    return handleError(err);
  }
}
