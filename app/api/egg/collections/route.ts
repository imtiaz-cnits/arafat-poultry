import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recordEggCollection, getEggPerformanceAndProfitability } from "@/lib/egg-service";

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

    const collection = await prisma.egg_collections.findUnique({
      where: { id: BigInt(id) },
      include: { egg_collection_grades: true },
    });

    if (!collection) {
      return NextResponse.json(
        { status: "fail", message: "সংগ্রহ রেকর্ড পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Revert product stock for each grade
      for (const grade of collection.egg_collection_grades) {
        const prod = await tx.products.findUnique({ where: { id: grade.product_id } });
        if (prod) {
          const curQty = parseFloat(prod.quantity || "0");
          const newQty = Math.max(0, curQty - grade.quantity_pieces);
          await tx.products.update({
            where: { id: grade.product_id },
            data: { quantity: newQty.toString() },
          });
        }
      }

      // Delete collection (cascades grades)
      await tx.egg_collections.delete({
        where: { id: BigInt(id) },
      });
    });

    return NextResponse.json({
      status: "success",
      message: "ডিম সংগ্রহ রেকর্ড সফলভাবে বাতিল করা হয়েছে",
    });
  } catch (error: any) {
    console.error("Egg Collection DELETE Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to delete egg collection" },
      { status: 500 }
    );
  }
}

