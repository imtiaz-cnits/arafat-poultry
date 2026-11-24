import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const species = await prisma.fish_species.findMany({
      orderBy: { species_name: "asc" },
    });

    return NextResponse.json({
      status: "success",
      data: species.map((s) => ({
        id: Number(s.id),
        species_name: s.species_name,
        name_bn: s.species_name,
        scientific_name: s.scientific_name,
        default_culture_days: s.default_culture_days,
      })),
    });
  } catch (error: any) {
    console.error("Fish Species GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load fish species" },
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
    const { species_name, scientific_name, default_culture_days = 180 } = body;

    const trimmedName = String(species_name || "").trim();
    if (!trimmedName) {
      return NextResponse.json(
        { status: "fail", message: "মাছের প্রজাতির নাম প্রদান করুন" },
        { status: 400 }
      );
    }

    // Check if species already exists
    const existing = await prisma.fish_species.findFirst({
      where: { species_name: trimmedName },
    });

    if (existing) {
      return NextResponse.json({
        status: "success",
        message: "এই প্রজাতির মাছ ইতিমধ্যে তালিকায় রয়েছে",
        data: {
          id: Number(existing.id),
          species_name: existing.species_name,
          name_bn: existing.species_name,
          scientific_name: existing.scientific_name,
          default_culture_days: existing.default_culture_days,
        },
      });
    }

    const created = await prisma.fish_species.create({
      data: {
        species_name: trimmedName,
        scientific_name: scientific_name ? String(scientific_name).trim() : null,
        default_culture_days: Number(default_culture_days) || 180,
      },
    });

    await recordActivity({
      userId: authResult.user.id,
      action: "CREATE",
      module: "FISH",
      description: `New fish species added: ${trimmedName}`,
      req,
    });

    return NextResponse.json({
      status: "success",
      message: "মাছের প্রজাতি সফলভাবে যুক্ত হয়েছে!",
      data: {
        id: Number(created.id),
        species_name: created.species_name,
        name_bn: created.species_name,
        scientific_name: created.scientific_name,
        default_culture_days: created.default_culture_days,
      },
    });
  } catch (error: any) {
    console.error("Fish Species POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "মাছের প্রজাতি যুক্ত করতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}
