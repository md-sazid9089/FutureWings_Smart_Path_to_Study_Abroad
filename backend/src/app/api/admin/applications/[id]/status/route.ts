import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// PUT /api/admin/applications/[id]/status
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const appId = parseInt(params.id);
    if (isNaN(appId)) return error("Invalid application ID", 400);

    const body = await req.json();
    const { statusName } = body;

    if (!statusName) return error("statusName is required", 400);

    const statusRecord = await prisma.applicationStatus.findUnique({
      where: { name: statusName },
    });
    if (!statusRecord) return error("Invalid status name", 400);

    const application = await prisma.application.update({
      where: { id: appId },
      data: { statusId: statusRecord.id },
      include: { status: true },
    });

    return success(application);
  } catch (err) {
    return handleError(err);
  }
}
