"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Receipt,
  RotateCcw,
  Wallet,
  Calendar,
  Plus,
  Loader2,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  Hash,
  Printer,
} from "lucide-react";

interface LedgerItem {
  id: number;
  date: string;
  transaction_type: string;
  reference_type: string;
  reference_no: string | null;
  debit: number;
  credit: number;
  balance: number;
  note: string | null;
  created_at: string;
}
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect , PageSkeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

interface OrderItem {
  id: number;
  order_no: string;
  sub_total: number;
  paid_amount: number;
  due_amount: number;
  order_status?: string | null;
  created_at: string;
}

interface PaymentItem {
  id: number;
  paid_amount: number;
  discount_amount: number;
  due_amount: number;
  previous_due_amount: number;
  due_collection_date: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  payment_status: string | null;
  created_at: string;
}

interface ReturnItem {
  id: number;
  order_id: number;
  amount: number;
  quantity: number;
  date: string;
  created_at: string | null;
}

interface CustomerData {
  id: number;
  customer_id: string;
  customer_name: string;
  mobile: string;
  email: string | null;
  nid: string | null;
  address_details: string | null;
  previous_due_amount: number;
  created_at: string;
  kpi: {
    total_orders: number;
    total_order_amount: number;
    total_paid_amount: number;
    total_order_due: number;
    current_due: number;
  };
  orders: OrderItem[];
  customer_payment_details: PaymentItem[];
  product_returns: ReturnItem[];
  party_ledger_entries?: LedgerItem[];
}

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "payments" | "returns" | "ledger">("orders");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Collect Due Modal State
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split("T")[0]);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchCustomerProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setCustomer(data.data);
      } else {
        toast.error(data.message || "Customer not found");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load customer profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerProfile();
  }, [id]);

  const handleOpenCollectModal = () => {
    setPayAmount("");
    setDiscountAmount("");
    setPaymentMethod("Cash");
    setTransactionId("");
    setCollectionDate(new Date().toISOString().split("T")[0]);
    setIsCollectModalOpen(true);
  };

  const handleCollectDue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const paidNum = parseFloat(payAmount || "0");
    const discNum = parseFloat(discountAmount || "0");

    if (paidNum <= 0 && discNum <= 0) {
      toast.error("Please enter a valid paid or discount amount");
      return;
    }

    try {
      setSubmittingPayment(true);
      const res = await fetch("/api/customers/due-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id,
          paid_amount: paidNum,
          discount_amount: discNum,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          due_collection_date: collectionDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success(data.message || "Due collected successfully!");
        setIsCollectModalOpen(false);
        fetchCustomerProfile();
      } else {
        toast.error(data.message || "Failed to collect due");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to process collection");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        <p className="text-xs text-slate-500 font-medium">Loading customer profile...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="text-rose-600 font-bold">Customer profile not found</div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>
    );
  }

  const currentDue = customer.kpi.current_due;
  const numPay = parseFloat(payAmount || "0");
  const numDisc = parseFloat(discountAmount || "0");
  const modalRemainingDue = Math.max(0, currentDue - (numPay + numDisc));

  if (loading && !customer) {

    return <PageSkeleton />;

  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 print:hidden">
      {/* 1. Top Section / Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all shrink-0 cursor-pointer"
            title="Back to Customer List"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight m-0">
                {customer.customer_name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold border border-rose-200 dark:border-rose-900">
                {customer.customer_id}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Customer Ledger, Invoices &amp; Due Management
            </p>
          </div>
        </div>

        {/* Action Buttons: Print Statement & Collect Due */}
        <div className="flex items-center gap-2 self-start md:self-auto print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-[38px] px-3.5 rounded-xl border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Print Customer Statement"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>প্রিন্ট স্টেটমেন্ট</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCollectModal}
            className="h-[38px] px-4 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Collect Due</span>
          </button>
        </div>
      </div>

      {/* 2. Customer Details Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Phone className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile</span>
              <span className="font-bold text-slate-800 dark:text-white font-mono">
                {customer.mobile || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <MapPin className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">ঠিকানা</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {customer.address_details || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Mail className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {customer.email || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Hash className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">NID No</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">
                {customer.nid || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              মোট ইনভয়েস
            </div>
            <div className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {customer.kpi.total_orders}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              মোট বিক্রয় / ক্রয় মূল্য
            </div>
            <div className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
              {formatBdCurrency(customer.kpi.total_order_amount)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            ৳
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              মোট পরিশোধিত টাকা
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatBdCurrency(customer.kpi.total_paid_amount)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            ৳
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Current Due Balance
            </div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">
              {formatBdCurrency(customer.kpi.current_due)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "orders"
              ? "bg-[#166534] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>ইনভয়েস তালিকা ({customer.orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "bg-[#166534] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>বকেয়া আদায় খতিয়ান ({customer.customer_payment_details.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "ledger"
              ? "bg-[#166534] text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>খতিয়ান লেজার ({customer.party_ledger_entries?.length || 0})</span>
        </button>


      </div>

      {/* 5. Tab Content: Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-semibold uppercase tracking-wider whitespace-nowrap">
                  <th className="text-center w-[45px] p-[10px]">ক্র: নং</th>
                  <th className="p-[10px]">ইনভয়েস নং (Invoice No)</th>
                  <th className="p-[10px]">তারিখ (Date)</th>
                  <th className="text-right p-[10px]">মোট টাকা</th>
                  <th className="text-right p-[10px]">পরিশোধিত</th>
                  <th className="text-right p-[10px]">বকেয়া</th>
                  <th className="text-center p-[10px]">স্ট্যাটাস</th>
                  <th className="text-center p-[10px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {customer.orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 font-medium p-[10px]">
                      No invoices found for this customer.
                    </td>
                  </tr>
                ) : (
                  customer.orders.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((o, idx) => (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="text-center font-bold text-slate-400 p-[10px]">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="font-mono font-bold text-slate-800 dark:text-white whitespace-nowrap p-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {o.order_no}
                        </span>
                      </td>
                      <td className="text-slate-600 dark:text-slate-300 whitespace-nowrap p-[10px]">
                        {new Date(o.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="text-right font-bold text-slate-800 dark:text-white p-[10px]">
                        {formatBdCurrency(o.sub_total)}
                      </td>
                      <td className="text-right font-bold text-emerald-600 dark:text-emerald-400 p-[10px]">
                        {formatBdCurrency(o.paid_amount)}
                      </td>
                      <td className="text-right font-black text-rose-600 dark:text-rose-400 p-[10px]">
                        {formatBdCurrency(o.due_amount)}
                      </td>
                      <td className="text-center p-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.due_amount <= 0
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {o.due_amount <= 0 ? "PAID" : "DUE"}
                        </span>
                      </td>
                      <td className="text-center p-[10px]">
                        <Link
                          href={`/invoices/${o.id}`}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[11px] font-bold transition-all inline-block border border-rose-200 dark:border-rose-900/50"
                        >
                          View Bill
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-semibold uppercase tracking-wider whitespace-nowrap">
                  <th className="text-center w-[45px] p-[10px]">ক্র: নং</th>
                  <th className="p-[10px]">আদায়ের তারিখ (Date)</th>
                  <th className="text-right p-[10px]">পূর্বের বকেয়া (Prev Due)</th>
                  <th className="text-right p-[10px]">আদায়কৃত টাকা (Collected ৳)</th>
                  <th className="text-right p-[10px]">Discount</th>
                  <th className="text-right p-[10px]">অবশিষ্ট বকেয়া</th>
                  <th className="text-center p-[10px]">পদ্ধতি (Method)</th>
                  <th className="text-center p-[10px]">ট্রানজেকশন আইডি</th>
                  <th className="text-center p-[10px]">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {customer.customer_payment_details.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 font-medium p-[10px]">
                      No due collection records found for this customer.
                    </td>
                  </tr>
                ) : (
                  customer.customer_payment_details.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p, idx) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="text-center font-bold text-slate-400 p-[10px]">{idx + 1}</td>
                      <td className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap p-[10px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-rose-600" />
                          <span>
                            {p.due_collection_date
                              ? new Date(p.due_collection_date).toLocaleDateString("en-GB")
                              : new Date(p.created_at).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                      </td>
                      <td className="text-right font-medium text-slate-600 dark:text-slate-400 p-[10px]">
                        {formatBdCurrency(p.previous_due_amount)}
                      </td>
                      <td className="text-right font-black text-emerald-600 dark:text-emerald-400 p-[10px]">
                        {formatBdCurrency(p.paid_amount)}
                      </td>
                      <td className="text-right text-amber-600 dark:text-amber-400 p-[10px]">
                        {p.discount_amount > 0 ? formatBdCurrency(p.discount_amount) : "-"}
                      </td>
                      <td className="text-right font-bold text-rose-600 dark:text-rose-400 p-[10px]">
                        {formatBdCurrency(p.due_amount)}
                      </td>
                      <td className="text-center font-medium p-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.payment_method || "Cash"}
                        </span>
                      </td>
                      <td className="text-center font-mono text-[11px] text-slate-500 p-[10px]">
                        {p.transaction_id || "-"}
                      </td>
                      <td className="text-center p-[10px]">
                        <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {p.payment_status || "Received"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "returns" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-semibold uppercase tracking-wider whitespace-nowrap">
                  <th className="text-center w-[45px] p-[10px]">ক্র: নং</th>
                  <th className="p-[10px]">ফেরতের তারিখ</th>
                  <th className="p-[10px]">অর্ডার আইডি (Order ID)</th>
                  <th className="text-center p-[10px]">ফেরত পরিমাণ</th>
                  <th className="text-right p-[10px]">ফেরত / সমন্বয় মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {customer.product_returns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 font-medium p-[10px]">
                      No sales return records found for this customer.
                    </td>
                  </tr>
                ) : (
                  customer.product_returns.map((r, idx) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="text-center font-bold text-slate-400 p-[10px]">{idx + 1}</td>
                      <td className="text-slate-600 dark:text-slate-300 whitespace-nowrap p-[10px]">
                        {r.date}
                      </td>
                      <td className="font-mono font-bold text-slate-800 dark:text-white p-[10px]">
                        #{r.order_id}
                      </td>
                      <td className="text-center font-bold text-slate-800 dark:text-white p-[10px]">
                        {r.quantity} pcs
                      </td>
                      <td className="text-right font-black text-rose-600 dark:text-rose-400 p-[10px]">
                        {formatBdCurrency(r.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-semibold uppercase tracking-wider whitespace-nowrap">
                  <th className="text-center w-[45px] p-[10px]">ক্র: নং</th>
                  <th className="p-[10px]">তারিখ</th>
                  <th className="p-[10px]">ভাউচার / রেফারেন্স নং</th>
                  <th className="p-[10px]">লেনদেনের ধরন</th>
                  <th className="p-[10px]">বিবরণ / নোট</th>
                  <th className="text-right p-[10px]">ডেবিট (৳)</th>
                  <th className="text-right p-[10px]">ক্রেডিট (৳)</th>
                  <th className="text-right p-[10px]">অবশিষ্ট ব্যালেন্স (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {(!customer.party_ledger_entries || customer.party_ledger_entries.length === 0) ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 font-medium p-[10px]">
                      এই কাস্টমারের কোনো লেজার রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  customer.party_ledger_entries.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((ple, idx) => (
                    <tr
                      key={ple.id || idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="text-center font-bold text-slate-400 p-[10px]">{idx + 1}</td>
                      <td className="text-slate-600 dark:text-slate-300 whitespace-nowrap p-[10px]">
                        {ple.date ? new Date(ple.date).toLocaleDateString("en-GB") : "-"}
                      </td>
                      <td className="font-mono font-bold text-slate-800 dark:text-white whitespace-nowrap p-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {ple.reference_no || "-"}
                        </span>
                      </td>
                      <td className="font-bold text-slate-700 dark:text-slate-300 p-[10px]">
                        {ple.reference_no?.startsWith("EXC-") || ple.note?.includes("বিনিময়") ? (
                          <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 inline-flex items-center gap-1">
                            🔄 পণ্য বিনিময় (Exchange)
                          </span>
                        ) : (
                          ple.transaction_type
                        )}
                      </td>
                      <td className="text-slate-500 dark:text-slate-400 max-w-xs truncate p-[10px]">
                        {ple.note || "-"}
                      </td>
                      <td className="text-right font-bold text-rose-600 dark:text-rose-400 p-[10px]">
                        {ple.debit > 0 ? formatBdCurrency(ple.debit) : "-"}
                      </td>
                      <td className="text-right font-bold text-emerald-600 dark:text-emerald-400 p-[10px]">
                        {ple.credit > 0 ? formatBdCurrency(ple.credit) : "-"}
                      </td>
                      <td className="text-right font-black text-slate-900 dark:text-white p-[10px]">
                        {formatBdCurrency(ple.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

            </div>

      {/* PRINT-ONLY STATEMENT SHEET */}
      <div id="customerPrintStatement" className="hidden print:flex flex-col justify-between min-h-[268mm] p-2 text-black bg-white">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start pb-3 border-b-2 border-black">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo1.png" alt="Arafat Poultry & Fisheries" className="h-12 w-auto object-contain" />
              <div>
                <h2 className="text-base font-black text-black leading-tight">আরাফাত পোল্ট্রি অ্যান্ড ফিশারিজ</h2>
                <p className="text-[10px] text-slate-700">গুণগত মানসম্মত পণ্য ও বিশ্বস্ত সেবা | পাইকারি ও খুচরা বিক্রেতা</p>
                <p className="text-[9px] text-slate-600">মোবাইল: 01975-703216, 01715-842083 | ইমেইল: info@arafatpoultry.com</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-[#166534] text-white font-bold text-xs rounded">
                কাস্টমার লেজার স্টেটমেন্ট
              </span>
              <p className="text-[10px] text-slate-600 mt-1">প্রিন্ট তারিখ: {new Date().toLocaleDateString("en-GB")}</p>
            </div>
          </div>

          {/* Details (No banner box) */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-black text-xs my-2">
            <div className="space-y-0.5">
              <div><strong>কাস্টমার:</strong> {customer.customer_name}</div>
              <div><strong>মোবাইল:</strong> {customer.mobile || "N/A"}</div>
              <div><strong>ঠিকানা:</strong> {customer.address_details || "N/A"}</div>
            </div>
            <div className="space-y-0.5 text-right">
              <div><strong>কাস্টমার আইডি:</strong> {customer.customer_id}</div>
              <div><strong>মোট বিক্রয় মূল্য:</strong> {formatBdCurrency(customer.kpi.total_order_amount)}</div>
              <div><strong>মোট পরিশোধ:</strong> {formatBdCurrency(customer.kpi.total_paid_amount)}</div>
              <div className="text-rose-700 font-bold"><strong>বর্তমান মোট বকেয়া:</strong> {formatBdCurrency(customer.kpi.current_due)}</div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-3">
            <table className="w-full text-left border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-black text-center">
                  <th className="border border-black p-1.5 w-10">ক্র: নং</th>
                  <th className="border border-black p-1.5">ইনভয়েস / অর্ডার নং</th>
                  <th className="border border-black p-1.5">তারিখ</th>
                  <th className="border border-black p-1.5 text-right">মোট টাকা (৳)</th>
                  <th className="border border-black p-1.5 text-right">পরিশোধিত (৳)</th>
                  <th className="border border-black p-1.5 text-right">বকেয়া (৳)</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4 border border-black">কোনো অর্ডারের রেকর্ড নেই।</td>
                  </tr>
                ) : (
                  customer.orders.map((o, idx) => (
                    <tr key={o.id} className="border-b border-black">
                      <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-black p-1.5 font-bold font-mono">{o.order_no}</td>
                      <td className="border border-black p-1.5 text-center">{new Date(o.created_at).toLocaleDateString("en-GB")}</td>
                      <td className="border border-black p-1.5 text-right font-mono">{formatBdCurrency(o.sub_total)}</td>
                      <td className="border border-black p-1.5 text-right font-mono text-emerald-800">{formatBdCurrency(o.paid_amount)}</td>
                      <td className="border border-black p-1.5 text-right font-mono text-rose-800 font-bold">{formatBdCurrency(o.due_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-8 break-inside-avoid">
          <div className="flex justify-between items-end text-[11px] font-semibold text-black gap-4 mb-3">
            <div className="w-36 text-center border-t border-dotted border-black pt-1">
              প্রস্তুতকারীর স্বাক্ষর
              
            </div>
            <div className="w-36 text-center border-t border-dotted border-black pt-1">
              যাচাইকারীর স্বাক্ষর
              
            </div>
            <div className="w-36 text-center border-t border-dotted border-black pt-1">
              অনুমোদনকারীর স্বাক্ষর
              
            </div>
          </div>
          <div className="text-center text-[9px] text-slate-500 pt-1 border-t border-slate-300">
            © 2026 ARAFAT POULTRY &amp; FISHERIES | Software By: CodeNext IT
          </div>
        </div>
      </div>

      {/* PRINT-SPECIFIC CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10px !important;
          }
          header, aside, nav, footer, .dashboard-header, [data-sidebar], .no-print {
            display: none !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          #customerPrintStatement {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            min-height: calc(297mm - 20mm) !important;
            width: 100% !important;
          }
          #customerPrintStatement table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          #customerPrintStatement tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* 6. COLLECT DUE MODAL */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white px-5 py-3.5 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white m-0">
                    কাস্টমার বকেয়া আদায়
                  </h3>
                  <p className="text-[11px] text-white/80 m-0">
                    বকেয়া আদায় ও কাস্টমার ব্যালেন্স সমন্বয়
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCollectModalOpen(false)}
                className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCollectDue} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    কাস্টমার
                  </span>
                  <span className="font-bold text-xs text-slate-800 dark:text-white">
                    {customer.customer_name} ({customer.customer_id})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold block">
                    বর্তমান বকেয়া
                  </span>
                  <span className="font-black text-sm text-rose-700 dark:text-rose-400">
                    {formatBdCurrency(currentDue)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    আদায়কৃত টাকা (৳) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="টাকার পরিমাণ লিখুন..."
                    className="w-full h-[42px] px-3 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800/90 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ছাড় / সমন্বয় (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="w-full h-[42px] px-3 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800/90 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <CustomSelect
                    value={paymentMethod}
                    onChange={(val) => setPaymentMethod(val)}
                    options={[
                      { value: "Cash", label: "নগদ (Cash)" },
                      { value: "Bank", label: "ব্যাংক (Bank Transfer)" },
                      { value: "bKash", label: "বিকাশ (bKash)" },
                      { value: "Nagad", label: "নগদ (Nagad)" },
                      { value: "Rocket", label: "রকেট (Rocket)" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ট্রানজেকশন আইডি / নোট
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="ঐচ্ছিক ট্রানজেকশন আইডি..."
                    className="w-full h-[42px] px-3 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800/90 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  আদায়ের তারিখ <span className="text-rose-600">*</span>
                </label>
                <CustomDatePicker
                  value={collectionDate}
                  onChange={(val) => setCollectionDate(val)}
                  placement="auto"
                />
              </div>

              {/* Remaining calculation banner */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>বর্তমান বকেয়া:</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatBdCurrency(currentDue)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>মোট কর্তন (আদায় + ছাড়):</span>
                  <span>- {formatBdCurrency(numPay + numDisc)}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-black pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>অবশিষ্ট কাস্টমার বকেয়া:</span>
                  <span>{formatBdCurrency(modalRemainingDue)}</span>
                </div>
              </div>

              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submittingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>আদায় সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
