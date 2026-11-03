import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  listPoultryFlocksWithMetrics,
  createPoultryFlock,
  recordFlockPurchase,
} from "@/lib/poultry-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const flocks = await listPoultryFlocksWithMetrics();

    return NextResponse.json({
      status: "success",
      data: flocks,
    });
  } catch (error: any) {
    console.error("Flocks GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load flocks" },
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
      shed_name,
      breed,
      initial_chicks_count,
      housing_date,
      supplier_id,
      unit_price,
      paid_amount,
      payment_method,
      note,
    } = body;

    if (!shed_name || !breed) {
      return NextResponse.json(
        { status: "fail", message: "শেডের নাম এবং জাত (Breed) প্রদান আবশ্যক" },
        { status: 400 }
      );
    }

    // If supplier_id is provided, execute full Flock Purchase flow
    if (supplier_id) {
      const result = await recordFlockPurchase({
        supplierId: supplier_id,
        shedName: shed_name,
        breed,
        birdCount: Number(initial_chicks_count || 0),
        unitPrice: Number(unit_price || 0),
        paidAmount: paid_amount ? Number(paid_amount) : 0,
        paymentMethod: payment_method || "Cash",
        housingDate: housing_date ? new Date(housing_date) : new Date(),
        note,
        userId: authResult.user.id,
      });

      return NextResponse.json({
        status: "success",
        message: "নতুন মুরগির ক্রয় ও শেড স্টক সফলভাবে সংরক্ষিত হয়েছে",
        data: result,
      });
    }

    // Otherwise, direct flock creation
    const result = await createPoultryFlock({
      shedName: shed_name,
      breed,
      initialChicksCount: Number(initial_chicks_count || 0),
      housingDate: housing_date ? new Date(housing_date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      message: "নতুন ফ্লক সফলভাবে তৈরি হয়েছে",
      data: result,
    });
  } catch (error: any) {
    console.error("Flocks POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to create flock" },
      { status: 500 }
    );
  }
}
