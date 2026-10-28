import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recordInternalFeedIssue, getFeedStockAndProfitability } from "@/lib/feed-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const report = await getFeedStockAndProfitability();
    const feedProducts = await prisma.products.findMany({
      where: { status: "active" },
      select: {
        id: true,
        product_name: true,
        quantity: true,
        cost_price: true,
        feed_products: {
          select: {
            bag_weight_kg: true,
            feed_type: true,
            target_type: true,
          },
        },
      },
      orderBy: { id: "desc" },
      take: 50,
    });

    return NextResponse.json({
      status: "success",
      data: {
        ...report,
        feed_products: feedProducts.map((p) => ({
          id: Number(p.id),
          product_name: p.product_name,
          quantity: parseFloat(p.quantity || "0"),
          cost_price: parseFloat(p.cost_price || "0"),
          bag_weight_kg: p.feed_products?.bag_weight_kg ? Number(p.feed_products.bag_weight_kg) : 50,
          target_type: p.feed_products?.target_type || "POULTRY",
        })),
      },
    });
  } catch (error: any) {
    console.error("Internal Feed Issues GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load feed issue records" },
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
      product_id,
      destination_type,
      destination_id,
      destination_name,
      bags,
      bag_weight_kg,
      date,
      note,
    } = body;

    if (!product_id || !bags || Number(bags) <= 0 || !destination_name) {
      return NextResponse.json(
        {
          status: "fail",
          message: "Product, valid bag quantity, and destination name are required!",
        },
        { status: 400 }
      );
    }

    const result = await recordInternalFeedIssue({
      productId: product_id,
      destinationType: destination_type || "POULTRY_FARM",
      destinationId: destination_id,
      destinationName: destination_name,
      bags: Number(bags),
      bagWeightKg: bag_weight_kg ? Number(bag_weight_kg) : 50,
      date: date ? new Date(date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      message: "Internal feed issue recorded successfully. Transferred to destination.",
      data: {
        issue_no: result.issueCode,
        bags_issued: result.bagsIssued,
        total_kg: result.totalKg,
        cost_transferred: result.totalCostAllocated,
        remaining_stock: result.remainingFeedStock,
        destination: result.destinationName,
      },
    });
  } catch (error: any) {
    console.error("Internal Feed Issue POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to issue feed" },
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
      return NextResponse.json(
        { status: "fail", message: "Issue ID is required" },
        { status: 400 }
      );
    }

    const issue = await prisma.internal_feed_issues.findUnique({
      where: { id: BigInt(id) },
    });

    if (!issue) {
      return NextResponse.json(
        { status: "fail", message: "হস্তান্তর রেকর্ড পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore product quantity
      const prod = await tx.products.findUnique({ where: { id: issue.product_id } });
      if (prod) {
        const currentQty = parseFloat(prod.quantity || "0");
        const restoredQty = currentQty + Number(issue.bags);
        await tx.products.update({
          where: { id: issue.product_id },
          data: { quantity: restoredQty.toString() },
        });
      }

      // 2. If destination was fish batch, decrement accumulated_feed_cost
      if (issue.destination_type === "FISH_POND" && issue.destination_id) {
        await tx.fish_batches.updateMany({
          where: { id: issue.destination_id },
          data: {
            accumulated_feed_cost: { decrement: issue.total_cost },
          },
        });
      }

      // 3. Delete the issue record
      await tx.internal_feed_issues.delete({
        where: { id: BigInt(id) },
      });
    });

    return NextResponse.json({
      status: "success",
      message: "হস্তান্তর রেকর্ড সফলভাবে বাতিল ও ফিড স্টক ফেরত দেওয়া হয়েছে",
    });
  } catch (error: any) {
    console.error("Internal Feed Issue DELETE Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to delete issue record" },
      { status: 500 }
    );
  }
}

