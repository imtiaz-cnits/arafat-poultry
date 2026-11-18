import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, hashPassword, verifyPassword } from "@/lib/auth";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

// GET: Authenticated User Profile
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(authUser.id) },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        img_url: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ status: "fail", message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: {
        ...user,
        id: Number(user.id),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT: Update Profile and Password
export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, mobile, img_url, current_password, new_password } = body;

    const userInDb = await prisma.users.findUnique({
      where: { id: BigInt(authUser.id) },
    });

    if (!userInDb) {
      return NextResponse.json({ status: "fail", message: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (mobile && mobile.trim()) {
      updateData.mobile = mobile.trim();
    }

    if (img_url !== undefined) {
      updateData.img_url = img_url;
    }

    // Password change workflow (Only super_admin can change password)
    if (new_password && new_password.trim() !== "") {
      if (userInDb.role !== "super_admin") {
        return NextResponse.json(
          { status: "fail", message: "পাসওয়ার্ড পরিবর্তনের অনুমতি শুধুমাত্র সুপার অ্যাডমিনের রয়েছে।" },
          { status: 403 }
        );
      }

      if (new_password.length < 4) {
        return NextResponse.json(
          { status: "fail", message: "New password must be at least 4 characters" },
          { status: 400 }
        );
      }

      if (current_password && current_password.trim() !== "") {
        const isMatch = await verifyPassword(current_password, userInDb.password);
        if (!isMatch) {
          return NextResponse.json(
            { status: "fail", message: "Current password does not match" },
            { status: 400 }
          );
        }
      }

      updateData.password = await hashPassword(new_password);
    }

    const updated = await prisma.users.update({
      where: { id: BigInt(authUser.id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        img_url: true,
      },
    });

    try {
      await recordActivity({
        req,
        userId: authUser.id,
        action: "UPDATE",
        module: "User Management",
        entityId: String(updated.id),
        description: `User "${updated.name}" updated profile details (Role: ${updated.role})${updateData.password ? " and changed password" : ""}`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        ...updated,
        id: Number(updated.id),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
