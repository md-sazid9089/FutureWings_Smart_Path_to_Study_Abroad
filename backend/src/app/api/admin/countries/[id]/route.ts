import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// PUT /api/admin/countries/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const id = parseInt(params.id);
    if (isNaN(id)) return error("Invalid ID", 400);

    const body = await req.json();
    const country = await prisma.country.update({
      where: { id },
      data: body,
    });

    return success(country);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/admin/countries/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req);
    const id = parseInt(params.id);
    if (isNaN(id)) return error("Invalid ID", 400);

    // Soft delete by setting isActive = false
    const country = await prisma.country.update({
      where: { id },
      data: { isActive: false },
    });

    return success(country);
  } catch (err) {
    return handleError(err);
  }
}
