import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalProducts,
      totalCustomers,
      totalSuppliers,
      totalOrders,
      recentOrders,
      ordersToday,
      ordersThisMonth,
      expensesToday,
      purchasesToday,
      customerDues,
      allPurchases,
    ] = await Promise.all([
      prisma.products.count(),
      prisma.customers.count(),
      prisma.suppliers.count(),
      prisma.orders.count(),
      prisma.orders.findMany({
        take: 8,
        orderBy: { id: "desc" },
        include: {
          customers: true,
        },
      }),
      prisma.orders.findMany({
        where: {
          created_at: { gte: todayStart, lte: todayEnd },
        },
        select: {
          sub_total: true,
          paid_amount: true,
          due_amount: true,
          discount_amount: true,
        },
      }),
      prisma.orders.findMany({
        where: {
          created_at: { gte: monthStart, lte: monthEnd },
        },
        select: {
          sub_total: true,
          paid_amount: true,
          due_amount: true,
        },
      }),
      prisma.expenses.findMany({
        where: {
          created_at: { gte: todayStart, lte: todayEnd },
        },
        select: { expense_amount: true },
      }),
      prisma.purchases.findMany({
        where: {
          created_at: { gte: todayStart, lte: todayEnd },
        },
        select: { grand_subtotal: true, paid_amount: true, due_amount: true },
      }),
      prisma.orders.aggregate({
        _sum: { due_amount: true },
      }),
      prisma.purchases.findMany({
        select: { due_amount: true },
      }),
    ]);

    const todaySales = ordersToday.reduce((acc, curr) => acc + Number(curr.sub_total || 0), 0);
    const todayPaid = ordersToday.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0);
    const todayDue = ordersToday.reduce((acc, curr) => acc + Number(curr.due_amount || 0), 0);
    const todayExpense = expensesToday.reduce((acc, curr) => acc + Number(curr.expense_amount || 0), 0);
    const todayPurchase = purchasesToday.reduce((acc, curr) => acc + Number(curr.grand_subtotal || 0), 0);

    const monthSales = ordersThisMonth.reduce((acc, curr) => acc + Number(curr.sub_total || 0), 0);
    const monthPaid = ordersThisMonth.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0);

    const totalCustomerDue = Number(customerDues._sum.due_amount || 0);
    const totalSupplierDue = allPurchases.reduce((acc, curr) => acc + Number(curr.due_amount || 0), 0);

    const serializedRecentOrders = recentOrders.map((o) => ({
      id: Number(o.id),
      order_no: o.order_no,
      customer_name: o.customers?.customer_name || "Walking Customer",
      sub_total: Number(o.sub_total || 0),
      paid_amount: Number(o.paid_amount || 0),
      due_amount: Number(o.due_amount || 0),
      created_at: o.created_at,
    }));

    return NextResponse.json({
      status: "success",
      data: {
        summary: {
          todaySales,
          todayPaid,
          todayDue,
          todayExpense,
          todayPurchase,
          monthSales,
          monthPaid,
          totalCustomerDue,
          totalSupplierDue,
          totalProducts,
          totalCustomers,
          totalSuppliers,
          totalOrders,
        },
        recentOrders: serializedRecentOrders,
      },
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to calculate stats" },
      { status: 500 }
    );
  }
}
