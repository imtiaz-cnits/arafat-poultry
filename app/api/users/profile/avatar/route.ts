import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ status: "fail", message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    const targetUserIdStr = (formData.get("userId") as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ status: "fail", message: "No avatar image file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ status: "fail", message: "Only image files (JPG, PNG, WebP) are allowed" }, { status: 400 });
    }

    // 5MB max
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ status: "fail", message: "Image size must not exceed 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    let ext = path.extname(file.name).toLowerCase();
    if (!ext || ext === ".") ext = ".jpg";
    const filename = `avatar-${targetUserIdStr || authUser.id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    const imgUrl = `/uploads/avatars/${filename}`;

    // Update user record in DB if target is an existing user or self
    if (targetUserIdStr && targetUserIdStr !== "new" && targetUserIdStr !== "temp") {
      try {
        await prisma.users.update({
          where: { id: BigInt(targetUserIdStr) },
          data: { img_url: imgUrl },
        });
      } catch {}
    } else if (!targetUserIdStr) {
      await prisma.users.update({
        where: { id: BigInt(authUser.id) },
        data: { img_url: imgUrl },
      });
    }

    try {
      await recordActivity({
        req,
        userId: authUser.id,
        action: "UPDATE",
        module: "User Management",
        description: `Uploaded new profile photo for user ID #${targetUserIdStr || authUser.id}`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Profile image uploaded successfully",
      img_url: imgUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
