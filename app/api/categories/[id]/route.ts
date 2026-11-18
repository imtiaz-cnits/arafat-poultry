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
    const { category_name, img_url, status } = body;

    const updated = await prisma.categories.update({
      where: { id: BigInt(id) },
      data: {
        category_name: category_name ? category_name.trim() : undefined,
        img_url: img_url !== undefined ? img_url : undefined,
        status: status || undefined,
      },
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "UPDATE",
        module: "Categories",
        entityId: String(updated.id),
        description: `Updated category "${updated.category_name}"`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Category updated successfully",
      data: {
        ...updated,
        id: Number(updated.id),
        user_id: Number(updated.user_id),
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to update category" },
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
    const catId = BigInt(id);

    const prodCount = await prisma.products.count({
      where: { category_id: catId },
    });

    if (prodCount > 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: `Cannot delete category because it contains ${prodCount} product(s). Please reassign or remove the products first.`,
        },
        { status: 400 }
      );
    }

    const existingCat = await prisma.categories.findUnique({
      where: { id: catId },
      select: { id: true, category_name: true },
    });

    await prisma.categories.delete({
      where: { id: catId },
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "DELETE",
        module: "Categories",
        entityId: String(catId),
        description: `Deleted category "${existingCat?.category_name || catId}"`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
