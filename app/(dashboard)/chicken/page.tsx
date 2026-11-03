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
  CheckCircle2,
  Boxes,
  Activity,
  HeartCrack,
  Scale,
  Utensils,
  Home,
  Users,
  Eye,
  Trash2,
  Tag,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface Flock {
  id: number;
  flock_code: string;
  shed_name: string;
  breed: string;
  current_birds: number;
  current_birds_count?: number;
  initial_chicks_count?: number;
  mortality_count?: number;
  mortality_rate_percent?: number;
  age_display?: string;
  age_days?: number;
  expected_daily_feed_kg?: number;
  actual_feed_consumed_kg?: number;
  total_expenses?: number;
  status: string;
  housing_date?: string;
  avg_weight_g?: number;
  laying_birds_count?: number;
}

export default function ChickenManagementPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [flocks, setFlocks] = useState<Flock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([]);

  // Modal: Add New Chicks / Flock
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newFlock, setNewFlock] = useState({
    shed_name: "শেড #১ (Shed 1)",
    flock_code: "",
    breed: "হাই-লাইন ব্রাউন (Hy-Line Brown)",
    initial_chicks_count: "2000",
    housing_date: new Date().toISOString().split("T")[0],
    avg_weight_g: "45", // chick weight ~45g, adult ~1800g
    daily_feed_g: "120", // default 120g adult, custom for chick
    supplier_id: "",
    unit_price: "45",
    paid_amount: "90000",
    payment_method: "Cash",
    note: "",
  });

  // Modal: Record Mortality
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState<Flock | null>(null);
  const [mortalityCount, setMortalityCount] = useState("1");
  const [mortalityReason, setMortalityReason] = useState("স্বাভাবিক দুর্বলতা (Natural weakness)");
  const [mortalityDate, setMortalityDate] = useState(new Date().toISOString().split("T")[0]);
  const [savingMortality, setSavingMortality] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [flocksRes, suppRes] = await Promise.all([
        fetch("/api/egg/flocks"),
        fetch("/api/suppliers"),
      ]);

      const [flocksJson, suppJson] = await Promise.all([
        flocksRes.json(),
        suppRes.json(),
      ]);

      if (flocksJson.status === "success" && Array.isArray(flocksJson.data)) {
        const normalized = flocksJson.data.map((f: any) => ({
          ...f,
          current_birds: Number(f.current_birds ?? f.current_birds_count ?? 0),
          initial_chicks_count: Number(f.initial_chicks_count ?? 0),
        }));
        setFlocks(normalized);
      }
      if (suppJson.status === "success" && Array.isArray(suppJson.data)) {
        setSuppliers(suppJson.data.map((s: any) => ({ id: Number(s.id), name: s.name })));
      }
    } catch (err: any) {
      console.error(err);
      toast.error("মুরগির তথ্য লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered flocks
  const filteredFlocks = useMemo(() => {
    if (!searchTerm.trim()) return flocks;
    const term = searchTerm.toLowerCase();
    return flocks.filter(
      (f) =>
        f.flock_code.toLowerCase().includes(term) ||
        f.shed_name.toLowerCase().includes(term) ||
        f.breed.toLowerCase().includes(term)
    );
  }, [flocks, searchTerm]);

  // Overall KPIs
  const totalLiveBirds = flocks.reduce((sum, f) => sum + (f.current_birds || 0), 0);
  const totalInitialChicks = flocks.reduce((sum, f) => sum + (f.initial_chicks_count || f.current_birds || 0), 0);
  const totalMortality = flocks.reduce((sum, f) => sum + (f.mortality_count || 0), 0);
  // Adult layer daily feed (120g/bird/day) in kg = (total live * 120) / 1000
  const dailyFeedKg = Math.round((totalLiveBirds * 120) / 1000);

  // Handle Add New Chicks / Flock Submit
  const handleAddFlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlock.shed_name || !newFlock.breed || !newFlock.initial_chicks_count) {
      toast.error("শেডের নাম, জাত এবং বাচ্চার সংখ্যা পূরণ করুন", "ত্রুটি");
      return;
    }

    try {
      setAdding(true);
      const res = await fetch("/api/egg/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shed_name: newFlock.shed_name,
          breed: newFlock.breed,
          initial_chicks_count: Number(newFlock.initial_chicks_count),
          housing_date: newFlock.housing_date,
          supplier_id: newFlock.supplier_id ? Number(newFlock.supplier_id) : undefined,
          unit_price: Number(newFlock.unit_price || 0),
          paid_amount: Number(newFlock.paid_amount || 0),
          payment_method: newFlock.payment_method,
          note: newFlock.note
            ? `${newFlock.note} | ওজন: ${newFlock.avg_weight_g}g | খাবার: ${newFlock.daily_feed_g}g/দিন`
            : `ওজন: ${newFlock.avg_weight_g}g | খাবার: ${newFlock.daily_feed_g}g/দিন`,
        }),
      });

      const json = await res.json();
      if (json.status === "success") {
        toast.success("নতুন মুরগির বাচ্চা ও শেড সফলভাবে যুক্ত হয়েছে!", "সফল");
        setIsAddModalOpen(false);
        loadData();
      } else {
        toast.error(json.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setAdding(false);
    }
  };

  // Handle Mortality Submit
  const handleMortalitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlock || !mortalityCount || Number(mortalityCount) <= 0) {
      toast.error("সঠিক মৃত্যুর সংখ্যা প্রদান করুন", "ত্রুটি");
      return;
    }

    try {
      setSavingMortality(true);
      const res = await fetch("/api/egg/flocks/mortality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flock_id: selectedFlock.id,
          mortality_count: Number(mortalityCount),
          reason: mortalityReason,
          date: mortalityDate,
        }),
      });

      const json = await res.json();
      if (json.status === "success") {
        toast.success("মুরগির মৃত্যুর হিসাব সফলভাবে সংরক্ষিত হয়েছে!", "সফল");
        setIsMortalityModalOpen(false);
        setSelectedFlock(null);
        setMortalityCount("1");
        loadData();
      } else {
        toast.error(json.message || "সংরক্ষণ ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSavingMortality(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Egg className="w-6 h-6 text-[#166534]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              মুরগির হিসাব ও শেড ব্যবস্থাপনা (Poultry Shed &amp; Flock Register)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              শেডভিত্তিক বাচ্চা আগমন, বয়স, খাবার হিসাব (প্রাপ্তবয়স্ক ১২০ গ্রাম/দিন), মৃত্যু ও ডিম পাড়া মুরগি ট্র্যাকিং
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন মুরগি / বাচ্চা যুক্ত করুন</span>
        </button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Live Birds */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>বর্তমান জীবন্ত মুরগি</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-[#166534] dark:text-emerald-400 mt-1">
            {totalLiveBirds.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">সবগুলো শেড মিলিয়ে লাইভ স্টক</div>
        </div>

        {/* Total Chicks Added */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>সর্বমোট বাচ্চা যুক্ত</span>
            <Home className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-1">
            {totalInitialChicks.toLocaleString("en-US")} পিস
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">প্রারম্ভিক বাচ্চা স্টক</div>
        </div>

        {/* Daily Feed Requirement (120g/bird/day) */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>দৈনিক খাবার চাহিদা</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {dailyFeedKg.toLocaleString("en-US")} কেজি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">প্রাপ্তবয়স্ক ১২০ গ্রাম/দিন অনুপাতে</div>
        </div>

        {/* Total Mortality */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মারা গেছে (Mortality)</span>
            <HeartCrack className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {totalMortality.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            হার: {totalInitialChicks > 0 ? ((totalMortality / totalInitialChicks) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="শেডের নাম, ব্যাচ বা জাত দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          মোট সক্রিয় শেড/ফ্লক: <strong className="text-slate-800 dark:text-white">{filteredFlocks.length} টি</strong>
        </div>
      </div>

      {/* 4. Desktop Flock Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="py-3 px-3 text-center w-12">ক্র: নং</th>
                <th className="py-3 px-4">শেডের নাম ও ব্যাচ কোড</th>
                <th className="py-3 px-3">মুরগির জাত (Breed)</th>
                <th className="py-3 px-3 text-center">বাচ্চা এন্ট্রি</th>
                <th className="py-3 px-3 text-center">বর্তমান মুরগি</th>
                <th className="py-3 px-3 text-center">বয়স (দিন / মাস)</th>
                <th className="py-3 px-3 text-center">দৈনিক খাবার (কেজি)</th>
                <th className="py-3 px-3 text-center">গড় ওজন</th>
                <th className="py-3 px-3 text-center">মারা গেছে</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center w-32">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>মুরগির শেড ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredFlocks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400 font-bold">
                    কোনো মুরগির শেড পাওয়া যায়নি। "+ নতুন মুরগি / বাচ্চা যুক্ত করুন" বাটনে ক্লিক করুন।
                  </td>
                </tr>
              ) : (
                filteredFlocks.map((flock, idx) => {
                  const flockDailyFeedKg = Math.round(((flock.current_birds || 0) * 120) / 1000);
                  const isAdult = (flock.age_days || 0) >= 120; // 4+ months

                  return (
                    <tr key={flock.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {flock.shed_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {flock.flock_code} &bull; আগমন: {flock.housing_date || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                          {flock.breed}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                        {Number(flock.initial_chicks_count || flock.current_birds || 0).toLocaleString("en-US")} পিস
                      </td>
                      <td className="py-3 px-3 text-center font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {Number(flock.current_birds ?? flock.current_birds_count ?? 0).toLocaleString("en-US")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {flock.age_display || `${flock.age_days || 0} দিন`}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {isAdult ? "প্রাপ্তবয়স্ক লেয়ার" : "বাচ্চা / গ্রোয়ার"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {flockDailyFeedKg} কেজি
                        </span>
                        <div className="text-[10px] text-slate-400">১২০ গ্রাম/মুরগি/দিন</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {isAdult ? "১.৬৫ - ১.৮৫ কেজি" : "৩৫০ - ৫৫০ গ্রাম"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {(flock.mortality_count || 0).toLocaleString("en-US")} টি
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {flock.mortality_rate_percent?.toFixed(1) || 0}%
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {flock.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFlock(flock);
                              setMortalityCount("1");
                              setIsMortalityModalOpen(true);
                            }}
                            className="h-7 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="মুরগির মৃত্যু এন্ট্রি করুন"
                          >
                            <HeartCrack className="w-3.5 h-3.5" />
                            <span>মৃত্যু এন্ট্রি</span>
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
      </div>

      {/* 5. MODAL: ADD NEW CHICKS / FLOCK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[92vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Egg className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  নতুন মুরগি / বাচ্চা এন্ট্রি (Add Chicks to Shed)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFlockSubmit} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {/* Shed Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    শেডের নাম / নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শেড ১, লেয়ার শেড ৩"
                    value={newFlock.shed_name}
                    onChange={(e) => setNewFlock({ ...newFlock, shed_name: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Breed / Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মুরগির জাত / প্রকার <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: হাই-লাইন ব্রাউন, সোনালী, ব্রয়লার"
                    value={newFlock.breed}
                    onChange={(e) => setNewFlock({ ...newFlock, breed: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Initial Chicks Count */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    বাচ্চার সংখ্যা (পিস) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    value={newFlock.initial_chicks_count}
                    onChange={(e) => setNewFlock({ ...newFlock, initial_chicks_count: e.target.value })}
                    className="w-full h-[42px] px-3 text-base bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-emerald-700 font-black focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Housing Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    আগমনের তারিখ <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={newFlock.housing_date}
                    onChange={(d) => setNewFlock({ ...newFlock, housing_date: d })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Chick Weight */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    বাচ্চার গড় ওজন (গ্রাম / কেজি)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ৪৫ গ্রাম বা ১.২ কেজি"
                    value={newFlock.avg_weight_g}
                    onChange={(e) => setNewFlock({ ...newFlock, avg_weight_g: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Daily Feed Intake */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    দৈনিক খাবার বরাদ্দ (গ্রাম/মুরগি)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    placeholder="120"
                    value={newFlock.daily_feed_g}
                    onChange={(e) => setNewFlock({ ...newFlock, daily_feed_g: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400">প্রাপ্তবয়স্ক মুরগির আদর্শ ১২০ গ্রাম/দিন</span>
                </div>
              </div>

              {/* Supplier (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  সরবরাহকারী / হ্যাচারি (ঐচ্ছিক)
                </label>
                <CustomSelect
                  options={[
                    { value: "", label: "নিজস্ব সংগ্রহ / কোনো সরবরাহকারী নয়" },
                    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  value={newFlock.supplier_id}
                  onChange={(val) => setNewFlock({ ...newFlock, supplier_id: String(val) })}
                  placeholder="সরবরাহকারী নির্বাচন করুন..."
                />
              </div>

              {/* Price & Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    প্রতি বাচ্চার মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newFlock.unit_price}
                    onChange={(e) => setNewFlock({ ...newFlock, unit_price: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পরিশোধ মাধ্যম
                  </label>
                  <CustomSelect
                    options={[
                      { value: "Cash", label: "ক্যাশ / নগদ ড্রয়ার (Cash)" },
                      { value: "Bank", label: "ব্যাংক হিসাব (Bank)" },
                      { value: "bKash", label: "বিকাশ (bKash)" },
                      { value: "Nagad", label: "নগদ (Nagad)" },
                    ]}
                    value={newFlock.payment_method}
                    onChange={(val) => setNewFlock({ ...newFlock, payment_method: String(val) })}
                    placeholder="পেমেন্ট মাধ্যম..."
                  />
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  বিশেষ মন্তব্য / বিবরণ
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: হ্যাচারি ভাউচার #৮৮২, প্রথম দিনের ভ্যাকসিন সম্পন্ন"
                  value={newFlock.note}
                  onChange={(e) => setNewFlock({ ...newFlock, note: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={adding}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: RECORD MORTALITY */}
      {isMortalityModalOpen && selectedFlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <HeartCrack className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  মৃত মুরগির হিসাব এন্ট্রি (Mortality Record)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMortalityModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMortalitySubmit} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedFlock.shed_name} ({selectedFlock.breed})
                </div>
                <div className="text-slate-500 mt-0.5">
                  বর্তমান লাইভ মুরগি: <strong className="text-emerald-700">{selectedFlock.current_birds} টি</strong>
                </div>
              </div>

              {/* Dead Count */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  মৃত মুরগির সংখ্যা <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedFlock.current_birds}
                  required
                  value={mortalityCount}
                  onChange={(e) => setMortalityCount(e.target.value)}
                  className="w-full h-[42px] px-3 text-base bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-rose-600 font-black focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  মৃত্যুর তারিখ <span className="text-red-500">*</span>
                </label>
                <CustomDatePicker
                  value={mortalityDate}
                  onChange={(d) => setMortalityDate(d)}
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  মৃত্যুর কারণ / লক্ষণ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: অতিরিক্ত গরম, স্বাভাবিক দুর্বলতা, ব্রুডিংজনিত সমস্যা"
                  value={mortalityReason}
                  onChange={(e) => setMortalityReason(e.target.value)}
                  className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMortalityModalOpen(false)}
                  disabled={savingMortality}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingMortality}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {savingMortality && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>মৃত্যু রেকর্ড সংরক্ষণ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

