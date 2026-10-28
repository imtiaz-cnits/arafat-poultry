import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getCashAndBankReconciliation } from "@/lib/accounting-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("as_of_date");
    const asOfDate = dateParam ? new Date(dateParam) : undefined;

    const data = await getCashAndBankReconciliation(asOfDate);

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (error: any) {
    console.error("Cash Reconciliation GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load cash and bank reconciliation" },
      { status: 500 }
    );
  }
}
