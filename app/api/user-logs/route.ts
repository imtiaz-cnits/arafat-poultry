import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { isAdminRole, isSuperAdminRole } from "@/lib/roles";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

// Standard action and module presets for filtering
export const STANDARD_ACTIONS = [
  { value: "all", label: "All Actions" },
  { value: "LOGIN", label: "LOGIN (User Session)" },
  { value: "LOGOUT", label: "LOGOUT (User Session)" },
  { value: "CREATE", label: "CREATE (New Record)" },
  { value: "UPDATE", label: "UPDATE (Edit Record)" },
  { value: "DELETE", label: "DELETE (Remove Record)" },
  { value: "DUE_COLLECTION", label: "DUE_COLLECTION (Due Payment)" },
  { value: "ADJUST", label: "ADJUST (Stock / Mortality Adjustment)" },
  { value: "RETURN", label: "RETURN (Product Return)" },
  { value: "HARVEST", label: "HARVEST (Fish Harvest)" },
  { value: "ISSUE", label: "ISSUE (Internal Feed Issue)" },
  { value: "PAYMENT", label: "PAYMENT (Payment Voucher)" },
  { value: "RECEIPT", label: "RECEIPT (Receipt Voucher)" },
  { value: "CANCEL", label: "CANCEL (Voucher Cancellation)" },
];

export const STANDARD_MODULES = [
  { value: "all", label: "All Modules" },
  { value: "Auth & Sessions", label: "Auth & Sessions" },
  { value: "Users & Roles", label: "Users & Roles" },
  { value: "User Management", label: "User Management" },
  { value: "Staff & Employees", label: "Staff & Employees" },
  { value: "POS / Sales", label: "POS / Sales" },
  { value: "Products", label: "Products" },
  { value: "Categories", label: "Categories" },
  { value: "Brands", label: "Brands" },
  { value: "Units", label: "Units" },
  { value: "Customers", label: "Customers & Dues" },
  { value: "Suppliers", label: "Suppliers & Payables" },
  { value: "Purchases", label: "Purchases & Inward" },
  { value: "Poultry & Sheds", label: "Poultry Shed & Flock" },
  { value: "Poultry & Egg", label: "Poultry & Eggs" },
  { value: "Fish Farming", label: "Fish Farming & Ponds" },
  { value: "Feed Management", label: "Feed Management" },
  { value: "Inventory & Stock", label: "Inventory & Stock" },
  { value: "Medication & Vaccine", label: "Medication & Vaccine" },
  { value: "Expenses", label: "Expenses" },
  { value: "Challans", label: "Delivery Challans" },
  { value: "Accounting", label: "Accounting & Vouchers" },
];

// GET: Fetch User Activity Logs
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !isAdminRole(authUser.role)) {
      return NextResponse.json(
        {
          status: "fail",
          message:
            "অননুমোদিত: শুধুমাত্র অ্যাডমিন এবং সুপার অ্যাডমিন হিস্ট্রি লগ দেখতে পারবেন",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
    const search = searchParams.get("search")?.trim() || "";
    const userId = searchParams.get("user_id")?.trim() || "";
    const action = searchParams.get("action")?.trim() || "";
    const moduleName = searchParams.get("module")?.trim() || "";

    const where: any = {};

    if (userId && userId !== "all") {
      try {
        where.user_id = BigInt(userId);
      } catch {}
    }

    if (action && action !== "all") {
      where.action = action;
    }

    if (moduleName && moduleName !== "all") {
      where.entity_type = moduleName;
    }

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entity_type: { contains: search } },
        { new_values: { contains: search } },
        { old_values: { contains: search } },
        { users: { name: { contains: search } } },
        { users: { email: { contains: search } } },
        { users: { mobile: { contains: search } } },
      ];
    }

    const [totalMatching, rawLogs, totalInDb, sessionCount, modCount, userCount, allUsers] =
      await Promise.all([
        prisma.audit_logs.count({ where }),
        prisma.audit_logs.findMany({
          where,
          orderBy: { id: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                role: true,
                img_url: true,
              },
            },
          },
        }),
        prisma.audit_logs.count(),
        prisma.audit_logs.count({
          where: { action: { in: ["LOGIN", "LOGOUT"] } },
        }),
        prisma.audit_logs.count({
          where: {
            action: { in: ["CREATE", "UPDATE", "DELETE", "DUE_COLLECTION", "ADJUST"] },
          },
        }),
        prisma.users.count(),
        prisma.users.findMany({
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            img_url: true,
          },
        }),
      ]);

    // Format logs for client display
    const logs = rawLogs.map((log) => {
      let description = "";
      if (log.new_values) {
        try {
          const parsed = JSON.parse(log.new_values);
          if (parsed.description) {
            description = parsed.description;
          } else if (typeof parsed === "string") {
            description = parsed;
          } else {
            description = `${log.action} action performed on ${log.entity_type}`;
          }
        } catch {
          description = log.new_values;
        }
      } else {
        description = `${log.action} action performed on ${log.entity_type}`;
      }

      return {
        id: Number(log.id),
        user_id: log.user_id ? Number(log.user_id) : null,
        user: log.users
          ? {
              id: Number(log.users.id),
              name: log.users.name,
              email: log.users.email,
              mobile: log.users.mobile,
              role: log.users.role,
              img_url: log.users.img_url,
            }
          : {
              id: 0,
              name: "System / Guest",
              email: null,
              mobile: "-",
              role: "system",
              img_url: null,
            },
        action: log.action,
        module: log.entity_type,
        entity_id: log.entity_id,
        description,
        created_at: log.created_at.toISOString(),
      };
    });

    return NextResponse.json({
      status: "success",
      data: {
        logs,
        pagination: {
          total: totalMatching,
          page,
          limit,
          totalPages: Math.ceil(totalMatching / limit),
        },
        stats: {
          totalRecordedLogs: totalInDb,
          pageLoginsAndSessions: sessionCount,
          dataModifications: modCount,
          registeredUsers: userCount,
        },
        filterOptions: {
          users: allUsers.map((u) => ({
            id: Number(u.id),
            name: u.name,
            email: u.email,
            role: u.role,
            img_url: u.img_url,
          })),
          actions: STANDARD_ACTIONS,
          modules: STANDARD_MODULES,
        },
      },
    });
  } catch (error: any) {
    console.error("Failed to load user logs:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}

// DELETE: Clear All Logs (Super Admin Only)
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || !isSuperAdminRole(authUser.role)) {
      return NextResponse.json(
        {
          status: "fail",
          message:
            "অননুমোদিত: শুধুমাত্র সুপার অ্যাডমিন সকল হিস্ট্রি লগ মুছে ফেলতে পারবেন",
        },
        { status: 403 }
      );
    }

    const countBefore = await prisma.audit_logs.count();
    await prisma.audit_logs.deleteMany({});

    // Record the clear event as a new starting audit record
    await recordActivity({
      req,
      userId: authUser.id,
      action: "DELETE",
      module: "Auth & Sessions",
      description: `Super Admin "${authUser.name}" (${authUser.email}) cleared ${countBefore} user activity history records.`,
    });

    return NextResponse.json({
      status: "success",
      message: "সকল হিস্ট্রি লগ সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error: any) {
    console.error("Failed to clear logs:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to clear logs" },
      { status: 500 }
    );
  }
}
