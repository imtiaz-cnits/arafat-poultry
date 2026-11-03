import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  recordEggCollection,
  getEggPerformanceAndProfitability,
  reverseEggCollection,
} from "@/lib/egg-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const report = await getEggPerformanceAndProfitability();
    return NextResponse.json({
      status: "success",
      data: report,
    });
  } catch (error: any) {
    console.error("Egg Collections GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load egg records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const {
      flock_id,
      total_collected,
      rejected_breakage,
      allocated_expenses,
      grades,
      date,
      note,
    } = body;

    if (!flock_id || !total_collected || Number(total_collected) <= 0) {
      return NextResponse.json(
        { status: "fail", message: "ফ্লক এবং সংগৃহীত ডিমের সংখ্যা আবশ্যক" },
        { status: 400 }
      );
    }

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { status: "fail", message: "ন্যূনতম একটি গ্রেডের জন্য ডিম বণ্টন করুন" },
        { status: 400 }
      );
    }

    const result = await recordEggCollection({
      flockId: flock_id,
      totalCollected: Number(total_collected),
      rejectedBreakage: Number(rejected_breakage || 0),
      allocatedExpenses: Number(allocated_expenses || 0),
      grades: grades.map((g: any) => ({
        productId: g.product_id,
        gradeName: g.grade_name,
        quantityPieces: Number(g.quantity_pieces || 0),
        trayCapacity: Number(g.tray_capacity || 30),
      })),
      date: date ? new Date(date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      message: "দৈনিক ডিম সংগ্রহ ও গ্রেডিং সফলভাবে সংরক্ষিত হয়েছে",
      data: result,
    });
  } catch (error: any) {
    console.error("Egg Collection POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record egg collection" },
      { status: 400 }
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
      return NextResponse.json(
        { status: "fail", message: "Collection ID is required" },
        { status: 400 }
      );
    }

    const result = await reverseEggCollection(BigInt(id), authResult.user.id, "User requested collection voucher cancellation");

    return NextResponse.json({
      status: "success",
      message: result.message || "ডিম সংগ্রহ রেকর্ড সফলভাবে বাতিল ও স্টক রিভার্স করা হয়েছে",
      data: result,
    });
  } catch (error: any) {
    console.error("Egg Collection DELETE Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to reverse egg collection" },
      { status: 500 }
    );
  }
}

