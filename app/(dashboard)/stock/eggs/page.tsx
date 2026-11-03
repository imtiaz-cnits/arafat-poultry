"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Egg,
  Plus,
  Search,
  Calendar,
  Layers,
  TrendingUp,
  AlertCircle,
  X,
  Loader2,
  Boxes,
  Home,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface EggCollection {
  id: number;
  collection_no: string;
  flock_name: string;
  total_collected: number;
  rejected_breakage: number;
  accepted_quantity: number;
  cost_per_accepted_egg: number;
  date: string;
  grades: Array<{
    grade_name: string;
    pieces: number;
    trays: number;
  }>;
}

interface EggStockData {
  summary: {
    total_collected: number;
    total_accepted: number;
    total_rejected_breakage: number;
    breakage_rate_percent: number;
  };
  flocks: Array<{ id: number; flock_code: string; shed_name: string }>;
  recent_collections: EggCollection[];
  grade_products: Array<{
    id: number;
    product_name: string;
    pieces: number;
    trays: number;
    sell_price: number;
  }>;
}

export default function StockEggsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EggStockData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Collection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFlockId, setSelectedFlockId] = useState<string>("");
  const [totalCollected, setTotalCollected] = useState<string>("1500");
  const [largeCount, setLargeCount] = useState<string>("1000"); // বড় ডিম
  const [smallCount, setSmallCount] = useState<string>("470");  // ছোট ডিম
  const [brokenCount, setBrokenCount] = useState<string>("30"); // ফাটা ও নষ্ট ডিম
  const [collectionDate, setCollectionDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [collectionNote, setCollectionNote] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/egg/collections");
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setData(json.data);
        if (json.data.flocks?.length > 0 && !selectedFlockId) {
          setSelectedFlockId(String(json.data.flocks[0].id));
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("ডিমের স্টক ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Total egg breakdown
  const largeEggProduct = data?.grade_products?.find(
    (p) => p.product_name.toLowerCase().includes("large") || p.product_name.toLowerCase().includes("grade a")
  );
  const smallEggProduct = data?.grade_products?.find(
    (p) => p.product_name.toLowerCase().includes("medium") || p.product_name.toLowerCase().includes("grade b")
  );

  const totalLargeEggs = largeEggProduct?.pieces || 0;
  const totalSmallEggs = smallEggProduct?.pieces || 0;
  const totalBreakage = data?.summary?.total_rejected_breakage || 0;
  const totalAcceptedStock = totalLargeEggs + totalSmallEggs;

  const totalHalis = Math.floor(totalAcceptedStock / 4);
  const totalTrays = Math.floor(totalAcceptedStock / 30);
  const remPieces = totalAcceptedStock % 30;

  // Filtered collections
  const filteredCollections = useMemo(() => {
    if (!data?.recent_collections) return [];
    if (!searchTerm.trim()) return data.recent_collections;
    const term = searchTerm.toLowerCase();
    return data.recent_collections.filter(
      (c) =>
        c.collection_no.toLowerCase().includes(term) ||
        c.flock_name.toLowerCase().includes(term) ||
        c.date.includes(term)
    );
  }, [data?.recent_collections, searchTerm]);

  // Handle Collection Submit
  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tot = Number(totalCollected);
    const lrg = Number(largeCount || 0);
    const sml = Number(smallCount || 0);
    const brk = Number(brokenCount || 0);

    if (!selectedFlockId) {
      toast.error("শেড / ফ্লক নির্বাচন করুন", "ত্রুটি");
      return;
    }

    if (lrg + sml + brk !== tot) {
      toast.error(
        `ডিমের হিসাব মেলেনি! বড় ডিম (${lrg}) + ছোট ডিম (${sml}) + ফাটা/নষ্ট ডিম (${brk}) = ${lrg + sml + brk}, কিন্তু মোট সংগৃহীত ডিম ${tot} টি`,
        "গণনায় অমিল"
      );
      return;
    }

    try {
      setSubmitting(true);
      const gradesPayload: any[] = [];
      if (largeEggProduct && lrg > 0) {
        gradesPayload.push({
          product_id: largeEggProduct.id,
          grade_name: "Grade A (Large)",
          quantity_pieces: lrg,
          tray_capacity: 30,
        });
      }
      if (smallEggProduct && sml > 0) {
        gradesPayload.push({
          product_id: smallEggProduct.id,
          grade_name: "Grade B (Medium)",
          quantity_pieces: sml,
          tray_capacity: 30,
        });
      }

      const res = await fetch("/api/egg/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flock_id: Number(selectedFlockId),
          total_collected: tot,
          rejected_breakage: brk,
          allocated_expenses: 0,
          grades: gradesPayload,
          date: collectionDate,
          note: collectionNote ? `${collectionNote} | নষ্ট/ফাটা: ${brk} টি` : `নষ্ট/ফাটা ডিম: ${brk} টি`,
        }),
      });

      const json = await res.json();
      if (json.status === "success") {
        toast.success("দৈনিক ডিম সংগ্রহ ও স্টক সফলভাবে সংরক্ষিত হয়েছে!", "সফল");
        setIsModalOpen(false);
        loadData();
      } else {
        toast.error(json.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Egg className="w-6 h-6 text-[#166534]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              ডিমের স্টক ও দৈনিক সংগ্রহ (Egg Inventory &amp; Collection)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              দৈনিক কত ডিম সংগ্রহ হলো, বড় ডিম, ছোট ডিম, ফাটা ও নষ্ট ডিমের লাইভ হিসাব
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন ডিম সংগ্রহ</span>
        </button>
      </div>

      {/* 2. Four Main Egg Stock KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Accepted Egg Stock */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মোট বিক্রয়যোগ্য ডিম স্টক</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-[#166534] dark:text-emerald-400 mt-1">
            {totalAcceptedStock.toLocaleString("en-US")} পিস
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalTrays} খাঁচি (ট্রে) + {remPieces} পিস ({totalHalis} হালি)
          </div>
        </div>

        {/* Large Eggs (Grade A) */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>বড় ডিম (Grade A)</span>
            <Egg className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-1">
            {totalLargeEggs.toLocaleString("en-US")} পিস
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {Math.floor(totalLargeEggs / 30)} ট্রে &bull; মূল্য: ৳{largeEggProduct?.sell_price || "11.50"}
          </div>
        </div>

        {/* Small Eggs (Grade B) */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>ছোট ডিম (Grade B)</span>
            <Egg className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalSmallEggs.toLocaleString("en-US")} পিস
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {Math.floor(totalSmallEggs / 30)} ট্রে &bull; মূল্য: ৳{smallEggProduct?.sell_price || "10.50"}
          </div>
        </div>

        {/* Cracked & Spoiled Eggs */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>ফাটা ও নষ্ট ডিম (Breakage)</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalBreakage.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            ভাঙা/নষ্টের হার: {data?.summary?.breakage_rate_percent || 0}%
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="কালেকশন নম্বর, তারিখ বা শেড দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          মোট রেকর্ড: <strong className="text-slate-800 dark:text-white">{filteredCollections.length} টি ভাউচার</strong>
        </div>
      </div>

      {/* 4. Desktop Collections Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="py-3 px-3 text-center w-12">ক্র: নং</th>
                <th className="py-3 px-4">তারিখ ও ভাউচার নং</th>
                <th className="py-3 px-3">শেডের নাম</th>
                <th className="py-3 px-3 text-center">মোট সংগ্রহ</th>
                <th className="py-3 px-3 text-center">বড় ডিম (Grade A)</th>
                <th className="py-3 px-3 text-center">ছোট ডিম (Grade B)</th>
                <th className="py-3 px-3 text-center">ফাটা ও নষ্ট ডিম</th>
                <th className="py-3 px-3 text-center">গৃহীত ভালো ডিম</th>
                <th className="py-3 px-3 text-right">গড় উৎপাদন খরচ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>ডিম সংগ্রহের ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-bold">
                    কোনো ডিম সংগ্রহের তথ্য পাওয়া যায়নি। "+ নতুন ডিম সংগ্রহ" বাটনে ক্লিক করুন।
                  </td>
                </tr>
              ) : (
                filteredCollections.map((col, idx) => {
                  const grpA = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade a"));
                  const grpB = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade b"));

                  return (
                    <tr key={col.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                          {col.date}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {col.collection_no}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {col.flock_name}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-slate-900 dark:text-white text-sm">
                        {col.total_collected.toLocaleString()} টি
                        <div className="text-[10px] text-slate-400 font-normal">
                          {Math.floor(col.total_collected / 30)} খাঁচি + {col.total_collected % 30}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-sky-700 dark:text-sky-400">
                        {grpA ? `${grpA.pieces.toLocaleString()} পিস` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                        {grpB ? `${grpB.pieces.toLocaleString()} পিস` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                        {col.rejected_breakage > 0 ? `${col.rejected_breakage} টি` : "০"}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-emerald-700 dark:text-emerald-400">
                        {col.accepted_quantity.toLocaleString()} পিস
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {col.cost_per_accepted_egg > 0 ? `৳${col.cost_per_accepted_egg.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: COLLECT EGGS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[92vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Egg className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  দৈনিক ডিম সংগ্রহ এন্ট্রি (Daily Egg Collection)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCollectionSubmit} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              {/* Flock / Shed */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  শেড / মুরগির ফ্লক <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={(data?.flocks || []).map((f) => ({
                    value: f.id,
                    label: `${f.shed_name} (${f.flock_code})`,
                  }))}
                  value={selectedFlockId}
                  onChange={(val) => setSelectedFlockId(String(val))}
                  placeholder="শেড নির্বাচন করুন..."
                />
              </div>

              {/* Total Collection and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মোট সংগৃহীত ডিম (পিস) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalCollected}
                    onChange={(e) => setTotalCollected(e.target.value)}
                    className="w-full h-[42px] px-3 text-base bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-emerald-700 font-black focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    সংগ্রহের তারিখ <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={collectionDate}
                    onChange={(d) => setCollectionDate(d)}
                  />
                </div>
              </div>

              {/* Egg Breakdown: Large, Small, Broken */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#1e293b]/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ডিমের সাইজ ও কোয়ালিটি বিভাজন (Breakdown)
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                      বড় ডিম (Grade A)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={largeCount}
                      onChange={(e) => setLargeCount(e.target.value)}
                      className="w-full h-[38px] px-2.5 text-xs bg-white dark:bg-[#0f172a] border border-sky-300 dark:border-sky-800 rounded-xl font-bold text-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                      ছোট ডিম (Grade B)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={smallCount}
                      onChange={(e) => setSmallCount(e.target.value)}
                      className="w-full h-[38px] px-2.5 text-xs bg-white dark:bg-[#0f172a] border border-amber-300 dark:border-amber-800 rounded-xl font-bold text-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                      ফাটা ও নষ্ট ডিম
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={brokenCount}
                      onChange={(e) => setBrokenCount(e.target.value)}
                      className="w-full h-[38px] px-2.5 text-xs bg-white dark:bg-[#0f172a] border border-rose-300 dark:border-rose-800 rounded-xl font-bold text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Verification indicator */}
                <div className="flex items-center justify-between text-[11px] font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>মোট বিভাজন: {Number(largeCount || 0) + Number(smallCount || 0) + Number(brokenCount || 0)} টি</span>
                  {Number(largeCount || 0) + Number(smallCount || 0) + Number(brokenCount || 0) === Number(totalCollected) ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> হিসাব মিলেছে
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">
                      অমিল: {Number(totalCollected) - (Number(largeCount || 0) + Number(smallCount || 0) + Number(brokenCount || 0))} টি
                    </span>
                  )}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  মন্তব্য / নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সকালের সংগ্রহ, ট্রে প্রস্তুত রাখা হয়েছে"
                  value={collectionNote}
                  onChange={(e) => setCollectionNote(e.target.value)}
                  className="w-full h-[40px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>ডিম সংগ্রহ সংরক্ষণ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

