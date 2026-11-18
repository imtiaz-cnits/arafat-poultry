import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unit = await prisma.units.findUnique({
      where: { id: BigInt(id) },
    });

    if (!unit) {
      return NextResponse.json({ status: "fail", message: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: {
        ...unit,
        id: Number(unit.id),
        user_id: Number(unit.user_id),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "fail", message: error?.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { unit_name, status } = body;

    if (!unit_name || unit_name.trim() === "") {
      return NextResponse.json(
        { status: "fail", message: "Unit name is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.units.update({
      where: { id: BigInt(id) },
      data: {
        unit_name: unit_name.trim(),
        status: status || undefined,
      },
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "UPDATE",
        module: "Units",
        entityId: String(updated.id),
        description: `Updated unit "${updated.unit_name}"`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Unit updated successfully",
      data: {
        ...updated,
        id: Number(updated.id),
        user_id: Number(updated.user_id),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "fail", message: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unitId = BigInt(id);

    // Safeguard: Check if any products reference this unit
    const productCount = await prisma.products.count({
      where: { unit_id: unitId },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: `Cannot delete unit because it is linked to ${productCount} product(s).`,
        },
        { status: 400 }
      );
    }

    const existingUnit = await prisma.units.findUnique({
      where: { id: unitId },
      select: { id: true, unit_name: true },
    });

    await prisma.units.delete({
      where: { id: unitId },
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "DELETE",
        module: "Units",
        entityId: String(unitId),
        description: `Deleted unit "${existingUnit?.unit_name || unitId}"`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Unit deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ status: "fail", message: error?.message }, { status: 500 });
  }
}
