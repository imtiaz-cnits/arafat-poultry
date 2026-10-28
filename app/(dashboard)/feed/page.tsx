"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  Plus,
  Search,
  Calendar,
  Send,
  RotateCcw,
  Package,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Layers,
  ArrowRightLeft,
  Fish,
  Egg,
  Eye,
  Trash2,
  Printer,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface FeedProduct {
  id: number;
  product_name: string;
  quantity: number;
  cost_price: number;
  bag_weight_kg: number;
  target_type: string;
}

interface InternalIssue {
  id: number;
  issue_no: string;
  product_name?: string;
  destination: string;
  destination_type: string;
  bags: number;
  total_kg: number;
  unit_cost_per_kg: number;
  total_cost: number;
  date: string;
}

interface FeedReport {
  summary: {
    total_purchased_bags: number;
    total_purchased_cost: number;
    total_sold_bags: number;
    total_sales_revenue: number;
    cogs_external_sales: number;
    gross_profit: number;
    total_internally_issued_bags: number;
    total_internally_issued_cost: number;
    expected_inventory_bags: number;
  };
  recent_internal_issues: InternalIssue[];
  feed_products?: FeedProduct[];
}

export default function FeedTradingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FeedReport | null>(null);
  const [activeTab, setActiveTab] = useState<"issues" | "stocks">("issues");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [destinationType, setDestinationType] = useState<"POULTRY_FARM" | "FISH_POND">("FISH_POND");
  const [destinationName, setDestinationName] = useState("");
  const [bags, setBags] = useState<string>("1");
  const [bagWeightKg, setBagWeightKg] = useState<string>("50");
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  // Action Modals State
  const [viewIssue, setViewIssue] = useState<InternalIssue | null>(null);
  const [deleteIssue, setDeleteIssue] = useState<InternalIssue | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/feed/internal-issue");
      const json = await res.json();
      if (json.status === "success") {
        setData(json.data);
      } else {
        toast.error(json.message || "ফিড ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err.message || "নেটওয়ার্ক সমস্যা", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Selected product details for real-time cost calculation
  const selectedProduct = useMemo(() => {
    if (!selectedProductId || !data?.feed_products) return null;
    return data.feed_products.find((p) => p.id === Number(selectedProductId)) || null;
  }, [selectedProductId, data]);

  // Update default bag weight when product changes
  useEffect(() => {
    if (selectedProduct) {
      setBagWeightKg(String(selectedProduct.bag_weight_kg || 50));
    }
  }, [selectedProduct]);

  // Computed issue values
  const computedTotalKg = useMemo(() => {
    const b = parseFloat(bags) || 0;
    const w = parseFloat(bagWeightKg) || 0;
    return b * w;
  }, [bags, bagWeightKg]);

  const computedTotalCost = useMemo(() => {
    const b = parseFloat(bags) || 0;
    const unitCost = selectedProduct?.cost_price || 0;
    return b * unitCost;
  }, [bags, selectedProduct]);

  const handleOpenModal = () => {
    if (data?.feed_products && data.feed_products.length > 0) {
      setSelectedProductId(data.feed_products[0].id);
      setBagWeightKg(String(data.feed_products[0].bag_weight_kg || 50));
    }
    setDestinationType("FISH_POND");
    setDestinationName("");
    setBags("1");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setNote("");
    setIsModalOpen(true);
  };

  const handleOpenModalWithProduct = (p: FeedProduct) => {
    setSelectedProductId(p.id);
    setBagWeightKg(String(p.bag_weight_kg || 50));
    setDestinationType("FISH_POND");
    setDestinationName("");
    setBags("1");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setNote("");
    setIsModalOpen(true);
  };

  const handleDeleteIssue = async () => {
    if (!deleteIssue) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/feed/internal-issue?id=${deleteIssue.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "হস্তান্তর রেকর্ড বাতিল করা হয়েছে", "সফল");
        setDeleteIssue(null);
        loadData();
      } else {
        toast.error(json.message || "বাতিল করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err.message || "নেটওয়ার্ক সমস্যা", "ত্রুটি");
    } finally {
      setDeleting(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("অনুগ্রহ করে ফিড পণ্য নির্বাচন করুন", "সতর্কতা");
      return;
    }
    if (!destinationName.trim()) {
      toast.error("গন্তব্য বা ব্যাচের নাম প্রদান করুন", "সতর্কতা");
      return;
    }
    const b = parseFloat(bags);
    if (!b || b <= 0) {
      toast.error("সঠিক বস্তার সংখ্যা দিন", "সতর্কতা");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/feed/internal-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProductId,
          destination_type: destinationType,
          destination_name: destinationName.trim(),
          bags: b,
          bag_weight_kg: parseFloat(bagWeightKg) || 50,
          date: issueDate,
          note: note.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success("অভ্যন্তরীণ ফিড হস্তান্তর সফলভাবে সম্পন্ন হয়েছে!", "সফল");
        setIsModalOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "হস্তান্তর সম্পন্ন করা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে", "ত্রুটি");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered issues list
  const filteredIssues = useMemo(() => {
    if (!data?.recent_internal_issues) return [];
    if (!searchTerm) return data.recent_internal_issues;
    const lower = searchTerm.toLowerCase();
    return data.recent_internal_issues.filter(
      (iss) =>
        iss.issue_no.toLowerCase().includes(lower) ||
        iss.destination.toLowerCase().includes(lower) ||
        (iss.product_name && iss.product_name.toLowerCase().includes(lower))
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              পোল্ট্রি ও ফিশ ফিড ট্রেডিং (Feed Trading)
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              খাদ্য ক্রয়-বিক্রয়, বস্তা/কেজি রূপান্তর ও খামার/পুকুরে অভ্যন্তরীণ হস্তান্তর
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="h-[38px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>নতুন অভ্যন্তরীণ হস্তান্তর</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Feed Purchases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট খাদ্য ক্রয়</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {data?.summary.total_purchased_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            মোট খরচ: {formatBdCurrency(data?.summary.total_purchased_cost || 0)}
          </div>
        </div>

        {/* Card 2: Commercial Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">বাণিজ্যিক বিক্রয়</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {data?.summary.total_sold_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-sky-600 font-medium">
            মোট বিক্রয় মূল্য: {formatBdCurrency(data?.summary.total_sales_revenue || 0)}
          </div>
        </div>

        {/* Card 3: Internal Transfers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">অভ্যন্তরীণ হস্তান্তর</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {data?.summary.total_internally_issued_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-orange-600 font-medium">
            ব্যয় স্থানান্তরিত: {formatBdCurrency(data?.summary.total_internally_issued_cost || 0)}
          </div>
        </div>

        {/* Card 4: Inventory & Gross Profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">বর্তমান ফিড মজুত</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {data?.summary.expected_inventory_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
            মোট লাভ: <span className="text-emerald-600 font-bold">{formatBdCurrency(data?.summary.gross_profit || 0)}</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("issues")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "issues"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              অভ্যন্তরীণ হস্তান্তর লগ ({data?.recent_internal_issues.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("stocks")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "stocks"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              ফিড তালিকা ও মজুত ({data?.feed_products?.length || 0})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="সার্চ করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-emerald-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tab 1: Internal Issues Table */}
        {activeTab === "issues" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-medium">
                  <th className="py-3 px-4">ইস্যু নম্বর</th>
                  <th className="py-3 px-4">খাদ্যের নাম</th>
                  <th className="py-3 px-4">গন্তব্য / ব্যাচ</th>
                  <th className="py-3 px-4 text-center">বস্তা</th>
                  <th className="py-3 px-4 text-center">মোট কেজি</th>
                  <th className="py-3 px-4 text-right">কেজি প্রতি দর</th>
                  <th className="py-3 px-4 text-right">স্থানান্তরিত ব্যয়</th>
                  <th className="py-3 px-4 text-center">তারিখ</th>
                  <th className="py-3 px-4 text-center w-28">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      ডাটা লোড হচ্ছে...
                    </td>
                  </tr>
                ) : filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      কোনো অভ্যন্তরীণ হস্তান্তরের তথ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                        {iss.issue_no}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {iss.product_name || "ফিড পণ্য"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${iss.destination_type === "FISH_POND"
                              ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                              : "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                            }`}
                        >
                          {iss.destination_type === "FISH_POND" ? (
                            <Fish className="w-3 h-3" />
                          ) : (
                            <Egg className="w-3 h-3" />
                          )}
                          {iss.destination}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">{iss.bags}</td>
                      <td className="py-3 px-4 text-center">{iss.total_kg} kg</td>
                      <td className="py-3 px-4 text-right">৳{iss.unit_cost_per_kg.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {formatBdCurrency(iss.total_cost)}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">{iss.date}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewIssue(iss)}
                            className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center hover:bg-sky-100 transition-colors cursor-pointer"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteIssue(iss)}
                            className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                            title="হস্তান্তর বাতিল করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Feed Products Stocks Table */}
        {activeTab === "stocks" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-medium">
                  <th className="py-3 px-4">খাদ্যের নাম</th>
                  <th className="py-3 px-4 text-center">টার্গেট</th>
                  <th className="py-3 px-4 text-center">বস্তার ওজন (কেজি)</th>
                  <th className="py-3 px-4 text-center">বর্তমান মজুত</th>
                  <th className="py-3 px-4 text-right">ক্রয় দর (বস্তা)</th>
                  <th className="py-3 px-4 text-right">ক্রয় দর (কেজি)</th>
                  <th className="py-3 px-4 text-center w-28">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      ডাটা লোড হচ্ছে...
                    </td>
                  </tr>
                ) : !data?.feed_products || data.feed_products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      কোনো ফিড পণ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  data.feed_products.map((p) => {
                    const costPerKg = p.bag_weight_kg > 0 ? p.cost_price / p.bag_weight_kg : p.cost_price;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{p.product_name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            {p.target_type || "POULTRY"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{p.bag_weight_kg} kg</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-400">
                          {p.quantity} বস্তা ({(p.quantity * p.bag_weight_kg).toFixed(1)} kg)
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatBdCurrency(p.cost_price)}</td>
                        <td className="py-3 px-4 text-right">৳{costPerKg.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenModalWithProduct(p)}
                            className="h-[28px] px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 mx-auto transition-all cursor-pointer shadow-xs"
                            title="খামার বা পুকুরে হস্তান্তর করুন"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>হস্তান্তর</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Internal Feed Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">অভ্যন্তরীণ খাদ্য হস্তান্তর ভাউচার</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleIssueSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  খাদ্য পণ্য নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={
                    data?.feed_products?.map((p) => ({
                      value: p.id,
                      label: p.product_name,
                      subLabel: `মজুত: ${p.quantity} বস্তা | দর: ৳${p.cost_price}`,
                    })) || []
                  }
                  value={selectedProductId || ""}
                  onChange={(v) => setSelectedProductId(Number(v))}
                  placeholder="-- ফিড পণ্য বেছে নিন --"
                />
              </div>

              {/* Destination Type Radio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  গন্তব্যের ধরন (Destination Unit) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDestinationType("FISH_POND")}
                    className={`h-[42px] px-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs transition-all ${destinationType === "FISH_POND"
                        ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    <Fish className="w-4 h-4 text-sky-600" />
                    <span>মৎস্য খামার / পুকুর</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinationType("POULTRY_FARM")}
                    className={`h-[42px] px-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs transition-all ${destinationType === "POULTRY_FARM"
                        ? "bg-orange-50 dark:bg-orange-950/50 border-orange-500 text-orange-700 dark:text-orange-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    <Egg className="w-4 h-4 text-orange-600" />
                    <span>পোল্ট্রি খামার / শেড</span>
                  </button>
                </div>
              </div>

              {/* Destination Name Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  পুকুর বা শেডের সুনির্দিষ্ট নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: পুকুর ১ (পাঙ্গাশ ব্যাচ) অথবা শেড ২ (লেয়ার ব্যাচ)"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  required
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                />
              </div>

              {/* Bags and Bag Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    বস্তা সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="বস্তা সংখ্যা"
                    value={bags}
                    onChange={(e) => setBags(e.target.value)}
                    required
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    প্রতি বস্তার ওজন (কেজি)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="৫০"
                    value={bagWeightKg}
                    onChange={(e) => setBagWeightKg(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">মোট খাদ্য পরিমাণ:</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 font-mono">
                    {computedTotalKg.toFixed(2)} কেজি ({bags} বস্তা × {bagWeightKg} কেজি)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">স্থানান্তরিত মোট ব্যয়:</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 font-mono">
                    {formatBdCurrency(computedTotalCost)}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                  * অভ্যন্তরীণ হস্তান্তরের ফলে কোনো বাহ্যিক বিক্রয় বা কাস্টমার বাকি তৈরি হবে না। ব্যয় সরাসরি সংশ্লিষ্ট
                  খামার ইউনিটে স্থানান্তরিত হবে।
                </p>
              </div>

              {/* Issue Date & Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">তারিখ</label>
                  <CustomDatePicker
                    value={issueDate}
                    onChange={setIssueDate}
                    placeholder="তারিখ নির্বাচন করুন"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">মন্তব্য (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="হস্তান্তরের কারণ/নোট"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>হস্তান্তর নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Issue Voucher Modal */}
      {viewIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">অভ্যন্তরীণ হস্তান্তর ভাউচার</h3>
                  <p className="text-[11px] text-emerald-100 font-mono mt-0.5">{viewIssue.issue_no}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewIssue(null)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">খাদ্যের নাম:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{viewIssue.product_name || "ফিড পণ্য"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">গন্তব্য / প্রাপক:</span>
                  <span className="font-bold px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {viewIssue.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">হস্তান্তরের তারিখ:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{viewIssue.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 block text-[11px]">স্থানান্তরিত বস্তা</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
                    {viewIssue.bags} <span className="text-xs font-normal">বস্তা</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">মোট {viewIssue.total_kg} কেজি</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-bold">স্থানান্তরিত মোট ব্যয়</span>
                  <span className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-1 block">
                    {formatBdCurrency(viewIssue.total_cost)}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ৳{viewIssue.unit_cost_per_kg.toFixed(2)} / কেজি
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="h-[38px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট ভাউচার</span>
              </button>
              <button
                type="button"
                onClick={() => setViewIssue(null)}
                className="h-[38px] px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Issue Confirmation Modal */}
      {deleteIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">হস্তান্তর রেকর্ড বাতিল ও স্টক রিভার্স</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteIssue(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 dark:text-slate-300 space-y-3">
              <p>
                আপনি কি নিশ্চিত যে চালান নম্বর <strong className="font-mono text-rose-600">{deleteIssue.issue_no}</strong>-এর হস্তান্তর বাতিল করতে চান?
              </p>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-medium">
                বাতিল করলে <strong>{deleteIssue.bags} বস্তা ফিড</strong> স্বয়ংক্রিয়ভাবে সেন্ট্রাল ইনভেন্টরি স্টকে ফেরত যোগ হবে এবং সংশ্লিষ্ট খামার/পুকুরের বরাদ্দকৃত ব্যয় সমন্বয় হবে।
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteIssue(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteIssue}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>হ্যাঁ, বাতিল নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
