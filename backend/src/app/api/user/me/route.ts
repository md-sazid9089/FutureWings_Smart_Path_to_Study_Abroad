import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/response";
import { users } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const user = users.find(u => u.id === auth.userId);
    if (!user) return error("User not found", 404);
    const { password, ...safe } = user;
    return success(safe);
  } catch (err) { return handleError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const body = await req.json();
    const user = users.find(u => u.id === auth.userId);
    if (!user) return error("User not found", 404);
    if (body.fullname !== undefined) user.fullname = body.fullname;
    if (body.cgpa !== undefined) user.cgpa = Number(body.cgpa);
    if (body.degreeLevel !== undefined) user.degreeLevel = body.degreeLevel;
    if (body.major !== undefined) user.major = body.major;
    if (body.fundScore !== undefined) user.fundScore = Number(body.fundScore);
    const { password, ...safe } = user;
    return success(safe);
  } catch (err) { return handleError(err); }
}