import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";

// POST /api/ratings – submit rating (post-visa only)
export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    const { applicationId, countryId, ratingValue, comments } = body;

    if (!applicationId || !countryId || !ratingValue) {
      return error("applicationId, countryId, and ratingValue are required", 400);
    }

    const rating = parseInt(ratingValue);
    if (rating < 1 || rating > 5) {
      return error("ratingValue must be between 1 and 5", 400);
    }

    // Verify the application belongs to the user
    const application = await prisma.application.findFirst({
      where: { id: parseInt(applicationId), userId: auth.userId },
    });
    if (!application) return error("Application not found", 404);

    // Verify visa outcome exists
    const visaOutcome = await prisma.visaOutcome.findUnique({
      where: { applicationId: parseInt(applicationId) },
    });
    if (!visaOutcome) {
      return error("Cannot rate – no visa outcome exists for this application", 400);
    }

    const newRating = await prisma.countryRating.create({
      data: {
        userId: auth.userId,
        applicationId: parseInt(applicationId),
        countryId: parseInt(countryId),
        ratingValue: rating,
        comments: comments || null,
      },
    });

    return success(newRating, 201);
  } catch (err) {
    return handleError(err);
  }
}
