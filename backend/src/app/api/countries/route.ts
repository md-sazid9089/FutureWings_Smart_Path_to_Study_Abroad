import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/response";

// GET /api/countries – list all active countries
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return success(countries);
  } catch (err) {
    return handleError(err);
  }
}
