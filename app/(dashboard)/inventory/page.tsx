"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Boxes,
  SlidersHorizontal,
  Edit2,
  X,
  Loader2,
  Printer,
  RotateCcw,
  Egg,
  Fish,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";
import { Pagination } from "@/components/ui";

interface UnitBreakdown {
  type: "EGG" | "FEED" | "FISH";
  trays?: number;
  dozens?: number;
  halis?: number;
  pieces?: number;
  bags?: number;
  total_kg?: number;
  formatted: string;
}

interface InventoryItem {
  id: number;
  name: string;
  primary_code: string;
  category: string;
  category_id: number | null;
  brand: string;
  unit: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  cost_price: number;
  sell_price: number;
  total_cost_value: number;
  total_retail_value: number;
  stock_status: "In Stock" | "Low Stock" | "Out of Stock";
  unit_breakdown?: UnitBreakdown | null;
}

interface Summary {
  total_products: number;
  total_stock_units: number;
  total_cost_valuation: number;
  total_retail_valuation: number;
  potential_profit: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface OptionItem {
  id: number;
  name?: string;
  category_name?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newQty, setNewQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("ফিজিক্যাল স্টক গণনা ও সমন্বয়");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, catRes, brandRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      const [invData, catData, brandData] = await Promise.all([
        invRes.json(),
        catRes.json(),
        brandRes.json(),
      ]);

      if (invData.status === "success") {
        setItems(invData.data || []);
        setSummary(invData.summary || null);
      }
      if (catData.status === "success") setCategories(catData.data || []);
      if (brandData.status === "success") setBrands(brandData.data || []);
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewQty(String(item.quantity));
    setAdjustReason("ফিজিক্যাল স্টক গণনা ও সমন্বয়");
    setAdjustNote("");
    setAdjustError("");
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const qtyVal = parseFloat(newQty);
    if (isNaN(qtyVal) || qtyVal < 0) {
      setAdjustError("সঠিক ও অঋণাত্মক সংখ্যা প্রদান করুন");
      return;
    }

    try {
      setAdjusting(true);
      setAdjustError("");
      const fullReason = adjustNote ? `${adjustReason} - ${adjustNote}` : adjustReason;
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedItem.id,
          new_quantity: qtyVal,
          reason: fullReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setIsAdjustModalOpen(false);
        loadData();
      } else {
        setAdjustError(data.message || "স্টক সমন্বয় সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setAdjustError(err?.message || "সার্ভার এরর");
    } finally {
      setAdjusting(false);
    }
  };

  // Helper for category display name
  const getCategoryDisplayName = (name: string): string => {
    if (!name) return "";
    const lower = name.toLowerCase();
    if (lower.includes("egg") || lower.includes("ডিম")) return "ডিম (Poultry Eggs)";
    if (lower.includes("fish") || lower.includes("aqua") || lower.includes("মাছ")) return "মাছ ও অ্যাকোয়া (Fisheries)";
    if (lower.includes("feed") || lower.includes("ফিড")) return "পোল্ট্রি ফিড (Poultry Feed)";
    if (lower.includes("chick") || lower.includes("মুরগি") || lower.includes("বাচ্চা")) return "একদিন বয়সী বাচ্চা (DOC Chicks)";
    if (lower.includes("medicine") || lower.includes("ওষুধ")) return "ভেটেরিনারি ওষুধ (Medicine)";
    return name;
  };

  // Filter options
  const categoryOptions = [
    { value: "all", label: "সকল ক্যাটাগরি (All)" },
    ...categories.map((c) => ({
      value: String(c.id),
      label: getCategoryDisplayName(c.category_name || ""),
    })),
  ];

  const brandOptions = [
    { value: "all", label: "সকল ব্র্যান্ড / প্রস্তুতকারক" },
    ...brands.map((b) => ({
      value: String(b.id),
      label: b.name || "N/A",
    })),
  ];

  // Filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && String(item.category_id) !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== "all") {
        const selectedBrandObj = brands.find((b) => String(b.id) === selectedBrand);
        if (selectedBrandObj && item.brand !== selectedBrandObj.name) return false;
      }

      // Stock status filter
      if (statusFilter === "low" && item.stock_status !== "Low Stock") return false;
      if (statusFilter === "out" && item.stock_status !== "Out of Stock") return false;

      // Text Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.primary_code.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchBrand = item.brand.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat && !matchBrand) return false;
      }

      return true;
    });
  }, [items, selectedCategory, selectedBrand, statusFilter, search, brands]);

  // Pagination slice
  const startIndex = (currentPage - 1) * pageSize;
  const displayedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters =
    search !== "" ||
    selectedCategory !== "all" ||
    selectedBrand !== "all" ||
    statusFilter !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header (Screen View) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              কেন্দ্রীয় পণ্য ও উপাদান স্টক (Central Stock)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ডিম, ফিড, মাছ, মুরগির বাচ্চা ও ওষুধের সমন্বিত লাইভ মজুত ও আর্থিক মূল্যায়ন
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          {summary && (
            <>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === "low" ? "all" : "low");
                  setCurrentPage(1);
                }}
                className={`h-[38px] px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === "low"
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40 hover:bg-amber-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>স্বল্প স্টক:</span>
                <span className="font-black">{summary.low_stock_count}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === "out" ? "all" : "out");
                  setCurrentPage(1);
                }}
                className={`h-[38px] px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === "out"
                    ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                    : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100"
                }`}
              >
                <span>স্টক শূন্য:</span>
                <span className="font-black">{summary.out_of_stock_count}</span>
              </button>
            </>
          )}

          {/* Print Stock Sheet Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="h-[38px] px-3.5 rounded-xl border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="স্টক শিট প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>প্রিন্ট শিট</span>
          </button>
        </div>
      </div>

      {/* 2. Valuation KPI Cards (Screen View) */}
      {summary && (
        <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Products */}
          <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>মোট পণ্য সংখ্যা (SKUs)</span>
              <Boxes className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {summary.total_products} <span className="text-xs font-normal">আইটেম</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              মোট ফিজিক্যাল ইউনিট: {summary.total_stock_units.toLocaleString()}
            </div>
          </div>

          {/* Cost Valuation */}
          <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>স্টক ক্রয়মূল্য (Cost Value)</span>
              <DollarSign className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-1">
              {formatBdCurrency(summary.total_cost_valuation)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">মজুত পণ্যে মোট বিনিয়োগ</div>
          </div>

          {/* Retail Valuation */}
          <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>বিক্রয়মূল্য (Retail Value)</span>
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {formatBdCurrency(summary.total_retail_valuation)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">বর্তমান বিক্রয়মূল্য অনুযায়ী</div>
          </div>

          {/* Potential Gross Profit */}
          <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>সম্ভাব্য মুনাফা (Margin)</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
              {formatBdCurrency(summary.potential_profit)}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
              +{summary.total_cost_valuation > 0
                ? ((summary.potential_profit / summary.total_cost_valuation) * 100).toFixed(1)
                : 0}% সম্ভাব্য মার্জিন
            </div>
          </div>
        </div>
      )}

      {/* 3. Controls & Dynamic Filter Bar (Screen View) */}
      <div className="no-print bg-white dark:bg-[#0f172a] p-3 sm:p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] space-y-3">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-3">
          <div className="grid grid-cols-1 md:flex md:flex-wrap items-center gap-2 md:gap-2.5 w-full xl:w-auto flex-1">
            {/* Search Bar */}
            <div className="w-full md:w-64 h-[38px] flex items-center px-3 bg-white dark:bg-slate-800/90 rounded-xl border border-[#cbd5e1] dark:border-[#334155] focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all shadow-xs">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="পণ্য, ক্যাটাগরি বা কোড খুঁজুন..."
                className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-[220px]">
              <CustomSelect
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(String(val));
                  setCurrentPage(1);
                }}
                options={categoryOptions}
                placeholder="সকল ক্যাটাগরি"
                className="[&_button]:!min-h-[38px] [&_button]:!h-[38px] [&_button]:!py-1"
              />
            </div>

            {/* Brand Filter */}
            <div className="w-full md:w-[180px]">
              <CustomSelect
                value={selectedBrand}
                onChange={(val) => {
                  setSelectedBrand(String(val));
                  setCurrentPage(1);
                }}
                options={brandOptions}
                placeholder="সকল ব্র্যান্ড"
                className="[&_button]:!min-h-[38px] [&_button]:!h-[38px] [&_button]:!py-1"
              />
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="ফিল্টার রিসেট করুন"
                className="h-[38px] px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট</span>
              </button>
            )}
          </div>

          {/* Right Side: Page Size */}
          <div className="flex items-center gap-2.5 self-start xl:self-auto shrink-0 w-full md:w-auto">
            <div className="w-[125px]">
              <CustomSelect
                value={String(pageSize)}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                options={[
                  { value: "20", label: "প্রদর্শন: ২০" },
                  { value: "50", label: "প্রদর্শন: ৫০" },
                  { value: "100", label: "প্রদর্শন: ১০০" },
                  { value: "200", label: "প্রদর্শন: ২০০" },
                ]}
                matchTriggerWidth={true}
                minPopoverWidth={125}
                className="[&_button]:!min-h-[38px] [&_button]:!h-[38px] [&_button]:!py-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Desktop Table (Screen View) */}
      <div className="no-print hidden md:block bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="py-3 px-3 text-center w-[50px]">ক্রমিক</th>
                <th className="py-3 px-4">পণ্যের বিবরণ ও কোড</th>
                <th className="py-3 px-3">ক্যাটাগরি ও ব্র্যান্ড</th>
                <th className="py-3 px-3 text-center">বর্তমান লাইভ স্টক</th>
                <th className="py-3 px-3 text-right">ক্রয় দর (৳)</th>
                <th className="py-3 px-3 text-right">বিক্রয় দর (৳)</th>
                <th className="py-3 px-3 text-right">মোট মজুত মূল্য</th>
                <th className="py-3 px-4 text-center w-24">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>স্টক তথ্য লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-bold">
                    কোন পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-bold text-slate-500">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
                        {item.category.includes("Egg") || item.category.includes("ডিম") ? (
                          <Egg className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : item.category.includes("Fish") || item.category.includes("মাছ") ? (
                          <Fish className="w-4 h-4 text-sky-600 shrink-0" />
                        ) : item.category.includes("Feed") || item.category.includes("ফিড") ? (
                          <Boxes className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span>{item.name}</span>
                      </div>
                      {item.primary_code && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {item.primary_code}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">
                        {getCategoryDisplayName(item.category)}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.brand}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-black ${
                          item.available_quantity <= 0
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                            : item.available_quantity <= 10
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        }`}
                      >
                        {item.unit_breakdown ? item.unit_breakdown.formatted : `${item.available_quantity} ${item.unit}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-300">
                      {item.cost_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {item.sell_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-sky-700 dark:text-sky-400">
                      {formatBdCurrency(item.total_cost_value)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenAdjust(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                        title="স্টক সমন্বয় করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>সমন্বয়</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredItems.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[20, 50, 100, 200]}
        />
      </div>

      {/* 5. Mobile Card View (Screen View) */}
      <div className="no-print block md:hidden space-y-2.5">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">স্টক ডাটা লোড হচ্ছে...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">কোন পণ্য পাওয়া যায়নি।</div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs space-y-2"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white text-xs">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {getCategoryDisplayName(item.category)} • {item.brand}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    item.available_quantity <= 0
                      ? "bg-rose-100 text-rose-700"
                      : item.available_quantity <= 10
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.unit_breakdown ? item.unit_breakdown.formatted : `${item.available_quantity} ${item.unit}`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">ক্রয় দর:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ৳{item.cost_price.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">বিক্রয় দর:</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    ৳{item.sell_price.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">মোট মূল্য:</span>
                  <span className="font-bold text-sky-700 dark:text-sky-400">
                    {formatBdCurrency(item.total_cost_value)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenAdjust(item)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>স্টক সমন্বয়</span>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredItems.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[20, 50, 100, 200]}
          />
        </div>
      </div>

      {/* 6. STOCK ADJUSTMENT MODAL (Screen View) */}
      {isAdjustModalOpen && selectedItem && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  স্টক সমন্বয় (Stock Adjustment)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              {adjustError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                  {adjustError}
                </div>
              )}

              {/* Product Info */}
              <div className="bg-slate-50 dark:bg-[#1e293b] p-3 rounded-xl border border-[#cbd5e1] dark:border-[#334155] space-y-1 text-xs">
                <div className="font-bold text-slate-800 dark:text-white text-xs">
                  {selectedItem.name}
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>বর্তমান নিবন্ধিত মজুত:</span>
                  <strong className="font-bold text-emerald-600">
                    {selectedItem.unit_breakdown ? selectedItem.unit_breakdown.formatted : `${selectedItem.quantity} ${selectedItem.unit}`}
                  </strong>
                </div>
              </div>

              {/* New Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  সংশোধিত প্রকৃত ফিজিক্যাল স্টক <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-black text-emerald-600 text-base focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  সমন্বয়ের কারণ
                </label>
                <CustomSelect
                  value={adjustReason}
                  onChange={(val) => setAdjustReason(String(val))}
                  options={[
                    { value: "ফিজিক্যাল স্টক গণনা ও সমন্বয়", label: "ফিজিক্যাল স্টক গণনা ও সমন্বয় (Physical Recount)" },
                    { value: "ভাঙা / অপচয় / নষ্ট ডিম বা মাছ", label: "ভাঙা / অপচয় / নষ্ট ডিম বা মাছ (Damage / Spoilage)" },
                    { value: "অভ্যন্তরীণ খামার ব্যবহার", label: "অভ্যন্তরীণ খামার ব্যবহার (Internal Farm Issue)" },
                    { value: "সরবরাহকারী রিপ্লেসমেন্ট", label: "সরবরাহকারী রিপ্লেসমেন্ট (Supplier Replacement)" },
                    { value: "অন্যান্য সমন্বয়", label: "অন্যান্য সমন্বয় (Other Adjustment)" },
                  ]}
                  placeholder="কারণ নির্বাচন করুন"
                />
              </div>

              {/* Additional Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  মন্তব্য / বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="যেমন: স্টোর ইনস্পেকশনে প্রাপ্ত ফলাফল..."
                  className="w-full h-[38px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  disabled={adjusting}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {adjusting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>স্টক আপডেট সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. DEDICATED PRINT-ONLY REPORT TEMPLATE */}
      <div className="print-only hidden print:block p-0 text-black bg-white">
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-2 mb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Image src="/logo1.png" alt="Arafat Poultry & Fisheries" width={48} height={48} className="object-contain" />
              <div>
                <h1 className="text-base font-black tracking-tight text-slate-900 m-0">আরাফাত পোল্ট্রি অ্যান্ড ফিশারিজ</h1>
                <p className="text-[10px] text-slate-600 m-0">কোয়ালিটি প্রোডাক্টস • বিশ্বস্ত সেবা | কেন্দ্রীয় স্টক অডিট শিট</p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-600">
              <div>প্রিন্টের তারিখ: {new Date().toLocaleDateString("bn-BD")}</div>
              <div>সময়: {new Date().toLocaleTimeString("bn-BD")}</div>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        {summary && (
          <div className="grid grid-cols-4 gap-2 mb-3 text-[10px] border border-slate-300 p-2 rounded">
            <div><strong>মোট পণ্য:</strong> {summary.total_products} টি</div>
            <div><strong>মোট একক:</strong> {summary.total_stock_units.toLocaleString()}</div>
            <div><strong>ক্রয়মূল্য মূল্যায়ন:</strong> {formatBdCurrency(summary.total_cost_valuation)}</div>
            <div><strong>বিক্রয়মূল্য মূল্যায়ন:</strong> {formatBdCurrency(summary.total_retail_valuation)}</div>
          </div>
        )}

        {/* Print Table */}
        <table className="w-full text-left text-[10px] border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 font-bold">
              <th className="p-1 border-r border-slate-400 text-center w-8">ক্র.</th>
              <th className="p-1 border-r border-slate-400">পণ্যের বিবরণ</th>
              <th className="p-1 border-r border-slate-400">ক্যাটাগরি</th>
              <th className="p-1 border-r border-slate-400 text-center">বর্তমান মজুত</th>
              <th className="p-1 border-r border-slate-400 text-right">ক্রয় দর</th>
              <th className="p-1 border-r border-slate-400 text-right">বিক্রয় দর</th>
              <th className="p-1 text-right">মোট মজুত মূল্য</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-300">
                <td className="p-1 border-r border-slate-300 text-center">{idx + 1}</td>
                <td className="p-1 border-r border-slate-300 font-semibold">{item.name}</td>
                <td className="p-1 border-r border-slate-300">{item.category}</td>
                <td className="p-1 border-r border-slate-300 text-center font-bold">
                  {item.unit_breakdown ? item.unit_breakdown.formatted : `${item.available_quantity} ${item.unit}`}
                </td>
                <td className="p-1 border-r border-slate-300 text-right font-mono">৳{item.cost_price.toFixed(2)}</td>
                <td className="p-1 border-r border-slate-300 text-right font-mono">৳{item.sell_price.toFixed(2)}</td>
                <td className="p-1 text-right font-mono font-bold">৳{item.total_cost_value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 3 Signatures Block */}
        <div className="grid grid-cols-3 gap-6 pt-12 text-center text-[10px]">
          <div>
            <div className="border-t border-slate-500 pt-1 font-bold">প্রস্তুতকারীর স্বাক্ষর</div>
          </div>
          <div>
            <div className="border-t border-slate-500 pt-1 font-bold">স্টোর কিপারের স্বাক্ষর</div>
          </div>
          <div>
            <div className="border-t border-slate-500 pt-1 font-bold">অনুমোদনকারীর স্বাক্ষর</div>
          </div>
        </div>
      </div>
    </div>
  );
}
