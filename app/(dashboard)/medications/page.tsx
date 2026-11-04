"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Activity,
  Plus,
  Search,
  Calendar,
  Layers,
  TrendingUp,
  AlertCircle,
  X,
  Loader2,
  Clock,
  Egg,
  Fish,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
  HeartPulse,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface MedicationItem {
  id: number;
  medicine_name: string;
  target_type: "POULTRY" | "FISH";
  target_name: string;
  disease: string;
  dosage: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  time_of_day: "MORNING" | "NOON" | "AFTERNOON" | "NIGHT";
  status: string;
  last_applied_date: string;
  next_due_date: string;
  note: string;
}

export default function MedicationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MedicationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "POULTRY" | "FISH" | "TODAY">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    medicine_name: "",
    target_type: "POULTRY",
    target_name: "শেড #১ (লেয়ার শেড)",
    disease: "নিয়মিত রোগ প্রতিরোধ ও ভিটামিন",
    dosage: "১ মিলি প্রতি ২ লিটার পানিতে",
    frequency: "DAILY",
    time_of_day: "MORNING",
    last_applied_date: new Date().toISOString().split("T")[0],
    next_due_date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/medications");
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("ওষুধের শিডিউল লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "POULTRY" && item.target_type !== "POULTRY") return false;
      if (activeTab === "FISH" && item.target_type !== "FISH") return false;
      if (activeTab === "TODAY" && item.next_due_date !== todayStr && item.frequency !== "DAILY") return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          item.medicine_name.toLowerCase().includes(term) ||
          item.target_name.toLowerCase().includes(term) ||
          item.disease.toLowerCase().includes(term) ||
          item.dosage.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [items, activeTab, searchTerm, todayStr]);

  // KPIs
  const totalCount = items.length;
  const poultryCount = items.filter((i) => i.target_type === "POULTRY").length;
  const fishCount = items.filter((i) => i.target_type === "FISH").length;
  const dueTodayCount = items.filter((i) => i.next_due_date === todayStr || i.frequency === "DAILY").length;

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicine_name || !formData.target_name || !formData.dosage) {
      toast.error("ওষুধের নাম, শেড/পুকুর এবং সঠিক ডোজ উল্লেখ করুন", "ত্রুটি");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.status === "success") {
        toast.success("নতুন ওষুধ / ভ্যাকসিন শিডিউল সংরক্ষিত হয়েছে!", "সফল");
        setIsModalOpen(false);
        setFormData({
          medicine_name: "",
          target_type: "POULTRY",
          target_name: "শেড #১ (লেয়ার শেড)",
          disease: "নিয়মিত রোগ প্রতিরোধ ও ভিটামিন",
          dosage: "১ মিলি প্রতি ২ লিটার পানিতে",
          frequency: "DAILY",
          time_of_day: "MORNING",
          last_applied_date: new Date().toISOString().split("T")[0],
          next_due_date: new Date().toISOString().split("T")[0],
          note: "",
        });
        loadData();
      } else {
        toast.error(json.message || "সংরক্ষণ ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার ত্রুটি", "ত্রুটি");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ওষুধের শিডিউলটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/medications?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.status === "success") {
        toast.success("শিডিউল মুছে ফেলা হয়েছে", "সফল");
        loadData();
      } else {
        toast.error(json.message || "মুছতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "DAILY":
        return "প্রতিদিন (Daily)";
      case "WEEKLY":
        return "সাপ্তাহিক (Weekly)";
      case "MONTHLY":
        return "মাসিক (Monthly)";
      case "YEARLY":
        return "বাৎসরিক (Yearly)";
      default:
        return freq;
    }
  };

  const getTimeOfDayBadge = (time: string) => {
    switch (time) {
      case "MORNING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
            <Sunrise className="w-3.5 h-3.5 text-amber-600" />
            <span>সকাল (Morning)</span>
          </span>
        );
      case "NOON":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200">
            <Sun className="w-3.5 h-3.5 text-orange-600" />
            <span>দুপুর (Noon)</span>
          </span>
        );
      case "AFTERNOON":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200">
            <Sunset className="w-3.5 h-3.5 text-sky-600" />
            <span>বিকাল (Afternoon)</span>
          </span>
        );
      case "NIGHT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200">
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>রাত (Night)</span>
          </span>
        );
      default:
        return <span>{time}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6 text-[#166534]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              ওষুধ ও ভ্যাকসিন প্রয়োগ রেজিস্টার (Medicine &amp; Vaccine Schedule)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              মাছ ও মুরগির ওষুধ, সঠিক ডোজ, প্রয়োগের ফ্রিকোয়েন্সি (Daily/Weekly/Monthly) ও বেলা (সকাল/দুপুর/বিকাল/রাত)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ওষুধ / ভ্যাকসিন শিডিউল</span>
        </button>
      </div>

      {/* 2. Four KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Schedules */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মোট শিডিউল</span>
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-[#166534] dark:text-emerald-400 mt-1">
            {totalCount} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">খামারের সক্রিয় স্বাস্থ্য কর্মসূচি</div>
        </div>

        {/* Due Today */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>আজকের প্রয়োগ কর্মসূচি</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {dueTodayCount} টি ওষুধ
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">আজকে শেড ও পুকুরে প্রয়োগ করতে হবে</div>
        </div>

        {/* Poultry Medicines */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মুরগির ওষুধ ও ভ্যাকসিন</span>
            <Egg className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {poultryCount} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">লেয়ার শেড ও বাচ্চা পরিচর্যা</div>
        </div>

        {/* Fish Medicines */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মাছের ওষুধ ও শোধন</span>
            <Fish className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-1">
            {fishCount} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">চুন, জিওলাইট, অক্সিজেন ও প্রিবায়োটিক</div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search */}
      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "ALL"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
          >
            সকল ওষুধ ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("TODAY")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "TODAY"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
          >
            আজকের প্রয়োগ ({dueTodayCount})
          </button>
          <button
            onClick={() => setActiveTab("POULTRY")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "POULTRY"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
          >
            মুরগি / পোল্ট্রি ({poultryCount})
          </button>
          <button
            onClick={() => setActiveTab("FISH")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === "FISH"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
          >
            মাছ / মৎস্য ({fishCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="ওষুধ, শেড বা পুকুর দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 4. Desktop Medications Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="py-3 px-3 text-center w-12">ক্র: নং</th>
                <th className="py-3 px-4">ওষুধ / ভ্যাকসিনের নাম ও লক্ষ্য</th>
                <th className="py-3 px-3">প্রয়োগের স্থান (শেড / পুকুর)</th>
                <th className="py-3 px-3">সঠিক ডোজ (Dosage)</th>
                <th className="py-3 px-3 text-center">কতবার / শিডিউল</th>
                <th className="py-3 px-3 text-center">প্রয়োগের বেলা</th>
                <th className="py-3 px-3 text-center">পরবর্তী প্রয়োগের তারিখ</th>
                <th className="py-3 px-4 text-center w-20">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>ওষুধ ও ভ্যাকসিন শিডিউল লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-bold">
                    কোনো ওষুধ বা ভ্যাকসিন শিডিউল পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{item.medicine_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.disease}
                      </div>
                      {item.note && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">
                          নোট: {item.note}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        {item.target_type === "POULTRY" ? (
                          <Egg className="w-3.5 h-3.5 text-orange-600" />
                        ) : (
                          <Fish className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        <span className="text-slate-800 dark:text-slate-200">{item.target_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-800 dark:text-emerald-400">
                      {item.dosage}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {getFrequencyLabel(item.frequency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getTimeOfDayBadge(item.time_of_day)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.next_due_date}</span>
                      </div>
                      {item.next_due_date === todayStr && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-white mt-0.5">
                          আজকের কাজ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center transition-colors cursor-pointer mx-auto"
                        title="শিডিউল মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: ADD NEW MEDICATION SCHEDULE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[92vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  নতুন ওষুধ / ভ্যাকসিন প্রয়োগ শিডিউল (New Schedule)
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

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              {/* Medicine Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ওষুধ বা ভ্যাকসিনের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: রানিখেত ভ্যাকসিন, চুন ও জিওলাইট, ভিটামিন বি কমপ্লেক্স"
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                  className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Target Type and Shed/Pond Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    খাত / প্রজাতি <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={[
                      { value: "POULTRY", label: "মুরগি / পোল্ট্রি (Poultry)" },
                      { value: "FISH", label: "মাছ / মৎস্য (Fisheries)" },
                    ]}
                    value={formData.target_type}
                    onChange={(val) => setFormData({ ...formData, target_type: String(val) as any })}
                    placeholder="খাত নির্বাচন করুন..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    শেড বা পুকুরের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শেড #১, পুকুর #২, সকল শেড"
                    value={formData.target_name}
                    onChange={(e) => setFormData({ ...formData, target_name: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Dosage */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  সঠিক ডোজ (Dosage) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১ মিলি প্রতি ২ লিটার পানিতে, ১ কেজি প্রতি শতাংশে, ১ ফোঁটা চোখে"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-emerald-800 dark:text-emerald-400 font-black focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Frequency and Time of Day */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    কতবার / ফ্রিকোয়েন্সি <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={[
                      { value: "DAILY", label: "প্রতিদিন (Daily)" },
                      { value: "WEEKLY", label: "সাপ্তাহিক (Weekly)" },
                      { value: "MONTHLY", label: "মাসিক (Monthly)" },
                      { value: "YEARLY", label: "বাৎসরিক (Yearly)" },
                    ]}
                    value={formData.frequency}
                    onChange={(val) => setFormData({ ...formData, frequency: String(val) as any })}
                    placeholder="ফ্রিকোয়েন্সি..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    কোন বেলায় দিতে হবে <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={[
                      { value: "MORNING", label: "সকাল (Morning)" },
                      { value: "NOON", label: "দুপুর (Noon)" },
                      { value: "AFTERNOON", label: "বিকাল (Afternoon)" },
                      { value: "NIGHT", label: "রাত (Night)" },
                    ]}
                    value={formData.time_of_day}
                    onChange={(val) => setFormData({ ...formData, time_of_day: String(val) as any })}
                    placeholder="প্রয়োগের বেলা..."
                  />
                </div>
              </div>

              {/* Next Due Date and Disease */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পরবর্তী প্রয়োগের তারিখ <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={formData.next_due_date}
                    onChange={(d) => setFormData({ ...formData, next_due_date: d })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    রোগ বা প্রতিরোধ লক্ষ্য
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: রানিখেত দমন, গ্যাস শোধন"
                    value={formData.disease}
                    onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Note / Special Instructions */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  প্রয়োগের সতর্কতা ও নিয়মাবলি
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: খালি পেটে দিতে হবে, ভ্যাকসিন তৈরির ২ ঘণ্টার মধ্যে পানি শেষ করতে হবে"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  <span>শিডিউল সংরক্ষণ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

