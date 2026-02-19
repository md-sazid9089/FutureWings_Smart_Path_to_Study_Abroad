import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/response";

// GET /api/documents/list – list current user's documents
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    const docs = await prisma.userDocument.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });

    return success(docs);
  } catch (err) {
    return handleError(err);
  }
}
