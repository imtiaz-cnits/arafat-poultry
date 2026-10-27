import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordMortality } from "@/lib/fish-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { batch_id, mortality_count, reason, date } = body;

    if (!batch_id || !mortality_count || Number(mortality_count) <= 0) {
      return NextResponse.json(
        { status: "fail", message: "ব্যাচ এবং সঠিক মৃত মাছের সংখ্যা প্রদান করা আবশ্যক" },
        { status: 400 }
      );
    }

    const result = await recordMortality({
      batchId: batch_id,
      mortalityCount: Number(mortality_count),
      reason,
      date: date ? new Date(date) : new Date(),
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: result,
      message: "মাছের মৃত্যুর হিসাব সফলভাবে সংরক্ষিত হয়েছে",
    });
  } catch (error: any) {
    console.error("Fish Mortality POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record mortality" },
      { status: 500 }
    );
  }
}
