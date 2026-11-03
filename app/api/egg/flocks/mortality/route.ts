import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordFlockMortality } from "@/lib/poultry-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { flock_id, mortality_count, reason, date } = body;

    if (!flock_id || !mortality_count || Number(mortality_count) <= 0) {
      return NextResponse.json(
        { status: "fail", message: "ফ্লক এবং সঠিক মৃত মুরগির সংখ্যা প্রদান করা আবশ্যক" },
        { status: 400 }
      );
    }

    const result = await recordFlockMortality({
      flockId: flock_id,
      mortalityCount: Number(mortality_count),
      reason,
      date: date ? new Date(date) : new Date(),
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: result,
      message: "মুরগির মৃত্যুর হিসাব সফলভাবে সংরক্ষিত ও লাইভ স্টক আপডেট হয়েছে",
    });
  } catch (error: any) {
    console.error("Flock Mortality POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record flock mortality" },
      { status: 500 }
    );
  }
}

