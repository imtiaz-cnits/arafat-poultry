import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { recordStockMovement, StockMovementType } from "@/lib/stock-service";
import { convertEggUnits, convertFeedBagsToKg } from "@/lib/unit-service";

export const dynamic = "force-dynamic";

// GET: Inventory Analytics and Stock List
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const filter = searchParams.get("filter"); // 'all', 'low', 'out'
    const categoryId = searchParams.get("category_id");

    const where: any = {};
    if (categoryId && categoryId !== "all") where.category_id = BigInt(categoryId);

    const products = await prisma.products.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        categories: true,
        brands: true,
        units: true,
      },
    });

    let totalStockUnits = 0;
    let totalCostValuation = 0;
    let totalRetailValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const pendingChallanItems = await prisma.order_details.findMany({
      where: { stock_lifecycle_state: "PENDING_CHALLAN" },
      select: { product_id: true, quantity: true },
    });
    const reservedMap = new Map<string, number>();
    for (const item of pendingChallanItems) {
      const pid = item.product_id.toString();
      const q = parseFloat(item.quantity || "0");
      reservedMap.set(pid, (reservedMap.get(pid) || 0) + q);
    }

    const formatted = products.map((p) => {
      const qty = parseFloat(p.quantity || "0");
      const cost = parseFloat(p.cost_price || "0");
      const sell = parseFloat(p.sell_price || "0");
      const totalCost = qty * cost;
      const totalRetail = qty * sell;
      const reservedQty = reservedMap.get(p.id.toString()) || 0;
      const availableQty = Math.max(0, qty - reservedQty);

      totalStockUnits += qty;
      totalCostValuation += totalCost;
      totalRetailValuation += totalRetail;

      if (availableQty <= 0) {
        outOfStockCount++;
      } else if (availableQty <= 10) {
        lowStockCount++;
      }

      let codes: string[] = [];
      if (p.product_code) {
        try {
          codes = Array.isArray(p.product_code)
            ? p.product_code
            : JSON.parse(String(p.product_code));
        } catch {
          codes = [String(p.product_code)];
        }
      }

      const catName = p.categories?.category_name || "";
      const catLower = catName.toLowerCase();
      const isEgg = catLower.includes("egg") || catName.includes("ডিম");
      const isFeed = catLower.includes("feed") || catName.includes("ফিড");
      const isFish = catLower.includes("fish") || catLower.includes("aqua") || catName.includes("মাছ");

      let unitBreakdown: any = null;
      if (isEgg) {
        const eggUnits = convertEggUnits(qty, "piece", 30);
        unitBreakdown = {
          type: "EGG",
          trays: eggUnits.trays,
          dozens: eggUnits.dozens,
          halis: eggUnits.halis,
          pieces: eggUnits.pieces,
          formatted: `${eggUnits.trays} খাঁচি (${eggUnits.pieces} পিস)`,
        };
      } else if (isFeed) {
        const totalKg = convertFeedBagsToKg(qty, 50);
        unitBreakdown = {
          type: "FEED",
          bags: qty,
          total_kg: totalKg,
          formatted: `${qty} বস্তা (${totalKg.toLocaleString()} কেজি)`,
        };
      } else if (isFish) {
        unitBreakdown = {
          type: "FISH",
          total_kg: qty,
          formatted: `${qty.toLocaleString()} কেজি`,
        };
      }

      return {
        id: Number(p.id),
        name: p.product_name,
        primary_code: codes[0] || "",
        category: p.categories?.category_name || "N/A",
        category_id: p.category_id ? Number(p.category_id) : null,
        brand: p.brands?.name || "N/A",
        unit: p.units?.unit_name || "Pcs",
        quantity: qty,
        reserved_quantity: reservedQty,
        available_quantity: availableQty,
        cost_price: cost,
        sell_price: sell,
        total_cost_value: totalCost,
        total_retail_value: totalRetail,
        unit_breakdown: unitBreakdown,
        stock_status: availableQty <= 0 ? "Out of Stock" : availableQty <= 10 ? "Low Stock" : "In Stock",
      };
    });

    let filteredList = formatted;
    if (filter === "low") {
      filteredList = filteredList.filter((p) => p.available_quantity > 0 && p.available_quantity <= 10);
    } else if (filter === "out") {
      filteredList = filteredList.filter((p) => p.available_quantity <= 0);
    }

    if (search) {
      filteredList = filteredList.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.primary_code.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      status: "success",
      summary: {
        total_products: products.length,
        total_stock_units: totalStockUnits,
        total_cost_valuation: totalCostValuation,
        total_retail_valuation: totalRetailValuation,
        potential_profit: Math.max(0, totalRetailValuation - totalCostValuation),
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
      },
      data: filteredList,
    });
  } catch (error: any) {
    console.error("Inventory GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load inventory" },
      { status: 500 }
    );
  }
}

// POST: Manual Stock Adjustment (recount / damage / adjustment)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const fallbackUser = await prisma.users.findFirst({ select: { id: true } });
    const userId = user?.id || (fallbackUser ? Number(fallbackUser.id) : 1);

    const body = await req.json();
    const { product_id, new_quantity, reason } = body;

    if (!product_id || new_quantity === undefined) {
      return NextResponse.json(
        { status: "fail", message: "Product and new quantity are required" },
        { status: 400 }
      );
    }

    const prodId = BigInt(product_id);
    const targetQty = parseFloat(String(new_quantity));
    if (isNaN(targetQty) || targetQty < 0) {
      return NextResponse.json(
        { status: "fail", message: "Quantity must be a non-negative number" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current product
      const product = await tx.products.findUnique({
        where: { id: prodId },
        select: { id: true, product_name: true, quantity: true, cost_price: true, sell_price: true },
      });

      if (!product) {
        throw new Error(`Product #${product_id} not found`);
      }

      const currentQty = parseFloat(product.quantity || "0");
      const delta = targetQty - currentQty;

      if (delta === 0) {
        return { product, delta: 0, newQty: currentQty };
      }

      const isDamage =
        reason &&
        (reason.toLowerCase().includes("damage") ||
          reason.toLowerCase().includes("broken") ||
          reason.toLowerCase().includes("loss") ||
          reason.toLowerCase().includes("নষ্ট") ||
          reason.toLowerCase().includes("ভাঙা") ||
          reason.toLowerCase().includes("অপচয়"));

      const movementType: StockMovementType =
        delta < 0
          ? isDamage
            ? "DAMAGE_LOSS"
            : "ADJUSTMENT"
          : "ADJUSTMENT";

      await recordStockMovement(
        {
          productId: prodId,
          movementType,
          quantity: Math.abs(delta),
          unitPrice: parseFloat(product.cost_price || product.sell_price || "0"),
          referenceType: "ADJUSTMENT",
          referenceId: null,
          referenceNo: `ADJ-${Date.now().toString().slice(-6)}`,
          date: new Date(),
          note: reason || `Manual Stock Adjustment: ${currentQty} -> ${targetQty}`,
          userId,
          allowNegativeStock: false,
        },
        tx
      );

      return { product, delta, newQty: targetQty };
    });

    return NextResponse.json({
      status: "success",
      message: `Stock updated for ${result.product.product_name} (${reason || "Physical Adjustment"})`,
      new_quantity: result.newQty,
      delta: result.delta,
    });
  } catch (error: any) {
    console.error("Stock Adjustment Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Stock adjustment failed" },
      { status: 500 }
    );
  }
}
