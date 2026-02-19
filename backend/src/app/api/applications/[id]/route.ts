import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// GET /api/applications/[id] – application detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(req);
    const appId = parseInt(params.id);
    if (isNaN(appId)) return error("Invalid application ID", 400);

    const application = await prisma.application.findFirst({
      where: { id: appId, userId: auth.userId },
      include: {
        status: true,
        country: true,
        program: { include: { university: true } },
        visaOutcome: true,
      },
    });

    if (!application) return error("Application not found", 404);
    return success(application);
  } catch (err) {
    return handleError(err);
  }
}
