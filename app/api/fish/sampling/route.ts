import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordGrowthSample } from "@/lib/fish-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { batch_id, sample_count, sample_weight_kg, date, note } = body;

    if (
      !batch_id ||
      !sample_count ||
      Number(sample_count) <= 0 ||
      !sample_weight_kg ||
      Number(sample_weight_kg) <= 0
    ) {
      return NextResponse.json(
        {
          status: "fail",
          message: "ব্যাচ, স্যাম্পল সংখ্যা এবং মোট ওজন (কেজি) উভয়ই প্রদান করা আবশ্যক",
        },
        { status: 400 }
      );
    }

    const result = await recordGrowthSample({
      batchId: batch_id,
      sampleCount: Number(sample_count),
      sampleWeightKg: Number(sample_weight_kg),
      date: date ? new Date(date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: result,
      message: "মাছের বৃদ্ধি ও গড় ওজনের নমুনা সফলভাবে সংরক্ষিত হয়েছে",
    });
  } catch (error: any) {
    console.error("Fish Sampling POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record growth sample" },
      { status: 500 }
    );
  }
}
