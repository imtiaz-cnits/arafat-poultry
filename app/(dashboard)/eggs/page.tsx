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
  Wallet,
  Activity,
  Utensils,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface Flock {
  id: number;
  flock_code: string;
  shed_name: string;
  breed: string;
  current_birds: number;
  initial_chicks_count?: number;
  mortality_count?: number;
  age_display?: string;
  age_months?: number;
  age_days?: number;
  expected_daily_feed_kg?: number;
  actual_feed_consumed_kg?: number;
  total_expenses?: number;
  status: string;
  housing_date?: string;
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
  const [flockHousingDate, setFlockHousingDate] = useState(new Date().toISOString().split("T")[0]);
  const [flockNote, setFlockNote] = useState("");
  const [isPurchaseFlock, setIsPurchaseFlock] = useState(false);
  const [flockSupplierId, setFlockSupplierId] = useState<number | "">("");
  const [flockUnitPrice, setFlockUnitPrice] = useState("45");
  const [flockPaidAmount, setFlockPaidAmount] = useState("0");
  const [flockPaymentMethod, setFlockPaymentMethod] = useState("Cash");

  // Mortality Modal State
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [selectedFlockForMortality, setSelectedFlockForMortality] = useState<Flock | null>(null);
  const [mortalityCount, setMortalityCount] = useState("1");
  const [mortalityReason, setMortalityReason] = useState("স্বাভাবিক মৃত্যু / হিট স্ট্রোক");
  const [mortalityDate, setMortalityDate] = useState(new Date().toISOString().split("T")[0]);
  const [submittingMortality, setSubmittingMortality] = useState(false);

  // Flock Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedFlockForExpense, setSelectedFlockForExpense] = useState<Flock | null>(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseType, setExpenseType] = useState("ওষুধ ও ভ্যাকসিন");
  const [expenseDetails, setExpenseDetails] = useState("");
  const [expensePaymentMethod, setExpensePaymentMethod] = useState("Cash");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Suppliers List
  const [suppliersList, setSuppliersList] = useState<Array<{ id: number; name: string; company?: string }>>([]);

  // Action Modals State
  const [viewCollection, setViewCollection] = useState<EggCollection | null>(null);
  const [deleteCollection, setDeleteCollection] = useState<EggCollection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eggRes, suppRes] = await Promise.all([
        fetch("/api/egg/collections"),
        fetch("/api/suppliers"),
      ]);
      const json = await eggRes.json();
      if (json.status === "success") {
        setData(json.data);
      } else {
        toast.error(json.message || "ডিম উৎপাদন ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }

      const suppJson = await suppRes.json();
      if (suppJson.status === "success" && Array.isArray(suppJson.data)) {
        setSuppliersList(suppJson.data);
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
      const payload: any = {
        shed_name: flockShedName.trim(),
        breed: flockBreed.trim(),
        initial_chicks_count: parseInt(flockChicksCount) || 0,
        housing_date: flockHousingDate,
        note: flockNote.trim() || undefined,
      };

      if (isPurchaseFlock) {
        if (!flockSupplierId) {
          toast.error("সরবরাহকারী নির্বাচন করুন", "সতর্কতা");
          setSubmittingFlock(false);
          return;
        }
        payload.supplier_id = flockSupplierId;
        payload.unit_price = parseFloat(flockUnitPrice) || 0;
        payload.paid_amount = parseFloat(flockPaidAmount) || 0;
        payload.payment_method = flockPaymentMethod;
      }

      const res = await fetch("/api/egg/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success(resData.message || "নতুন পোল্ট্রি ফ্লক সফলভাবে তৈরি হয়েছে!", "সফল");
        setIsFlockModalOpen(false);
        setFlockShedName("");
        setIsPurchaseFlock(false);
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

  const handleOpenMortalityForFlock = (flock: Flock) => {
    setSelectedFlockForMortality(flock);
    setMortalityCount("1");
    setMortalityReason("স্বাভাবিক মৃত্যু / হিট স্ট্রোক");
    setMortalityDate(new Date().toISOString().split("T")[0]);
    setIsMortalityModalOpen(true);
  };

  const handleMortalitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlockForMortality) return;
    const count = parseInt(mortalityCount) || 0;
    if (count <= 0) {
      toast.error("সঠিক সংখ্যা প্রদান করুন", "সতর্কতা");
      return;
    }

    try {
      setSubmittingMortality(true);
      const res = await fetch("/api/egg/flocks/mortality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flock_id: selectedFlockForMortality.id,
          mortality_count: count,
          reason: mortalityReason,
          date: mortalityDate,
        }),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success(resData.message || "মৃত্যুর হিসাব সফলভাবে সংরক্ষিত হয়েছে", "সফল");
        setIsMortalityModalOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "মৃত্যু সংরক্ষণ ব্যর্থ হয়েছে", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSubmittingMortality(false);
    }
  };

  const handleOpenExpenseForFlock = (flock: Flock) => {
    setSelectedFlockForExpense(flock);
    setExpenseAmount("");
    setExpenseType("ওষুধ ও ভ্যাকসিন");
    setExpenseDetails("");
    setExpensePaymentMethod("Cash");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setIsExpenseModalOpen(true);
  };

  const handleFlockExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlockForExpense) return;
    const amt = parseFloat(expenseAmount) || 0;
    if (amt <= 0) {
      toast.error("সঠিক খরচের পরিমাণ দিন", "সতর্কতা");
      return;
    }

    try {
      setSubmittingExpense(true);
      const res = await fetch("/api/egg/flocks/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flock_id: selectedFlockForExpense.id,
          amount: amt,
          expense_type: expenseType,
          expense_details: expenseDetails,
          payment_method: expensePaymentMethod,
          date: expenseDate,
        }),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success(resData.message || "ফ্লকের খরচ সফলভাবে যোগ হয়েছে", "সফল");
        setIsExpenseModalOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "খরচ সংরক্ষণ ব্যর্থ", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSubmittingExpense(false);
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
    <div className="no-print space-y-6">
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

        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
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
                  <th className="py-3 px-4">ফ্লক ও শেড</th>
                  <th className="py-3 px-4">মুরগির জাত (Breed)</th>
                  <th className="py-3 px-4 text-center">বয়স (৩০ দিন/মাস)</th>
                  <th className="py-3 px-4 text-center">লাইভ মুরগি / মোট</th>
                  <th className="py-3 px-4 text-center">দৈনিক ফিড (১২০g/দিন)</th>
                  <th className="py-3 px-4 text-right">মোট উৎপাদন ব্যয়</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-center w-52">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {!data?.flocks || data.flocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      কোনো পোল্ট্রি ফ্লক নেই।
                    </td>
                  </tr>
                ) : (
                  data.flocks.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {f.flock_code}
                        </div>
                        <div className="text-[11px] text-gray-900 dark:text-white font-medium">{f.shed_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{f.breed}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          <Calendar className="w-3 h-3 text-sky-600" />
                          <span>{f.age_display || "০ দিন"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                          {f.current_birds} টি
                        </div>
                        <div className="text-[10px] text-slate-400">
                          শুরু: {f.initial_chicks_count ?? f.current_birds} | মৃত: {f.mortality_count ?? 0}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <div className="font-bold text-orange-600 dark:text-orange-400">
                          {f.expected_daily_feed_kg ?? ((f.current_birds * 0.12).toFixed(1))} কেজি
                        </div>
                        <div className="text-[10px] text-slate-400">
                          খাওয়া শেষ: {f.actual_feed_consumed_kg ?? 0} kg
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatBdCurrency(f.total_expenses ?? 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenCollectionForFlock(f)}
                            className="h-[28px] px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="এই ফ্লক থেকে ডিম সংগ্রহ করুন"
                          >
                            <Egg className="w-3 h-3" />
                            <span>ডিম</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenMortalityForFlock(f)}
                            className="h-[28px] px-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="মৃত মুরগির হিসাব এন্ট্রি করুন"
                          >
                            <BadgeAlert className="w-3 h-3" />
                            <span>মৃত্যু</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenExpenseForFlock(f)}
                            className="h-[28px] px-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                            title="ফ্লকের ওষুধ/ভ্যাকসিন/লেবার খরচ এন্ট্রি"
                          >
                            <Wallet className="w-3 h-3" />
                            <span>খরচ</span>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">নতুন পোল্ট্রি ফ্লক / শেড ও মুরগি সংগ্রহ</h3>
              </div>
              <button
                onClick={() => setIsFlockModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFlockSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="যেমন: BV-300 Layer, Novogen"
                    value={flockBreed}
                    onChange={(e) => setFlockBreed(e.target.value)}
                    required
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    মুরগির সংখ্যা (Chicks Count) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={flockChicksCount}
                    onChange={(e) => setFlockChicksCount(e.target.value)}
                    required
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    শেডে তোলার তারিখ
                  </label>
                  <input
                    type="date"
                    value={flockHousingDate}
                    onChange={(e) => setFlockHousingDate(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Purchase Toggle */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                      সরবরাহকারী থেকে মুরগি ক্রয় (Flock Purchase)?
                    </span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      সরাসরি ইনভেন্টরি ও সরবরাহকারী লেজারে বাকি/পরিশোধের হিসাব যুক্ত হবে
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPurchaseFlock}
                    onChange={(e) => setIsPurchaseFlock(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {isPurchaseFlock && (
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        সরবরাহকারী নির্বাচন করুন <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={flockSupplierId}
                        onChange={(e) => setFlockSupplierId(e.target.value ? Number(e.target.value) : "")}
                        required={isPurchaseFlock}
                        className="w-full h-[42px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
                      >
                        <option value="">-- সরবরাহকারী নির্বাচন করুন --</option>
                        {suppliersList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.company ? `(${s.company})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          প্রতি মুরগির দর (৳)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={flockUnitPrice}
                          onChange={(e) => setFlockUnitPrice(e.target.value)}
                          className="w-full h-[42px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          মোট ক্রয়মূল্য (স্বয়ংক্রিয়)
                        </label>
                        <div className="w-full h-[42px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold flex items-center text-emerald-700 dark:text-emerald-400">
                          {formatBdCurrency((parseInt(flockChicksCount) || 0) * (parseFloat(flockUnitPrice) || 0))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          পরিশোধিত অর্থ (৳)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={flockPaidAmount}
                          onChange={(e) => setFlockPaidAmount(e.target.value)}
                          className="w-full h-[42px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-sky-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          পেমেন্ট মেথড
                        </label>
                        <select
                          value={flockPaymentMethod}
                          onChange={(e) => setFlockPaymentMethod(e.target.value)}
                          className="w-full h-[42px] px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
                        >
                          <option value="Cash">নগদ (Cash)</option>
                          <option value="Bank">ব্যাংক (Bank)</option>
                          <option value="bKash">বিকাশ (bKash)</option>
                          <option value="Nagad">নগদ (Nagad)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] p-2 bg-white/70 dark:bg-slate-900/70 rounded-lg">
                      <span className="text-gray-600 dark:text-gray-400">সরবরাহকারীর নিকট বকেয়া:</span>
                      <strong className="text-rose-600 font-mono font-bold text-xs">
                        {formatBdCurrency(
                          Math.max(
                            0,
                            (parseInt(flockChicksCount) || 0) * (parseFloat(flockUnitPrice) || 0) -
                              (parseFloat(flockPaidAmount) || 0)
                          )
                        )}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  মন্তব্য / বিবরণ
                </label>
                <input
                  type="text"
                  placeholder="অতিরিক্ত কোনো তথ্য থাকলে লিখুন"
                  value={flockNote}
                  onChange={(e) => setFlockNote(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
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
                  <span>{isPurchaseFlock ? "ক্রয় ও ফ্লক সংরক্ষণ" : "ফ্লক সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mortality Modal */}
      {isMortalityModalOpen && selectedFlockForMortality && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-rose-800 to-red-700 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BadgeAlert className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-base">মৃত মুরগির হিসাব এন্ট্রি (Flock Mortality)</h3>
              </div>
              <button
                onClick={() => setIsMortalityModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMortalitySubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900">
                <div className="text-gray-900 dark:text-white font-bold text-xs">{selectedFlockForMortality.shed_name}</div>
                <div className="text-[11px] font-mono text-rose-700 dark:text-rose-400">
                  ফ্লক: {selectedFlockForMortality.flock_code} | বর্তমান মুরগি: <strong>{selectedFlockForMortality.current_birds} টি</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  মৃত মুরগির সংখ্যা <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedFlockForMortality.current_birds}
                  value={mortalityCount}
                  onChange={(e) => setMortalityCount(e.target.value)}
                  required
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  মৃত্যুর তারিখ
                </label>
                <input
                  type="date"
                  value={mortalityDate}
                  onChange={(e) => setMortalityDate(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  মৃত্যুর কারণ / বিবরণ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: অতিরিক্ত গরম, স্বাভাবিক মৃত্যু, ইত্যাদি"
                  value={mortalityReason}
                  onChange={(e) => setMortalityReason(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span>মৃত্যুর পর অবশিষ্ট থাকবে:</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                  {Math.max(0, selectedFlockForMortality.current_birds - (parseInt(mortalityCount) || 0))} টি
                </strong>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMortalityModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingMortality}
                  className="px-6 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submittingMortality ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>মৃত্যু রেকর্ড নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flock Expense Modal */}
      {isExpenseModalOpen && selectedFlockForExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-base">ফ্লকের প্রত্যক্ষ খরচ এন্ট্রি (Farm Expense)</h3>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFlockExpenseSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900">
                <div className="text-gray-900 dark:text-white font-bold text-xs">{selectedFlockForExpense.shed_name}</div>
                <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                  ফ্লক কোড: {selectedFlockForExpense.flock_code} | বর্তমান খরচ: {formatBdCurrency(selectedFlockForExpense.total_expenses ?? 0)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  খরচের খাত <span className="text-red-500">*</span>
                </label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
                >
                  <option value="ওষুধ ও ভ্যাকসিন">ওষুধ ও ভ্যাকসিন (Medicine & Vaccine)</option>
                  <option value="লিটার ও বেডিং">লিটার ও বেডিং উপাদান (Litter & Bedding)</option>
                  <option value="লেবার মজুরি">লেবার ও পরিচর্যা মজুরি (Labor Wages)</option>
                  <option value="বিদ্যুৎ ও জ্বালানি">বিদ্যুৎ, জেনারেটর ও হিটিং (Electricity/Heating)</option>
                  <option value="শেড রক্ষণাবেক্ষণ">শেড মেরামত ও চুনকাম (Shed Maintenance)</option>
                  <option value="অন্যান্য প্রত্যক্ষ খরচ">অন্যান্য প্রত্যক্ষ খরচ (Other Direct Expense)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    টাকার পরিমাণ (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    placeholder="যেমন: ১৫০০"
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    পেমেন্ট মেথড
                  </label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
                  >
                    <option value="Cash">নগদ (Cash)</option>
                    <option value="Bank">ব্যাংক (Bank)</option>
                    <option value="bKash">বিকাশ (bKash)</option>
                    <option value="Nagad">নগদ (Nagad)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  তারিখ
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  খরচের বিবরণ / ভাউচার রেফারেন্স
                </label>
                <input
                  type="text"
                  placeholder="যেমন: রানীক্ষেত ভ্যাকসিনের ডোজ সংগ্রহ"
                  value={expenseDetails}
                  onChange={(e) => setExpenseDetails(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submittingExpense ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>খরচ যোগ করুন</span>
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
      {/* Dedicated Print-Only Collection Voucher */}
      {viewCollection && (
        <div className="print-only text-black bg-white">
          <div className="border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 m-0">ARAFAT POULTRY &amp; FISHERIES</h1>
                <p className="text-[11px] text-slate-600 font-medium m-0">Quality Products. Trusted Service.</p>
                <h2 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
                  ডিম সংগ্রহ ও গ্রেডিং ভাউচার (EGG COLLECTION VOUCHER)
                </h2>
              </div>
              <div className="text-right text-[10px] text-slate-600">
                <p>শেড/ফ্লক: <strong className="text-slate-900">{viewCollection.flock_name}</strong></p>
                <p>তারিখ: <strong>{viewCollection.date}</strong></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
            <div className="p-2 border border-slate-300">
              <span className="text-slate-500 block">মোট সংগৃহীত ডিম:</span>
              <strong className="text-sm">{viewCollection.total_collected} টি</strong>
            </div>
            <div className="p-2 border border-slate-300">
              <span className="text-slate-500 block">ভাঙা / নষ্ট:</span>
              <strong className="text-sm text-rose-600">{viewCollection.rejected_breakage} টি</strong>
            </div>
            <div className="p-2 border border-slate-300">
              <span className="text-slate-500 block">গ্রহণযোগ্য ডিম:</span>
              <strong className="text-sm text-emerald-700">{viewCollection.accepted_quantity} টি</strong>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs mb-4">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold">
                <th className="p-2 border border-slate-300 text-center w-10">ক্র নং</th>
                <th className="p-2 border border-slate-300">গ্রেডের নাম</th>
                <th className="p-2 border border-slate-300 text-center">ডিমের সংখ্যা (টি)</th>
                <th className="p-2 border border-slate-300 text-center">খাঁচি সংখ্যা (ট্রে)</th>
              </tr>
            </thead>
            <tbody>
              {viewCollection.grades.map((g, idx) => (
                <tr key={idx}>
                  <td className="p-2 border border-slate-300 text-center font-bold">{idx + 1}</td>
                  <td className="p-2 border border-slate-300 font-bold">{g.grade_name}</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{g.pieces} টি</td>
                  <td className="p-2 border border-slate-300 text-center font-mono">{g.trays} খাঁচি</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-3 gap-8 pt-10 text-center text-xs text-slate-700">
            <div className="border-t border-slate-400 pt-1">সংগ্রহকারী</div>
            <div className="border-t border-slate-400 pt-1">ইনভেন্টরি ইনচার্জ</div>
            <div className="border-t border-slate-400 pt-1">ম্যানেজার</div>
          </div>
        </div>
      )}
    </div>
  );
}