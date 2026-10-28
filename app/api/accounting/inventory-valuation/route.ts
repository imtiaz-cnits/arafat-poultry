import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getInventoryValuationReport } from "@/lib/accounting-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const data = await getInventoryValuationReport();

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error: any) {
    console.error("Inventory Valuation GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load inventory valuation report" },
      { status: 500 }
    );
  }
}
