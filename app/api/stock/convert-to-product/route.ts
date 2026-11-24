import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const fallbackUser = await prisma.users.findFirst({ select: { id: true } });
    const userId = user?.id ? BigInt(user.id) : (fallbackUser ? fallbackUser.id : BigInt(1));

    const body = await req.json();
    const {
      type, // "EGG" | "CHICKEN" | "FISH"
      source_id,
      product_name,
      quantity,
      unit, // "Pcs" | "Hali" | "Khacha" | "Kg" | "Gram"
      sell_price,
      cost_price,
    } = body;

    const qtyNum = parseFloat(quantity);
    if (!product_name || isNaN(qtyNum) || qtyNum <= 0) {
      return NextResponse.json(
        { status: "fail", message: "সঠিক পণ্যের নাম ও পরিমাণ প্রদান করুন" },
        { status: 400 }
      );
    }

    const sellPriceNum = parseFloat(sell_price) || 0;
    const costPriceNum = parseFloat(cost_price) || 0;

    // Run within a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct stock from source based on type
      if (type === "EGG") {
        let piecesToDeduct = qtyNum;
        if (unit === "Hali") {
          piecesToDeduct = qtyNum * 4;
        } else if (unit === "Khacha" || unit === "Tray") {
          piecesToDeduct = qtyNum * 30;
        }

        if (source_id) {
          const col = await tx.egg_collections.findUnique({
            where: { id: BigInt(source_id) },
          });
          if (col) {
            const currentAccepted = col.accepted_quantity || 0;
            const newAccepted = Math.max(0, currentAccepted - Math.round(piecesToDeduct));
            await tx.egg_collections.update({
              where: { id: col.id },
              data: { accepted_quantity: newAccepted },
            });
          }
        }
      } else if (type === "CHICKEN") {
        if (source_id) {
          const flock = await tx.poultry_flocks.findUnique({
            where: { id: BigInt(source_id) },
          });
          if (flock) {
            const birdsToDeduct = unit === "Kg" ? Math.max(1, Math.round(qtyNum / 1.5)) : Math.round(qtyNum);
            const currentBirds = flock.current_birds_count || 0;
            const newBirds = Math.max(0, currentBirds - birdsToDeduct);
            await tx.poultry_flocks.update({
              where: { id: flock.id },
              data: { current_birds_count: newBirds },
            });
          }
        }
      } else if (type === "FISH") {
        if (source_id) {
          const batch = await tx.fish_batches.findUnique({
            where: { id: BigInt(source_id) },
          });
          if (batch) {
            let kgToDeduct = qtyNum;
            if (unit === "Gram") {
              kgToDeduct = qtyNum / 1000;
            } else if (unit === "Pcs") {
              const avgG = Number(batch.latest_avg_weight_g || 500);
              kgToDeduct = (qtyNum * avgG) / 1000;
            }

            const currentBiomass = Number(batch.estimated_biomass_kg || 0);
            const newBiomass = Math.max(0, currentBiomass - kgToDeduct);

            // Deduct fish count proportionally
            const fishCountToDeduct =
              currentBiomass > 0
                ? Math.round((kgToDeduct / currentBiomass) * (batch.current_fish_count || 0))
                : Math.round(qtyNum);
            const newCount = Math.max(0, (batch.current_fish_count || 0) - fishCountToDeduct);

            await tx.fish_batches.update({
              where: { id: batch.id },
              data: {
                estimated_biomass_kg: new Prisma.Decimal(newBiomass.toFixed(2)),
                current_fish_count: newCount,
              },
            });
          }
        }
      }

      // 2. Determine target Category & Unit
      let targetCategoryId: bigint = BigInt(2); // Egg
      if (type === "CHICKEN") targetCategoryId = BigInt(4);
      else if (type === "FISH") targetCategoryId = BigInt(3);

      let targetUnitId: bigint = BigInt(3); // Pcs
      if (unit === "Kg" || unit === "Gram") targetUnitId = BigInt(2);
      else if (unit === "Hali") targetUnitId = BigInt(4);
      else if (unit === "Khacha" || unit === "Tray") targetUnitId = BigInt(5);

      const firstBrand = await tx.brands.findFirst();
      const brandId = firstBrand ? firstBrand.id : BigInt(1);

      // Quantity to add to commercial product (if Gram, convert to Kg)
      const addedCommercialQty = unit === "Gram" ? qtyNum / 1000 : qtyNum;

      // 3. Find or Create Product in commercial inventory
      const existingProduct = await tx.products.findFirst({
        where: {
          product_name: { equals: product_name.trim() },
        },
      });

      let productRecord;
      let finalStock = addedCommercialQty;
      if (existingProduct) {
        const currentQty = parseFloat(existingProduct.quantity || "0");
        finalStock = currentQty + addedCommercialQty;
        productRecord = await tx.products.update({
          where: { id: existingProduct.id },
          data: {
            quantity: String(finalStock),
            sell_price: String(sellPriceNum > 0 ? sellPriceNum : existingProduct.sell_price),
            cost_price: String(costPriceNum > 0 ? costPriceNum : existingProduct.cost_price),
            status: "active",
            updated_at: new Date(),
          },
        });
      } else {
        const codeSuffix = Math.floor(1000 + Math.random() * 9000);
        const prefix = type === "EGG" ? "EGG" : type === "CHICKEN" ? "CHK" : "FSH";
        const generatedCode = [`PRD-${prefix}-${codeSuffix}`];

        productRecord = await tx.products.create({
          data: {
            product_name: product_name.trim(),
            product_code: generatedCode,
            quantity: String(addedCommercialQty),
            cost_price: String(costPriceNum),
            sell_price: String(sellPriceNum),
            status: "active",
            category_id: targetCategoryId,
            unit_id: targetUnitId,
            brand_id: brandId,
            user_id: userId,
          },
        });
      }

      // 4. Record Stock Movement
      const buCode = type === "EGG" || type === "CHICKEN" ? "POULTRY" : "FISH";
      const bu = await tx.business_units.findUnique({ where: { code: buCode } });

      await tx.stock_movements.create({
        data: {
          product_id: productRecord.id,
          business_unit_id: bu ? bu.id : null,
          movement_type: "STOCK_CONVERSION_INWARD",
          quantity: new Prisma.Decimal(addedCommercialQty.toFixed(2)),
          unit_price: new Prisma.Decimal(costPriceNum.toFixed(2)),
          total_value: new Prisma.Decimal((addedCommercialQty * costPriceNum).toFixed(2)),
          stock_after: new Prisma.Decimal(finalStock.toFixed(2)),
          reference_type: "STOCK_TO_PRODUCT_CONVERSION",
          reference_no: `CNV-${Date.now()}`,
          date: new Date(),
          note: `খামার স্টক হতে বিক্রয়যোগ্য পণ্যে রূপান্তর: ${qtyNum} ${unit} (${product_name})`,
          user_id: userId,
        },
      });

      return productRecord;
    });

    return NextResponse.json({
      status: "success",
      message: `${product_name} সফলভাবে বিক্রয়যোগ্য পণ্যে যুক্ত করা হয়েছে এবং স্টক থেকে সমন্বয় করা হয়েছে!`,
      data: {
        product_id: Number(result.id),
        product_name: result.product_name,
        total_quantity: result.quantity,
      },
    });
  } catch (error: any) {
    console.error("Stock Convert to Product Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "পণ্য হিসেবে যুক্ত করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
