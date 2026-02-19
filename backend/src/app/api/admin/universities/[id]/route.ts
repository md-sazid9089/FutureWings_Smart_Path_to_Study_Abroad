import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// PUT /api/admin/universities/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const id = parseInt(params.id);
    if (isNaN(id)) return error("Invalid ID", 400);

    const body = await req.json();
    const university = await prisma.university.update({
      where: { id },
      data: body,
    });

    return success(university);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/admin/universities/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const id = parseInt(params.id);
    if (isNaN(id)) return error("Invalid ID", 400);

    await prisma.university.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
