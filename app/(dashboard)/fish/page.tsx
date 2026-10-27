"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Fish,
  Plus,
  Search,
  Calendar,
  Layers,
  TrendingUp,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Scale,
  Activity,
  DollarSign,
  Droplets,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui";

interface Pond {
  id: number;
  pond_code: string;
  pond_name: string;
  area_decimal: number;
  water_depth_feet: number;
  status: string;
  active_batches_count: number;
}

interface FishSpecies {
  id: number;
  species_name: string;
  default_culture_days: number;
}

interface FishBatch {
  id: number;
  batch_no: string;
  pond_name: string;
  species_name: string;
  stocking_date: string;
  fingerling_count: number;
  current_fish_count: number;
  mortality_count: number;
  latest_avg_weight_g: number;
  estimated_biomass_kg: number;
  harvested_kg: number;
  status: string;
  total_cost: number;
}

interface FishHarvest {
  id: number;
  harvest_no: string;
  pond_name: string;
  species_name: string;
  product_name: string;
  harvest_type: string;
  fish_count: number;
  total_weight_kg: number;
  avg_weight_kg: number;
  cost_per_kg: number;
  cost_allocated: number;
  date: string;
}

interface SaleableProduct {
  id: number;
  product_name: string;
  stock_kg: number;
  cost_price: number;
  sell_price: number;
}

interface FishDashboardData {
  summary: {
    total_ponds: number;
    total_batches: number;
    active_batches: number;
    total_fingerlings_stocked: number;
    total_current_live_fish: number;
    total_mortality: number;
    mortality_rate_percent: number;
    total_estimated_biomass_kg: number;
    total_harvested_kg: number;
    total_harvested_cost: number;
    total_batch_expenses: number;
  };
  ponds: Pond[];
  species: FishSpecies[];
  batches: FishBatch[];
  recent_harvests: FishHarvest[];
  saleable_fish_products: SaleableProduct[];
}

export default function FishFarmingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FishDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<"batches" | "harvests" | "ponds" | "products">("batches");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isSamplingModalOpen, setIsSamplingModalOpen] = useState(false);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPondModalOpen, setIsPondModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Batch Form State
  const [batchPondId, setBatchPondId] = useState<number | "">("");
  const [batchSpeciesId, setBatchSpeciesId] = useState<number | "">("");
  const [batchProductId, setBatchProductId] = useState<number | "">("");
  const [fingerlingCount, setFingerlingCount] = useState<string>("5000");
  const [fingerlingUnitCost, setFingerlingUnitCost] = useState<string>("2.50");
  const [stockingDate, setStockingDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [batchNote, setBatchNote] = useState("");

  // Harvest Form State
  const [harvestBatchId, setHarvestBatchId] = useState<number | "">("");
  const [harvestProductId, setHarvestProductId] = useState<number | "">("");
  const [harvestType, setHarvestType] = useState<"PARTIAL" | "FINAL">("PARTIAL");
  const [harvestFishCount, setHarvestFishCount] = useState<string>("1000");
  const [harvestTotalWeightKg, setHarvestTotalWeightKg] = useState<string>("850");
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [harvestNote, setHarvestNote] = useState("");

  // Sampling Form State
  const [samplingBatchId, setSamplingBatchId] = useState<number | "">("");
  const [sampleCount, setSampleCount] = useState<string>("50");
  const [sampleWeightKg, setSampleWeightKg] = useState<string>("40");
  const [samplingDate, setSamplingDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [samplingNote, setSamplingNote] = useState("");

  // Mortality Form State
  const [mortalityBatchId, setMortalityBatchId] = useState<number | "">("");
  const [mortalityCount, setMortalityCount] = useState<string>("10");
  const [mortalityReason, setMortalityReason] = useState<string>("স্বাভাবিক মৃত্যু / আবহাওয়া পরিবর্তন");
  const [mortalityDate, setMortalityDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Expense Form State
  const [expenseBatchId, setExpenseBatchId] = useState<number | "">("");
  const [expenseAmount, setExpenseAmount] = useState<string>("1500");
  const [expenseCategory, setExpenseCategory] = useState<string>("চুন ও পুকুর পরিচর্যা");
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<string>("Cash");
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [expenseNote, setExpenseNote] = useState("");

  // Pond Form State
  const [pondCode, setPondCode] = useState<string>("");
  const [pondName, setPondName] = useState<string>("");
  const [pondLocation, setPondLocation] = useState<string>("");
  const [pondAreaDecimal, setPondAreaDecimal] = useState<string>("40");
  const [pondDepthFeet, setPondDepthFeet] = useState<string>("6");
  const [pondNote, setPondNote] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fish");
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setData(json.data);
      } else {
        toast.error(json.message || "ডাটা লোড করা যায়নি");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    if (!data?.batches) return [];
    if (!searchTerm) return data.batches;
    const term = searchTerm.toLowerCase();
    return data.batches.filter(
      (b) =>
        b.batch_no.toLowerCase().includes(term) ||
        b.pond_name.toLowerCase().includes(term) ||
        b.species_name.toLowerCase().includes(term)
    );
  }, [data?.batches, searchTerm]);

  // Filtered Harvests
  const filteredHarvests = useMemo(() => {
    if (!data?.recent_harvests) return [];
    if (!searchTerm) return data.recent_harvests;
    const term = searchTerm.toLowerCase();
    return data.recent_harvests.filter(
      (h) =>
        h.harvest_no.toLowerCase().includes(term) ||
        h.pond_name.toLowerCase().includes(term) ||
        h.species_name.toLowerCase().includes(term) ||
        h.product_name.toLowerCase().includes(term)
    );
  }, [data?.recent_harvests, searchTerm]);

  // Handlers for Form Submissions
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchPondId || !batchSpeciesId || !fingerlingCount || Number(fingerlingCount) <= 0) {
      toast.error("পুকুর, প্রজাতি এবং সঠিক পোনার সংখ্যা দিন");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/fish/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pond_id: batchPondId,
          species_id: batchSpeciesId,
          product_id: batchProductId || null,
          fingerling_count: Number(fingerlingCount),
          fingerling_unit_cost: Number(fingerlingUnitCost),
          stocking_date: stockingDate,
          note: batchNote,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "নতুন ব্যাচ সফলভাবে যুক্ত হয়েছে");
        setIsBatchModalOpen(false);
        fetchData();
      } else {
        toast.error(json.message || "ব্যাচ তৈরিতে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestBatchId || !harvestProductId || !harvestFishCount || !harvestTotalWeightKg) {
      toast.error("ব্যাচ, বিক্রয়যোগ্য পণ্য, মাছের সংখ্যা ও ওজন দিন");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/fish/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: harvestBatchId,
          product_id: harvestProductId,
          harvest_type: harvestType,
          fish_count: Number(harvestFishCount),
          total_weight_kg: Number(harvestTotalWeightKg),
          date: harvestDate,
          note: harvestNote,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "মাছ আহরণ সফলভাবে সম্পন্ন হয়েছে");
        setIsHarvestModalOpen(false);
        fetchData();
      } else {
        toast.error(json.message || "আহরণে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSampling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!samplingBatchId || !sampleCount || !sampleWeightKg) {
      toast.error("ব্যাচ, স্যাম্পল সংখ্যা ও মোট ওজন দিন");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/fish/sampling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: samplingBatchId,
          sample_count: Number(sampleCount),
          sample_weight_kg: Number(sampleWeightKg),
          date: samplingDate,
          note: samplingNote,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "বৃদ্ধির নমুনা সংরক্ষিত হয়েছে");
        setIsSamplingModalOpen(false);
        fetchData();
      } else {
        toast.error(json.message || "নমুনা সংরক্ষণে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMortality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortalityBatchId || !mortalityCount || Number(mortalityCount) <= 0) {
      toast.error("ব্যাচ ও সঠিক মৃত মাছের সংখ্যা দিন");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/fish/mortality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: mortalityBatchId,
          mortality_count: Number(mortalityCount),
          reason: mortalityReason,
          date: mortalityDate,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "মৃত মাছের হিসাব সংরক্ষিত হয়েছে");
        setIsMortalityModalOpen(false);
        fetchData();
      } else {
        toast.error(json.message || "হিসাব সংরক্ষণে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseBatchId || !expenseAmount || Number(expenseAmount) <= 0) {
      toast.error("ব্যাচ ও খরচের টাকার পরিমাণ দিন");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/fish/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: expenseBatchId,
          amount: Number(expenseAmount),
          expense_category: expenseCategory,
          payment_method: expensePaymentMethod,
          date: expenseDate,
          note: expenseNote,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "খরচ সফলভাবে যুক্ত হয়েছে");
        setIsExpenseModalOpen(false);
        fetchData();
      } else {
        toast.error(json.message || "খরচ সংরক্ষণে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondCode || !pondName) {
      toast.error("পুকুর কোড ও নাম দিন");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/fish/ponds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pond_code: pondCode,
          pond_name: pondName,
          location: pondLocation,
          area_decimal: Number(pondAreaDecimal),
          water_depth_feet: Number(pondDepthFeet),
          note: pondNote,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "পুকুর সফলভাবে তৈরি হয়েছে");
        setIsPondModalOpen(false);
        fetchData();
      } else {
        toast.error(json.message || "পুকুর তৈরিতে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <Fish className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
              মাছ চাষ ও বিক্রয় ব্যবস্থাপনা
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              পুকুর ব্যবস্থাপনা, পোনা মজুদ, বৃদ্ধি পর্যবেক্ষণ, মাছ আহরণ ও বাণিজ্যিক বিক্রয়
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            পোনা মজুদকরণ
          </button>
          <button
            onClick={() => setIsHarvestModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            মাছ আহরণ
          </button>
          <button
            onClick={() => setIsSamplingModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Scale className="w-3.5 h-3.5" />
            নমুনা ওজন
          </button>
          <button
            onClick={() => setIsMortalityModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            মৃত মাছ
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <DollarSign className="w-3.5 h-3.5" />
            অন্যান্য খরচ
          </button>
          <button
            onClick={() => setIsPondModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            নতুন পুকুর
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>পুকুর ও সক্রিয় ব্যাচ</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              {data?.summary.active_batches || 0}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">
              / {data?.summary.total_ponds || 0} পুকুর
            </span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            মোট ব্যাচ: {data?.summary.total_batches || 0} টি
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>জীবন্ত মাছের সংখ্যা</span>
            <Fish className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {Number(data?.summary.total_current_live_fish || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">পিস</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            মোট মজুদ: {Number(data?.summary.total_fingerlings_stocked || 0).toLocaleString()}
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>সম্ভাব্য লাইভ বায়োমাস</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              {Number(data?.summary.total_estimated_biomass_kg || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">কেজি</span>
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            পুকুরে জীবন্ত মজুদ ওজন
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মোট আহরিত মাছ</span>
            <PackageCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-sky-700 dark:text-sky-400">
              {Number(data?.summary.total_harvested_kg || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">কেজি</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            আহরণ ব্যয়: {formatBdCurrency(data?.summary.total_harvested_cost || 0)}
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>মাছের মৃত্যু হার</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {data?.summary.mortality_rate_percent || 0}%
            </span>
            <span className="text-xs text-slate-400 ml-1.5">
              ({Number(data?.summary.total_mortality || 0).toLocaleString()} পিস)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            মোট খরচ: {formatBdCurrency(data?.summary.total_batch_expenses || 0)}
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("batches")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "batches"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            ব্যাচ ও পুকুর স্টক ({data?.batches.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("harvests")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "harvests"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            আহরণ ইতিহাস ({data?.recent_harvests.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("ponds")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ponds"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            পুকুরসমূহ ({data?.ponds.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "products"
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            বিক্রয়যোগ্য মাছ স্টক ({data?.saleable_fish_products.length || 0})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="খুঁজুন (ব্যাচ, পুকুর, প্রজাতি)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 4. Tab Contents */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-slate-500 mt-2">ডাটা লোড হচ্ছে...</p>
        </div>
      ) : activeTab === "batches" ? (
        /* Batches Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3.5">ব্যাচ নং ও তারিখ</th>
                  <th className="p-3.5">পুকুর ও মাছের প্রজাতি</th>
                  <th className="p-3.5 text-right">মজুদ পোনা</th>
                  <th className="p-3.5 text-right">বর্তমান জীবন্ত মাছ</th>
                  <th className="p-3.5 text-right">গড় ওজন (গ্রাম)</th>
                  <th className="p-3.5 text-right">সম্ভাব্য বায়োমাস</th>
                  <th className="p-3.5 text-right">মোট আহরণ (কেজি)</th>
                  <th className="p-3.5 text-right">মোট উৎপাদন ব্যয়</th>
                  <th className="p-3.5 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      কোন ব্যাচ তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                        <div className="font-semibold text-emerald-800 dark:text-emerald-400">
                          {b.batch_no}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{b.stocking_date}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-100">{b.pond_name}</div>
                        <div className="text-[11px] text-sky-600 dark:text-sky-400">{b.species_name}</div>
                      </td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">
                        {b.fingerling_count.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {b.current_fish_count.toLocaleString()}
                        {b.mortality_count > 0 && (
                          <span className="text-[10px] text-rose-500 font-normal ml-1">
                            (-{b.mortality_count})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right text-slate-700 dark:text-slate-200 font-medium">
                        {b.latest_avg_weight_g > 0 ? `${b.latest_avg_weight_g} g` : "নমুনা নেই"}
                      </td>
                      <td className="p-3.5 text-right font-bold text-amber-700 dark:text-amber-400">
                        {b.estimated_biomass_kg.toLocaleString()} kg
                      </td>
                      <td className="p-3.5 text-right text-sky-700 dark:text-sky-400 font-semibold">
                        {b.harvested_kg.toLocaleString()} kg
                      </td>
                      <td className="p-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatBdCurrency(b.total_cost)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            b.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : b.status === "PARTIALLY_HARVESTED"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "harvests" ? (
        /* Harvests Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3.5">আহরণ নং ও তারিখ</th>
                  <th className="p-3.5">পুকুর ও মাছ</th>
                  <th className="p-3.5">ইনভেন্টরি প্রোডাক্ট</th>
                  <th className="p-3.5 text-center">আহরণের ধরণ</th>
                  <th className="p-3.5 text-right">মাছের সংখ্যা</th>
                  <th className="p-3.5 text-right">মোট ওজন (কেজি)</th>
                  <th className="p-3.5 text-right">গড় ওজন (কেজি)</th>
                  <th className="p-3.5 text-right">উৎপাদন খরচ / কেজি</th>
                  <th className="p-3.5 text-right">মোট বরাদ্দকৃত ব্যয়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHarvests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      কোন আহরণ রেকর্ড নেই
                    </td>
                  </tr>
                ) : (
                  filteredHarvests.map((h) => (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                        <div className="font-semibold text-sky-800 dark:text-sky-400">{h.harvest_no}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{h.date}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{h.pond_name}</div>
                        <div className="text-[11px] text-slate-400">{h.species_name}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {h.product_name}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            h.harvest_type === "FINAL"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                              : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                          }`}
                        >
                          {h.harvest_type === "FINAL" ? "চূড়ান্ত আহরণ" : "আংশিক আহরণ"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-300">
                        {h.fish_count.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-sky-700 dark:text-sky-400">
                        {h.total_weight_kg.toLocaleString()} kg
                      </td>
                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-400">
                        {h.avg_weight_kg} kg/pc
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                        {formatBdCurrency(h.cost_per_kg)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatBdCurrency(h.cost_allocated)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "ponds" ? (
        /* Ponds Table */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.ponds.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {p.pond_code}
                  </span>
                  <span className="text-xs text-slate-400">{p.status}</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-2">
                  {p.pond_name}
                </h3>
                <div className="text-xs text-slate-500 mt-2 space-y-1">
                  <div>আয়তন: <span className="font-semibold text-slate-700 dark:text-slate-200">{p.area_decimal} শতাংশ</span></div>
                  <div>পানির গভীরতা: <span className="font-semibold text-slate-700 dark:text-slate-200">{p.water_depth_feet} ফুট</span></div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">চলমান ব্যাচ:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {p.active_batches_count} টি
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Saleable Fish Products Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3.5">পণ্য আইডি</th>
                  <th className="p-3.5">মাছের পণ্যের নাম</th>
                  <th className="p-3.5 text-right">বর্তমান মজুত (কেজি)</th>
                  <th className="p-3.5 text-right">গড় উৎপাদন ব্যয় / কেজি</th>
                  <th className="p-3.5 text-right">বর্তমান বিক্রয় মূল্য / কেজি</th>
                  <th className="p-3.5 text-right">মজুত পণ্যের মোট মূল্যায়ন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.saleable_fish_products.map((sp) => (
                  <tr
                    key={sp.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 font-medium text-slate-400">#{sp.id}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-white">
                      {sp.product_name}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {sp.stock_kg.toLocaleString()} kg
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-600 dark:text-slate-300">
                      {formatBdCurrency(sp.cost_price)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-sky-700 dark:text-sky-400">
                      {formatBdCurrency(sp.sell_price)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                      {formatBdCurrency(sp.stock_kg * sp.cost_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: NEW BATCH / FINGERLING STOCKING
      ======================================================== */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5" />
                <h3 className="font-bold text-sm">নতুন মাছের ব্যাচ ও পোনা মজুদকরণ</h3>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateBatch} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  পুকুর নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={batchPondId}
                  onChange={(e) => setBatchPondId(Number(e.target.value))}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- পুকুর সিলেক্ট করুন --</option>
                  {data?.ponds.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pond_name} ({p.pond_code}) - {p.area_decimal} শতাংশ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  মাছের প্রজাতি <span className="text-red-500">*</span>
                </label>
                <select
                  value={batchSpeciesId}
                  onChange={(e) => setBatchSpeciesId(Number(e.target.value))}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- প্রজাতি সিলেক্ট করুন --</option>
                  {data?.species.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.species_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  সংযুক্ত বিক্রয়যোগ্য পণ্য (ইনভেন্টরি লিংক)
                </label>
                <select
                  value={batchProductId}
                  onChange={(e) => setBatchProductId(e.target.value ? Number(e.target.value) : "")}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- বিক্রয়যোগ্য পণ্য নির্বাচন করুন (ঐচ্ছিক) --</option>
                  {data?.saleable_fish_products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    পোনা মাছের সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={fingerlingCount}
                    onChange={(e) => setFingerlingCount(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    প্রতি পিস পোনা ক্রয়মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fingerlingUnitCost}
                    onChange={(e) => setFingerlingUnitCost(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">মোট পোনা ক্রয় ব্যয়:</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">
                  {formatBdCurrency((Number(fingerlingCount) || 0) * (Number(fingerlingUnitCost) || 0))}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  মজুদের তারিখ
                </label>
                <input
                  type="date"
                  value={stockingDate}
                  onChange={(e) => setStockingDate(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">মন্তব্য</label>
                <input
                  type="text"
                  placeholder="পোনা সরবরাহকারী, সাইজ বা কোনো নোট..."
                  value={batchNote}
                  onChange={(e) => setBatchNote(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* Sticky Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  ব্যাচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: HARVEST RECORDING (PARTIAL / FINAL)
      ======================================================== */}
      {isHarvestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm">মাছ আহরণ ও ইনভেন্টরি মজুদ</h3>
              </div>
              <button
                onClick={() => setIsHarvestModalOpen(false)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHarvest} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ব্যাচ নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={harvestBatchId}
                  onChange={(e) => setHarvestBatchId(Number(e.target.value))}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- ব্যাচ সিলেক্ট করুন --</option>
                  {data?.batches
                    .filter((b) => b.status === "ACTIVE" || b.status === "PARTIALLY_HARVESTED")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_no} - {b.pond_name} ({b.species_name}) | বর্তমান মাছ: {b.current_fish_count}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ইনভেন্টরি প্রোডাক্ট (যেখানে স্টক যুক্ত হবে) <span className="text-red-500">*</span>
                </label>
                <select
                  value={harvestProductId}
                  onChange={(e) => setHarvestProductId(Number(e.target.value))}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- বিক্রয়যোগ্য প্রোডাক্ট নির্বাচন করুন --</option>
                  {data?.saleable_fish_products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} (বর্তমান স্টক: {p.stock_kg} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  আহরণের ধরণ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHarvestType("PARTIAL")}
                    className={`h-[42px] rounded-xl font-semibold border transition-all ${
                      harvestType === "PARTIAL"
                        ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                        : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    আংশিক আহরণ (Partial)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHarvestType("FINAL")}
                    className={`h-[42px] rounded-xl font-semibold border transition-all ${
                      harvestType === "FINAL"
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    চূড়ান্ত আহরণ (Final/Close)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    আহরণকৃত মাছের সংখ্যা (পিস) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={harvestFishCount}
                    onChange={(e) => setHarvestFishCount(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    মোট আহরণ ওজন (কেজি) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={harvestTotalWeightKg}
                    onChange={(e) => setHarvestTotalWeightKg(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sky-700"
                  />
                </div>
              </div>

              {Number(harvestFishCount) > 0 && Number(harvestTotalWeightKg) > 0 && (
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">আহরণে গড় ওজন:</span>
                  <span className="font-bold text-sky-800 dark:text-sky-400">
                    {(Number(harvestTotalWeightKg) / Number(harvestFishCount)).toFixed(3)} কেজি / পিস
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  আহরণের তারিখ
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">মন্তব্য</label>
                <input
                  type="text"
                  placeholder="আহরণের বিবরণ বা পাইকার তথ্য..."
                  value={harvestNote}
                  onChange={(e) => setHarvestNote(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHarvestModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  আহরণ সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: GROWTH SAMPLING & BIOMASS
      ======================================================== */}
      {isSamplingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                <h3 className="font-bold text-sm">মাছের বৃদ্ধির নমুনা ওজন ও বায়োমাস</h3>
              </div>
              <button
                onClick={() => setIsSamplingModalOpen(false)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSampling} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ব্যাচ নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={samplingBatchId}
                  onChange={(e) => setSamplingBatchId(Number(e.target.value))}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- ব্যাচ সিলেক্ট করুন --</option>
                  {data?.batches
                    .filter((b) => b.status === "ACTIVE" || b.status === "PARTIALLY_HARVESTED")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_no} - {b.pond_name} ({b.species_name})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    স্যাম্পল মাছ সংখ্যা (পিস) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sampleCount}
                    onChange={(e) => setSampleCount(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    স্যাম্পলের মোট ওজন (কেজি) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={sampleWeightKg}
                    onChange={(e) => setSampleWeightKg(e.target.value)}
                    required
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  />
                </div>
              </div>

              {Number(sampleCount) > 0 && Number(sampleWeightKg) > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">হিসাবকৃত গড় ওজন:</span>
                  <span className="font-bold text-amber-800 dark:text-amber-400">
                    {((Number(sampleWeightKg) / Number(sampleCount)) * 1000).toFixed(1)} গ্রাম / পিস
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  নমুনার তারিখ
                </label>
                <input
                  type="date"
                  value={samplingDate}
                  onChange={(e) => setSamplingDate(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">মন্তব্য</label>
                <input
                  type="text"
                  placeholder="মাছের স্বাস্থ্য ও বৃদ্ধির লক্ষণ..."
                  value={samplingNote}
                  onChange={(e) => setSamplingNote(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSamplingModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  নমুনা সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: MORTALITY RECORDING
      ======================================================== */}
      {isMortalityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="bg-gradient-to-r from-rose-800 to-rose-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-sm">মৃত মাছের সংখ্যা অন্তর্ভুক্তি</h3>
              </div>
              <button
                onClick={() => setIsMortalityModalOpen(false)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMortality} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ব্যাচ নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={mortalityBatchId}
                  onChange={(e) => setMortalityBatchId(Number(e.target.value))}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- ব্যাচ সিলেক্ট করুন --</option>
                  {data?.batches
                    .filter((b) => b.status === "ACTIVE" || b.status === "PARTIALLY_HARVESTED")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_no} - {b.pond_name} ({b.species_name}) | বর্তমান মাছ: {b.current_fish_count}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  মৃত মাছের সংখ্যা (পিস) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={mortalityCount}
                  onChange={(e) => setMortalityCount(e.target.value)}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  মৃত্যুর কারণ
                </label>
                <input
                  type="text"
                  value={mortalityReason}
                  onChange={(e) => setMortalityReason(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">তারিখ</label>
                <input
                  type="date"
                  value={mortalityDate}
                  onChange={(e) => setMortalityDate(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMortalityModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: BATCH EXPENSE RECORDING
      ======================================================== */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold text-sm">ব্যাচের অন্যান্য উৎপাদন খরচ সংযোজন</h3>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpense} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ব্যাচ নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseBatchId}
                  onChange={(e) => setExpenseBatchId(Number(e.target.value))}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">-- ব্যাচ সিলেক্ট করুন --</option>
                  {data?.batches
                    .filter((b) => b.status === "ACTIVE" || b.status === "PARTIALLY_HARVESTED")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_no} - {b.pond_name} ({b.species_name})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  খরচের খাত <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="চুন ও পুকুর পরিচর্যা">চুন ও পুকুর পরিচর্যা</option>
                  <option value="ওষুধ ও রাসায়নিক">ওষুধ ও রাসায়নিক</option>
                  <option value="বিদ্যুৎ ও জ্বালানি">বিদ্যুৎ ও জ্বালানি</option>
                  <option value="শ্রমিক মজুরি">শ্রমিক মজুরি</option>
                  <option value="পুকুর ইজারা/ভাড়া">পুকুর ইজারা/ভাড়া</option>
                  <option value="অন্যান্য বিবিধ ব্যয়">অন্যান্য বিবিধ ব্যয়</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  টাকার পরিমাণ (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  পরিশোধ মাধ্যম
                </label>
                <select
                  value={expensePaymentMethod}
                  onChange={(e) => setExpensePaymentMethod(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="Cash">Cash (নগদ)</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">তারিখ</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">বিবরণ</label>
                <input
                  type="text"
                  placeholder="খরচের বিবরণ..."
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  খরচ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: NEW POND CREATION
      ======================================================== */}
      {isPondModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold text-sm">নতুন পুকুর রেজিস্ট্রেশন</h3>
              </div>
              <button
                onClick={() => setIsPondModalOpen(false)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePond} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  পুকুর কোড (Pond Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="উদাহরণ: POND-02"
                  value={pondCode}
                  onChange={(e) => setPondCode(e.target.value.toUpperCase())}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  পুকুরের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="উদাহরণ: দক্ষিণ পুকুর - রুই চাষ"
                  value={pondName}
                  onChange={(e) => setPondName(e.target.value)}
                  required
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    আয়তন (শতাংশ)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={pondAreaDecimal}
                    onChange={(e) => setPondAreaDecimal(e.target.value)}
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    পানির গভীরতা (ফুট)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={pondDepthFeet}
                    onChange={(e) => setPondDepthFeet(e.target.value)}
                    className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">অবস্থান</label>
                <input
                  type="text"
                  placeholder="খামার ব্লক / দাগ নম্বর..."
                  value={pondLocation}
                  onChange={(e) => setPondLocation(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">নোট</label>
                <input
                  type="text"
                  placeholder="অতিরিক্ত কোনো তথ্য..."
                  value={pondNote}
                  onChange={(e) => setPondNote(e.target.value)}
                  className="h-[42px] w-full px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPondModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  পুকুর সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
