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
  Pencil,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast, Pagination, PageSkeleton, DeleteConfirmModal } from "@/components/ui";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Collection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFlockId, setSelectedFlockId] = useState<string>("");
  const [editingCollection, setEditingCollection] = useState<EggCollection | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<EggCollection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState(false);

  // Add Shed Modal State
  const [isAddShedModalOpen, setIsAddShedModalOpen] = useState(false);
  const [addShedSubmitting, setAddShedSubmitting] = useState(false);
  const [newShedName, setNewShedName] = useState("");
  const [newBreed, setNewBreed] = useState("লেয়ার (ব্রাউন)");
  const [newInitialCount, setNewInitialCount] = useState("1000");
  const [newHousingDate, setNewHousingDate] = useState(new Date().toISOString().split("T")[0]);
  const [newShedNote, setNewShedNote] = useState("");

  const handleOpenNewCollection = () => {
    setEditingCollection(null);
    setTotalCollected("1500");
    setLargeCount("1000");
    setSmallCount("470");
    setBrokenCount("30");
    setCollectionDate(new Date().toISOString().split("T")[0]);
    setCollectionNote("");
    if (data?.flocks?.length && !selectedFlockId) {
      setSelectedFlockId(String(data.flocks[0].id));
    }
    setIsModalOpen(true);
  };

  
  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;
    try {
      setDeletingCollection(true);
      const res = await fetch(`/api/egg/collections?id=${collectionToDelete.id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (res.ok && resData.status === "success") {
        toast.success(resData.message || "ডিম সংগ্রহ রেকর্ড সফলভাবে বাতিল ও স্টক রিভার্স করা হয়েছে!", "সফল");
        setCollectionToDelete(null);
        await loadData();
      } else {
        toast.error(resData.message || "মুছে ফেলা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setDeletingCollection(false);
    }
  };

  // Convert Egg to Product Modal State
  const [isConvertToProductOpen, setIsConvertToProductOpen] = useState(false);
  const [convertSubmitting, setConvertSubmitting] = useState(false);
  const [selectedEggCollection, setSelectedEggCollection] = useState<EggCollection | null>(null);
  const [convertEggType, setConvertEggType] = useState<"LARGE" | "SMALL" | "BROKEN">("LARGE");
  const [convertUnit, setConvertUnit] = useState<"Pcs" | "Hali" | "Khacha">("Pcs");
  const [convertAmount, setConvertAmount] = useState<string>("100");
  const [convertSellPrice, setConvertSellPrice] = useState<string>("12.50");
  const [convertProductName, setConvertProductName] = useState<string>("ফার্মের তাজা লাল ডিম (বড়)");
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


  
  const handleOpenAddShedModal = () => {
    setNewShedName("");
    setNewBreed("লেয়ার (ব্রাউন)");
    setNewInitialCount("1000");
    setNewHousingDate(new Date().toISOString().split("T")[0]);
    setNewShedNote("");
    setIsAddShedModalOpen(true);
  };

  const handleAddShedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShedName.trim()) {
      toast.error("শেডের নাম দিন", "সতর্কতা");
      return;
    }
    try {
      setAddShedSubmitting(true);
      const res = await fetch("/api/egg/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shed_name: newShedName.trim(),
          breed: newBreed.trim() || "লেয়ার (ব্রাউন)",
          initial_chicks_count: Number(newInitialCount) || 1000,
          housing_date: newHousingDate,
          note: newShedNote.trim() || undefined,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.status === "success") {
        toast.success("নতুন শেড সফলভাবে যুক্ত করা হয়েছে!", "সফল");
        try {
          const stored = localStorage.getItem("ap_chicken_sheds");
          const list = stored ? JSON.parse(stored) : [];
          if (!list.includes(newShedName.trim())) {
            list.push(newShedName.trim());
            localStorage.setItem("ap_chicken_sheds", JSON.stringify(list));
          }
        } catch {}
        await loadData();
        if (resData.data?.id) {
          setSelectedFlockId(String(resData.data.id));
        }
        setIsAddShedModalOpen(false);
      } else {
        toast.error(resData.message || "শেড যোগ করা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে", "ত্রুটি");
    } finally {
      setAddShedSubmitting(false);
    }
  };

  const handleOpenCreateCollection = () => {
    setEditingCollection(null);
    if (data?.flocks?.length && data.flocks.length > 0 && !selectedFlockId) {
      setSelectedFlockId(String(data.flocks[0].id));
    }
    setTotalCollected("1500");
    setLargeCount("1000");
    setSmallCount("470");
    setBrokenCount("30");
    setCollectionDate(new Date().toISOString().split("T")[0]);
    setCollectionNote("");
    setIsModalOpen(true);
  };

  const handleOpenEditCollection = (col: EggCollection) => {
    setEditingCollection(col);
    const grpA = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade a"));
    const grpB = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade b"));
    
    const matchingFlock = data?.flocks?.find((f) => f.shed_name === col.flock_name || f.flock_code === col.flock_name);
    if (matchingFlock) {
      setSelectedFlockId(String(matchingFlock.id));
    }
    setTotalCollected(String(col.total_collected));
    setLargeCount(grpA ? String(grpA.pieces) : "0");
    setSmallCount(grpB ? String(grpB.pieces) : "0");
    setBrokenCount(String(col.rejected_breakage || 0));
    setCollectionDate(col.date || new Date().toISOString().split("T")[0]);
    setCollectionNote("");
    setIsModalOpen(true);
  };

  const handleOpenConvertModal = (col: EggCollection) => {
    setSelectedEggCollection(col);
    setConvertEggType("LARGE");
    setConvertUnit("Pcs");
    const grpA = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade a"));
    const defCount = grpA ? String(grpA.pieces) : String(Math.min(100, col.accepted_quantity));
    setConvertAmount(defCount);
    setConvertSellPrice("12.50");
    setConvertProductName(`ফার্মের তাজা লাল ডিম (বড়) - ${col.flock_name}`);
    setIsConvertToProductOpen(true);
  };

  const handleEggTypeChange = (type: "LARGE" | "SMALL" | "BROKEN") => {
    setConvertEggType(type);
    if (!selectedEggCollection) return;
    if (type === "LARGE") {
      const grpA = selectedEggCollection.grades?.find((g) => g.grade_name.toLowerCase().includes("grade a"));
      setConvertAmount(grpA ? String(grpA.pieces) : "100");
      setConvertSellPrice("12.50");
      setConvertProductName(`ফার্মের তাজা লাল ডিম (বড়) - ${selectedEggCollection.flock_name}`);
    } else if (type === "SMALL") {
      const grpB = selectedEggCollection.grades?.find((g) => g.grade_name.toLowerCase().includes("grade b"));
      setConvertAmount(grpB ? String(grpB.pieces) : "50");
      setConvertSellPrice("10.00");
      setConvertProductName(`ফার্মের মাঝারি লাল ডিম (ছোট) - ${selectedEggCollection.flock_name}`);
    } else {
      setConvertAmount(String(selectedEggCollection.rejected_breakage || 10));
      setConvertSellPrice("6.00");
      setConvertProductName(`ফাটা ও ভাঙা ডিম (ডিসকাউন্ট) - ${selectedEggCollection.flock_name}`);
    }
  };

  const handleConvertToProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEggCollection) return;
    const amountNum = parseFloat(convertAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error("সঠিক পরিমাণ প্রদান করুন", "সতর্কতা");
      return;
    }

    try {
      setConvertSubmitting(true);
      const res = await fetch("/api/stock/convert-to-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EGG",
          source_id: selectedEggCollection.id,
          product_name: convertProductName.trim(),
          quantity: amountNum,
          unit: convertUnit,
          sell_price: parseFloat(convertSellPrice) || 0,
          cost_price: selectedEggCollection.cost_per_accepted_egg || 0,
          metadata: {
            flock_name: selectedEggCollection.flock_name,
            egg_type: convertEggType,
          },
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.status === "success") {
        toast.success(resData.message || "ডিম সফলভাবে বিক্রয়যোগ্য পণ্যে রূপান্তর করা হয়েছে!", "সফল");
        setIsConvertToProductOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "পণ্য হিসেবে যোগ করা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে", "ত্রুটি");
    } finally {
      setConvertSubmitting(false);
    }
  };

  // Total egg breakdown & smart product matching
  const largeEggProduct = data?.grade_products?.find(
    (p) =>
      p.product_name.toLowerCase().includes("large") ||
      p.product_name.toLowerCase().includes("grade a") ||
      p.product_name.includes("বড়") ||
      p.product_name.includes("লাল ডিম") ||
      p.product_name.includes("গ্রেড-এ") ||
      p.product_name.includes("গ্রেড এ")
  ) || data?.grade_products?.[0];

  const smallEggProduct = data?.grade_products?.find(
    (p) =>
      p.product_name.toLowerCase().includes("medium") ||
      p.product_name.toLowerCase().includes("grade b") ||
      p.product_name.includes("ছোট") ||
      p.product_name.includes("সাদা ডিম") ||
      p.product_name.includes("গ্রেড-বি") ||
      p.product_name.includes("গ্রেড বি") ||
      p.product_name.includes("হাঁসের ডিম")
  ) || (data?.grade_products && data.grade_products.length > 1 ? data.grade_products.find((p) => p.id !== largeEggProduct?.id) || data.grade_products[1] : largeEggProduct);

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

  const displayedCollections = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCollections.slice(start, start + pageSize);
  }, [filteredCollections, currentPage, pageSize]);

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
      const pLarge = largeEggProduct || data?.grade_products?.[0];
      const pSmall =
        smallEggProduct ||
        (data?.grade_products && data.grade_products.length > 1
          ? data.grade_products.find((p) => p.id !== pLarge?.id) || data.grade_products[1]
          : pLarge);

      if (pLarge && lrg > 0) {
        gradesPayload.push({
          product_id: pLarge.id,
          grade_name: "Grade A (Large)",
          quantity_pieces: lrg,
          tray_capacity: 30,
        });
      }
      if (pSmall && sml > 0) {
        gradesPayload.push({
          product_id: pSmall.id,
          grade_name: "Grade B (Medium)",
          quantity_pieces: sml,
          tray_capacity: 30,
        });
      }

      // Safety fallback: ensure at least one grade allocation if accepted eggs > 0
      if (gradesPayload.length === 0 && tot - brk > 0 && pLarge) {
        gradesPayload.push({
          product_id: pLarge.id,
          grade_name: "Grade A (Standard)",
          quantity_pieces: tot - brk,
          tray_capacity: 30,
        });
      }

      const endpoint = "/api/egg/collections";
      const method = editingCollection ? "PUT" : "POST";
      const payload: any = {
        flock_id: Number(selectedFlockId),
        total_collected: tot,
        rejected_breakage: brk,
        allocated_expenses: 0,
        grades: gradesPayload,
        date: collectionDate,
        note: collectionNote ? `${collectionNote} | নষ্ট/ফাটা: ${brk} টি` : `নষ্ট/ফাটা ডিম: ${brk} টি`,
      };
      if (editingCollection) {
        payload.id = editingCollection.id;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.status === "success") {
        toast.success(editingCollection ? "ডিম সংগ্রহের তথ্য সফলভাবে আপডেট করা হয়েছে!" : "দৈনিক ডিম সংগ্রহ ও স্টক সফলভাবে সংরক্ষিত হয়েছে!", "সফল");
        setIsModalOpen(false);
        setEditingCollection(null);
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

  if (loading && !data) {

    return <PageSkeleton />;

  }

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
          onClick={() => {
            setEditingCollection(null);
            setTotalCollected("1500");
            setLargeCount("1000");
            setSmallCount("470");
            setBrokenCount("30");
            setCollectionDate(new Date().toISOString().split("T")[0]);
            setCollectionNote("");
            setIsModalOpen(true);
          }}
          className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ডিম সংগ্রহ</span>
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
            <span>বড় ডিম</span>
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
            <span>ছোট ডিম</span>
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
        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="text-center w-12 p-[10px]">ক্র: নং</th>
                <th className="p-[10px]">তারিখ ও ভাউচার নং</th>
                <th className="p-[10px]">শেডের নাম</th>
                <th className="text-center p-[10px]">মোট সংগ্রহ</th>
                <th className="text-center p-[10px]">বড় ডিম</th>
                <th className="text-center p-[10px]">ছোট ডিম</th>
                <th className="text-center p-[10px]">ফাটা ও নষ্ট ডিম</th>
                <th className="text-center p-[10px]">গৃহীত ভালো ডিম</th>
                <th className="text-right p-[10px]">গড় উৎপাদন খরচ</th>
                <th className="text-center w-28 p-[10px]">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 p-[10px]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>ডিম সংগ্রহের ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 font-bold p-[10px]">
                    কোনো ডিম সংগ্রহের তথ্য পাওয়া যায়নি। "নতুন ডিম সংগ্রহ" বাটনে ক্লিক করুন।
                  </td>
                </tr>
              ) : (
                displayedCollections.map((col, idx) => {
                  const grpA = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade a"));
                  const grpB = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade b"));

                  return (
                    <tr key={col.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="text-center font-bold text-slate-400 p-[10px]">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="p-[10px]">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                          {col.date}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {col.collection_no}
                        </div>
                      </td>
                      <td className="font-semibold text-slate-800 dark:text-slate-200 p-[10px]">
                        {col.flock_name}
                      </td>
                      <td className="text-center font-black text-slate-900 dark:text-white text-sm p-[10px]">
                        {col.total_collected.toLocaleString()} টি
                        <div className="text-[10px] text-slate-400 font-normal">
                          {Math.floor(col.total_collected / 30)} খাঁচি + {col.total_collected % 30}
                        </div>
                      </td>
                      <td className="text-center font-bold text-sky-700 dark:text-sky-400 p-[10px]">
                        {grpA ? `${grpA.pieces.toLocaleString()} পিস` : "—"}
                      </td>
                      <td className="text-center font-bold text-amber-600 dark:text-amber-400 p-[10px]">
                        {grpB ? `${grpB.pieces.toLocaleString()} পিস` : "—"}
                      </td>
                      <td className="text-center font-bold text-rose-600 dark:text-rose-400 p-[10px]">
                        {col.rejected_breakage > 0 ? `${col.rejected_breakage} টি` : "০"}
                      </td>
                      <td className="text-center font-black text-emerald-700 dark:text-emerald-400 p-[10px]">
                        {col.accepted_quantity.toLocaleString()} পিস
                      </td>
                      <td className="text-right font-semibold text-slate-800 dark:text-slate-200 p-[10px]">
                        {col.cost_per_accepted_egg > 0 ? `৳${col.cost_per_accepted_egg.toFixed(2)}` : "—"}
                      </td>
                      <td className="text-center p-[10px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCollection(col)}
                            className="w-7 h-7 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center transition-colors cursor-pointer"
                            title="সম্পাদন করুন (Edit)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCollectionToDelete(col)}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-800 flex items-center justify-center transition-colors cursor-pointer"
                            title="মুছে ফেলুন (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredCollections.length > 0 && (
              <tfoot className="border-t-2 border-[#166534] bg-emerald-50/70 dark:bg-emerald-950/40 font-bold text-xs">
                <tr>
                  <td className="p-[10px] text-center font-black text-slate-700 dark:text-slate-200">
                    সর্বমোট
                  </td>
                  <td className="p-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {filteredCollections.length} টি ভাউচার
                  </td>
                  <td className="p-[10px] text-slate-400 font-normal text-center">—</td>
                  <td className="p-[10px] text-center font-black text-slate-900 dark:text-white text-sm">
                    {filteredCollections.reduce((s, c) => s + c.total_collected, 0).toLocaleString()} টি
                  </td>
                  <td className="p-[10px] text-center font-black text-sky-700 dark:text-sky-400">
                    {filteredCollections
                      .reduce((s, c) => {
                        const g = c.grades?.find((x) => x.grade_name.toLowerCase().includes("grade a"));
                        return s + (g ? g.pieces : 0);
                      }, 0)
                      .toLocaleString()} পিস
                  </td>
                  <td className="p-[10px] text-center font-black text-amber-600 dark:text-amber-400">
                    {filteredCollections
                      .reduce((s, c) => {
                        const g = c.grades?.find((x) => x.grade_name.toLowerCase().includes("grade b"));
                        return s + (g ? g.pieces : 0);
                      }, 0)
                      .toLocaleString()} পিস
                  </td>
                  <td className="p-[10px] text-center font-black text-rose-600 dark:text-rose-400">
                    {filteredCollections.reduce((s, c) => s + c.rejected_breakage, 0).toLocaleString()} টি
                  </td>
                  <td className="p-[10px] text-center font-black text-emerald-700 dark:text-emerald-400">
                    {filteredCollections.reduce((s, c) => s + c.accepted_quantity, 0).toLocaleString()} পিস
                  </td>
                  <td className="p-[10px] text-right font-black text-slate-800 dark:text-slate-200">
                    {(() => {
                      const acc = filteredCollections.reduce((s, c) => s + c.accepted_quantity, 0);
                      const costSum = filteredCollections.reduce((s, c) => s + (c.cost_per_accepted_egg * c.accepted_quantity), 0);
                      return acc > 0 && costSum > 0 ? `৳${(costSum / acc).toFixed(2)}` : "—";
                    })()}
                  </td>
                  <td className="p-[10px] text-center text-slate-400 font-normal">—</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile View: Compact Box Cards */}
        <div className="md:hidden space-y-2.5 p-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <span>ডিম সংগ্রহের ডাটা লোড হচ্ছে...</span>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              কোনো ডিম সংগ্রহের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            displayedCollections.map((col, idx) => {
              const grpA = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade a"));
              const grpB = col.grades?.find((g) => g.grade_name.toLowerCase().includes("grade b"));

              return (
                <div
                  key={col.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 shadow-2xs"
                >
                  {/* Card Header: Date & Voucher + Shed Name */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                        {col.date}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {col.collection_no}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                        {col.flock_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCollection(col)}
                        className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center cursor-pointer"
                        title="সম্পাদন করুন"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollectionToDelete(col)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Grid Stats: Compact, with ample space for numbers so they never wrap */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">মোট সংগ্রহ</span>
                      <span className="font-black text-slate-900 dark:text-white text-xs whitespace-nowrap">
                        {col.total_collected.toLocaleString()} টি
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {Math.floor(col.total_collected / 30)} খাঁচি + {col.total_collected % 30}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/70">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">গৃহীত ভালো ডিম</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs whitespace-nowrap">
                        {col.accepted_quantity.toLocaleString()} পিস
                      </span>
                      {col.cost_per_accepted_egg > 0 && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          খরচ: ৳{col.cost_per_accepted_egg.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">বড় ও ছোট ডিম</span>
                      <div className="text-[11px] mt-0.5 whitespace-nowrap">
                        <span className="font-bold text-sky-700 dark:text-sky-400">
                          বড়: {grpA ? `${grpA.pieces.toLocaleString()}` : "০"}
                        </span>
                        <span className="text-slate-300 mx-1">|</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          ছোট: {grpB ? `${grpB.pieces.toLocaleString()}` : "০"}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/70">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-bold">নষ্ট ও ভাঙা ডিম</span>
                      <span className="font-black text-rose-600 dark:text-rose-400 text-xs whitespace-nowrap">
                        {col.rejected_breakage > 0 ? `${col.rejected_breakage} টি` : "০ টি"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCollections.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[20, 50, 100, 200, 500]}
        />
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

            <form onSubmit={handleCollectionSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
              {/* Flock / Shed with Plus Button */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  শেড / মুরগির ফ্লক <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
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
                  <button
                    type="button"
                    onClick={handleOpenAddShedModal}
                    className="w-[42px] h-[42px] rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer"
                    title="নতুন শেড / ফ্লক যোগ করুন"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
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
                      বড় ডিম
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
                      ছোট ডিম
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

              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5 z-10">
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

      {/* Add Shed / Flock Modal */}
      {isAddShedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base leading-tight">নতুন শেড / ফ্লক যোগ করুন</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddShedModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddShedSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    শেডের নাম / নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শেড ৪ (লেয়ার)"
                    value={newShedName}
                    onChange={(e) => setNewShedName(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    মুরগির জাত / প্রকার <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: হাই-লাইন ব্রাউন"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">মুরগির সংখ্যা</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="১০০০"
                      value={newInitialCount}
                      onChange={(e) => setNewInitialCount(e.target.value)}
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">আগমনের তারিখ</label>
                    <CustomDatePicker
                      value={newHousingDate}
                      onChange={setNewHousingDate}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">মন্তব্য / বিবরণ</label>
                  <input
                    type="text"
                    placeholder="শেড সংক্রান্ত বিশেষ নোট"
                    value={newShedNote}
                    onChange={(e) => setNewShedNote(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsAddShedModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={addShedSubmitting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {addShedSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>শেড সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Egg Stock to Product Modal */}
      {isConvertToProductOpen && selectedEggCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base leading-tight">ডিম বিক্রয়যোগ্য পণ্যে রূপান্তর / যোগ (Add Egg to Products)</h3>
                  <p className="text-[11px] text-emerald-100 font-normal">স্টক হতে ডিম বিক্রয়যোগ্য পণ্য হিসেবে ইনভেন্টরিতে যুক্ত করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertToProductOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConvertToProductSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
                {/* Source details card */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">উৎস শেড ও সংগ্রহ নং:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {selectedEggCollection.flock_name} ({selectedEggCollection.collection_no})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">মোট সংগৃহীত ভালো ডিম:</span>
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                      {selectedEggCollection.accepted_quantity} পিস
                    </span>
                  </div>
                </div>

                {/* Egg Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    ডিমের প্রকার নির্বাচন করুন <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEggTypeChange("LARGE")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        convertEggType === "LARGE"
                          ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-800 dark:text-sky-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      বড় ডিম (Grade A)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEggTypeChange("SMALL")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        convertEggType === "SMALL"
                          ? "bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      ছোট ডিম (Grade B)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEggTypeChange("BROKEN")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        convertEggType === "BROKEN"
                          ? "bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      ফাটা ও নষ্ট ডিম
                    </button>
                  </div>
                </div>

                {/* Unit & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      বিক্রয় একক <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={[
                        { value: "Pcs", label: "পিস (Piece)" },
                        { value: "Hali", label: "হালি (Hali - ৪ পিস)" },
                        { value: "Khacha", label: "খাঁচা / ট্রে (Tray - ৩০ পিস)" },
                      ]}
                      value={convertUnit}
                      onChange={(v) => setConvertUnit(v as any)}
                      placeholder="একক নির্বাচন করুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      পরিমাণ ({convertUnit === "Pcs" ? "পিস" : convertUnit === "Hali" ? "হালি" : "খাঁচা"}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white font-bold focus:outline-emerald-600"
                    />
                  </div>
                </div>

                {/* Live conversion info */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/70 flex justify-between items-center text-xs">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">স্টক হতে কাটা হবে:</span>
                  <span className="font-mono font-bold text-emerald-950 dark:text-emerald-100">
                    {convertUnit === "Hali" ? (parseFloat(convertAmount) || 0) * 4 : convertUnit === "Khacha" ? (parseFloat(convertAmount) || 0) * 30 : (parseFloat(convertAmount) || 0)} পিস ডিম
                  </span>
                </div>

                {/* Selling Price & Product Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      বিক্রয় মূল্য প্রতি {convertUnit === "Pcs" ? "পিস" : convertUnit === "Hali" ? "হালি" : "খাঁচা"} (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={convertSellPrice}
                      onChange={(e) => setConvertSellPrice(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white font-bold focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      পণ্যের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={convertProductName}
                      onChange={(e) => setConvertProductName(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsConvertToProductOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={convertSubmitting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {convertSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>পণ্য ইনভেন্টরিতে যোগ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Collection Confirm Modal */}
      {collectionToDelete && (
        <DeleteConfirmModal
          isOpen={!!collectionToDelete}
          onClose={() => setCollectionToDelete(null)}
          onConfirm={confirmDeleteCollection}
          title="ডিম সংগ্রহের রেকর্ড মুছে ফেলা"
          warningMessage={`আপনি কি নিশ্চিতভাবে ${collectionToDelete.date}-এর কালেকশন ভাউচার (${collectionToDelete.collection_no}) মুছে ফেলতে চান? এটি মুছে ফেললে ডিমের মজুদ পূর্বের অবস্থায় ফিরিয়ে নেওয়া হবে।`}
          isLoading={deletingCollection}
        />
      )}

    </div>
  );
}

