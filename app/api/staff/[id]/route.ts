import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth";
import { isProtectedSuperAdmin, isSuperAdminRole, SUPER_ADMIN_EMAIL } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req, { requiredRole: "admin" });
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const staffId = BigInt(id);
    const existingStaff = await prisma.users.findUnique({
      where: { id: staffId },
      select: { id: true, email: true, role: true },
    });
    if (!existingStaff) {
      return NextResponse.json({ status: "fail", message: "Staff member not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, mobile, email, role, status, password } = body;

    const isSuperTarget = isProtectedSuperAdmin(existingStaff);
    if (!isSuperTarget && isSuperAdminRole(role)) {
      return NextResponse.json(
        { status: "fail", message: `Super Admin role is reserved exclusively for ${SUPER_ADMIN_EMAIL}` },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {
      name: name !== undefined ? name.trim() : undefined,
      mobile: mobile !== undefined ? mobile.trim() : undefined,
      email: isSuperTarget
        ? SUPER_ADMIN_EMAIL
        : email !== undefined
          ? email
            ? email.trim()
            : null
          : undefined,
      role: isSuperTarget ? "super_admin" : role !== undefined ? role : undefined,
      status: isSuperTarget ? "approved" : status !== undefined ? status : undefined,
    };

    if (password && password.trim()) {
      dataToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.users.update({
      where: { id: staffId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      status: "success",
      message: "Staff details updated successfully",
      data: {
        id: Number(updated.id),
        name: updated.name,
        mobile: updated.mobile,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "fail", message: error instanceof Error ? error.message : "Failed to update staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(req, { requiredRole: "admin" });
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const { id } = await params;
    const staffId = BigInt(id);

    const targetStaff = await prisma.users.findUnique({
      where: { id: staffId },
      select: { id: true, email: true, role: true },
    });
    if (!targetStaff) {
      return NextResponse.json({ status: "fail", message: "Staff member not found" }, { status: 404 });
    }

    // Prevent deleting dev@arafatpoultry.com (super_admin) or currently logged-in user
    if (isProtectedSuperAdmin(targetStaff)) {
      return NextResponse.json(
        { status: "fail", message: `Super Admin account (${SUPER_ADMIN_EMAIL}) cannot be deleted!` },
        { status: 403 }
      );
    }

    if (staffId === BigInt(authResult.user.id)) {
      return NextResponse.json(
        { status: "fail", message: "Currently logged-in account cannot be deleted." },
        { status: 400 }
      );
    }

    const [expenseCount, orderCount] = await Promise.all([
      prisma.expenses.count({ where: { user_id: staffId } }),
      prisma.orders.count({ where: { user_id: staffId } }),
    ]);

    if (expenseCount > 0 || orderCount > 0) {
      return NextResponse.json(
        {
          status: "fail",
          message: `Cannot delete staff member because they have associated records (${expenseCount} expenses, ${orderCount} orders).`,
        },
        { status: 400 }
      );
    }

    await prisma.users.delete({
      where: { id: staffId },
    });

    return NextResponse.json({
      status: "success",
      message: "Staff member deleted successfully",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "fail", message: error instanceof Error ? error.message : "Failed to delete staff" },
      { status: 500 }
    );
  }
}
