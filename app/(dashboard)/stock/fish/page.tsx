"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Fish,
  X,
  Search,
  Layers,
  TrendingUp,
  AlertCircle,
  Loader2,
  Boxes,
  Droplets,
  Scale,
  Plus,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui";

interface PondStockItem {
  id: number;
  batch_no: string;
  pond_name: string;
  pond_area_decimal?: number;
  species_name: string;
  current_fish_count: number;
  fingerling_count: number;
  latest_avg_weight_g: number;
  estimated_biomass_kg: number;
  harvested_kg: number;
  status: string;
  stocking_date: string;
}

export default function StockFishPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<PondStockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ponds, setPonds] = useState<any[]>([]);
  const [speciesList, setSpeciesList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    pond_id: "",
    species_id: "",
    fingerling_count: "",
    fingerling_unit_cost: "",
    stocking_date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const handleCreateFishStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pond_id || !formData.species_id || !formData.fingerling_count) {
      toast.error("পুকুর, মাছের প্রজাতি এবং পোনার সংখ্যা দিন", "ত্রুটি");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/fish/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pond_id: Number(formData.pond_id),
          species_id: Number(formData.species_id),
          fingerling_count: Number(formData.fingerling_count),
          fingerling_unit_cost: Number(formData.fingerling_unit_cost || 0),
          stocking_date: formData.stocking_date,
          note: formData.note,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success("নতুন মাছের স্টক / পোনা সফলভাবে যুক্ত হয়েছে!", "সফল");
        setIsModalOpen(false);
        setFormData({
          pond_id: "",
          species_id: "",
          fingerling_count: "",
          fingerling_unit_cost: "",
          stocking_date: new Date().toISOString().split("T")[0],
          note: "",
        });
        loadData();
      } else {
        toast.error(json.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSaving(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fish");
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setBatches(json.data.batches || []);
        if (json.data.ponds) setPonds(json.data.ponds);
        if (json.data.species) setSpeciesList(json.data.species);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("মাছের স্টক ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return batches;
    const term = searchTerm.toLowerCase();
    return batches.filter(
      (b) =>
        b.pond_name.toLowerCase().includes(term) ||
        b.species_name.toLowerCase().includes(term) ||
        b.batch_no.toLowerCase().includes(term)
    );
  }, [batches, searchTerm]);

  // Aggregate stats by size:
  // পোনা মাছ: avg weight < 200g
  // মাঝারি মাছ: 200g <= avg weight < 800g
  // বড় মাছ: avg weight >= 800g
  let totalLive = 0;
  let ponaCount = 0;
  let mediumCount = 0;
  let largeCount = 0;
  let totalBiomassKg = 0;

  batches.forEach((b) => {
    const count = b.current_fish_count || 0;
    const w = b.latest_avg_weight_g || 0;
    totalLive += count;
    totalBiomassKg += Number(b.estimated_biomass_kg || 0);

    if (w >= 800) {
      largeCount += count;
    } else if (w >= 200) {
      mediumCount += count;
    } else {
      ponaCount += count;
    }
  });

  return (
    <div className="space-y-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <Fish className="w-6 h-6 text-[#166534]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              পুকুরভিত্তিক মাছের স্টক (Pond &amp; Fish Inventory)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              কোন পুকুরে কি মাছ আছে, মাঝারি সাইজ, বড় সাইজ ও পোনা মাছের লাইভ স্টক রিপোর্ট
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন মাছের স্টক / পোনা যোগ</span>
        </button>
      </div>

      {/* 2. Four KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Live Fish */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মোট জীবন্ত মাছ</span>
            <Fish className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-[#166534] dark:text-emerald-400 mt-1">
            {totalLive.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">সব পুকুর মিলিয়ে মোট মজুদ</div>
        </div>

        {/* Large Fish (800g+) */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>বড় সাইজ মাছ (৮০০g+)</span>
            <Boxes className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
            {largeCount.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">আহরণ ও বিক্রির উপযুক্ত বড় মাছ</div>
        </div>

        {/* Medium Fish (200g - 800g) */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>মাঝারি সাইজ মাছ</span>
            <Scale className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-sky-700 dark:text-sky-400 mt-1">
            {mediumCount.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">২০০ গ্রাম থেকে ৮০০ গ্রাম সাইজ</div>
        </div>

        {/* Fingerlings / Small (<200g) */}
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
            <span>পোনা মাছের স্টক</span>
            <Droplets className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {ponaCount.toLocaleString("en-US")} টি
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">নার্সারি ও গ্রোয়ার পোনা মাছ</div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="পুকুরের নাম, মাছের জাত দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          মোট সম্ভাব্য বায়োমাস: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{Math.round(totalBiomassKg).toLocaleString()} কেজি</strong>
        </div>
      </div>

      {/* 4. Desktop Stock Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="py-3 px-3 text-center w-12">ক্র: নং</th>
                <th className="py-3 px-4">পুকুরের নাম ও অবস্থান</th>
                <th className="py-3 px-3">মাছের নাম ও জাত</th>
                <th className="py-3 px-3 text-center">সাইজ ক্যাটাগরি</th>
                <th className="py-3 px-3 text-center">বর্তমান জীবন্ত সংখ্যা</th>
                <th className="py-3 px-3 text-center">গড় ওজন (গ্রাম / কেজি)</th>
                <th className="py-3 px-3 text-right">সম্ভাব্য মোট ওজন (কেজি)</th>
                <th className="py-3 px-3 text-center">চাষকাল (বয়স)</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>মাছের স্টক ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-bold">
                    কোনো পুকুরের মাছের স্টক পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const w = item.latest_avg_weight_g || 0;
                  const sizeCategory = w >= 800 ? "বড় মাছ" : w >= 200 ? "মাঝারি মাছ" : "পোনা মাছ";
                  const sizeColor =
                    w >= 800
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200"
                      : w >= 200
                        ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200";

                  const ageDays = Math.max(1, Math.floor((new Date().getTime() - new Date(item.stocking_date).getTime()) / 86400000));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-sky-600" />
                          <span>{item.pond_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ব্যাচ: {item.batch_no} &bull; ছাড়া হয়েছে: {item.stocking_date}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400">
                          {item.species_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${sizeColor}`}>
                          {sizeCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {item.current_fish_count.toLocaleString()} টি
                        <div className="text-[10px] text-slate-400 font-normal">
                          প্রারম্ভিক পোনা: {item.fingerling_count.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {w >= 1000 ? `${(w / 1000).toFixed(2)} কেজি` : `${w} গ্রাম`}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-amber-700 dark:text-amber-400 text-sm">
                        {Math.round(item.estimated_biomass_kg).toLocaleString()} কেজি
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {ageDays} দিন
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

      {/* Inward Fish Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide m-0 text-white">
                  নতুন মাছের স্টক / পোনা যোগ (Add Fish Stock)
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

            <form onSubmit={handleCreateFishStock} className="p-5 space-y-3.5 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পুকুর নির্বাচন <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.pond_id}
                    onChange={(e) => setFormData({ ...formData, pond_id: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">পুকুর বেছে নিন...</option>
                    {ponds.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.pond_name} ({p.pond_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মাছের প্রজাতি <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.species_id}
                    onChange={(e) => setFormData({ ...formData, species_id: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">প্রজাতি বেছে নিন...</option>
                    {speciesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_bn || s.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পোনার সংখ্যা (পিস) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="যেমন: 5000"
                    value={formData.fingerling_count}
                    onChange={(e) => setFormData({ ...formData, fingerling_count: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মজুদকরণ তারিখ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.stocking_date}
                    onChange={(e) => setFormData({ ...formData, stocking_date: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    প্রতি পোনা ক্রয়মূল্য / খরচ (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.fingerling_unit_cost}
                    onChange={(e) => setFormData({ ...formData, fingerling_unit_cost: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    নোট / মন্তব্য
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: হ্যাচারি থেকে পোনা সংগ্রহ"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>সংরক্ষণ ও স্টক ইন (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

