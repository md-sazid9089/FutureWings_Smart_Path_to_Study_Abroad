import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { success, handleError } from "@/lib/response";

// GET /api/admin/documents?status=Pending
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const status = req.nextUrl.searchParams.get("status") || undefined;

    const docs = await prisma.userDocument.findMany({
      where: status ? { status } : {},
      include: { user: { select: { id: true, email: true, fullname: true } } },
      orderBy: { createdAt: "desc" },
    });

    return success(docs);
  } catch (err) {
    return handleError(err);
  }
}
