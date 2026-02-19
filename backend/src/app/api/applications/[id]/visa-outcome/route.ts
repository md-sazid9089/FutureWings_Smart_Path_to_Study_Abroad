import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/applications/[id]/visa-outcome
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    const appId = parseInt(params.id);
    if (isNaN(appId)) return error("Invalid application ID", 400);

    // Ensure app belongs to user
    const application = await prisma.application.findFirst({
      where: { id: appId, userId: auth.userId },
    });
    if (!application) return error("Application not found", 404);

    const visaOutcome = await prisma.visaOutcome.findUnique({
      where: { applicationId: appId },
    });

    if (!visaOutcome) return error("No visa outcome yet", 404);

    return success(visaOutcome);
  } catch (err) {
    return handleError(err);
  }
}
