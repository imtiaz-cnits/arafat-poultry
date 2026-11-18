import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { recordActivity } from "@/lib/audit-service";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, logo, status } = body;

    const updated = await prisma.brands.update({
      where: { id: BigInt(id) },
      data: {
        name: name ? name.trim() : undefined,
        logo: logo !== undefined ? logo : undefined,
        status: status || undefined,
      },
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "UPDATE",
        module: "Brands",
        entityId: String(updated.id),
        description: `Updated brand "${updated.name}"`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Brand updated successfully",
      data: {
        ...updated,
        id: Number(updated.id),
        user_id: Number(updated.user_id),
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brandId = BigInt(id);

    const prodCount = await prisma.products.count({
      where: { brand_id: brandId },
    });

    if (prodCount > 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: `Cannot delete brand because it contains ${prodCount} product(s). Please reassign or remove the products first.`,
        },
        { status: 400 }
      );
    }

    const existingBrand = await prisma.brands.findUnique({
      where: { id: brandId },
      select: { id: true, name: true },
    });

    await prisma.brands.delete({
      where: { id: brandId },
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "DELETE",
        module: "Brands",
        entityId: String(brandId),
        description: `Deleted brand "${existingBrand?.name || brandId}"`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Brand deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
