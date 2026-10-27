import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createFishBatch } from "@/lib/fish-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const batches = await prisma.fish_batches.findMany({
      orderBy: { id: "desc" },
      include: {
        fish_ponds: true,
        fish_species: true,
        products: true,
      },
    });

    return NextResponse.json({
      status: "success",
      data: batches.map((b) => ({
        id: Number(b.id),
        batch_no: b.batch_no,
        pond_id: Number(b.pond_id),
        pond_name: b.fish_ponds.pond_name,
        species_id: Number(b.species_id),
        species_name: b.fish_species.species_name,
        product_id: b.product_id ? Number(b.product_id) : null,
        product_name: b.products?.product_name || null,
        stocking_date: b.stocking_date.toISOString().split("T")[0],
        fingerling_count: b.fingerling_count,
        fingerling_unit_cost: Number(b.fingerling_unit_cost),
        fingerling_total_cost: Number(b.fingerling_total_cost),
        current_fish_count: b.current_fish_count,
        total_mortality_count: b.total_mortality_count,
        latest_avg_weight_g: Number(b.latest_avg_weight_g),
        estimated_biomass_kg: Number(b.estimated_biomass_kg),
        accumulated_feed_cost: Number(b.accumulated_feed_cost),
        accumulated_other_expenses: Number(b.accumulated_other_expenses),
        total_production_cost:
          Number(b.fingerling_total_cost) +
          Number(b.accumulated_feed_cost) +
          Number(b.accumulated_other_expenses),
        total_harvested_count: b.total_harvested_count,
        total_harvested_kg: Number(b.total_harvested_kg),
        total_harvested_cost: Number(b.total_harvested_cost),
        status: b.status,
        note: b.note,
      })),
    });
  } catch (error: any) {
    console.error("Fish Batches GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load fish batches" },
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
      pond_id,
      species_id,
      product_id,
      fingerling_count,
      fingerling_unit_cost,
      stocking_date,
      note,
    } = body;

    if (!pond_id || !species_id || !fingerling_count || Number(fingerling_count) <= 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: "পুকুর, প্রজাতি এবং সঠিক পোনার সংখ্যা প্রদান করা আবশ্যক",
        },
        { status: 400 }
      );
    }

    const result = await createFishBatch({
      pondId: pond_id,
      speciesId: species_id,
      productId: product_id || null,
      fingerlingCount: Number(fingerling_count),
      fingerlingUnitCost: Number(fingerling_unit_cost || 0),
      stockingDate: stocking_date ? new Date(stocking_date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: {
        ...result,
        batchId: Number(result.batchId),
      },
      message: "মাছের নতুন ব্যাচ সফলভাবে যুক্ত করা হয়েছে",
    });
  } catch (error: any) {
    console.error("Fish Batches POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to create fish batch" },
      { status: 500 }
    );
  }
}
