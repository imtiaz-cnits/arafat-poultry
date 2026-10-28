import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getConsolidatedProfitAndLoss,
  getBusinessUnitProfitAndLoss,
} from "@/lib/accounting-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("start_date");
    const endDateParam = searchParams.get("end_date");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const [consolidatedPnl, businessUnitsDetail] = await Promise.all([
      getConsolidatedProfitAndLoss({ startDate, endDate }),
      getBusinessUnitProfitAndLoss({ startDate, endDate }),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        consolidated: consolidatedPnl,
        cost_transfers_and_allocations: businessUnitsDetail,
      },
    });
  } catch (error: any) {
    console.error("Accounting PnL GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load profit and loss statement" },
      { status: 500 }
    );
  }
}
