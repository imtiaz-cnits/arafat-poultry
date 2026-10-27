import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordHarvest } from "@/lib/fish-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { batch_id, product_id, harvest_type, fish_count, total_weight_kg, date, note } = body;

    if (
      !batch_id ||
      !product_id ||
      !fish_count ||
      Number(fish_count) <= 0 ||
      !total_weight_kg ||
      Number(total_weight_kg) <= 0
    ) {
      return NextResponse.json(
        {
          status: "fail",
          message: "ব্যাচ, বিক্রয়যোগ্য পণ্য, মাছের সংখ্যা এবং মোট ওজন প্রদান করা আবশ্যক",
        },
        { status: 400 }
      );
    }

    const result = await recordHarvest({
      batchId: batch_id,
      productId: product_id,
      harvestType: harvest_type === "FINAL" ? "FINAL" : "PARTIAL",
      fishCount: Number(fish_count),
      totalWeightKg: Number(total_weight_kg),
      date: date ? new Date(date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: {
        ...result,
        harvestId: Number(result.harvestId),
      },
      message: `${harvest_type === "FINAL" ? "চূড়ান্ত" : "আংশিক"} মাছ আহরণ সফলভাবে সম্পন্ন ও ইনভেন্টরিতে যুক্ত হয়েছে`,
    });
  } catch (error: any) {
    console.error("Fish Harvest POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record fish harvest" },
      { status: 500 }
    );
  }
}
