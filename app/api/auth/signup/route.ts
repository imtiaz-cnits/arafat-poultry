import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit-service";
import { isValidSystemRole, ROLE_PRESETS } from "@/lib/roles";

export const dynamic = "force-dynamic";

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_CHARS_REGEX = /^[0-9+\-\s()]+$/;

/**
 * Public self-registration endpoint for `/signup`.
 * Always creates accounts in `pending` status requiring Admin approval in `/users`.
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { status: "fail", message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { status: "fail", message: "Invalid registration payload" },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;

    const trimmedName = typeof payload.name === "string" ? payload.name.trim() : "";
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return NextResponse.json(
        { status: "fail", message: "Full name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    const trimmedMobile = typeof payload.mobile === "string" ? payload.mobile.trim() : "";
    const mobileDigits = trimmedMobile.replace(/\D/g, "");
    if (
      !trimmedMobile ||
      trimmedMobile.length > 50 ||
      !MOBILE_CHARS_REGEX.test(trimmedMobile) ||
      mobileDigits.length < 6 ||
      mobileDigits.length > 15
    ) {
      return NextResponse.json(
        { status: "fail", message: "Please enter a valid mobile number" },
        { status: 400 }
      );
    }

    const rawEmail = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const normalizedEmail = rawEmail.length > 0 ? rawEmail : null;
    if (normalizedEmail !== null) {
      if (normalizedEmail.length > 50 || !EMAIL_REGEX.test(normalizedEmail)) {
        return NextResponse.json(
          { status: "fail", message: "Please enter a valid email address (max 50 characters)" },
          { status: 400 }
        );
      }
    }

    const normalizedRole =
      typeof payload.role === "string" ? payload.role.trim().toLowerCase() : "";
    if (!isValidSystemRole(normalizedRole)) {
      return NextResponse.json(
        { status: "fail", message: "Please select a valid role (admin, manager, or staff)" },
        { status: 400 }
      );
    }

    const password = typeof payload.password === "string" ? payload.password : "";
    if (password.length < 4) {
      return NextResponse.json(
        { status: "fail", message: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }
    if (password.length > 72) {
      return NextResponse.json(
        { status: "fail", message: "Password must not exceed 72 characters" },
        { status: 400 }
      );
    }

    if (payload.confirmPassword !== undefined && password !== payload.confirmPassword) {
      return NextResponse.json(
        { status: "fail", message: "Password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Hash outside the DB transaction to avoid holding locks during bcrypt work.
    const hashedPassword = await hashPassword(password);

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    const createdUser = await prisma.$transaction(async (tx) => {
      const mobileCandidates =
        mobileDigits !== trimmedMobile ? [trimmedMobile, mobileDigits] : [trimmedMobile];

      const existingMobile = await tx.users.findFirst({
        where: { mobile: { in: mobileCandidates } },
        select: { id: true },
      });
      if (existingMobile) {
        throw new ConflictError("Mobile number is already registered");
      }

      if (normalizedEmail) {
        const existingEmail = await tx.users.findFirst({
          where: { email: normalizedEmail },
          select: { id: true },
        });
        if (existingEmail) {
          throw new ConflictError("Email address is already registered");
        }
      }

      // Server strictly forces status: "pending" regardless of any client-supplied status.
      const user = await tx.users.create({
        data: {
          name: trimmedName,
          email: normalizedEmail,
          mobile: trimmedMobile,
          password: hashedPassword,
          role: normalizedRole,
          status: "pending",
          img_url: null,
          otp: "000000",
          permissions: JSON.stringify(ROLE_PRESETS[normalizedRole]),
        },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
          status: true,
          created_at: true,
        },
      });

      await logAudit(
        {
          userId: user.id,
          action: "CREATE",
          entityType: "USER",
          entityId: user.id,
          newValues: {
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            status: user.status,
            source: "self_signup",
          },
          ipAddress,
          userAgent,
        },
        tx
      );

      return user;
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Account registered successfully. Waiting for admin approval.",
        data: {
          id: Number(createdUser.id),
          name: createdUser.name,
          email: createdUser.email,
          mobile: createdUser.mobile,
          role: createdUser.role,
          status: createdUser.status,
          created_at: createdUser.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { status: "fail", message: error.message },
        { status: 409 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { status: "fail", message: "Email or mobile number is already registered" },
        { status: 409 }
      );
    }

    console.error("Signup Error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: error instanceof Error ? error.message : "Failed to register user",
      },
      { status: 500 }
    );
  }
}
