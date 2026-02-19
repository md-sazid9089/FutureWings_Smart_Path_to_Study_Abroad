import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// POST /api/documents/upload – multipart file upload
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return error("No file provided", 400);
    }

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Build unique filename
    const ext = path.extname(file.name);
    const filename = `${auth.userId}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save record in DB
    const doc = await prisma.userDocument.create({
      data: {
        userId: auth.userId,
        fileName: file.name,
        fileType: file.type || ext,
        filePath: `uploads/${filename}`,
        status: "Pending",
      },
    });

    return success(doc, 201);
  } catch (err) {
    return handleError(err);
  }
}
