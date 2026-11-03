"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Egg,
  Search,
  Home,
  Boxes,
  TrendingUp,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui";

interface ShedStockItem {
  id: number;
  flock_code: string;
  shed_name: string;
  breed: string;
  current_birds: number;
  current_birds_count?: number;
  initial_chicks_count?: number;
  mortality_count?: number;
  age_days?: number;
  age_display?: string;
  status: string;
  housing_date?: string;
}

export default function StockChickenPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [flocks, setFlocks] = useState<ShedStockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/egg/flocks");
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        const normalized = json.data.map((f: any) => ({
          ...f,
          current_birds: Number(f.current_birds ?? f.current_birds_count ?? 0),
          initial_chicks_count: Number(f.initial_chicks_count ?? 0),
        }));
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

  // Filtered
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

  // Aggregate stats:
  // বড় মুরগি (Adult Layers): age >= 120 days (~4+ months)
  // মাঝারি মুরগি (Growers): 45 <= age < 120 days
  // বাচ্চা মুরগি (Chicks): age < 45 days
  let totalLive = 0;
  let adultCount = 0;
  let growerCount = 0;
  let chickCount = 0;

  flocks.forEach((f) => {
    const count = f.current_birds || 0;
    const age = f.age_days || 0;
    totalLive += count;

    if (age >= 120) {
      adultCount += count;
    } else if (age >= 45) {
      growerCount += count;
    } else {
      chickCount += count;
    }
  });

  return (
    <div className="space-y-4">
      {/* 1. Page Header */}
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
              কোন শেডে কত মুরগি আছে, বড় মুরগি, মাঝারি মুরগি ও বাচ্চার বিস্তারিত লাইভ স্টক
            </p>
          </div>
        </div>
      </div>

      {/* 2. Four KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Birds */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>সর্বমোট মুরগি স্টক</span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-[#166534] dark:text-emerald-400 mt-1">
            {totalLive.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">সবগুলো শেড মিলিয়ে বর্তমান সংখ্যা</div>
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
          <div className="text-[11px] text-slate-400 mt-0.5">ডিম পাড়া প্রাপ্তবয়স্ক মুরগি (৪+ মাস)</div>
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
          <div className="text-[11px] text-slate-400 mt-0.5">বর্ধনশীল গ্রোয়ার (৪৫ দিন - ১২০ দিন)</div>
        </div>

        {/* Chicks */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>ছোট ও বাচ্চা মুরগি (Chicks)</span>
            <Home className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {chickCount.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">ব্রুডার ও নার্সারি বাচ্চা (&lt;৪৫ দিন)</div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="শেডের নাম, ব্যাচ কোড দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          সক্রিয় শেড সংখ্যা: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{filtered.length} টি</strong>
        </div>
      </div>

      {/* 4. Desktop Shed Stock Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="py-3 px-3 text-center w-12">ক্র: নং</th>
                <th className="py-3 px-4">শেডের নাম ও কোড</th>
                <th className="py-3 px-3">মুরগির জাত (Breed)</th>
                <th className="py-3 px-3 text-center">বড় মুরগি (Adult)</th>
                <th className="py-3 px-3 text-center">মাঝারি মুরগি (Grower)</th>
                <th className="py-3 px-3 text-center">বাচ্চা মুরগি (Chicks)</th>
                <th className="py-3 px-3 text-center">শেডে বর্তমান মোট</th>
                <th className="py-3 px-3 text-center">বয়স (দিন / মাস)</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>শেডের স্টক ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-bold">
                    কোনো শেডের স্টক তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const age = item.age_days || 0;
                  const isAdult = age >= 120;
                  const isGrower = age >= 45 && age < 120;
                  const isChick = age < 45;

                  const adultBirds = isAdult ? item.current_birds : 0;
                  const growerBirds = isGrower ? item.current_birds : 0;
                  const chickBirds = isChick ? item.current_birds : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{item.shed_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.flock_code} &bull; আগমন: {item.housing_date || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                          {item.breed}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-orange-600 dark:text-orange-400">
                        {adultBirds > 0 ? `${adultBirds.toLocaleString()} টি` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-sky-700 dark:text-sky-400">
                        {growerBirds > 0 ? `${growerBirds.toLocaleString()} টি` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                        {chickBirds > 0 ? `${chickBirds.toLocaleString()} টি` : "—"}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {Number(item.current_birds ?? item.current_birds_count ?? 0).toLocaleString()} টি
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.age_display || `${age} দিন`}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {item.status || "ACTIVE"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

