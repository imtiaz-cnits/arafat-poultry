"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Egg,
  X,
  Search,
  Home,
  Boxes,
  TrendingUp,
  Loader2,
  Trash2,
  CheckCircle2,
  Eye,
  Pencil,
  Scale,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import {
  useToast,
  Pagination,
  PageSkeleton,
  CustomSelect,
  DeleteConfirmModal,
} from "@/components/ui";

interface LinkedProductInfo {
  id: number;
  product_name: string;
  quantity: number;
  sell_price: number;
  cost_price: number;
  weight_display: string;
  size_group: string;
  unit: string;
}

interface ShedStockItem {
  id: number;
  flock_code: string;
  shed_name: string;
  breed: string;
  current_birds: number;
  current_birds_count?: number;
  initial_chicks_count?: number;
  chick_birds?: number;
  medium_birds?: number;
  adult_birds?: number;
  age_stage?: 1 | 2 | 3;
  age_stage_label?: string;
  avg_weight_display?: string;
  mortality_count?: number;
  age_days?: number;
  age_total_days?: number;
  age_display?: string;
  status: string;
  housing_date?: string;
  linked_product?: LinkedProductInfo | null;
}

export default function StockChickenPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [flocks, setFlocks] = useState<ShedStockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Add Chicken to Product Modal State
  const [isConvertChickenModalOpen, setIsConvertChickenModalOpen] = useState(false);
  const [convertSubmitting, setConvertSubmitting] = useState(false);
  const [selectedChickenFlock, setSelectedChickenFlock] = useState<ShedStockItem | null>(null);
  const [chickenSizeGroup, setChickenSizeGroup] = useState<"LARGE" | "MEDIUM">("LARGE");
  const [chickenUnit, setChickenUnit] = useState<"Pcs" | "Kg">("Pcs");
  const [chickenAmount, setChickenAmount] = useState<string>("50");
  const [chickenWeight, setChickenWeight] = useState<string>("");
  const [chickenSellPrice, setChickenSellPrice] = useState<string>("220");
  const [chickenProductName, setChickenProductName] = useState<string>("");

  // View Details & Edit Linked Product Modal State
  const [viewingItem, setViewingItem] = useState<ShedStockItem | null>(null);
  const [isEditingProductInView, setIsEditingProductInView] = useState(false);
  const [savingProductEdit, setSavingProductEdit] = useState(false);
  const [productEditForm, setProductEditForm] = useState({
    product_name: "",
    weight_display: "",
    sell_price: "",
    quantity: "",
    size_group: "LARGE",
  });

  // Delete ONLY from Product Confirm Modal State
  const [productUnlinkItem, setProductUnlinkItem] = useState<ShedStockItem | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/egg/flocks");
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        const normalized: ShedStockItem[] = json.data
          .map((f: any) => ({
            ...f,
            current_birds: Number(f.current_birds ?? f.current_birds_count ?? 0),
            initial_chicks_count: Number(f.initial_chicks_count ?? 0),
          }))
          // Strict Rule: বাচ্চা মুরগি থাকবে না — Only Stage 2 (মাঝারি: 45-119d) & Stage 3 (বড় মুরগি: 120d+)
          .filter((f: ShedStockItem) => (f.age_total_days ?? 0) >= 45);

        setFlocks(normalized);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("মুরগির স্টক ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenConvertChickenModal = (item: ShedStockItem) => {
    setSelectedChickenFlock(item);
    const totalDays = item.age_total_days ?? 0;
    const defaultSize: "LARGE" | "MEDIUM" = totalDays >= 120 ? "LARGE" : "MEDIUM";
    setChickenSizeGroup(defaultSize);
    setChickenUnit("Pcs");
    const count = Number(item.current_birds ?? item.current_birds_count ?? 0);
    setChickenAmount(String(item.linked_product ? item.linked_product.quantity : count));
    setChickenWeight(item.linked_product?.weight_display || item.avg_weight_display || "");
    setChickenSellPrice(
      item.linked_product?.sell_price
        ? String(item.linked_product.sell_price)
        : defaultSize === "LARGE"
        ? "250"
        : "190"
    );
    setChickenProductName(
      item.linked_product?.product_name ||
        `${defaultSize === "LARGE" ? "বড় মুরগি" : "মাঝারি মুরগি"} - ${item.breed} (${item.shed_name})`
    );
    setIsConvertChickenModalOpen(true);
  };

  const handleChickenSizeChange = (size: "LARGE" | "MEDIUM") => {
    setChickenSizeGroup(size);
    if (!selectedChickenFlock) return;
    if (size === "LARGE") {
      setChickenSellPrice("250");
      setChickenProductName(`বড় মুরগি - ${selectedChickenFlock.breed} (${selectedChickenFlock.shed_name})`);
    } else {
      setChickenSellPrice("190");
      setChickenProductName(`মাঝারি মুরগি - ${selectedChickenFlock.breed} (${selectedChickenFlock.shed_name})`);
    }
  };

  const handleConvertChickenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChickenFlock) return;
    const amountNum = parseFloat(chickenAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error("সঠিক মুরগির সংখ্যা প্রদান করুন", "সতর্কতা");
      return;
    }
    if (amountNum > selectedChickenFlock.current_birds) {
      toast.error(
        `শেডে বর্তমান মুরগি আছে ${selectedChickenFlock.current_birds} টি, এর বেশি দেওয়া যাবে না!`,
        "সতর্কতা"
      );
      return;
    }

    try {
      setConvertSubmitting(true);
      const res = await fetch("/api/stock/convert-to-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CHICKEN",
          source_id: selectedChickenFlock.id,
          product_name: chickenProductName.trim(),
          quantity: amountNum,
          unit: chickenUnit,
          sell_price: parseFloat(chickenSellPrice) || 0,
          cost_price: 0,
          metadata: {
            shed_name: selectedChickenFlock.shed_name,
            breed: selectedChickenFlock.breed,
            size_group: chickenSizeGroup,
            weight: chickenWeight.trim() || selectedChickenFlock.avg_weight_display,
            replace_qty: Boolean(selectedChickenFlock.linked_product),
          },
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.status === "success") {
        toast.success("মুরগি সফলভাবে প্রোডাক্টে যুক্ত করা হয়েছে!", "সফল");
        setIsConvertChickenModalOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "প্রোডাক্টে যুক্ত করা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে", "ত্রুটি");
    } finally {
      setConvertSubmitting(false);
    }
  };

  // Open View Modal (with inline Product Edit capability)
  const handleOpenViewModal = (item: ShedStockItem) => {
    setViewingItem(item);
    setIsEditingProductInView(false);
    if (item.linked_product) {
      setProductEditForm({
        product_name: item.linked_product.product_name || "",
        weight_display: item.linked_product.weight_display || item.avg_weight_display || "",
        sell_price: String(item.linked_product.sell_price || 0),
        quantity: String(item.linked_product.quantity || 0),
        size_group: item.linked_product.size_group || ((item.age_total_days ?? 0) >= 120 ? "LARGE" : "MEDIUM"),
      });
    }
  };

  const handleSaveProductFromViewModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingItem?.linked_product) return;

    const nextQty = parseFloat(productEditForm.quantity) || 0;
    if (nextQty < 0 || nextQty > viewingItem.current_birds) {
      toast.error(
        `প্রোডাক্টের সংখ্যা ০ থেকে ${viewingItem.current_birds} টির মধ্যে হতে হবে!`,
        "সতর্কতা"
      );
      return;
    }

    try {
      setSavingProductEdit(true);
      const res = await fetch(`/api/products/${viewingItem.linked_product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productEditForm.product_name.trim(),
          door_side: productEditForm.weight_display.trim(),
          sell_price: parseFloat(productEditForm.sell_price) || 0,
          quantity: nextQty,
          grade: productEditForm.size_group,
          surface_finish: `FLOCK:${viewingItem.id}`,
          img_url:
            productEditForm.size_group === "MEDIUM"
              ? "/images/products/chicken-medium.svg"
              : "/images/products/chicken-large.svg",
        }),
      });

      const json = await res.json();
      if (res.ok && json.status === "success") {
        toast.success("প্রোডাক্টের তথ্য সফলভাবে আপডেট করা হয়েছে!", "সফল");
        setIsEditingProductInView(false);
        setViewingItem(null);
        await loadData();
      } else {
        toast.error(json.message || "আপডেট ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSavingProductEdit(false);
    }
  };

  // Confirm Delete ONLY from Product (keeps shed & flock intact)
  const confirmRemoveFromProduct = async () => {
    if (!productUnlinkItem?.linked_product) return;
    try {
      setIsUnlinking(true);
      const res = await fetch(
        `/api/products/${productUnlinkItem.linked_product.id}?unlink_only=1`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (res.ok && json.status === "success") {
        toast.success("শুধুমাত্র প্রোডাক্ট তালিকা হতে মুরগি মুছে ফেলা হয়েছে!", "সফল");
        setProductUnlinkItem(null);
        await loadData();
      } else {
        toast.error(json.message || "প্রোডাক্ট হতে মুছে ফেলা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setIsUnlinking(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return flocks;
    const term = searchTerm.toLowerCase();
    return flocks.filter(
      (f) =>
        f.shed_name.toLowerCase().includes(term) ||
        f.flock_code.toLowerCase().includes(term) ||
        f.breed.toLowerCase().includes(term)
    );
  }, [flocks, searchTerm]);

  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Aggregate stats (Strictly Adult & Medium only — No Chicks)
  let totalStockBirds = 0;
  let adultCount = 0;
  let growerCount = 0;

  flocks.forEach((f) => {
    const count = f.current_birds || 0;
    const totalDays = f.age_total_days ?? 0;
    if (totalDays >= 120) {
      adultCount += count;
      totalStockBirds += count;
    } else if (totalDays >= 45) {
      growerCount += count;
      totalStockBirds += count;
    }
  });

  if (loading && flocks.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* 1. Page Header (No Add Button per requirement) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Home className="w-6 h-6 text-[#166534]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              শেডভিত্তিক মুরগির স্টক (Shed-wise Poultry Stock)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              মুরগির হিসাব হতে প্রাপ্ত বিক্রয়যোগ্য বড় মুরগি ও মাঝারি মুরগির শেডভিত্তিক লাইভ স্টক ও প্রোডাক্ট সংযোগ
            </p>
          </div>
        </div>
      </div>

      {/* 2. Three KPI Cards (No Chicks KPI Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Total Sellable Birds */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>সর্বমোট মুরগি স্টক</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-[#166534] dark:text-emerald-400 mt-1">
            {totalStockBirds.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">সকল শেডের বড় ও মাঝারি মুরগির মোট সংখ্যা</div>
        </div>

        {/* Adult Birds */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>বড় মুরগি (Adult Layers)</span>
            <Egg className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {adultCount.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">প্রাপ্তবয়স্ক বড় মুরগি (১২০+ দিন / ৪+ মাস)</div>
        </div>

        {/* Medium Birds / Growers */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মাঝারি মুরগি (Growers)</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-1">
            {growerCount.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">বর্ধনশীল মাঝারি মুরগি (৪৫ দিন - ১১৯ দিন)</div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="শেডের নাম, ব্যাচ কোড বা জাত দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          বিক্রয়যোগ্য শেড সংখ্যা:{" "}
          <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{filtered.length} টি</strong>
        </div>
      </div>

      {/* 4. Shed Stock Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="text-center w-12 p-[10px]">ক্র: নং</th>
                <th className="p-[10px]">শেডের নাম ও কোড</th>
                <th className="p-[10px]">মুরগির জাত</th>
                <th className="text-center p-[10px]">বড় মুরগি</th>
                <th className="text-center p-[10px]">মাঝারি মুরগি</th>
                <th className="text-center p-[10px]">ওজন</th>
                <th className="text-center p-[10px]">শেডে বর্তমান মোট</th>
                <th className="text-center p-[10px]">বয়স</th>
                <th className="text-center p-[10px]">স্ট্যাটাস</th>
                <th className="text-center w-44 p-[10px]">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center text-slate-400 p-[10px] py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>শেডের স্টক ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-slate-400 font-bold p-[10px] py-10">
                    বর্তমানে কোনো মাঝারি বা বড় মুরগির শেড স্টকে নেই।
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => {
                  const totalDays = item.age_total_days ?? 0;
                  const isAdult = totalDays >= 120;
                  const isGrower = totalDays >= 45 && totalDays < 120;

                  const adultBirds = item.adult_birds ?? (isAdult ? item.current_birds : 0);
                  const growerBirds = item.medium_birds ?? (isGrower ? item.current_birds : 0);
                  const weightDisplay =
                    item.linked_product?.weight_display || item.avg_weight_display || "—";
                  const hasProduct = Boolean(item.linked_product);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="text-center font-bold text-slate-400 p-[10px]">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="p-[10px]">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{item.shed_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.flock_code} &bull; আগমন: {item.housing_date || "—"}
                        </div>
                      </td>
                      <td className="font-semibold text-slate-800 dark:text-slate-200 p-[10px]">
                        <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                          {item.breed}
                        </span>
                      </td>
                      <td className="text-center font-bold text-orange-600 dark:text-orange-400 p-[10px] whitespace-nowrap">
                        {adultBirds > 0 ? `${adultBirds.toLocaleString("en-US")} টি` : "0"}
                      </td>
                      <td className="text-center font-bold text-sky-700 dark:text-sky-400 p-[10px] whitespace-nowrap">
                        {growerBirds > 0 ? `${growerBirds.toLocaleString("en-US")} টি` : "0"}
                      </td>
                      <td className="text-center font-bold text-slate-700 dark:text-slate-300 p-[10px] whitespace-nowrap">
                        {weightDisplay}
                      </td>
                      <td className="text-center font-black text-emerald-700 dark:text-emerald-400 text-sm p-[10px] whitespace-nowrap">
                        {Number(item.current_birds ?? item.current_birds_count ?? 0).toLocaleString("en-US")} টি
                      </td>
                      <td className="text-center font-bold text-slate-700 dark:text-slate-300 p-[10px] whitespace-nowrap">
                        {item.age_display || `${totalDays} দিন`}
                      </td>
                      <td className="text-center p-[10px]">
                        {hasProduct ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>প্রোডাক্টে যুক্ত</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              ({item.linked_product?.quantity} পিস • ৳{item.linked_product?.sell_price})
                            </span>
                          </div>
                        ) : (
                          <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {item.status || "ACTIVE"}
                          </span>
                        )}
                      </td>
                      <td className="text-center p-[10px]">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details & Edit Product Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenViewModal(item)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="বিস্তারিত দেখুন ও প্রোডাক্ট সম্পাদনা করুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button: ONLY shown when added to Product (deletes ONLY from Product) */}
                          {hasProduct && (
                            <button
                              type="button"
                              onClick={() => setProductUnlinkItem(item)}
                              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center transition-colors cursor-pointer"
                              title="শুধুমাত্র প্রোডাক্ট হতে মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Add to Product Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenConvertChickenModal(item)}
                            className="h-[28px] px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                            title="বিক্রয়যোগ্য পণ্য হিসেবে প্রোডাক্ট ইনভেন্টরিতে যোগ করুন"
                          >
                            <Boxes className="w-3 h-3" />
                            <span>{hasProduct ? "প্রোডাক্ট আপডেট" : "প্রোডাক্টে যোগ"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-2.5 p-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <span>শেডের স্টক ডাটা লোড হচ্ছে...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              বর্তমানে কোনো মাঝারি বা বড় মুরগির শেড স্টকে নেই।
            </div>
          ) : (
            displayedItems.map((item) => {
              const totalDays = item.age_total_days ?? 0;
              const isAdult = totalDays >= 120;
              const isGrower = totalDays >= 45 && totalDays < 120;
              const adultBirds = item.adult_birds ?? (isAdult ? item.current_birds : 0);
              const growerBirds = item.medium_birds ?? (isGrower ? item.current_birds : 0);
              const weightDisplay =
                item.linked_product?.weight_display || item.avg_weight_display || "—";
              const hasProduct = Boolean(item.linked_product);

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{item.shed_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.flock_code} • {item.breed}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenViewModal(item)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center cursor-pointer"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {hasProduct && (
                        <button
                          type="button"
                          onClick={() => setProductUnlinkItem(item)}
                          className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center cursor-pointer"
                          title="প্রোডাক্ট হতে মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenConvertChickenModal(item)}
                        className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer"
                        title="প্রোডাক্টে যোগ"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">বড় মুরগি</span>
                      <span className="font-bold text-orange-600">
                        {adultBirds > 0 ? `${adultBirds} টি` : "0"}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">মাঝারি মুরগি</span>
                      <span className="font-bold text-sky-700">
                        {growerBirds > 0 ? `${growerBirds} টি` : "0"}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">ওজন</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {weightDisplay}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span>
                      শেডে মোট: <strong className="text-emerald-700">{item.current_birds} টি</strong> • বয়স:{" "}
                      <strong>{item.age_display}</strong>
                    </span>
                    {hasProduct ? (
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[10px]">
                        প্রোডাক্টে যুক্ত ({item.linked_product?.quantity})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[20, 50, 100, 200, 500]}
        />
      </div>

      {/* MODAL 1: ADD / UPDATE CHICKEN STOCK TO PRODUCT */}
      {isConvertChickenModalOpen && selectedChickenFlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white">
                    মুরগি বিক্রয়যোগ্য প্রোডাক্টে যোগ (Add Chicken to Product)
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-normal">
                    শেড স্টক হতে মুরগি বিক্রয়যোগ্য পণ্য হিসেবে যুক্ত করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertChickenModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConvertChickenSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">উৎস শেড ও জাত:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {selectedChickenFlock.shed_name} ({selectedChickenFlock.breed})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">শেডে বর্তমান মোট মুরগি:</span>
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                      {selectedChickenFlock.current_birds} টি
                    </span>
                  </div>
                </div>

                {/* Size / Group Selector: Strictly LARGE and MEDIUM only (No Chicks) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    মুরগির সাইজ ও ক্যাটাগরি <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleChickenSizeChange("LARGE")}
                      className={`h-[42px] px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        chickenSizeGroup === "LARGE"
                          ? "bg-orange-50 dark:bg-orange-950/50 border-orange-500 text-orange-800 dark:text-orange-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      বড় মুরগি (Adult)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChickenSizeChange("MEDIUM")}
                      className={`h-[42px] px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        chickenSizeGroup === "MEDIUM"
                          ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-800 dark:text-sky-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      মাঝারি মুরগি (Grower)
                    </button>
                  </div>
                </div>

                {/* Unit, Quantity & Weight */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বিক্রয় একক <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={[
                        { value: "Pcs", label: "পিস (টি)" },
                        { value: "Kg", label: "কেজি (Kg)" },
                      ]}
                      value={chickenUnit}
                      onChange={(v) => setChickenUnit(v as "Pcs" | "Kg")}
                      placeholder="একক"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      সংখ্যা (সর্বোচ্চ {selectedChickenFlock.current_birds}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max={selectedChickenFlock.current_birds}
                      value={chickenAmount}
                      onChange={(e) => setChickenAmount(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      গড় ওজন
                    </label>
                    <input
                      type="text"
                      value={chickenWeight}
                      onChange={(e) => setChickenWeight(e.target.value)}
                      placeholder="যেমন: ১.৬৫ কেজি"
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                {/* Selling Price & Product Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      বিক্রয় মূল্য (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={chickenSellPrice}
                      onChange={(e) => setChickenSellPrice(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-emerald-700 dark:text-emerald-400 font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      পণ্যের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={chickenProductName}
                      onChange={(e) => setChickenProductName(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsConvertChickenModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={convertSubmitting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {convertSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>প্রোডাক্টে সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW DETAILS & INLINE EDIT PRODUCT MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-[#cbd5e1] dark:border-[#334155] w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm m-0 text-white">
                  মুরগির স্টক ও প্রোডাক্ট বিস্তারিত তথ্য (Stock &amp; Product Details)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewingItem(null);
                  setIsEditingProductInView(false);
                }}
                className="w-7 h-7 rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Shed & Stock Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-[#1e293b] p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block">শেডের নাম</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-xs">
                    {viewingItem.shed_name}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ব্যাচ কোড</span>
                  <strong className="font-mono text-slate-700 dark:text-slate-200">
                    {viewingItem.flock_code}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">মুরগির জাত</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {viewingItem.breed}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">বয়স ও ধাপ</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {viewingItem.age_display} ({viewingItem.age_stage_label})
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">বড় / মাঝারি মুরগি</span>
                  <strong className="text-orange-600 dark:text-orange-400">
                    {(viewingItem.age_total_days ?? 0) >= 120
                      ? `বড় মুরগি: ${viewingItem.current_birds} টি`
                      : `মাঝারি মুরগি: ${viewingItem.current_birds} টি`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">গড় ওজন</span>
                  <strong className="text-slate-900 dark:text-white flex items-center gap-1">
                    <Scale className="w-3 h-3 text-emerald-600" />
                    {viewingItem.linked_product?.weight_display || viewingItem.avg_weight_display}
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">শেডে বর্তমান মোট জীবন্ত মুরগি:</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {viewingItem.current_birds.toLocaleString("en-US")} টি
                  </span>
                </div>
              </div>

              {/* Linked Product Details & Inline Edit */}
              {viewingItem.linked_product ? (
                <div className="rounded-xl border border-sky-200 dark:border-sky-800/70 bg-sky-50/40 dark:bg-sky-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-sky-200/70 dark:border-sky-800/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      <span className="font-bold text-sky-900 dark:text-sky-300 text-xs">
                        সংযুক্ত বিক্রয়যোগ্য প্রোডাক্ট তথ্য (Linked Product)
                      </span>
                    </div>
                    {!isEditingProductInView && (
                      <button
                        type="button"
                        onClick={() => setIsEditingProductInView(true)}
                        className="h-[30px] px-3 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>প্রোডাক্ট এডিট করুন</span>
                      </button>
                    )}
                  </div>

                  {!isEditingProductInView ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 block">প্রোডাক্টের নাম</span>
                        <strong className="text-slate-900 dark:text-white font-bold">
                          {viewingItem.linked_product.product_name}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">বিক্রয় মূল্য (Price)</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                          {formatBdCurrency(viewingItem.linked_product.sell_price)} / পিস
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">প্রোডাক্টে যুক্ত মুরগি</span>
                        <strong className="text-sky-700 dark:text-sky-300 font-black text-sm">
                          {viewingItem.linked_product.quantity} পিস
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">ওজন</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {viewingItem.linked_product.weight_display}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">মোট বিক্রয় মূল্যমান</span>
                        <strong className="text-slate-900 dark:text-white font-bold">
                          {formatBdCurrency(
                            viewingItem.linked_product.quantity * viewingItem.linked_product.sell_price
                          )}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProductFromViewModal} className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">
                          প্রোডাক্টের নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productEditForm.product_name}
                          onChange={(e) =>
                            setProductEditForm({ ...productEditForm, product_name: e.target.value })
                          }
                          className="w-full h-[40px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            ওজন (Weight)
                          </label>
                          <input
                            type="text"
                            value={productEditForm.weight_display}
                            onChange={(e) =>
                              setProductEditForm({ ...productEditForm, weight_display: e.target.value })
                            }
                            className="w-full h-[40px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            বিক্রয় মূল্য (৳) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="1"
                            required
                            value={productEditForm.sell_price}
                            onChange={(e) =>
                              setProductEditForm({ ...productEditForm, sell_price: e.target.value })
                            }
                            className="w-full h-[40px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-black text-emerald-700 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            সংখ্যা (≤{viewingItem.current_birds}) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max={viewingItem.current_birds}
                            required
                            value={productEditForm.quantity}
                            onChange={(e) =>
                              setProductEditForm({ ...productEditForm, quantity: e.target.value })
                            }
                            className="w-full h-[40px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProductInView(false)}
                          className="h-[36px] px-3.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          disabled={savingProductEdit}
                          className="h-[36px] px-4 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {savingProductEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>প্রোডাক্ট আপডেট সংরক্ষণ</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <p className="text-slate-500 font-medium m-0">
                    এই শেডের মুরগি এখনো বিক্রয়যোগ্য প্রোডাক্টে যুক্ত করা হয়নি।
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingItem;
                      setViewingItem(null);
                      handleOpenConvertChickenModal(target);
                    }}
                    className="h-[34px] px-4 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>এখনই প্রোডাক্টে যোগ করুন</span>
                  </button>
                </div>
              )}
            </div>

            <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setViewingItem(null);
                  setIsEditingProductInView(false);
                }}
                className="h-[38px] px-5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE ONLY FROM PRODUCT CONFIRMATION */}
      <DeleteConfirmModal
        isOpen={Boolean(productUnlinkItem)}
        onClose={() => setProductUnlinkItem(null)}
        onConfirm={confirmRemoveFromProduct}
        recordIdentifier={productUnlinkItem?.linked_product?.product_name || productUnlinkItem?.shed_name}
        title="প্রোডাক্ট হতে মুছে ফেলার নিশ্চিতকরণ"
        warningMessage={`আপনি কি নিশ্চিত যে "${productUnlinkItem?.linked_product?.product_name}" শুধুমাত্র প্রোডাক্ট তালিকা হতে মুছে ফেলতে চান? (শেডের মূল মুরগির স্টক অপরিবর্তিত থাকবে)`}
        isLoading={isUnlinking}
      />
    </div>
  );
}
