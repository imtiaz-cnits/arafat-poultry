import { getAuthUser, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  isAdminRole,
  isProtectedSuperAdmin,
  isSuperAdminRole,
  SUPER_ADMIN_EMAIL,
} from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !isAdminRole(authUser.role)) {
      return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const targetUserId = BigInt(id);

    const existingUser = await prisma.users.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });
    if (!existingUser) {
      return NextResponse.json({ status: "fail", message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, mobile, password, role, status, permissions, img_url } = body;

    const isSuperTarget = isProtectedSuperAdmin(existingUser);
    if (!isSuperTarget && isSuperAdminRole(role)) {
      return NextResponse.json(
        { status: "fail", message: `Super Admin role is reserved exclusively for ${SUPER_ADMIN_EMAIL}` },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name) data.name = name.trim();
    if (mobile) data.mobile = mobile.trim();
    if (password && password.trim() !== "") {
      data.password = await hashPassword(password);
    }
    if (img_url !== undefined) data.img_url = img_url || null;
    if (permissions !== undefined) {
      data.permissions = typeof permissions === "object" ? JSON.stringify(permissions) : permissions;
    }

    if (isSuperTarget) {
      // Keep protected Super Admin role, approved status, and email locked
      data.role = "super_admin";
      data.status = "approved";
      data.email = SUPER_ADMIN_EMAIL;
    } else {
      if (email !== undefined) data.email = email ? email.trim() : null;
      if (role) data.role = role;
      if (status) data.status = status;
    }

    const updated = await prisma.users.update({
      where: { id: targetUserId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        img_url: true,
        permissions: true,
        created_at: true,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "User updated successfully",
      data: {
        ...updated,
        id: Number(updated.id),
        permissions: updated.permissions ? JSON.parse(updated.permissions) : null,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "fail", message: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !isAdminRole(authUser.role)) {
      return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const targetUserId = BigInt(id);

    const targetUser = await prisma.users.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true },
    });
    if (!targetUser) {
      return NextResponse.json({ status: "fail", message: "User not found" }, { status: 404 });
    }

    // Safeguard: dev@arafatpoultry.com (super_admin) is strictly undeletable
    if (isProtectedSuperAdmin(targetUser)) {
      return NextResponse.json(
        { status: "fail", message: `Super Admin account (${SUPER_ADMIN_EMAIL}) cannot be deleted.` },
        { status: 403 }
      );
    }

    if (targetUserId === BigInt(authUser.id)) {
      return NextResponse.json(
        { status: "fail", message: "Currently logged-in account cannot be deleted." },
        { status: 400 }
      );
    }

    // Safeguard: Check if user has associated transactions
    const [orderCount, purchaseCount] = await Promise.all([
      prisma.orders.count({ where: { user_id: targetUserId } }),
      prisma.purchases.count({ where: { user_id: targetUserId } }),
    ]);

    if (orderCount > 0 || purchaseCount > 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: `Cannot delete user because they have recorded transactions (${orderCount} orders, ${purchaseCount} purchases). Consider deactivating the account instead.`,
        },
        { status: 400 }
      );
    }

    await prisma.users.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "fail", message: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
