import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, hashPassword } from "@/lib/auth";
import { isAdminRole, isSuperAdminRole, isDevUser, DEV_EMAILS } from "@/lib/roles";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

// GET: All Users (Ordered descending by ID as per PROJECT_RULES)
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (!isDevUser(authUser.email) && !isSuperAdminRole(authUser.role))) {
      return NextResponse.json({ status: "fail", message: "অননুমোদিত: ইউজার তালিকা শুধুমাত্র সুপার অ্যাডমিন দেখতে পারবেন" }, { status: 403 });
    }

    const users = await prisma.users.findMany({
      where: { NOT: { email: { in: DEV_EMAILS } } },
      orderBy: { id: "desc" },
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

    const serializedUsers = users.filter((u) => !isDevUser(u.email)).map((u) => ({
      ...u,
      id: Number(u.id),
      permissions: u.permissions ? JSON.parse(u.permissions) : null,
    }));

    return NextResponse.json({
      status: "success",
      data: serializedUsers,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "fail", message: error instanceof Error ? error.message : "Failed to load users" },
      { status: 500 }
    );
  }
}

// POST: Create User by Admin
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (!isDevUser(authUser.email) && !isSuperAdminRole(authUser.role))) {
      return NextResponse.json({ status: "fail", message: "অননুমোদিত: নতুন ইউজার শুধুমাত্র সুপার অ্যাডমিন তৈরি করতে পারবেন" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, mobile, password, role, status, permissions, img_url } = body;

    if (!name || !mobile || !password || !role) {
      return NextResponse.json(
        { status: "fail", message: "Name, mobile, password, and role are required" },
        { status: 400 }
      );
    }

    if (role === "super_admin") {
      return NextResponse.json(
        { status: "fail", message: "সুপার অ্যাডমিন পদবী শুধুমাত্র dev@arafatpoultry.com এর জন্য সংরক্ষিত" },
        { status: 400 }
      );
    }


    // Check duplicate
    if (email) {
      const existing = await prisma.users.findFirst({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { status: "fail", message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.users.create({
      data: {
        name,
        email: email || null,
        mobile,
        password: hashedPassword,
        role,
        status: status || "approved",
        img_url: img_url || null,
        otp: "000000",
        permissions: permissions ? JSON.stringify(permissions) : null,
      },
    });

    await recordActivity({
      req,
      userId: authUser.id,
      action: "CREATE",
      module: "Users & Roles",
      entityId: newUser.id,
      description: `Created new user account for "${newUser.name}" (${newUser.email || newUser.mobile}) with role "${newUser.role}"`,
    });

    return NextResponse.json({
      status: "success",
      message: "User created successfully",
      data: {
        id: Number(newUser.id),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "fail", message: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
