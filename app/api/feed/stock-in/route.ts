import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recordStockMovement } from "@/lib/stock-service";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const {
      product_id,
      unit,
      amount,
      bag_weight_kg = 50,
      cost_price_per_bag,
      cost_price,
      date,
      note,
    } = body;

    const prodId = Number(product_id);
    const rawAmount = parseFloat(amount);
    const bagWeight = parseFloat(bag_weight_kg) || 50;

    if (!prodId || isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { status: "fail", message: "সঠিক পণ্য এবং স্টক পরিমাণ আবশ্যক" },
        { status: 400 }
      );
    }

    // Unit conversion: support bosta (bag), kg, gram
    let bags = 0;
    let totalKg = 0;
    const unitLower = String(unit || "bag").toLowerCase();

    if (unitLower === "kg" || unitLower === "কেজি") {
      totalKg = rawAmount;
      bags = bagWeight > 0 ? totalKg / bagWeight : totalKg;
    } else if (unitLower === "gram" || unitLower === "গ্রাম" || unitLower === "gm") {
      totalKg = rawAmount / 1000;
      bags = bagWeight > 0 ? totalKg / bagWeight : totalKg;
    } else {
      // Default: bag (বস্তা)
      bags = rawAmount;
      totalKg = bags * bagWeight;
    }

    const costPerBag = parseFloat(cost_price_per_bag ?? cost_price) || 0;
    const movementDate = date ? new Date(date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({
        where: { id: BigInt(prodId) },
        include: { feed_products: true },
      });

      if (!product) {
        throw new Error("ফিড পণ্যটি খুঁজে পাওয়া যায়নি");
      }

      const feedBu = await tx.business_units.findUnique({ where: { code: "FEED" } });

      const unitDisplay =
        unitLower === "kg" || unitLower === "কেজি"
          ? `${rawAmount} কেজি`
          : unitLower === "gram" || unitLower === "গ্রাম" || unitLower === "gm"
          ? `${rawAmount} গ্রাম`
          : `${rawAmount} বস্তা`;

      const stockMovement = await recordStockMovement(
        {
          productId: BigInt(prodId),
          businessUnitId: feedBu?.id,
          movementType: "PURCHASE_INWARD",
          quantity: bags,
          unitPrice: costPerBag,
          referenceType: "PURCHASE",
          referenceNo: `STK-FEED-${Date.now()}`,
          date: movementDate,
          note: note
            ? `${note} | ইনপুট: ${unitDisplay} (${totalKg.toFixed(2)} কেজি / ${bags.toFixed(2)} বস্তা)`
            : `ফিড স্টক ইন: ${unitDisplay} (${totalKg.toFixed(2)} কেজি / ${bags.toFixed(2)} বস্তা)`,
          userId: authResult.user.id,
        },
        tx
      );

      // Optionally update product cost price if specified
      if (costPerBag > 0) {
        await tx.products.update({
          where: { id: BigInt(prodId) },
          data: {
            cost_price: costPerBag.toFixed(2),
          },
        });
      }

      return {
        product_name: product.product_name,
        added_bags: bags,
        total_kg: totalKg,
        new_quantity: stockMovement.newStock,
      };
    });

    await recordActivity({
      userId: authResult.user.id,
      action: "CREATE",
      module: "FEED",
      description: `Feed stock added: ${result.product_name} (${bags.toFixed(2)} bags / ${totalKg.toFixed(2)} kg)`,
      req,
    });

    return NextResponse.json({
      status: "success",
      message: "ফিড স্টক সফলভাবে যুক্ত হয়েছে!",
      data: result,
    });
  } catch (error: any) {
    console.error("Feed Stock In Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "ফিড স্টক যোগ করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
