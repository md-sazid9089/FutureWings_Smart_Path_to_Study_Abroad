import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// PUT /api/admin/documents/[docId]/verify
export async function PUT(
  req: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    requireAdmin(req);
    const docId = parseInt(params.docId);
    if (isNaN(docId)) return error("Invalid document ID", 400);

    const body = await req.json();
    const { status, note } = body;

    if (!status || !["Verified", "Rejected"].includes(status)) {
      return error("status must be 'Verified' or 'Rejected'", 400);
    }

    const doc = await prisma.userDocument.update({
      where: { id: docId },
      data: { status, note: note || null },
    });

    return success(doc);
  } catch (err) {
    return handleError(err);
  }
}
