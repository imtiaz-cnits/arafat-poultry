import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

// Helper: parse product_code safely into array of strings
function parseCodes(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.map(String) : [String(raw)];
  } catch {
    return [String(raw)];
  }
}

// GET: Product List with eager loading & newest first (Rule 4.1)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const categoryId = searchParams.get("category_id");
    const brandId = searchParams.get("brand_id");
    const limitParam = searchParams.get("limit");
    const limit = limitParam && limitParam !== "all" && !isNaN(Number(limitParam)) ? Number(limitParam) : undefined;

    const where: any = {
      status: { not: "deleted" },
    };
    if (categoryId) where.category_id = BigInt(categoryId);
    if (brandId) where.brand_id = BigInt(brandId);

    const products = await prisma.products.findMany({
      where,
      ...(limit ? { take: limit } : {}),
      orderBy: { id: "desc" }, // Strict Rule: Latest records on top
      include: {
        categories: true,
        brands: true,
        units: true,
        sub_categories: true,
      },
    });

    let formatted = products.map((p) => {
      const codes = parseCodes(p.product_code);
      const primaryCode = codes.length > 0 ? codes[0] : "";
      const displayCodes = codes.join(", ");

      let displayName = p.product_name;

      return {
        id: Number(p.id),
        name: displayName,
        product_name: p.product_name,
        primary_code: primaryCode,
        display_codes: displayCodes,
        all_codes: codes,
        cost_price: parseFloat(p.cost_price || "0"),
        sell_price: parseFloat(p.sell_price || "0"),
        quantity: parseFloat(p.quantity || "0"),
        tile_size: p.tile_size || null,
        sqft_per_box: p.sqft_per_box ? parseFloat(p.sqft_per_box) : null,
        pcs_per_box: p.pcs_per_box ? parseInt(p.pcs_per_box) : null,
        grade: p.grade || null,
        surface_finish: p.surface_finish || null,
        door_side: p.door_side || null,
        status: p.status,
        img_url: p.img_url,
        brand_id: Number(p.brand_id),
        category_id: Number(p.category_id),
        unit_id: p.unit_id ? Number(p.unit_id) : null,
        sub_category_id: p.sub_category_id ? Number(p.sub_category_id) : null,
        category: p.categories?.category_name || "N/A",
        brand: p.brands?.name || "N/A",
        unit: p.units?.unit_name || "Pcs",
        created_at: p.created_at,
      };
    });

    // Client-side text filter if search parameter passed
    if (search) {
      formatted = formatted.filter((p) => {
        return (
          p.product_name.toLowerCase().includes(search) ||
          p.display_codes.toLowerCase().includes(search) ||
          (p.brand && p.brand.toLowerCase().includes(search)) ||
          (p.category && p.category.toLowerCase().includes(search)) ||
          (p.tile_size && p.tile_size.toLowerCase().includes(search)) ||
          String(p.id) === search
        );
      });
    }

    return NextResponse.json({
      status: "success",
      data: formatted,
    });
  } catch (error: any) {
    console.error("Products GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load products" },
      { status: 500 }
    );
  }
}

// POST: Create Product with multi-barcode
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const fallbackUser = await prisma.users.findFirst({ select: { id: true } });
    const userId = user?.id || (fallbackUser ? Number(fallbackUser.id) : 7);

    const body = await req.json();
    const {
      product_name,
      product_code,
      cost_price,
      sell_price,
      quantity,
      tile_size,
      sqft_per_box,
      pcs_per_box,
      grade,
      surface_finish,
      door_side,
      brand_id,
      category_id,
      sub_category_id,
      unit_id,
      img_url,
      status,
    } = body;

    if (!product_name) {
      return NextResponse.json(
        { status: "fail", message: "পণ্যের নাম আবশ্যক" },
        { status: 400 }
      );
    }

    // Robust verification and fallback for brand_id and category_id
    let finalBrandId = brand_id ? BigInt(brand_id) : null;
    let finalCategoryId = category_id ? BigInt(category_id) : null;
    let finalUnitId = unit_id ? BigInt(unit_id) : null;

    if (finalBrandId) {
      const bExists = await prisma.brands.findUnique({ where: { id: finalBrandId } });
      if (!bExists) {
        const firstB = await prisma.brands.findFirst();
        finalBrandId = firstB ? firstB.id : null;
      }
    } else {
      const firstB = await prisma.brands.findFirst();
      finalBrandId = firstB ? firstB.id : null;
    }

    if (finalCategoryId) {
      const cExists = await prisma.categories.findUnique({ where: { id: finalCategoryId } });
      if (!cExists) {
        const firstC = await prisma.categories.findFirst();
        finalCategoryId = firstC ? firstC.id : null;
      }
    } else {
      const firstC = await prisma.categories.findFirst();
      finalCategoryId = firstC ? firstC.id : null;
    }

    if (finalUnitId) {
      const uExists = await prisma.units.findUnique({ where: { id: finalUnitId } });
      if (!uExists) {
        const firstU = await prisma.units.findFirst();
        finalUnitId = firstU ? firstU.id : null;
      }
    }

    if (!finalBrandId || !finalCategoryId) {
      return NextResponse.json(
        { status: "fail", message: "ব্র্যান্ড ও ক্যাটাগরি আবশ্যক" },
        { status: 400 }
      );
    }

    // Auto-generate barcode if not provided
    let finalCodes: string[] = [];
    if (Array.isArray(product_code) && product_code.length > 0) {
      finalCodes = product_code;
    } else if (typeof product_code === "string" && product_code.trim()) {
      finalCodes = [product_code.trim()];
    } else {
      const maxProduct = await prisma.products.findFirst({
        orderBy: { id: "desc" },
        select: { id: true },
      });
      const nextId = (maxProduct ? Number(maxProduct.id) : 0) + 1;
      finalCodes = [`PRD-${String(nextId).padStart(4, "0")}`];
    }

    const newProduct = await prisma.products.create({
      data: {
        product_name: product_name.trim(),
        product_code: finalCodes as any, // stored as json array
        cost_price: String(cost_price || "0"),
        sell_price: String(sell_price || "0"),
        quantity: String(quantity || "0"),
        tile_size: tile_size ? String(tile_size).trim() : null,
        sqft_per_box: sqft_per_box ? String(sqft_per_box).trim() : null,
        pcs_per_box: pcs_per_box ? String(pcs_per_box).trim() : null,
        grade: grade ? String(grade).trim() : null,
        surface_finish: surface_finish ? String(surface_finish).trim() : null,
        door_side: door_side ? String(door_side).trim() : null,
        brand_id: finalBrandId,
        category_id: finalCategoryId,
        sub_category_id: sub_category_id ? BigInt(sub_category_id) : null,
        unit_id: finalUnitId,
        img_url: img_url || null,
        status: status || "active",
        user_id: BigInt(userId),
      },
    });

    try {
      await recordActivity({
        req,
        userId,
        action: "CREATE",
        module: "Products",
        entityId: String(newProduct.id),
        description: `Created product "${product_name.trim()}" (Code: ${finalCodes[0]}, Stock: ${quantity || 0}, Buy: ৳ ${cost_price || 0}, Sell: ৳ ${sell_price || 0})`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Product created successfully",
      data: {
        ...newProduct,
        id: Number(newProduct.id),
        brand_id: Number(newProduct.brand_id),
        category_id: Number(newProduct.category_id),
        sub_category_id: newProduct.sub_category_id ? Number(newProduct.sub_category_id) : null,
        unit_id: newProduct.unit_id ? Number(newProduct.unit_id) : null,
        user_id: Number(newProduct.user_id),
      },
    });

  } catch (error: any) {
    console.error("Product Create Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
