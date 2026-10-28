import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ status: "fail", message: "Harvest ID is required" }, { status: 400 });
    }

    const harvest = await prisma.fish_harvests.findUnique({
      where: { id: BigInt(id) },
    });

    if (!harvest) {
      return NextResponse.json({ status: "fail", message: "আহরণ রেকর্ড পাওয়া যায়নি" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Revert product stock
      const prod = await tx.products.findUnique({ where: { id: harvest.product_id } });
      if (prod) {
        const currentQty = parseFloat(prod.quantity || "0");
        const newQty = Math.max(0, currentQty - Number(harvest.total_weight_kg));
        await tx.products.update({
          where: { id: harvest.product_id },
          data: { quantity: newQty.toString() },
        });
      }

      // 2. Revert batch live fish count and harvested statistics
      await tx.fish_batches.update({
        where: { id: harvest.batch_id },
        data: {
          current_fish_count: { increment: harvest.fish_count },
          total_harvested_count: { decrement: harvest.fish_count },
          total_harvested_kg: { decrement: harvest.total_weight_kg },
          total_harvested_cost: { decrement: harvest.cost_allocated },
          status: "ACTIVE",
        },
      });

      // 3. Delete harvest record
      await tx.fish_harvests.delete({
        where: { id: BigInt(id) },
      });
    });

    return NextResponse.json({
      status: "success",
      message: "মাছ আহরণ রেকর্ড সফলভাবে বাতিল ও ইনভেন্টরি সংশোধন করা হয়েছে",
    });
  } catch (error: any) {
    console.error("Fish Harvest DELETE Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to delete harvest record" },
      { status: 500 }
    );
  }
}

