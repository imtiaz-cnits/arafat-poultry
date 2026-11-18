import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { recordActivity } from "@/lib/audit-service";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (authUser) {
      await recordActivity({
        req,
        userId: authUser.id,
        action: "LOGOUT",
        module: "Auth & Sessions",
        description: `User "${authUser.name}" (${authUser.email || authUser.mobile}) logged out`,
      });
    }
  } catch {}

  const response = NextResponse.json({
    status: "success",
    message: "Logged out successfully",
  });

  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}

export async function GET(req: NextRequest) {
  return POST(req);
}
