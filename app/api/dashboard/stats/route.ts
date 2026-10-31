import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "today";
    const fromDateParam = searchParams.get("from_date");
    const toDateParam = searchParams.get("to_date");

    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      startDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      endDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
    } else if (period === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "month") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "custom" || fromDateParam || toDateParam) {
      if (fromDateParam && !toDateParam) {
        const [fy, fm, fd] = fromDateParam.split("-").map(Number);
        startDate = new Date(fy, fm - 1, fd, 0, 0, 0, 0);
        endDate = new Date(fy, fm - 1, fd, 23, 59, 59, 999);
      } else if (!fromDateParam && toDateParam) {
        const [ty, tm, td] = toDateParam.split("-").map(Number);
        startDate = new Date(ty, tm - 1, td, 0, 0, 0, 0);
        endDate = new Date(ty, tm - 1, td, 23, 59, 59, 999);
      } else if (fromDateParam && toDateParam) {
        const [fy, fm, fd] = fromDateParam.split("-").map(Number);
        const [ty, tm, td] = toDateParam.split("-").map(Number);
        startDate = new Date(fy, fm - 1, fd, 0, 0, 0, 0);
        endDate = new Date(ty, tm - 1, td, 23, 59, 59, 999);
      }
    } // "all": startDate and endDate remain null

    const dateFilter = startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

    const [
      totalProducts,
      totalCustomers,
      totalSuppliers,
      totalOrders,
      recentOrders,
      periodOrders,
      periodExpenses,
      periodPurchases,
      periodDueCollections,
      periodReturns,
      customerDuesAgg,
      customersBaseDues,
      purchasesDueList,
      suppliersBaseDues,
    ] = await Promise.all([
      prisma.products.count(),
      prisma.customers.count(),
      prisma.suppliers.count(),
      prisma.orders.count(),
      prisma.orders.findMany({
        take: 10,
        orderBy: { id: "desc" },
        include: {
          customers: true,
        },
      }),
      prisma.orders.findMany({
        where: dateFilter ? { created_at: dateFilter } : undefined,
      }),
      prisma.expenses.findMany({
        where: dateFilter ? { created_at: dateFilter } : undefined,
        select: { expense_amount: true },
      }),
      prisma.purchases.findMany({
        where: dateFilter ? { created_at: dateFilter } : undefined,
        select: { due_amount: true },
      }),
      prisma.customer_payment_details.findMany({
        where: dateFilter ? { created_at: dateFilter } : undefined,
        select: { paid_amount: true, discount_amount: true },
      }),
      prisma.product_returns.findMany({
        where: dateFilter ? { created_at: dateFilter } : undefined,
        select: { amount: true },
      }),
      prisma.orders.aggregate({
        _sum: { due_amount: true },
      }),
      prisma.customers.findMany({
        select: { previous_due_amount: true },
      }),
      prisma.purchases.findMany({
        select: { due_amount: true },
      }),
      prisma.suppliers.findMany({
        select: { purchase_payable_amount: true },
      }),
    ]);

    // Financial Computations for Selected Period
    let income = 0;
    let orderCashCollection = 0;
    let orderDiscountAmount = 0;
    let orderDueAmount = 0;

    periodOrders.forEach((o) => {
      income += Number(o.sub_total || 0);
      orderCashCollection += Number(o.paid_amount || 0);
      orderDiscountAmount += Number(o.discount_amount || 0);
      orderDueAmount += Number(o.due_amount || 0);
    });

    const dueCollectionsPaid = periodDueCollections.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0);
    const dueCollectionsDiscount = periodDueCollections.reduce((sum, c) => sum + Number(c.discount_amount || 0), 0);

    const cashCollection = orderCashCollection + dueCollectionsPaid;
    const discountAmount = orderDiscountAmount + dueCollectionsDiscount;

    const expense = periodExpenses.reduce((sum, e) => sum + Number(e.expense_amount || 0), 0);
    const returnAmount = periodReturns.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // Net Profit = (Sales Revenue - Returns) - Operating Expenses - Discounts
    const netRevenue = income - returnAmount - discountAmount;
    const profit = Math.max(0, netRevenue - expense);

    // Receivable Due & Payable Due (Filtered Period vs All-Time Cumulative)
    let receivableDue = 0;
    let payableDue = 0;

    if (dateFilter) {
      receivableDue = orderDueAmount;
      payableDue = periodPurchases.reduce((s, p) => s + Number(p.due_amount || 0), 0);
    } else {
      const totalOrderDue = Number(customerDuesAgg._sum.due_amount || 0);
      const totalCustPrevDue = customersBaseDues.reduce((s, c) => s + Number(c.previous_due_amount || 0), 0);
      receivableDue = totalOrderDue + totalCustPrevDue;

      const totalPurchaseDue = purchasesDueList.reduce((s, p) => s + Number(p.due_amount || 0), 0);
      const totalSuppPayable = suppliersBaseDues.reduce((s, sup) => s + Number(sup.purchase_payable_amount || 0), 0);
      payableDue = totalPurchaseDue + totalSuppPayable;
    }

    const serializedRecentOrders = recentOrders.map((o) => ({
      id: Number(o.id),
      order_no: o.order_no,
      customer_name: o.customers?.customer_name || "Walking Customer",
      sub_total: Number(o.sub_total || 0),
      paid_amount: Number(o.paid_amount || 0),
      due_amount: Number(o.due_amount || 0),
      created_at: o.created_at,
    }));

    // 1. Calculate Last 15 Days Trend for Sales & Net Profit
    const trendDays = 15;
    const startTrendDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (trendDays - 1), 0, 0, 0, 0);

    const [trendOrders, trendExpenses, trendReturns] = await Promise.all([
      prisma.orders.findMany({
        where: { created_at: { gte: startTrendDate } },
        select: { created_at: true, sub_total: true, discount_amount: true, paid_amount: true },
      }),
      prisma.expenses.findMany({
        where: { created_at: { gte: startTrendDate } },
        select: { created_at: true, expense_amount: true },
      }),
      prisma.product_returns.findMany({
        where: { created_at: { gte: startTrendDate } },
        select: { created_at: true, amount: true },
      }),
    ]);

    const trendMap: { [dateStr: string]: { date: string; label: string; sales: number; profit: number } } = {};
    for (let i = 0; i < trendDays; i++) {
      const d = new Date(startTrendDate);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      const monthShort = d.toLocaleDateString("en-US", { month: "short" });
      const label = `${d.getDate()} ${monthShort}`;
      trendMap[dateStr] = {
        date: dateStr,
        label,
        sales: 0,
        profit: 0,
      };
    }

    trendOrders.forEach((o) => {
      const d = new Date(o.created_at);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      if (trendMap[dateStr]) {
        const subTotal = Number(o.sub_total || 0);
        const discount = Number(o.discount_amount || 0);
        trendMap[dateStr].sales += subTotal;
        trendMap[dateStr].profit += Math.max(0, subTotal - discount);
      }
    });

    trendExpenses.forEach((e) => {
      const d = new Date(e.created_at);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      if (trendMap[dateStr]) {
        trendMap[dateStr].profit = Math.max(0, trendMap[dateStr].profit - Number(e.expense_amount || 0));
      }
    });

    trendReturns.forEach((r) => {
      const d = new Date(r.created_at);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;
      if (trendMap[dateStr]) {
        trendMap[dateStr].profit = Math.max(0, trendMap[dateStr].profit - Number(r.amount || 0));
      }
    });

    const trend = Object.values(trendMap);

    // 2. Financial Distribution (Monthly Collection, Customer Dues, Monthly Expenses)
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
    const [monthlyOrdersAgg, monthlyExpensesAgg] = await Promise.all([
      prisma.orders.findMany({
        where: { created_at: { gte: thirtyDaysAgo } },
        select: { paid_amount: true },
      }),
      prisma.expenses.findMany({
        where: { created_at: { gte: thirtyDaysAgo } },
        select: { expense_amount: true },
      }),
    ]);

    const monthlyCollection = monthlyOrdersAgg.reduce((sum, o) => sum + Number(o.paid_amount || 0), 0);
    const monthlyExpenses = monthlyExpensesAgg.reduce((sum, e) => sum + Number(e.expense_amount || 0), 0);
    const customerDues = receivableDue;
    const totalVolume = monthlyCollection + customerDues + monthlyExpenses;

    const distribution = {
      monthlyCollection: Math.round(monthlyCollection * 100) / 100,
      customerDues: Math.round(customerDues * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      totalVolume: Math.round(totalVolume * 100) / 100,
    };

    return NextResponse.json({
      status: "success",
      data: {
        summary: {
          income,
          cashCollection,
          expense,
          profit,
          receivableDue,
          payableDue,
          returnAmount,
          discountAmount,
          totalProducts,
          totalCustomers,
          totalSuppliers,
          totalOrders,
        },
        period,
        recentOrders: serializedRecentOrders,
        trend,
        distribution,
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
