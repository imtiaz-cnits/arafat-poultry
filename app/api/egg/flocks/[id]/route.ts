import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getFlockDetailsWithAnalytics } from "@/lib/poultry-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const flockId = BigInt(id);

    const flock = await getFlockDetailsWithAnalytics(flockId);
    if (!flock) {
      return NextResponse.json(
        { status: "fail", message: "ফ্লক পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: flock,
    });
  } catch (error: any) {
    console.error("Flock Detail GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load flock details" },
      { status: 500 }
    );
  }
}

