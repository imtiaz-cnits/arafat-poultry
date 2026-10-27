import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createPond } from "@/lib/fish-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const ponds = await prisma.fish_ponds.findMany({
      orderBy: { id: "desc" },
      include: {
        fish_batches: {
          where: { status: { in: ["ACTIVE", "PARTIALLY_HARVESTED"] } },
          include: { fish_species: true },
        },
      },
    });

    return NextResponse.json({
      status: "success",
      data: ponds.map((p) => ({
        id: Number(p.id),
        pond_code: p.pond_code,
        pond_name: p.pond_name,
        location: p.location,
        area_decimal: Number(p.area_decimal),
        water_depth_feet: Number(p.water_depth_feet),
        status: p.status,
        note: p.note,
        active_batches: p.fish_batches.map((b) => ({
          id: Number(b.id),
          batch_no: b.batch_no,
          species_name: b.fish_species.species_name,
          current_fish_count: b.current_fish_count,
          estimated_biomass_kg: Number(b.estimated_biomass_kg),
        })),
      })),
    });
  } catch (error: any) {
    console.error("Fish Ponds GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load fish ponds" },
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
    const { pond_code, pond_name, location, area_decimal, water_depth_feet, note } = body;

    if (!pond_code || !pond_name) {
      return NextResponse.json(
        { status: "fail", message: "পুকুর কোড ও নাম প্রদান করা আবশ্যক (Pond code and name are required)" },
        { status: 400 }
      );
    }

    const pond = await createPond({
      pondCode: pond_code,
      pondName: pond_name,
      location,
      areaDecimal: area_decimal ? Number(area_decimal) : 0,
      waterDepthFeet: water_depth_feet ? Number(water_depth_feet) : 5,
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: {
        id: Number(pond.id),
        pond_code: pond.pond_code,
        pond_name: pond.pond_name,
      },
      message: "পুকুর সফলভাবে তৈরি করা হয়েছে",
    });
  } catch (error: any) {
    console.error("Fish Ponds POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to create pond" },
      { status: 500 }
    );
  }
}
