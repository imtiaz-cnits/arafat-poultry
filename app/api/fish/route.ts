import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getFishFarmingDashboardData } from "@/lib/fish-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const data = await getFishFarmingDashboardData();
    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error: any) {
    console.error("Fish Dashboard GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load fish farming dashboard data" },
      { status: 500 }
    );
  }
}
