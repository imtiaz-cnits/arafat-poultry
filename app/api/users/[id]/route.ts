import { getAuthUser, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { recordActivity } from "@/lib/audit-service";
import {
  isAdminRole,
  isProtectedSuperAdmin,
  isSuperAdminRole,
  isDevUser,
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
    if (!authUser || (!isDevUser(authUser.email) && !isSuperAdminRole(authUser.role))) {
      return NextResponse.json({ status: "fail", message: "অননুমোদিত: শুধুমাত্র সুপার অ্যাডমিন ব্যবহারকারী সম্পাদনা করতে পারবেন" }, { status: 403 });
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

    const isDevAccount = existingUser.email === SUPER_ADMIN_EMAIL;
    if (isDevAccount) {
      // Keep developer super admin account email and role locked
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

    await recordActivity({
      req,
      userId: authUser.id,
      action: "UPDATE",
      module: "Users & Roles",
      entityId: updated.id,
      description: `Updated user account "${updated.name}" (${updated.email || updated.mobile}, Role: ${updated.role})`,
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
    if (!authUser || !isSuperAdminRole(authUser.role)) {
      return NextResponse.json({ status: "fail", message: "অননুমোদিত: শুধুমাত্র সুপার অ্যাডমিন ব্যবহারকারী মুছে ফেলতে পারবেন" }, { status: 403 });
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
    if (targetUser.role === "super_admin" || isProtectedSuperAdmin(targetUser) || isDevUser(targetUser.email)) {
      return NextResponse.json(
        { status: "fail", message: "সুপার অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা নিষিদ্ধ।" },
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

    await recordActivity({
      req,
      userId: authUser.id,
      action: "DELETE",
      module: "Users & Roles",
      entityId: targetUserId,
      description: `Deleted user account #${targetUserId} (${targetUser.email || "No email"}, Role: ${targetUser.role})`,
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
