import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const flocks = await prisma.poultry_flocks.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      status: "success",
      data: flocks.map((f) => ({
        id: Number(f.id),
        flock_code: f.flock_code,
        shed_name: f.shed_name,
        breed: f.breed,
        initial_chicks_count: f.initial_chicks_count,
        current_birds_count: f.current_birds_count,
        housing_date: f.housing_date.toISOString().split("T")[0],
        status: f.status,
        feed_consumed_kg: Number(f.feed_consumed_kg),
        total_expenses: Number(f.total_expenses),
        note: f.note,
      })),
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
    const { shed_name, breed, initial_chicks_count, housing_date, note } = body;

    if (!shed_name || !breed) {
      return NextResponse.json(
        { status: "fail", message: "শেডের নাম এবং জাত (Breed) প্রদান আবশ্যক" },
        { status: 400 }
      );
    }

    const count = Math.max(0, parseInt(initial_chicks_count) || 0);
    const d = new Date();
    const flockCode = `FLOCK-${d.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const flock = await prisma.poultry_flocks.create({
      data: {
        flock_code: flockCode,
        shed_name: shed_name.trim(),
        breed: breed.trim(),
        initial_chicks_count: count,
        current_birds_count: count,
        housing_date: housing_date ? new Date(housing_date) : new Date(),
        status: "ACTIVE",
        note: note ? note.trim() : null,
        user_id: authResult.user.id,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "নতুন ফ্লক সফলভাবে তৈরি হয়েছে",
      data: {
        id: Number(flock.id),
        flock_code: flock.flock_code,
        shed_name: flock.shed_name,
        breed: flock.breed,
        current_birds_count: flock.current_birds_count,
      },
    });
  } catch (error: any) {
    console.error("Flocks POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to create flock" },
      { status: 500 }
    );
  }
}
