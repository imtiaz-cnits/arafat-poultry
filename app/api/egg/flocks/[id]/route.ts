import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getFlockDetailsWithAnalytics } from "@/lib/poultry-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const flockId = BigInt(id);

    const flock = await getFlockDetailsWithAnalytics(flockId);
    if (!flock) {
      return NextResponse.json(
        { status: "fail", message: "ফ্লক পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: flock,
    });
  } catch (error: any) {
    console.error("Flock Detail GET Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load flock details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) return authResult.errorResponse;

    const { id } = await params;
    const flockId = BigInt(id);
    const body = await req.json();
    const {
      shed_name,
      breed,
      current_birds,
      initial_chicks_count,
      housing_date,
      status,
      note,
    } = body;

    const existing = await prisma.poultry_flocks.findUnique({
      where: { id: flockId },
    });
    if (!existing) {
      return NextResponse.json({ status: "fail", message: "ফ্লক পাওয়া যায়নি" }, { status: 404 });
    }

    let nextCurrentBirds = existing.current_birds_count;
    if (current_birds !== undefined) {
      nextCurrentBirds = Math.max(0, Number(current_birds));
    } else if (initial_chicks_count !== undefined) {
      const delta = Number(initial_chicks_count) - existing.initial_chicks_count;
      nextCurrentBirds = Math.max(0, existing.current_birds_count + delta);
    }

    const updated = await prisma.poultry_flocks.update({
      where: { id: flockId },
      data: {
        shed_name: shed_name ?? existing.shed_name,
        breed: breed ?? existing.breed,
        current_birds_count: nextCurrentBirds,
        initial_chicks_count:
          initial_chicks_count !== undefined
            ? Math.max(0, Number(initial_chicks_count))
            : existing.initial_chicks_count,
        housing_date: housing_date ? new Date(housing_date) : existing.housing_date,
        status: status ?? existing.status,
        note: note !== undefined ? note : existing.note,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "মুরগির শেড সফলভাবে আপডেট করা হয়েছে",
      data: {
        ...updated,
        id: Number(updated.id),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "fail", message: error?.message || "আপডেট করা যায়নি" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) return authResult.errorResponse;

    const { id } = await params;
    const flockId = BigInt(id);

    const flock = await prisma.poultry_flocks.findUnique({
      where: { id: flockId },
      include: { egg_collections: true },
    });

    if (!flock) {
      return NextResponse.json({ status: "fail", message: "ফ্লক পাওয়া যায়নি" }, { status: 404 });
    }

    if (flock.egg_collections && flock.egg_collections.length > 0) {
      return NextResponse.json({
        status: "fail",
        message: "এই শেড/ফ্লকে ডিম সংগ্রহের রেকর্ড বিদ্যমান থাকায় মুছে ফেলা সম্ভব নয়!",
      }, { status: 400 });
    }

    await prisma.poultry_flocks.delete({ where: { id: flockId } });

    return NextResponse.json({
      status: "success",
      message: "মুরগির শেড/ফ্লক সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    return NextResponse.json({ status: "fail", message: error?.message || "মুছে ফেলা যায়নি" }, { status: 500 });
  }
}

