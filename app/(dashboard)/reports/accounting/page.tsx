"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Scale,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Loader2,
  X,
  Plus,
  Egg,
  Fish,
} from "lucide-react";
import { exportReportToPdf } from "@/lib/pdf-export";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface BusinessUnitProfit {
  unit_code: string;
  unit_name: string;
  revenue: number;
  cogs: number;
  gross_profit: number;
  margin_percent: number;
}

interface ConsolidatedPnlData {
  statement: string;
  period: { start_date: string; end_date: string };
  revenue: {
    gross_sales_revenue: number;
    returns_deductions: number;
    net_sales_revenue: number;
  };
  cost_of_goods_sold: {
    feed_cogs: number;
    egg_cogs: number;
    fish_cogs: number;
    general_cogs: number;
    total_cogs: number;
  };
  gross_profit: number;
  gross_margin_percent: number;
  operating_expenses: {
    breakdown: Array<{ category: string; amount: number }>;
    total_operating_expenses: number;
  };
  net_operating_profit: number;
  net_margin_percent: number;
  business_units: BusinessUnitProfit[];
}

interface CashAccountRecon {
  id: number;
  account_name: string;
  account_type: string;
  account_number: string | null;
  bank_name: string | null;
  opening_balance: number;
  total_inflow: number;
  total_outflow: number;
  current_balance: number;
  transaction_net_flow: number;
  is_reconciled: boolean;
}

interface InventoryValuationData {
  statement: string;
  total_inventory_valuation: number;
  business_units_summary: {
    feed_inventory_valuation: number;
    egg_inventory_valuation: number;
    harvested_fish_stock_valuation: number;
    live_fish_pond_biomass_valuation: number;
    general_retail_valuation: number;
  };
  products: Array<{
    id: number;
    name: string;
    business_unit: string;
    unit: string;
    quantity: number;
    cost_price: number;
    valuation: number;
  }>;
  live_fish_ponds: Array<{
    batch_id: number;
    batch_no: string;
    pond_name: string;
    species_name: string;
    live_fish_count: number;
    estimated_biomass_kg: number;
    standing_batch_valuation: number;
  }>;
}

interface ReceivablesData {
  total_receivables: number;
  aging_summary: {
    current_0_30: number;
    aging_31_60: number;
    aging_61_90: number;
    aging_90_plus: number;
  };
  customers_count: number;
  due_customers: Array<{
    id: number;
    customer_id: string;
    name: string;
    mobile: string;
    due_amount: number;
    days_overdue: number;
    aging_bracket: string;
  }>;
}

interface PayablesData {
  total_payables: number;
  suppliers_count: number;
  due_suppliers: Array<{
    id: number;
    supplier_id: string;
    name: string;
    company: string;
    mobile: string;
    payable_amount: number;
  }>;
}

export default function ConsolidatedAccountingPage() {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    try {
      await exportReportToPdf(".print-only", {
        filename: "consolidated-accounting-report-" + new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  }

  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pnl" | "units" | "liquidity" | "inventory" | "receivables" | "payables"
  >("pnl");

  // Date Filters
  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Data States
  const [pnlData, setPnlData] = useState<ConsolidatedPnlData | null>(null);
  const [reconData, setReconData] = useState<{ total_liquidity: number; accounts: CashAccountRecon[] } | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryValuationData | null>(null);
  const [receivablesData, setReceivablesData] = useState<ReceivablesData | null>(null);
  const [payablesData, setPayablesData] = useState<PayablesData | null>(null);

  // Voucher Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [submittingVoucher, setSubmittingVoucher] = useState(false);

  // Payment Voucher Form State
  const [payVoucherType, setPayVoucherType] = useState<"SUPPLIER_PAYMENT" | "EXPENSE">("SUPPLIER_PAYMENT");
  const [paySupplierId, setPaySupplierId] = useState<number | "">("");
  const [payAmount, setPayAmount] = useState<string>("5000");
  const [payMethod, setPayMethod] = useState<string>("Cash");
  const [payDate, setPayDate] = useState<string>(todayStr);
  const [payNote, setPayNote] = useState("");

  // Receipt Voucher Form State
  const [recCustomerId, setRecCustomerId] = useState<number | "">("");
  const [recAmount, setRecAmount] = useState<string>("3000");
  const [recMethod, setRecMethod] = useState<string>("Cash");
  const [recDate, setRecDate] = useState<string>(todayStr);
  const [recNote, setRecNote] = useState("");

  const loadAllReports = async () => {
    try {
      setLoading(true);
      const [pnlRes, reconRes, invRes, recRes, payRes] = await Promise.all([
        fetch(`/api/accounting/pnl?start_date=${startDate}&end_date=${endDate}`),
        fetch(`/api/accounting/cash-reconciliation`),
        fetch(`/api/accounting/inventory-valuation`),
        fetch(`/api/accounting/receivables`),
        fetch(`/api/accounting/payables`),
      ]);

      const [pnlJson, reconJson, invJson, recJson, payJson] = await Promise.all([
        pnlRes.json(),
        reconRes.json(),
        invRes.json(),
        recRes.json(),
        payRes.json(),
      ]);

      if (pnlJson.status === "success") setPnlData(pnlJson.data.consolidated);
      if (reconJson.status === "success") setReconData(reconJson.data);
      if (invJson.status === "success") setInventoryData(invJson.data);
      if (recJson.status === "success") setReceivablesData(recJson.data);
      if (payJson.status === "success") setPayablesData(payJson.data);
    } catch (err: any) {
      toast.error(err.message || "রিপোর্ট লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, [startDate, endDate]);

  const handlePaymentVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("সঠিক টাকার পরিমাণ প্রদান করুন");
      return;
    }
    try {
      setSubmittingVoucher(true);
      const res = await fetch("/api/accounting/vouchers/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_type: payVoucherType,
          supplier_id: paySupplierId || null,
          amount: Number(payAmount),
          payment_method: payMethod,
          date: payDate,
          note: payNote,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "পেমেন্ট ভাউচার সফলভাবে সম্পন্ন হয়েছে");
        setIsPaymentModalOpen(false);
        loadAllReports();
      } else {
        toast.error(json.message || "ভাউচার সংরক্ষণে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmittingVoucher(false);
    }
  };

  const handleReceiptVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recCustomerId || !recAmount || Number(recAmount) <= 0) {
      toast.error("গ্রাহক ও আদায়ের সঠিক পরিমাণ প্রদান করুন");
      return;
    }
    try {
      setSubmittingVoucher(true);
      const res = await fetch("/api/accounting/vouchers/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: recCustomerId,
          amount: Number(recAmount),
          payment_method: recMethod,
          date: recDate,
          note: recNote,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "রিসিপ্ট ভাউচার সফলভাবে সম্পন্ন হয়েছে");
        setIsReceiptModalOpen(false);
        loadAllReports();
      } else {
        toast.error(json.message || "ভাউচার সংরক্ষণে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmittingVoucher(false);
    }
  };

  return (
    <div>
      {/* Print-Only Styles and Dedicated Report Template */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10px !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside,
          header,
          nav,
          footer,
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
            padding: 10px !important;
            margin: 0 !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 11px !important;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #94a3b8 !important;
            padding: 5px 8px !important;
          }
          .print-table tr {
            page-break-inside: avoid !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Interactive Layout */}
      <div className="no-print space-y-6">
        {/* 1. Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
                সমন্বিত আর্থিক হিসাব ও প্রতিবেদন (Consolidated Accounting)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ব্যবসায়িক ইউনিটভিত্তিক লাভ-ক্ষতি, উৎপাদন ব্যয় বণ্টন, ক্যাশ রিকনসিলিয়েশন ও ব্যালেন্স শিট স্টক
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <div className="flex items-center gap-1.5">
              <div className="w-[130px]">
                <CustomDatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="শুরুর তারিখ"
                />
              </div>
              <span className="text-xs text-slate-400 font-bold">থেকে</span>
              <div className="w-[130px]">
                <CustomDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="শেষ তারিখ"
                />
              </div>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(true)}
              className="h-[38px] px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              রিসিপ্ট ভাউচার (আদায়)
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="h-[38px] px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              পেমেন্ট ভাউচার (পরিশোধ)
            </button>

            <button
              onClick={() => window.print()}
              className="h-[38px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              প্রিন্ট রিপোর্ট
            </button>
          </div>
        </div>

        {/* 2. Top Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Card 1: Net Sales Revenue */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>মোট নিট বিক্রয়</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {formatBdCurrency(pnlData?.revenue.net_sales_revenue || 0)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              রিটার্ন কর্তন: {formatBdCurrency(pnlData?.revenue.returns_deductions || 0)}
            </div>
          </div>

          {/* Card 2: COGS */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>উৎপাদন ও পণ্য ক্রয় ব্যয় (COGS)</span>
              <Boxes className="w-4 h-4 text-sky-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-xl font-bold text-sky-700 dark:text-sky-400">
                {formatBdCurrency(pnlData?.cost_of_goods_sold.total_cogs || 0)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              মোট বিক্রিত পণ্যের মূল খরচ
            </div>
          </div>

          {/* Card 3: Gross Profit */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>গ্রস মুনাফা ও মার্জিন</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2.5">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatBdCurrency(pnlData?.gross_profit || 0)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 ml-1.5">
                ({pnlData?.gross_margin_percent || 0}%)
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              মোট বিক্রয় লাভ
            </div>
          </div>

          {/* Card 4: Operating Expenses */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>পরিচালন ব্যয় (Overheads)</span>
              <Building2 className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {formatBdCurrency(pnlData?.operating_expenses.total_operating_expenses || 0)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              শ্রমিক, বিদ্যুৎ, ভাড়া ও বিবিধ
            </div>
          </div>

          {/* Card 5: Net Profit */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>নিট অপারেটিং লাভ</span>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2.5">
              <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                {formatBdCurrency(pnlData?.net_operating_profit || 0)}
              </span>
              <span className="text-xs font-semibold text-indigo-600 ml-1.5">
                ({pnlData?.net_margin_percent || 0}%)
              </span>
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-1">
              সর্বমোট নিট লাভ
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("pnl")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "pnl"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            সমন্বিত লাভ-ক্ষতি বিবরণী (Consolidated P&L)
          </button>
          <button
            onClick={() => setActiveTab("units")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "units"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            ব্যবসায়িক ইউনিট অ্যানালাইসিস (Unit Margins)
          </button>
          <button
            onClick={() => setActiveTab("liquidity")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "liquidity"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            ক্যাশ ও ব্যাংক রিকনসিলিয়েশন ({reconData?.accounts.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "inventory"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            ব্যালেন্স শিট স্টক মূল্যায়ন ({formatBdCurrency(inventoryData?.total_inventory_valuation || 0)})
          </button>
          <button
            onClick={() => setActiveTab("receivables")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "receivables"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            কাস্টমার বকেয়া ও এজিন ({formatBdCurrency(receivablesData?.total_receivables || 0)})
          </button>
          <button
            onClick={() => setActiveTab("payables")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "payables"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
          >
            সাপ্লায়ার দেনা ({formatBdCurrency(payablesData?.total_payables || 0)})
          </button>
        </div>

        {/* 4. Tab Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs text-slate-500 mt-2">আর্থিক প্রতিবেদন বিশ্লেষণ হচ্ছে...</p>
          </div>
        ) : activeTab === "pnl" ? (
          /* Consolidated P&L Table */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  সমন্বিত আর্থিক লাভ-ক্ষতি বিবরণী (Comprehensive Income Statement)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  সময়কাল: {pnlData?.period.start_date} থেকে {pnlData?.period.end_date}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                নিট লাভ: {formatBdCurrency(pnlData?.net_operating_profit || 0)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column: Revenue & COGS */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-sm border-b pb-1.5 flex justify-between">
                    <span>বিক্রয় রেভিনিউ (Sales Revenue)</span>
                    <span>{formatBdCurrency(pnlData?.revenue.net_sales_revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>মোট বিক্রয় (Gross Sales):</span>
                    <span>{formatBdCurrency(pnlData?.revenue.gross_sales_revenue || 0)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>বিক্রয় ফেরত কর্তন (Sales Returns):</span>
                    <span>(-) {formatBdCurrency(pnlData?.revenue.returns_deductions || 0)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-sm border-b pb-1.5 flex justify-between">
                    <span>বিক্রিত পণ্যের উৎপাদন ও ক্রয় ব্যয় (COGS)</span>
                    <span>{formatBdCurrency(pnlData?.cost_of_goods_sold.total_cogs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>ফিড ট্রেডিং বিক্রয় ব্যয়:</span>
                    <span>{formatBdCurrency(pnlData?.cost_of_goods_sold.feed_cogs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>ডিম উৎপাদন ব্যয় (Flock Allocated):</span>
                    <span>{formatBdCurrency(pnlData?.cost_of_goods_sold.egg_cogs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>মাছ আহরণ ও চাষ ব্যয়:</span>
                    <span>{formatBdCurrency(pnlData?.cost_of_goods_sold.fish_cogs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>রিটেইল পণ্য ক্রয় ব্যয়:</span>
                    <span>{formatBdCurrency(pnlData?.cost_of_goods_sold.general_cogs || 0)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex justify-between items-center text-sm">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">মোট গ্রস মুনাফা (Gross Profit):</span>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-400 text-base">
                    {formatBdCurrency(pnlData?.gross_profit || 0)}
                  </span>
                </div>
              </div>

              {/* Right Column: Operating Overheads & Net Profit */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-sm border-b pb-1.5 flex justify-between">
                    <span>পরিচালন ব্যয় খাতসমূহ (Overhead Expenses)</span>
                    <span>{formatBdCurrency(pnlData?.operating_expenses.total_operating_expenses || 0)}</span>
                  </div>
                  {pnlData?.operating_expenses.breakdown.length === 0 ? (
                    <p className="text-slate-400 py-2">কোন ওভারহেড খরচ পাওয়া যায়নি</p>
                  ) : (
                    pnlData?.operating_expenses.breakdown.map((exp, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{exp.category}:</span>
                        <span>{formatBdCurrency(exp.amount)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-md flex justify-between items-center">
                  <div>
                    <span className="text-xs text-emerald-200 font-medium">চূড়ান্ত নিট অপারেটিং লাভ:</span>
                    <div className="text-2xl font-black mt-1">
                      {formatBdCurrency(pnlData?.net_operating_profit || 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-200">নিট প্রফিট মার্জিন:</span>
                    <div className="text-xl font-bold mt-1">{pnlData?.net_margin_percent || 0}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "units" ? (
          /* Business Unit P&L Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pnlData?.business_units.map((bu) => (
              <div
                key={bu.unit_code}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    {bu.unit_code === "FEED" && <Boxes className="w-5 h-5 text-sky-600" />}
                    {bu.unit_code === "EGG" && <Egg className="w-5 h-5 text-amber-500" />}
                    {bu.unit_code === "FISH" && <Fish className="w-5 h-5 text-emerald-600" />}
                    {bu.unit_code === "GENERAL" && <Scale className="w-5 h-5 text-purple-600" />}
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{bu.unit_name}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {bu.unit_code}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <div className="text-slate-400 text-[10px]">মোট বিক্রয়</div>
                    <div className="font-bold text-slate-800 dark:text-white mt-1">
                      {formatBdCurrency(bu.revenue)}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <div className="text-slate-400 text-[10px]">উৎপাদন/ক্রয় ব্যয়</div>
                    <div className="font-bold text-sky-700 dark:text-sky-400 mt-1">
                      {formatBdCurrency(bu.cogs)}
                    </div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl">
                    <div className="text-emerald-700 dark:text-emerald-300 text-[10px]">গ্রস প্রফিট</div>
                    <div className="font-bold text-emerald-800 dark:text-emerald-400 mt-1">
                      {formatBdCurrency(bu.gross_profit)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">প্রফিট মার্জিন:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {bu.margin_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "liquidity" ? (
          /* Cash & Bank Liquidity Reconciliation */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                নগদ ক্যাশ, ব্যাংক ও এমএফএস অ্যাকাউন্ট রিকনসিলিয়েশন
              </h3>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                সর্বমোট তরল ক্যাশ: {formatBdCurrency(reconData?.total_liquidity || 0)}
              </span>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="p-3.5">অ্যাকাউন্ট নাম</th>
                    <th className="p-3.5">ধরণ</th>
                    <th className="p-3.5 text-right">প্রারম্ভিক স্থিতি</th>
                    <th className="p-3.5 text-right text-emerald-600">মোট জমা (Inflows)</th>
                    <th className="p-3.5 text-right text-rose-600">মোট উত্তোলন (Outflows)</th>
                    <th className="p-3.5 text-right">বর্তমান ক্যাশ স্থিতি</th>
                    <th className="p-3.5 text-center">রিকনসিলিয়েশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reconData?.accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-white">
                        {acc.account_name}
                        {acc.account_number && (
                          <div className="text-[10px] text-slate-400 font-normal">{acc.account_number}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 font-medium">{acc.account_type}</td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">
                        {formatBdCurrency(acc.opening_balance)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        (+) {formatBdCurrency(acc.total_inflow)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                        (-) {formatBdCurrency(acc.total_outflow)}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900 dark:text-white text-sm">
                        {formatBdCurrency(acc.current_balance)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          শতভাগ মিলেছে
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "inventory" ? (
          /* Inventory Asset Valuation on Balance Sheet */
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">ফিড মজুত মূল্য</span>
                <div className="font-bold text-sm text-slate-800 dark:text-white mt-1">
                  {formatBdCurrency(inventoryData?.business_units_summary.feed_inventory_valuation || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">ডিম মজুত মূল্য</span>
                <div className="font-bold text-sm text-slate-800 dark:text-white mt-1">
                  {formatBdCurrency(inventoryData?.business_units_summary.egg_inventory_valuation || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">আহরিত মাছ মজুত</span>
                <div className="font-bold text-sm text-slate-800 dark:text-white mt-1">
                  {formatBdCurrency(inventoryData?.business_units_summary.harvested_fish_stock_valuation || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">পুকুরের লাইভ মাছ বায়োমাস</span>
                <div className="font-bold text-sm text-slate-800 dark:text-white mt-1">
                  {formatBdCurrency(inventoryData?.business_units_summary.live_fish_pond_biomass_valuation || 0)}
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-emerald-800 dark:text-emerald-300 font-bold">মোট ব্যালেন্স শিট স্টক</span>
                <div className="font-extrabold text-base text-emerald-700 dark:text-emerald-400 mt-1">
                  {formatBdCurrency(inventoryData?.total_inventory_valuation || 0)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white">
                পণ্যভিত্তিক স্টক ও মূল্যায়ন তালিকা
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      <th className="p-3.5">পণ্যের নাম</th>
                      <th className="p-3.5">ব্যবসায়িক ইউনিট</th>
                      <th className="p-3.5 text-right">মজুত পরিমাণ</th>
                      <th className="p-3.5 text-right">গড় উৎপাদন/ক্রয় মূল্য</th>
                      <th className="p-3.5 text-right">মোট মজুত মূল্যায়ন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inventoryData?.products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-semibold text-slate-800 dark:text-white">{p.name}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {p.business_unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-bold text-slate-800 dark:text-white">
                          {p.quantity.toLocaleString()} {p.unit}
                        </td>
                        <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">
                          {formatBdCurrency(p.cost_price)}
                        </td>
                        <td className="p-3.5 text-right font-black text-emerald-700 dark:text-emerald-400">
                          {formatBdCurrency(p.valuation)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "receivables" ? (
          /* Customer Receivables & Aging */
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">০ - ৩০ দিন (Current)</span>
                <div className="font-bold text-sm text-emerald-600 mt-1">
                  {formatBdCurrency(receivablesData?.aging_summary.current_0_30 || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">৩১ - ৬০ দিন বকেয়া</span>
                <div className="font-bold text-sm text-amber-600 mt-1">
                  {formatBdCurrency(receivablesData?.aging_summary.aging_31_60 || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">৬১ - ৯০ দিন বকেয়া</span>
                <div className="font-bold text-sm text-orange-600 mt-1">
                  {formatBdCurrency(receivablesData?.aging_summary.aging_61_90 || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">৯০+ দিন দীর্ঘমেয়াদী বকেয়া</span>
                <div className="font-bold text-sm text-rose-600 mt-1">
                  {formatBdCurrency(receivablesData?.aging_summary.aging_90_plus || 0)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
                <span className="text-slate-800 dark:text-white">গ্রাহক বকেয়া ও এজিন তালিকা</span>
                <span className="text-rose-600 font-extrabold text-sm">
                  মোট বকেয়া: {formatBdCurrency(receivablesData?.total_receivables || 0)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      <th className="p-3.5">গ্রাহক নাম ও আইডি</th>
                      <th className="p-3.5">মোবাইল</th>
                      <th className="p-3.5 text-center">কতদিন যাবৎ বকেয়া</th>
                      <th className="p-3.5 text-center">এজিন ব্র্যাকেট</th>
                      <th className="p-3.5 text-right">বকেয়ার পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {receivablesData?.due_customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-semibold text-slate-800 dark:text-white">
                          {c.name}
                          <div className="text-[10px] text-slate-400 font-normal">{c.customer_id}</div>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{c.mobile}</td>
                        <td className="p-3.5 text-center text-slate-600 dark:text-slate-300 font-medium">
                          {c.days_overdue} দিন
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.days_overdue > 90
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                : c.days_overdue > 60
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300"
                                  : c.days_overdue > 30
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                          >
                            {c.aging_bracket}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-black text-rose-600 text-sm">
                          {formatBdCurrency(c.due_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Supplier Payables */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
              <span className="text-slate-800 dark:text-white">সাপ্লায়ার দেনা ও বাকি পরিশোধ তালিকা</span>
              <span className="text-sky-700 dark:text-sky-400 font-extrabold text-sm">
                মোট দেনা: {formatBdCurrency(payablesData?.total_payables || 0)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="p-3.5">সাপ্লায়ার নাম ও কোম্পানি</th>
                    <th className="p-3.5">মোবাইল</th>
                    <th className="p-3.5 text-right">বাকি পাওনা পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payablesData?.due_suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-white">
                        {s.name}
                        <div className="text-[10px] text-slate-400 font-normal">{s.company} ({s.supplier_id})</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{s.mobile}</td>
                      <td className="p-3.5 text-right font-black text-sky-700 dark:text-sky-400 text-sm">
                        {formatBdCurrency(s.payable_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
          MODAL 1: PAYMENT VOUCHER
      ======================================================== */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
              <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5" />
                  <h3 className="font-bold text-sm">পেমেন্ট ভাউচার (টাকা পরিশোধ)</h3>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePaymentVoucher} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    ভাউচারের ধরণ <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={[
                      { value: "SUPPLIER_PAYMENT", label: "সাপ্লায়ার বাকি পরিশোধ (Supplier Payment)" },
                      { value: "EXPENSE", label: "অফিস ও পরিচালন ব্যয় (Expense Voucher)" },
                    ]}
                    value={payVoucherType}
                    onChange={(v) => setPayVoucherType(v as any)}
                  />
                </div>

                {payVoucherType === "SUPPLIER_PAYMENT" && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      সাপ্লায়ার নির্বাচন করুন <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={
                        payablesData?.due_suppliers.map((s) => ({
                          value: s.id,
                          label: `${s.name} (${s.company})`,
                          subLabel: `বাকি: ${formatBdCurrency(s.payable_amount)}`,
                        })) || []
                      }
                      value={paySupplierId || ""}
                      onChange={(v) => setPaySupplierId(Number(v))}
                      placeholder="-- সাপ্লায়ার সিলেক্ট করুন --"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    পরিশোধের পরিমাণ (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sky-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    পরিশোধ মাধ্যম
                  </label>
                  <CustomSelect
                    options={[
                      { value: "Cash", label: "Cash (নগদ ক্যাশ)" },
                      { value: "bKash", label: "bKash (বিকাশ)" },
                      { value: "Nagad", label: "Nagad (নগদ)" },
                      { value: "Bank", label: "Bank Account (ব্যাংক অ্যাকাউন্ট)" },
                    ]}
                    value={payMethod}
                    onChange={(v) => setPayMethod(String(v))}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">তারিখ</label>
                  <CustomDatePicker
                    value={payDate}
                    onChange={setPayDate}
                    placeholder="তারিখ নির্বাচন করুন"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বিবরণ / রেফারেন্স</label>
                  <input
                    type="text"
                    placeholder="চেক নম্বর বা ভাউচার নোট..."
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVoucher}
                    className="h-[38px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {submittingVoucher && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    ভাউচার কনফার্ম করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
          MODAL 2: RECEIPT VOUCHER
      ======================================================== */}
        {isReceiptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
              <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5" />
                  <h3 className="font-bold text-sm">রিসিপ্ট ভাউচার (বকেয়া আদায়)</h3>
                </div>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReceiptVoucher} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    গ্রাহক নির্বাচন করুন <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={
                      receivablesData?.due_customers.map((c) => ({
                        value: c.id,
                        label: `${c.name} (${c.mobile})`,
                        subLabel: `বকেয়া: ${formatBdCurrency(c.due_amount)}`,
                      })) || []
                    }
                    value={recCustomerId || ""}
                    onChange={(v) => setRecCustomerId(Number(v))}
                    placeholder="-- গ্রাহক সিলেক্ট করুন --"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    আদায়ের পরিমাণ (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    জমার মাধ্যম (Payment Method)
                  </label>
                  <CustomSelect
                    options={[
                      { value: "Cash", label: "Cash (নগদ ক্যাশ)" },
                      { value: "bKash", label: "bKash (বিকাশ)" },
                      { value: "Nagad", label: "Nagad (নগদ)" },
                      { value: "Bank", label: "Bank Account (ব্যাংক অ্যাকাউন্ট)" },
                    ]}
                    value={recMethod}
                    onChange={(v) => setRecMethod(String(v))}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">তারিখ</label>
                  <CustomDatePicker
                    value={recDate}
                    onChange={setRecDate}
                    placeholder="তারিখ নির্বাচন করুন"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বিবরণ / নোট</label>
                  <input
                    type="text"
                    placeholder="রিসিপ্ট নোট বা ইনভয়েস তথ্য..."
                    value={recNote}
                    onChange={(e) => setRecNote(e.target.value)}
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReceiptModalOpen(false)}
                    className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVoucher}
                    className="h-[38px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {submittingVoucher && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    আদায় সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED PRINT-ONLY LAYOUT (Strict 10px margin, heading details & tables only) */}
      <div className="print-only text-black bg-white">
        <div className="border-b-2 border-slate-900 pb-2 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 m-0">
                ARAFAT POULTRY &amp; FISHERIES
              </h1>
              <p className="text-[11px] text-slate-600 font-medium m-0">
                Quality Products. Trusted Service.
              </p>
              <h2 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
                সমন্বিত আর্থিক লাভ-ক্ষতি প্রতিবেদন (Consolidated Financial Statement)
              </h2>
            </div>
            <div className="text-right text-[10px] text-slate-600">
              <p suppressHydrationWarning>
                Printed: {new Date().toLocaleDateString("en-GB")} {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p>সময়কাল: <strong className="text-slate-900">{startDate} থেকে {endDate}</strong></p>
              <p>মুদ্রা: <strong className="text-slate-900">BDT (৳)</strong></p>
            </div>
          </div>
        </div>

        {/* 1. Main P&L Table */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 border-b border-slate-300 pb-0.5">
            ১. আয় ও ব্যয় সংক্ষেপ (Income Statement Summary)
          </h3>
          <table className="print-table">
            <thead>
              <tr className="bg-slate-100 font-bold text-left">
                <th>হিসাব খাত (Account Head)</th>
                <th className="text-right">পরিমাণ (৳)</th>
                <th className="text-right">শতাংশ / নোট</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold">মোট পণ্য বিক্রয় (Gross Sales Revenue)</td>
                <td className="text-right font-bold">{formatBdCurrency(pnlData?.revenue.gross_sales_revenue || 0)}</td>
                <td className="text-right text-[10px]">মোট বিক্রয় ইনভয়েস</td>
              </tr>
              <tr>
                <td className="text-red-700">বিক্রয় ফেরত কর্তন (Sales Returns)</td>
                <td className="text-right text-red-700">(-) {formatBdCurrency(pnlData?.revenue.returns_deductions || 0)}</td>
                <td className="text-right text-[10px]">ফেরত সমন্বয়</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td>নিট বিক্রয় রেভিনিউ (Net Sales Revenue)</td>
                <td className="text-right font-black">{formatBdCurrency(pnlData?.revenue.net_sales_revenue || 0)}</td>
                <td className="text-right">100.0%</td>
              </tr>
              <tr>
                <td>বিক্রিত পণ্যের ক্রয় ও উৎপাদন ব্যয় (COGS)</td>
                <td className="text-right font-bold">{formatBdCurrency(pnlData?.cost_of_goods_sold.total_cogs || 0)}</td>
                <td className="text-right text-[10px]">ফিড, ডিম, মাছ ও সাধারণ পণ্য ব্যয়</td>
              </tr>
              <tr className="bg-emerald-50 font-bold">
                <td className="text-emerald-900">মোট গ্রস মুনাফা (Gross Profit)</td>
                <td className="text-right text-emerald-900 font-black">{formatBdCurrency(pnlData?.gross_profit || 0)}</td>
                <td className="text-right font-bold text-emerald-800">
                  {pnlData?.revenue.net_sales_revenue
                    ? ((pnlData.gross_profit / pnlData.revenue.net_sales_revenue) * 100).toFixed(2)
                    : 0}%
                </td>
              </tr>
              <tr>
                <td>মোট পরিচালন ও খামার ব্যয় (Operating Overheads)</td>
                <td className="text-right font-bold text-red-700">(-) {formatBdCurrency(pnlData?.operating_expenses.total_operating_expenses || 0)}</td>
                <td className="text-right text-[10px]">শ্রমিক বেতন, বিদ্যুৎ, ভাড়া ও বিবিধ</td>
              </tr>
              <tr className="bg-slate-200 font-black text-xs">
                <td>চূড়ান্ত নিট অপারেটিং লাভ / (ক্ষতি)</td>
                <td className="text-right font-black">{formatBdCurrency(pnlData?.net_operating_profit || 0)}</td>
                <td className="text-right">{pnlData?.net_margin_percent || 0}% নিট মার্জিন</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Business Units Table */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 border-b border-slate-300 pb-0.5">
            ২. ব্যবসায়িক ইউনিটভিত্তিক মার্জিন (Business Unit Breakdown)
          </h3>
          <table className="print-table">
            <thead>
              <tr className="bg-slate-100 font-bold text-left">
                <th>ইউনিট নাম</th>
                <th className="text-right">বিক্রয় রেভিনিউ (৳)</th>
                <th className="text-right">উৎপাদন/ক্রয় ব্যয় (৳)</th>
                <th className="text-right">গ্রস লাভ (৳)</th>
                <th className="text-right">মার্জিন %</th>
              </tr>
            </thead>
            <tbody>
              {pnlData?.business_units.map((bu) => (
                <tr key={bu.unit_code}>
                  <td className="font-bold">{bu.unit_name}</td>
                  <td className="text-right">{formatBdCurrency(bu.revenue)}</td>
                  <td className="text-right">{formatBdCurrency(bu.cogs)}</td>
                  <td className="text-right font-bold text-emerald-800">{formatBdCurrency(bu.gross_profit)}</td>
                  <td className="text-right">{bu.margin_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end mt-10 pt-6 text-[10px] text-slate-600">
          <div className="text-center">
            <div className="w-36 border-t border-slate-400 mb-1"></div>
            <span>Prepared By</span>
          </div>
          <div className="text-center">
            <div className="w-36 border-t border-slate-400 mb-1"></div>
            <span>Accounts Officer</span>
          </div>
          <div className="text-center">
            <div className="w-36 border-t border-slate-400 mb-1"></div>
            <span>Authorized Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
}
