import { NextRequest } from "next/server";
import { success, handleError } from "@/lib/response";
import { countries } from "@/lib/store";

export async function GET(_req: NextRequest) {
  try { return success(countries.filter(c => c.isActive)); }
  catch (err) { return handleError(err); }
}