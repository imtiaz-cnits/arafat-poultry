import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { recordInternalFeedIssue, getFeedStockAndProfitability } from "@/lib/feed-service";
import { recordActivity } from "@/lib/audit-service";

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

    try {
      await recordActivity({
        req,
        userId: authResult.user.id,
        action: "ISSUE",
        module: "Feed Management",
        entityId: result.issueCode,
        description: `Issued ${result.bagsIssued} bags of feed (${result.totalKg} kg, cost: ৳ ${result.totalCostAllocated.toLocaleString()}) to ${result.destinationName}`,
      });
    } catch {}

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

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) return authResult.errorResponse;

    const body = await req.json();
    const { id, product_id, destination_type, destination_id, destination_name, bags, bag_weight_kg, date, note } = body;
    if (!id) {
      return NextResponse.json({ status: "fail", message: "রেকর্ড আইডি আবশ্যক" }, { status: 400 });
    }

    const issueId = BigInt(id);
    const existing = await prisma.internal_feed_issues.findUnique({
      where: { id: issueId },
    });
    if (!existing) {
      return NextResponse.json({ status: "fail", message: "হস্তান্তর রেকর্ড পাওয়া যায়নি" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Revert previous stock deduction
      const oldProd = await tx.products.findUnique({ where: { id: existing.product_id } });
      if (oldProd) {
        const curQty = parseFloat(oldProd.quantity || "0");
        await tx.products.update({
          where: { id: existing.product_id },
          data: { quantity: (curQty + Number(existing.bags)).toString() },
        });
      }
      if (existing.destination_type === "FISH_POND" && existing.destination_id) {
        await tx.fish_batches.updateMany({
          where: { id: existing.destination_id },
          data: { accumulated_feed_cost: { decrement: existing.total_cost } },
        });
      }

      // 2. Apply new values
      const newProdId = product_id ? BigInt(product_id) : existing.product_id;
      const targetProd = await tx.products.findUnique({ where: { id: newProdId } });
      if (!targetProd) throw new Error("ফিড পণ্য পাওয়া যায়নি");

      const newBags = bags ? Number(bags) : Number(existing.bags);
      const bagWeight = bag_weight_kg ? Number(bag_weight_kg) : 50;
      const totalKg = newBags * bagWeight;
      const costPerBag = parseFloat(targetProd.cost_price || "0");
      const totalCost = newBags * costPerBag;

      const currentQty = parseFloat(targetProd.quantity || "0");
      if (currentQty < newBags) {
        throw new Error(`পর্যাপ্ত স্টক নেই! বর্তমান স্টক: ${currentQty} বস্তা`);
      }

      await tx.products.update({
        where: { id: newProdId },
        data: { quantity: (currentQty - newBags).toString() },
      });

      const destType = destination_type || existing.destination_type;
      const destId = destination_id ? BigInt(destination_id) : existing.destination_id;
      const destName = destination_name || existing.destination_name;

      if (destType === "FISH_POND" && destId) {
        await tx.fish_batches.updateMany({
          where: { id: destId },
          data: { accumulated_feed_cost: { increment: new Prisma.Decimal(totalCost.toFixed(2)) } },
        });
      }

      await tx.internal_feed_issues.update({
        where: { id: issueId },
        data: {
          product_id: newProdId,
          destination_type: destType,
          destination_id: destId,
          destination_name: destName,
          bags: new Prisma.Decimal(newBags.toFixed(2)),
          total_kg: new Prisma.Decimal(totalKg.toFixed(2)),
          unit_cost_per_kg: new Prisma.Decimal((bagWeight > 0 ? costPerBag / bagWeight : costPerBag).toFixed(2)),
          total_cost: new Prisma.Decimal(totalCost.toFixed(2)),
          date: date ? new Date(date) : existing.date,
          note: note !== undefined ? note : existing.note,
        },
      });
    });

    return NextResponse.json({
      status: "success",
      message: "খাবার প্রদানের রেকর্ড সফলভাবে আপডেট করা হয়েছে",
    });
  } catch (error: any) {
    console.error("Internal Feed Issue PUT Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "রেকর্ড আপডেট করতে ব্যর্থ হয়েছে" },
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

    try {
      await recordActivity({
        req,
        userId: authResult.user.id,
        action: "CANCEL",
        module: "Feed Management",
        entityId: String(id),
        description: `Cancelled internal feed issue #${id} and restored ${issue.bags} bags to stock`,
      });
    } catch {}

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


