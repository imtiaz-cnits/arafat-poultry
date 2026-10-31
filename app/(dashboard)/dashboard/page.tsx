"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatBdCurrency } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { CustomDatePicker } from "@/components/ui/date-picker";
import {
  TrendingUp,
  Receipt,
  Wallet,
  ShoppingBag,
  ArrowUpRight,
  ShoppingCart,
  PlusCircle,
  Truck,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCw,
  Percent,
  RotateCcw,
  Building2,
  Box,
  PieChart,
} from "lucide-react";

interface SummaryData {
  income: number;
  cashCollection: number;
  expense: number;
  profit: number;
  receivableDue: number;
  payableDue: number;
  returnAmount: number;
  discountAmount: number;
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalOrders: number;
}

interface RecentOrder {
  id: number;
  order_no: string;
  customer_name: string;
  sub_total: number;
  paid_amount: number;
  due_amount: number;
  created_at: string;
}

interface TrendItem {
  date: string;
  label: string;
  sales: number;
  profit: number;
}

interface FinancialDistribution {
  monthlyCollection: number;
  customerDues: number;
  monthlyExpenses: number;
  totalVolume: number;
}

const PERIOD_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Last Week", value: "week" },
  { label: "Last Month", value: "month" },
  { label: "Date Wise", value: "custom" },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryData>({
    income: 0,
    cashCollection: 0,
    expense: 0,
    profit: 0,
    receivableDue: 0,
    payableDue: 0,
    returnAmount: 0,
    discountAmount: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [distribution, setDistribution] = useState<FinancialDistribution>({
    monthlyCollection: 0,
    customerDues: 0,
    monthlyExpenses: 0,
    totalVolume: 0,
  });
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [activeDonutSegment, setActiveDonutSegment] = useState<"collection" | "dues" | "expenses" | null>(null);

  const fetchStats = useCallback(
    async (selectedPeriod: string, fDate?: string, tDate?: string) => {
      setLoading(true);
      try {
        let url = `/api/dashboard/stats?period=${selectedPeriod}`;
        const effFrom = fDate !== undefined ? fDate : fromDate;
        const effTo = tDate !== undefined ? tDate : toDate;
        if (selectedPeriod === "custom") {
          if (effFrom) url += `&from_date=${effFrom}`;
          if (effTo) url += `&to_date=${effTo}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "success" && data.data) {
          setSummary(data.data.summary);
          setRecentOrders(data.data.recentOrders || []);
          if (data.data.trend) setTrendData(data.data.trend);
          if (data.data.distribution) setDistribution(data.data.distribution);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate]
  );

  useEffect(() => {
    if (period !== "custom") {
      fetchStats(period);
    } else if (fromDate && toDate) {
      fetchStats("custom", fromDate, toDate);
    }
  }, [period, fetchStats, fromDate, toDate]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Header Card (Matching Reference Layout) */}
      <div className="card bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none m-0">
              Overview Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time sales, collections, expenses, dues &amp; business metrics
            </p>
          </div>
        </div>

        {/* Right: Controls (Period dropdown, custom date inputs, refresh, POS button, Products button) */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          {/* Period Dropdown */}
          <div className="w-36">
            <CustomSelect
              options={PERIOD_OPTIONS}
              value={period}
              onChange={(val) => {
                setPeriod(val);
                if (val !== "custom") {
                  fetchStats(val, "", "");
                }
              }}
              placeholder="Select Period"
            />
          </div>

          {/* Custom Date Pickers (Shown when Date Wise is selected) */}
          {period === "custom" && (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <div className="w-[130px] sm:w-[140px]">
                <CustomDatePicker
                  value={fromDate}
                  onChange={(val) => {
                    setFromDate(val);
                    fetchStats("custom", val, toDate);
                  }}
                  placeholder="From Date"
                  allowClear
                />
              </div>
              <span className="text-xs text-slate-400 font-medium px-0.5">to</span>
              <div className="w-[130px] sm:w-[140px]">
                <CustomDatePicker
                  value={toDate}
                  onChange={(val) => {
                    setToDate(val);
                    fetchStats("custom", fromDate, val);
                  }}
                  placeholder="To Date"
                  allowClear
                />
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => fetchStats(period, fromDate, toDate)}
            disabled={loading}
            title="Refresh Metrics"
            aria-label="Refresh Metrics"
            className="w-[38px] h-[38px] rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-700 hover:border-emerald-600 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          {/* POS Terminal Button */}
          <Link
            href="/pos"
            className="h-[38px] px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:shadow-sm transition-all shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>POS Terminal</span>
          </Link>

          {/* Products Button */}
          <Link
            href="/products"
            className="h-[38px] px-3.5 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-600 hover:text-emerald-700 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Products</span>
          </Link>
        </div>
      </div>

      {/* 2. 1st Line: 4 Prominent KPI Cards (INCOME, CASH COLLECTION, EXPENSE, PROFIT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* INCOME */}
        <div className="card bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              INCOME
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            {formatBdCurrency(summary.income)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-sky-600 dark:text-sky-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total Sales Revenue</span>
          </div>
        </div>

        {/* CASH COLLECTION */}
        <div className="card bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CASH COLLECTION
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            {formatBdCurrency(summary.cashCollection)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-teal-600 dark:text-teal-400 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Paid at Counter &amp; Dues</span>
          </div>
        </div>

        {/* EXPENSE */}
        <div className="card bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              EXPENSE
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            {formatBdCurrency(summary.expense)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Operating Expenses</span>
          </div>
        </div>

        {/* PROFIT */}
        <div className="card bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PROFIT
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            {formatBdCurrency(summary.profit)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Net Business Profit</span>
          </div>
        </div>
      </div>

      {/* 3. 2nd Line: 4 Compact Cards (Noticeably Shorter Height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* RECEIVABLE DUE */}
        <div className="card bg-white dark:bg-slate-900 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] py-2.5 px-3.5 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              RECEIVABLE DUE
            </p>
            <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-tight truncate">
              {formatBdCurrency(summary.receivableDue)}
            </p>
          </div>
        </div>

        {/* PAYABLE DUE */}
        <div className="card bg-white dark:bg-slate-900 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] py-2.5 px-3.5 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              PAYABLE DUE
            </p>
            <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-tight truncate">
              {formatBdCurrency(summary.payableDue)}
            </p>
          </div>
        </div>

        {/* RETURN */}
        <div className="card bg-white dark:bg-slate-900 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] py-2.5 px-3.5 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              RETURN
            </p>
            <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-tight truncate">
              {formatBdCurrency(summary.returnAmount)}
            </p>
          </div>
        </div>

        {/* DISCOUNT */}
        <div className="card bg-white dark:bg-slate-900 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] py-2.5 px-3.5 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              DISCOUNT
            </p>
            <p className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-tight truncate">
              {formatBdCurrency(summary.discountAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* 4. 3rd Line: Unified 3-Column Banner Card (Exact Image Match + Clickable Links) */}
      <div className="rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-sky-50/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-sky-950/30 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-800">
          {/* Column 1: Total Products -> /products */}
          <Link
            href="/products"
            className="flex items-center justify-between p-4 sm:py-4 sm:px-6 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100/80 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  Total Products
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Active Catalog Items
                </p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {summary.totalProducts}
            </div>
          </Link>

          {/* Column 2: Total Customers -> /customers */}
          <Link
            href="/customers"
            className="flex items-center justify-between p-4 sm:py-4 sm:px-6 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100/80 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  Total Customers
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Registered Client Profiles
                </p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {summary.totalCustomers}
            </div>
          </Link>

          {/* Column 3: Total Suppliers -> /suppliers */}
          <Link
            href="/suppliers"
            className="flex items-center justify-between p-4 sm:py-4 sm:px-6 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100/80 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  Total Suppliers
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Verified Brand Vendors
                </p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {summary.totalSuppliers}
            </div>
          </Link>
        </div>
      </div>

      {/* 5. Recent Invoices Section */}
      <div className="card bg-white dark:bg-slate-900 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white leading-none m-0">
                Recent Invoices (Latest First)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time transactions ordered descending by ID
              </p>
            </div>
          </div>

          <Link
            href="/invoices"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1"
          >
            <span>View All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Desktop View Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                <th className="p-[10px] text-center w-[45px]">SL</th>
                <th className="p-[10px]">Order No</th>
                <th className="p-[10px]">Customer</th>
                <th className="p-[10px] text-right">Sub Total</th>
                <th className="p-[10px] text-right">Paid Amount</th>
                <th className="p-[10px] text-right">Due Amount</th>
                <th className="p-[10px] text-center">Status</th>
                <th className="p-[10px] text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No orders recorded yet. Launch the POS terminal to start ringing sales!
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, idx) => {
                  const due = Number(order.due_amount || 0);
                  const status =
                    due <= 0 ? "PAID" : order.paid_amount && Number(order.paid_amount) > 0 ? "PARTIAL" : "DUE";

                  return (
                    <tr
                      key={Number(order.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="p-[10px] text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-[10px] font-bold text-slate-900 dark:text-white">
                        {order.order_no || `ORD-${order.id}`}
                      </td>
                      <td className="p-[10px] font-medium">
                        {order.customer_name}
                      </td>
                      <td className="p-[10px] text-right font-bold text-slate-800 dark:text-white">
                        {formatBdCurrency(order.sub_total)}
                      </td>
                      <td className="p-[10px] text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatBdCurrency(order.paid_amount)}
                      </td>
                      <td className="p-[10px] text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatBdCurrency(order.due_amount)}
                      </td>
                      <td className="p-[10px] text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${status === "PAID"
                              ? "bg-emerald-500 text-white"
                              : status === "PARTIAL"
                                ? "bg-amber-500 text-white"
                                : "bg-rose-500 text-white"
                            }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-[10px] text-center text-slate-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List (< 768px) */}
        <div className="block md:hidden p-3 space-y-3">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-medium">
              No orders recorded yet.
            </div>
          ) : (
            recentOrders.map((order) => {
              const due = Number(order.due_amount || 0);
              const status =
                due <= 0 ? "PAID" : order.paid_amount && Number(order.paid_amount) > 0 ? "PARTIAL" : "DUE";

              return (
                <div
                  key={Number(order.id)}
                  className="rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] p-3.5 bg-white dark:bg-slate-800/60 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                      {order.order_no || `ORD-${order.id}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${status === "PAID"
                          ? "bg-emerald-500 text-white"
                          : status === "PARTIAL"
                            ? "bg-amber-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {order.customer_name}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                      <span className="text-slate-400 text-[11px]">Total:</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {formatBdCurrency(order.sub_total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80">
                      <span className="text-slate-400 text-[11px]">Due:</span>
                      <span className="font-bold text-rose-600">
                        {formatBdCurrency(order.due_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Dynamic Charts Section (Sales & Profit Trend + Financial Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Chart: Sales & Profit Trend (Last 15 Days) */}
        <div className="lg:col-span-2 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Sales &amp; Profit Trend (Last 15 Days Sales &amp; Net Profit)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Daily sales revenue vs actual net profit
                </p>
              </div>
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Analytics
              </span>
            </div>

            {/* SVG Chart Container */}
            <div className="relative w-full overflow-hidden select-none">
              {(() => {
                const data = trendData.length > 0 ? trendData : [];
                const maxSales = Math.max(...data.map((d) => d.sales), 0);
                // Round up to nearest 10,000, minimum 40,000 to match screenshot styling
                const maxVal = Math.max(40000, Math.ceil(maxSales / 10000) * 10000);

                const width = 720;
                const height = 240;
                const padLeft = 65;
                const padRight = 20;
                const padTop = 20;
                const padBottom = 200;
                const plotWidth = width - padLeft - padRight;
                const plotHeight = padBottom - padTop;

                const ticks = [
                  { val: maxVal, label: `৳ ${maxVal.toLocaleString("en-IN")}` },
                  { val: maxVal * 0.75, label: `৳ ${(maxVal * 0.75).toLocaleString("en-IN")}` },
                  { val: maxVal * 0.5, label: `৳ ${(maxVal * 0.5).toLocaleString("en-IN")}` },
                  { val: maxVal * 0.25, label: `৳ ${(maxVal * 0.25).toLocaleString("en-IN")}` },
                  { val: 0, label: "৳ 0" },
                ];

                const points = data.map((d, i) => {
                  const x = padLeft + (data.length > 1 ? (i / (data.length - 1)) * plotWidth : plotWidth / 2);
                  const y = padBottom - (d.sales / maxVal) * plotHeight;
                  return { x, y, data: d };
                });

                // Build smooth bezier curve
                let pathD = "";
                if (points.length > 0) {
                  pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
                  for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[i === 0 ? 0 : i - 1];
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

                    const cp1x = p1.x + (p2.x - p0.x) / 6;
                    const cp1y = p1.y + (p2.y - p0.y) / 6;
                    const cp2x = p2.x - (p3.x - p1.x) / 6;
                    const cp2y = p2.y - (p3.y - p1.y) / 6;

                    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
                  }
                }

                const areaD =
                  points.length > 0
                    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${padBottom} L ${points[0].x.toFixed(1)} ${padBottom} Z`
                    : "";

                const activePoint =
                  hoveredTrendIndex !== null && points[hoveredTrendIndex] ? points[hoveredTrendIndex] : null;

                return (
                  <div className="relative">
                    <svg viewBox={`0 0 ${width} ${height + 25}`} className="w-full h-auto overflow-visible">
                      <defs>
                        <linearGradient id="salesTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Dashed Grid Lines & Y Ticks */}
                      {ticks.map((t, idx) => {
                        const yPos = padBottom - (t.val / maxVal) * plotHeight;
                        return (
                          <g key={idx}>
                            <line
                              x1={padLeft}
                              y1={yPos}
                              x2={width - padRight}
                              y2={yPos}
                              stroke="currentColor"
                              className="text-slate-100 dark:text-slate-800"
                              strokeDasharray="3 3"
                              strokeWidth="1"
                            />
                            <text
                              x={padLeft - 10}
                              y={yPos + 4}
                              textAnchor="end"
                              className="fill-slate-400 dark:fill-slate-500 text-[11px] font-sans font-medium"
                            >
                              {t.label}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      {areaD && <path d={areaD} fill="url(#salesTrendGrad)" />}

                      {/* Line Curve */}
                      {pathD && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#16a34a"
                          strokeWidth="2.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Hover Tracking Line */}
                      {activePoint && (
                        <line
                          x1={activePoint.x}
                          y1={padTop}
                          x2={activePoint.x}
                          y2={padBottom}
                          stroke="#16a34a"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      )}

                      {/* Points / Hover Circles */}
                      {points.map((pt, i) => (
                        <g key={i}>
                          {/* Invisible larger hover hotspot */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="12"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredTrendIndex(i)}
                            onMouseLeave={() => setHoveredTrendIndex(null)}
                          />
                          {/* Visible dot when hovered */}
                          {hoveredTrendIndex === i && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="5"
                              fill="#16a34a"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="pointer-events-none drop-shadow-sm"
                            />
                          )}
                        </g>
                      ))}

                      {/* X-axis Day Labels */}
                      {points.map((pt, i) => (
                        <text
                          key={i}
                          x={pt.x}
                          y={padBottom + 20}
                          textAnchor="middle"
                          className="fill-slate-500 dark:fill-slate-400 text-[10.5px] font-medium"
                        >
                          {pt.data.label}
                        </text>
                      ))}
                    </svg>

                    {/* Interactive Floating Tooltip */}
                    {activePoint && (
                      <div
                        style={{
                          left: `${(activePoint.x / width) * 100}%`,
                          top: `${(activePoint.y / height) * 100}%`,
                          transform: "translate(-50%, -120%)",
                        }}
                        className="absolute pointer-events-none z-20 bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 px-3 py-2 rounded-xl shadow-xl text-xs whitespace-nowrap transition-all duration-75"
                      >
                        <p className="font-bold border-b border-slate-700 dark:border-slate-200 pb-1 mb-1 text-[11px]">
                          {activePoint.data.label} ({activePoint.data.date})
                        </p>
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-emerald-400 dark:text-emerald-600 font-semibold">Sales:</span>
                          <span className="font-mono font-bold">{formatBdCurrency(activePoint.data.sales)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-sky-400 dark:text-sky-600 font-semibold">Net Profit:</span>
                          <span className="font-mono font-bold">{formatBdCurrency(activePoint.data.profit)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Chart: Financial Distribution */}
        <div className="lg:col-span-1 rounded-2xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Financial Distribution
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Breakdown of collections, dues &amp; profit
              </p>
            </div>

            {/* Donut Chart with Center Text & Interactive Hover */}
            <div className="relative flex items-center justify-center my-4 py-2">
              {(() => {
                const total =
                  distribution.totalVolume ||
                  distribution.monthlyCollection + distribution.customerDues + distribution.monthlyExpenses;
                const col = distribution.monthlyCollection || 0;
                const dues = distribution.customerDues || 0;
                const exp = distribution.monthlyExpenses || 0;

                // Segments percentages
                const p1 = total > 0 ? col / total : 0.35;
                const p2 = total > 0 ? dues / total : 0.45;
                const p3 = total > 0 ? exp / total : 0.2;

                const r = 75;
                const circumference = 2 * Math.PI * r;

                // Segment lengths with subtle separation gap
                const gap = 3;
                const len1 = Math.max(0, p1 * circumference - gap);
                const len2 = Math.max(0, p2 * circumference - gap);
                const len3 = Math.max(0, p3 * circumference - gap);

                const off1 = 0;
                const off2 = -(p1 * circumference);
                const off3 = -((p1 + p2) * circumference);

                return (
                  <div className="relative w-60 h-60 flex items-center justify-center">
                    {/* Hover Floating Pill Badge */}
                    {activeDonutSegment && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-3 py-1 rounded-full shadow-lg text-[11px] whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 flex items-center gap-2 border border-slate-700 dark:border-slate-200">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            activeDonutSegment === "collection"
                              ? "bg-[#7c3aed]"
                              : activeDonutSegment === "dues"
                              ? "bg-[#ef4444]"
                              : "bg-[#f59e0b]"
                          }`}
                        />
                        <span className="font-bold">
                          {activeDonutSegment === "collection"
                            ? "Monthly Collection"
                            : activeDonutSegment === "dues"
                            ? "Customer Dues"
                            : "Monthly Expenses"}
                          :
                        </span>
                        <span className="font-mono font-black">
                          {formatBdCurrency(
                            activeDonutSegment === "collection"
                              ? col
                              : activeDonutSegment === "dues"
                              ? dues
                              : exp
                          )}
                        </span>
                        <span className="opacity-80 font-bold">
                          (
                          {(
                            ((activeDonutSegment === "collection"
                              ? col
                              : activeDonutSegment === "dues"
                              ? dues
                              : exp) /
                              (total || 1)) *
                            100
                          ).toFixed(1)}
                          %)
                        </span>
                      </div>
                    )}

                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 overflow-visible">
                      {/* Background track circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r={r}
                        fill="transparent"
                        stroke="currentColor"
                        className="text-slate-100 dark:text-slate-800/80"
                        strokeWidth="24"
                      />

                      {/* Segment 1: Monthly Collection (Purple) */}
                      {p1 > 0 && (
                        <circle
                          cx="100"
                          cy="100"
                          r={r}
                          fill="transparent"
                          stroke="#7c3aed"
                          strokeWidth={activeDonutSegment === "collection" ? 30 : 24}
                          strokeDasharray={`${len1} ${circumference - len1}`}
                          strokeDashoffset={off1}
                          opacity={activeDonutSegment === null || activeDonutSegment === "collection" ? 1 : 0.4}
                          onMouseEnter={() => setActiveDonutSegment("collection")}
                          onMouseLeave={() => setActiveDonutSegment(null)}
                          className="cursor-pointer transition-all duration-300 drop-shadow-sm"
                        />
                      )}

                      {/* Segment 2: Customer Dues (Red) */}
                      {p2 > 0 && (
                        <circle
                          cx="100"
                          cy="100"
                          r={r}
                          fill="transparent"
                          stroke="#ef4444"
                          strokeWidth={activeDonutSegment === "dues" ? 30 : 24}
                          strokeDasharray={`${len2} ${circumference - len2}`}
                          strokeDashoffset={off2}
                          opacity={activeDonutSegment === null || activeDonutSegment === "dues" ? 1 : 0.4}
                          onMouseEnter={() => setActiveDonutSegment("dues")}
                          onMouseLeave={() => setActiveDonutSegment(null)}
                          className="cursor-pointer transition-all duration-300 drop-shadow-sm"
                        />
                      )}

                      {/* Segment 3: Monthly Expenses (Amber) */}
                      {p3 > 0 && (
                        <circle
                          cx="100"
                          cy="100"
                          r={r}
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth={activeDonutSegment === "expenses" ? 30 : 24}
                          strokeDasharray={`${len3} ${circumference - len3}`}
                          strokeDashoffset={off3}
                          opacity={activeDonutSegment === null || activeDonutSegment === "expenses" ? 1 : 0.4}
                          onMouseEnter={() => setActiveDonutSegment("expenses")}
                          onMouseLeave={() => setActiveDonutSegment(null)}
                          className="cursor-pointer transition-all duration-300 drop-shadow-sm"
                        />
                      )}
                    </svg>

                    {/* Donut Center Dynamic Data Display on Hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-4 transition-all duration-200">
                      {activeDonutSegment === "collection" ? (
                        <div className="animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-xs font-bold text-[#7c3aed] flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                            Monthly Collection
                          </span>
                          <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                            {formatBdCurrency(col)}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {((col / (total || 1)) * 100).toFixed(1)}% of volume
                          </span>
                        </div>
                      ) : activeDonutSegment === "dues" ? (
                        <div className="animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-xs font-bold text-[#ef4444] flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                            Customer Dues
                          </span>
                          <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                            {formatBdCurrency(dues)}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {((dues / (total || 1)) * 100).toFixed(1)}% of volume
                          </span>
                        </div>
                      ) : activeDonutSegment === "expenses" ? (
                        <div className="animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-xs font-bold text-[#f59e0b] flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                            Monthly Expenses
                          </span>
                          <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                            {formatBdCurrency(exp)}
                          </span>
                          <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                            {((exp / (total || 1)) * 100).toFixed(1)}% of volume
                          </span>
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-150">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Total Volume
                          </span>
                          <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                            {formatBdCurrency(total)}
                          </span>
                          <span className="block text-[10px] font-medium text-slate-400 mt-0.5">
                            Hover slices for data
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Bottom Interactive Legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onMouseEnter={() => setActiveDonutSegment("collection")}
              onMouseLeave={() => setActiveDonutSegment(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeDonutSegment === "collection"
                  ? "bg-purple-100 dark:bg-purple-950/60 ring-1 ring-purple-400 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shrink-0" />
              <span>Monthly Collection</span>
            </button>
            <button
              type="button"
              onMouseEnter={() => setActiveDonutSegment("dues")}
              onMouseLeave={() => setActiveDonutSegment(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeDonutSegment === "dues"
                  ? "bg-rose-100 dark:bg-rose-950/60 ring-1 ring-rose-400 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
              <span>Customer Dues</span>
            </button>
            <button
              type="button"
              onMouseEnter={() => setActiveDonutSegment("expenses")}
              onMouseLeave={() => setActiveDonutSegment(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeDonutSegment === "expenses"
                  ? "bg-amber-100 dark:bg-amber-950/60 ring-1 ring-amber-400 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
              <span>Monthly Expenses</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
