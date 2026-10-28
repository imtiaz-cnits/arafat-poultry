"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Egg,
  Plus,
  Search,
  Calendar,
  Layers,
  ArrowRightLeft,
  RotateCcw,
  Boxes,
  TrendingUp,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Users,
  Home,
  Tag,
  BadgeAlert,
  Eye,
  Trash2,
  Printer,
  RefreshCw,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface Flock {
  id: number;
  flock_code: string;
  shed_name: string;
  breed: string;
  current_birds: number;
  status: string;
}

interface GradeProduct {
  id: number;
  product_name: string;
  pieces: number;
  dozens: number;
  trays: number;
  cost_price: number;
  sell_price: number;
}

interface EggCollection {
  id: number;
  collection_no: string;
  flock_name: string;
  total_collected: number;
  rejected_breakage: number;
  accepted_quantity: number;
  cost_per_accepted_egg: number;
  allocated_expenses: number;
  date: string;
  grades: Array<{
    grade_name: string;
    pieces: number;
    trays: number;
  }>;
}

interface EggReport {
  summary: {
    total_flocks: number;
    total_birds: number;
    total_collected: number;
    total_accepted: number;
    total_rejected_breakage: number;
    breakage_rate_percent: number;
    total_expenses: number;
    avg_cost_per_accepted_egg: number;
    laying_rate_percent: number;
  };
  flocks: Flock[];
  recent_collections: EggCollection[];
  grade_products: GradeProduct[];
}

export default function EggProductionPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EggReport | null>(null);
  const [activeTab, setActiveTab] = useState<"collections" | "grades" | "flocks">("collections");
  const [searchTerm, setSearchTerm] = useState("");

  // Collection Modal State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [submittingCollection, setSubmittingCollection] = useState(false);
  const [selectedFlockId, setSelectedFlockId] = useState<number | "">("");
  const [totalCollected, setTotalCollected] = useState<string>("850");
  const [rejectedBreakage, setRejectedBreakage] = useState<string>("20");
  const [allocatedExpenses, setAllocatedExpenses] = useState<string>("4150");
  const [collectionDate, setCollectionDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  // Grade Breakdown for Collection
  const [gradeAQuantity, setGradeAQuantity] = useState<string>("500");
  const [gradeBQuantity, setGradeBQuantity] = useState<string>("250");
  const [gradeCQuantity, setGradeCQuantity] = useState<string>("80");
  const [trayCapacity, setTrayCapacity] = useState<number>(30);

  // Regrade Modal State
  const [isRegradeModalOpen, setIsRegradeModalOpen] = useState(false);
  const [submittingRegrade, setSubmittingRegrade] = useState(false);
  const [sourceProductId, setSourceProductId] = useState<number | "">("");
  const [destinationProductId, setDestinationProductId] = useState<number | "">("");
  const [regradePieces, setRegradePieces] = useState<string>("50");

  // New Flock Modal State
  const [isFlockModalOpen, setIsFlockModalOpen] = useState(false);
  const [submittingFlock, setSubmittingFlock] = useState(false);
  const [flockShedName, setFlockShedName] = useState("");
  const [flockBreed, setFlockBreed] = useState("BV-300 Layer");
  const [flockChicksCount, setFlockChicksCount] = useState("1000");

  // Action Modals State
  const [viewCollection, setViewCollection] = useState<EggCollection | null>(null);
  const [deleteCollection, setDeleteCollection] = useState<EggCollection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/egg/collections");
      const json = await res.json();
      if (json.status === "success") {
        setData(json.data);
      } else {
        toast.error(json.message || "ডিম উৎপাদন ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
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

  const handleOpenCollectionForFlock = (flock: Flock) => {
    setSelectedFlockId(flock.id);
    setIsCollectionModalOpen(true);
  };

  const handleOpenRegradeForProduct = (p: GradeProduct) => {
    setSourceProductId(p.id);
    setIsRegradeModalOpen(true);
  };

  const handleDeleteCollection = async () => {
    if (!deleteCollection) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/egg/collections?id=${deleteCollection.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "ডিম সংগ্রহ বাতিল করা হয়েছে", "সফল");
        setDeleteCollection(null);
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

  // Real-time calculations for Collection
  const computedAccepted = useMemo(() => {
    const tot = parseInt(totalCollected) || 0;
    const rej = parseInt(rejectedBreakage) || 0;
    return Math.max(0, tot - rej);
  }, [totalCollected, rejectedBreakage]);

  const computedGradesSum = useMemo(() => {
    const gA = parseInt(gradeAQuantity) || 0;
    const gB = parseInt(gradeBQuantity) || 0;
    const gC = parseInt(gradeCQuantity) || 0;
    return gA + gB + gC;
  }, [gradeAQuantity, gradeBQuantity, gradeCQuantity]);

  const gradesMatchAccepted = computedGradesSum === computedAccepted;

  const computedCostPerEgg = useMemo(() => {
    const exp = parseFloat(allocatedExpenses) || 0;
    return computedAccepted > 0 ? exp / computedAccepted : 0;
  }, [allocatedExpenses, computedAccepted]);

  const handleOpenCollectionModal = () => {
    if (data?.flocks && data.flocks.length > 0) {
      setSelectedFlockId(data.flocks[0].id);
    }
    setTotalCollected("850");
    setRejectedBreakage("20");
    setAllocatedExpenses("4150");
    setGradeAQuantity("500");
    setGradeBQuantity("250");
    setGradeCQuantity("80");
    setTrayCapacity(30);
    setCollectionDate(new Date().toISOString().split("T")[0]);
    setNote("");
    setIsCollectionModalOpen(true);
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlockId) {
      toast.error("অনুগ্রহ করে একটি ফ্লক বা শেড বেছে নিন", "সতর্কতা");
      return;
    }
    if (!gradesMatchAccepted) {
      toast.error(
        `গ্রেডের মোট ডিমের সংখ্যা (${computedGradesSum}) গ্রহণযোগ্য ডিমের (${computedAccepted}) সমান হতে হবে!`,
        "ভুল বণ্টন"
      );
      return;
    }

    // Find grade products
    const gradeAProd = data?.grade_products.find((p) => p.product_name.includes("Grade A") || p.product_name.includes("গ্রেড এ"));
    const gradeBProd = data?.grade_products.find((p) => p.product_name.includes("Grade B") || p.product_name.includes("গ্রেড বি"));
    const gradeCProd = data?.grade_products.find((p) => p.product_name.includes("Grade C") || p.product_name.includes("গ্রেড সি"));

    const gradesPayload: any[] = [];
    if (parseInt(gradeAQuantity) > 0 && gradeAProd) {
      gradesPayload.push({
        product_id: gradeAProd.id,
        grade_name: "Grade A",
        quantity_pieces: parseInt(gradeAQuantity),
        tray_capacity: trayCapacity,
      });
    }
    if (parseInt(gradeBQuantity) > 0 && gradeBProd) {
      gradesPayload.push({
        product_id: gradeBProd.id,
        grade_name: "Grade B",
        quantity_pieces: parseInt(gradeBQuantity),
        tray_capacity: trayCapacity,
      });
    }
    if (parseInt(gradeCQuantity) > 0 && gradeCProd) {
      gradesPayload.push({
        product_id: gradeCProd.id,
        grade_name: "Grade C",
        quantity_pieces: parseInt(gradeCQuantity),
        tray_capacity: trayCapacity,
      });
    }

    if (gradesPayload.length === 0) {
      toast.error("গ্রেড পণ্য ডাটাবেজে কনফিগার করা নেই। অনুগ্রহ করে প্রোডাক্ট তালিকায় গ্রেড এ/বি/সি নিশ্চিত করুন।", "সতর্কতা");
      return;
    }

    try {
      setSubmittingCollection(true);
      const res = await fetch("/api/egg/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flock_id: selectedFlockId,
          total_collected: parseInt(totalCollected),
          rejected_breakage: parseInt(rejectedBreakage),
          allocated_expenses: parseFloat(allocatedExpenses) || 0,
          grades: gradesPayload,
          date: collectionDate,
          note: note.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success("দৈনিক ডিম সংগ্রহ ও গ্রেডিং সফলভাবে সংরক্ষিত হয়েছে!", "সফল");
        setIsCollectionModalOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "সংগ্রহ সংরক্ষণ ব্যর্থ হয়েছে", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSubmittingCollection(false);
    }
  };

  const handleRegradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceProductId || !destinationProductId) {
      toast.error("উৎস ও গন্তব্য গ্রেড নির্বাচন করুন", "সতর্কতা");
      return;
    }
    if (sourceProductId === destinationProductId) {
      toast.error("একই গ্রেডে স্থানান্তর সম্ভব নয়", "সতর্কতা");
      return;
    }

    try {
      setSubmittingRegrade(true);
      const res = await fetch("/api/egg/regrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_product_id: sourceProductId,
          destination_product_id: destinationProductId,
          quantity_pieces: parseInt(regradePieces),
        }),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success("ডিম রিগ্রেডিং সফলভাবে সম্পন্ন হয়েছে!", "সফল");
        setIsRegradeModalOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "রিগ্রেড সম্পন্ন করা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSubmittingRegrade(false);
    }
  };

  const handleFlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockShedName.trim()) {
      toast.error("শেডের নাম দিন", "সতর্কতা");
      return;
    }

    try {
      setSubmittingFlock(true);
      const res = await fetch("/api/egg/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shed_name: flockShedName.trim(),
          breed: flockBreed.trim(),
          initial_chicks_count: parseInt(flockChicksCount) || 0,
        }),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success("নতুন পোল্ট্রি ফ্লক সফলভাবে তৈরি হয়েছে!", "সফল");
        setIsFlockModalOpen(false);
        setFlockShedName("");
        await loadData();
      } else {
        toast.error(resData.message || "ফ্লক তৈরি ব্যর্থ হয়েছে", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSubmittingFlock(false);
    }
  };

  const filteredCollections = useMemo(() => {
    if (!data?.recent_collections) return [];
    if (!searchTerm) return data.recent_collections;
    const lower = searchTerm.toLowerCase();
    return data.recent_collections.filter(
      (c) =>
        c.collection_no.toLowerCase().includes(lower) ||
        c.flock_name.toLowerCase().includes(lower)
    );
  }, [data, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <Egg className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              ডিম উৎপাদন ও গ্রেডিং (Egg Production & Grading)
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              দৈনিক ডিম সংগ্রহ, গ্রেডিং (A/B/C), খাঁচি রূপান্তর ও উৎপাদন ব্যয় বিশ্লেষণ
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFlockModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>নতুন ফ্লক</span>
          </button>

          <button
            onClick={() => setIsRegradeModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>ডিম রিগ্রেডিং</span>
          </button>

          <button
            onClick={handleOpenCollectionModal}
            className="h-[38px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>দৈনিক সংগ্রহ ও গ্রেডিং</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Collected */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট সংগৃহীত ডিম</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Egg className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white font-mono">
            {data?.summary.total_collected || 0} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            প্রায় {((data?.summary.total_collected || 0) / 30).toFixed(1)} খাঁচি (Trays)
          </div>
        </div>

        {/* Card 2: Accepted Sellable Eggs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">বিক্রয়যোগ্য ডিম</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white font-mono">
            {data?.summary.total_accepted || 0} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <div className="mt-1 text-xs text-sky-600 font-medium">
            গ্রেড এ, বি ও সি-তে প্রস্তুত
          </div>
        </div>

        {/* Card 3: Breakage / Rejected */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ভাঙা / অপচয় ডিম</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 font-mono">
            {data?.summary.total_rejected_breakage || 0} <span className="text-xs font-normal text-slate-500">টি</span>
          </div>
          <div className="mt-1 text-xs text-rose-600 font-medium">
            অপচয় হার: {data?.summary.breakage_rate_percent || 0}%
          </div>
        </div>

        {/* Card 4: Cost per Egg */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">গড় উৎপাদন খরচ</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-orange-600 font-mono">
            ৳{(data?.summary.avg_cost_per_accepted_egg || 0).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-500">/ ডিম</span>
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
            প্রতি খাঁচি: ৳{((data?.summary.avg_cost_per_accepted_egg || 0) * 30).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tabs and Data Tables */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("collections")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === "collections"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              দৈনিক সংগ্রহ হিস্ট্রি ({data?.recent_collections.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("grades")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === "grades"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              গ্রেড অনুযায়ী মজুত ({data?.grade_products.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("flocks")}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === "flocks"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              শেড ও ফ্লক সমূহ ({data?.flocks.length || 0})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="সার্চ করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
            />
          </div>
        </div>

        {/* Tab 1: Daily Collections */}
        {activeTab === "collections" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-medium">
                  <th className="py-3 px-4">সংগ্রহ নম্বর</th>
                  <th className="py-3 px-4">ফ্লক / শেড</th>
                  <th className="py-3 px-4 text-center">মোট ডিম</th>
                  <th className="py-3 px-4 text-center">ভাঙা/নষ্ট</th>
                  <th className="py-3 px-4 text-center">গ্রহণযোগ্য</th>
                  <th className="py-3 px-4">গ্রেড বণ্টন</th>
                  <th className="py-3 px-4 text-right">উৎপাদন খরচ/ডিম</th>
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
                ) : filteredCollections.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      কোনো ডিম সংগ্রহের তথ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredCollections.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                        {c.collection_no}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{c.flock_name}</td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white">
                        {c.total_collected}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-rose-600">{c.rejected_breakage}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-400">
                        {c.accepted_quantity}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.grades.map((g, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800"
                            >
                              {g.grade_name}: {g.pieces} ({g.trays} খাঁচি)
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        ৳{c.cost_per_accepted_egg.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">{c.date}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewCollection(c)}
                            className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center hover:bg-sky-100 transition-colors cursor-pointer"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCollection(c)}
                            className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                            title="সংগ্রহ বাতিল করুন"
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

        {/* Tab 2: Grade Stocks */}
        {activeTab === "grades" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-medium">
                  <th className="py-3 px-4">গ্রেড পণ্য</th>
                  <th className="py-3 px-4 text-center">মজুত (পিস)</th>
                  <th className="py-3 px-4 text-center">মজুত (ডজন)</th>
                  <th className="py-3 px-4 text-center">মজুত (খাঁচি - ৩০ পিস)</th>
                  <th className="py-3 px-4 text-right">উৎপাদন খরচ</th>
                  <th className="py-3 px-4 text-right">বিক্রয় দর</th>
                  <th className="py-3 px-4 text-center w-28">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {!data?.grade_products || data.grade_products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      কোনো গ্রেড পণ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  data.grade_products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Egg className="w-4 h-4 text-emerald-600" />
                        <span>{p.product_name}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        {p.pieces} টি
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{p.dozens} ডজন</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-sky-600">{p.trays} খাঁচি</td>
                      <td className="py-3 px-4 text-right font-mono">৳{p.cost_price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        ৳{p.sell_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenRegradeForProduct(p)}
                          className="h-[28px] px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 mx-auto transition-all cursor-pointer shadow-xs"
                          title="গ্রেড রূপান্তর / বাছাই"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>পুনঃগ্রেডিং</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Flocks */}
        {activeTab === "flocks" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-medium">
                  <th className="py-3 px-4">ফ্লক কোড</th>
                  <th className="py-3 px-4">শেডের নাম</th>
                  <th className="py-3 px-4">মুরগির জাত (Breed)</th>
                  <th className="py-3 px-4 text-center">বর্তমান মুরগির সংখ্যা</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center w-28">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {!data?.flocks || data.flocks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      কোনো পোল্ট্রি ফ্লক নেই।
                    </td>
                  </tr>
                ) : (
                  data.flocks.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                        {f.flock_code}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{f.shed_name}</td>
                      <td className="py-3 px-4">{f.breed}</td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900 dark:text-white font-mono">
                        {f.current_birds} টি
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenCollectionForFlock(f)}
                          className="h-[28px] px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 mx-auto transition-all cursor-pointer shadow-xs"
                          title="এই ফ্লক থেকে ডিম সংগ্রহ করুন"
                        >
                          <Egg className="w-3 h-3" />
                          <span>ডিম সংগ্রহ</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collection Modal */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Egg className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">দৈনিক ডিম সংগ্রহ ও গ্রেডিং ভাউচার</h3>
              </div>
              <button
                onClick={() => setIsCollectionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCollectionSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Flock Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  শেড / ফ্লক নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={
                    data?.flocks.map((f) => ({
                      value: f.id,
                      label: `${f.shed_name} (${f.breed})`,
                      subLabel: `${f.current_birds} মুরগি`,
                    })) || []
                  }
                  value={selectedFlockId || ""}
                  onChange={(v) => setSelectedFlockId(Number(v))}
                  placeholder="-- ফ্লক বেছে নিন --"
                />
              </div>

              {/* Collection Counts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    মোট সংগৃহীত ডিম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="850"
                    value={totalCollected}
                    onChange={(e) => setTotalCollected(e.target.value)}
                    required
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    ভাঙা / অপচয় ডিম
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="20"
                    value={rejectedBreakage}
                    onChange={(e) => setRejectedBreakage(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Accepted Quantity Banner */}
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-sky-800 dark:text-sky-300 font-medium">বিক্রয়যোগ্য গ্রহণযোগ্য ডিম:</span>
                <span className="font-bold text-sky-950 dark:text-sky-200 text-sm font-mono">
                  {computedAccepted} টি ({(computedAccepted / trayCapacity).toFixed(1)} খাঁচি)
                </span>
              </div>

              {/* Grade Allocations */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white text-xs">গ্রেড অনুযায়ী বণ্টন</span>
                  <span
                    className={`text-[11px] font-bold ${gradesMatchAccepted ? "text-emerald-600" : "text-rose-600"
                      }`}
                  >
                    বণ্টনকৃত: {computedGradesSum} / {computedAccepted} টি
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">গ্রেড এ (Grade A)</label>
                    <input
                      type="number"
                      min="0"
                      value={gradeAQuantity}
                      onChange={(e) => setGradeAQuantity(e.target.value)}
                      className="w-full h-[38px] px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">গ্রেড বি (Grade B)</label>
                    <input
                      type="number"
                      min="0"
                      value={gradeBQuantity}
                      onChange={(e) => setGradeBQuantity(e.target.value)}
                      className="w-full h-[38px] px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 mb-1">গ্রেড সি (Grade C)</label>
                    <input
                      type="number"
                      min="0"
                      value={gradeCQuantity}
                      onChange={(e) => setGradeCQuantity(e.target.value)}
                      className="w-full h-[38px] px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Expense Allocation & Cost per Egg */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    বরাদ্দকৃত খাদ্য ও খামার ব্যয় (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="4150"
                    value={allocatedExpenses}
                    onChange={(e) => setAllocatedExpenses(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    খাঁচি সাইজ (Tray Size)
                  </label>
                  <CustomSelect
                    options={[
                      { value: 30, label: "৩০ পিসের স্ট্যান্ডার্ড খাঁচি (30 Eggs Tray)" },
                      { value: 24, label: "২৪ পিসের খাঁচি (24 Eggs Tray)" },
                    ]}
                    value={trayCapacity}
                    onChange={(v) => setTrayCapacity(Number(v))}
                  />
                </div>
              </div>

              {/* Real-time Calculated Cost per Egg */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">নির্ধারিত উৎপাদন খরচ:</span>
                <span className="font-bold text-emerald-950 dark:text-emerald-200 font-mono">
                  ৳{computedCostPerEgg.toFixed(2)} / ডিম (৳{(computedCostPerEgg * trayCapacity).toFixed(2)} / খাঁচি)
                </span>
              </div>

              {/* Date & Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">তারিখ</label>
                  <CustomDatePicker
                    value={collectionDate}
                    onChange={setCollectionDate}
                    placeholder="তারিখ নির্বাচন করুন"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">নোট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="মন্তব্য"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingCollection || !gradesMatchAccepted}
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submittingCollection ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>সংগ্রহ নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regrade Modal */}
      {isRegradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-sky-800 to-sky-700 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-sky-200" />
                <h3 className="font-bold text-base">ডিম রিগ্রেডিং (Reclassification)</h3>
              </div>
              <button
                onClick={() => setIsRegradeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegradeSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  উৎস গ্রেড (Source Grade) <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={
                    data?.grade_products.map((p) => ({
                      value: p.id,
                      label: p.product_name,
                      subLabel: `মজুত: ${p.pieces} পিস`,
                    })) || []
                  }
                  value={sourceProductId || ""}
                  onChange={(v) => setSourceProductId(Number(v))}
                  placeholder="-- উৎস গ্রেড বেছে নিন --"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  গন্তব্য গ্রেড (Destination Grade) <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={
                    data?.grade_products.map((p) => ({
                      value: p.id,
                      label: p.product_name,
                      subLabel: `বর্তমান: ${p.pieces} পিস`,
                    })) || []
                  }
                  value={destinationProductId || ""}
                  onChange={(v) => setDestinationProductId(Number(v))}
                  placeholder="-- গন্তব্য গ্রেড বেছে নিন --"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  স্থানান্তরযোগ্য ডিমের সংখ্যা (পিস) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={regradePieces}
                  onChange={(e) => setRegradePieces(e.target.value)}
                  required
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegradeModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingRegrade}
                  className="px-6 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submittingRegrade ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>রিগ্রেড সম্পন্ন করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Flock Modal */}
      {isFlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">নতুন পোল্ট্রি ফ্লক / শেড যোগ</h3>
              </div>
              <button
                onClick={() => setIsFlockModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFlockSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  শেডের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: শেড ১ (লেয়ার ব্যাচ)"
                  value={flockShedName}
                  onChange={(e) => setFlockShedName(e.target.value)}
                  required
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  মুরগির জাত (Breed) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: BV-300 Layer, Novogen White"
                  value={flockBreed}
                  onChange={(e) => setFlockBreed(e.target.value)}
                  required
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  প্রারম্ভিক বাচ্চা সংখ্যা (Chicks Count)
                </label>
                <input
                  type="number"
                  min="0"
                  value={flockChicksCount}
                  onChange={(e) => setFlockChicksCount(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlockModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingFlock}
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submittingFlock ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>ফ্লক সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Collection Details Voucher Modal */}
      {viewCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Egg className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">ডিম সংগ্রহ ভাউচার</h3>
                  <p className="text-[11px] text-emerald-100 font-mono mt-0.5">{viewCollection.collection_no}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewCollection(null)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">ফ্লক / শেড:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{viewCollection.flock_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">সংগ্রহের তারিখ:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{viewCollection.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">উৎপাদন খরচ (প্রতি ডিম):</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    ৳{viewCollection.cost_per_accepted_egg.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block text-[10px]">মোট ডিম</span>
                  <span className="text-base font-black text-slate-800 dark:text-white">{viewCollection.total_collected}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-rose-600 block text-[10px] font-bold">ভাঙা / নষ্ট</span>
                  <span className="text-base font-black text-rose-600">{viewCollection.rejected_breakage}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] font-bold">গ্রহণযোগ্য</span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{viewCollection.accepted_quantity}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">গ্রেড অনুযায়ী খাঁচি ও পিস বণ্টন</h4>
                <div className="space-y-1.5">
                  {viewCollection.grades.map((g, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-200">{g.grade_name}</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        {g.pieces} টি ({g.trays} খাঁচি)
                      </span>
                    </div>
                  ))}
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
                onClick={() => setViewCollection(null)}
                className="h-[38px] px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Collection Confirmation Modal */}
      {deleteCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">ডিম সংগ্রহ রেকর্ড বাতিল ও স্টক রিভার্স</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteCollection(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 dark:text-slate-300 space-y-3">
              <p>
                আপনি কি নিশ্চিত যে ভাউচার নম্বর <strong className="font-mono text-rose-600">{deleteCollection.collection_no}</strong>-এর সংগ্রহ রেকর্ড বাতিল করতে চান?
              </p>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-medium">
                বাতিল করলে এই সংগ্রহ থেকে ইনভেন্টরিতে যোগ হওয়া <strong>{deleteCollection.accepted_quantity} টি ডিম</strong> গ্রেড স্টক থেকে স্বয়ংক্রিয়ভাবে বিয়োগ হয়ে যাবে।
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteCollection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteCollection}
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
