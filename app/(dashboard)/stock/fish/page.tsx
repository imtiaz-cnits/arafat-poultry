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
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { useToast, Pagination, PageSkeleton, CustomSelect, CustomDatePicker, DeleteConfirmModal } from "@/components/ui";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ponds, setPonds] = useState<any[]>([]);
  const [speciesList, setSpeciesList] = useState<any[]>([]);

  // Add Pond Modal State
  const [isAddPondModalOpen, setIsAddPondModalOpen] = useState(false);
  const [savingPond, setSavingPond] = useState(false);
  const [newPond, setNewPond] = useState({
    pond_name: "",
    pond_code: "",
    area_decimal: "",
    water_depth_feet: "5.0",
    location: "",
    note: "",
  });

  // Add Species Modal State
  const [isAddSpeciesModalOpen, setIsAddSpeciesModalOpen] = useState(false);
  const [savingSpecies, setSavingSpecies] = useState(false);
  // Convert Fish to Product Modal
  const [isConvertFishModalOpen, setIsConvertFishModalOpen] = useState(false);
  const [convertSubmitting, setConvertSubmitting] = useState(false);
  const [selectedFishBatch, setSelectedFishBatch] = useState<PondStockItem | null>(null);
  const [fishSizeCategory, setFishSizeCategory] = useState<"LARGE" | "MEDIUM" | "FINGERLING">("LARGE");
  const [fishUnit, setFishUnit] = useState<"Kg" | "Gram" | "Pcs">("Kg");
  const [fishAmount, setFishAmount] = useState<string>("50");
  const [fishSellPrice, setFishSellPrice] = useState<string>("240");
  const [fishProductName, setFishProductName] = useState<string>("তাজা মাছ");

  const [newSpecies, setNewSpecies] = useState({
    species_name: "",
    scientific_name: "",
  });

  const [formData, setFormData] = useState({
    pond_id: "",
    species_id: "",
    fingerling_count: "",
    fingerling_unit_cost: "",
    stocking_date: new Date().toISOString().split("T")[0],
    note: "",
  });


  const handleOpenConvertFishModal = (item: PondStockItem) => {
    setSelectedFishBatch(item);
    const w = item.latest_avg_weight_g || 0;
    const initialSize = w >= 800 ? "LARGE" : w >= 200 ? "MEDIUM" : "FINGERLING";
    setFishSizeCategory(initialSize);
    setFishUnit("Kg");
    setFishAmount(String(Math.min(50, Math.round(item.estimated_biomass_kg || 10))));
    setFishSellPrice("240");
    setFishProductName(`তাজা ${item.species_name} (${item.pond_name})`);
    setIsConvertFishModalOpen(true);
  };

  const handleFishSizeChange = (size: "LARGE" | "MEDIUM" | "FINGERLING") => {
    setFishSizeCategory(size);
    if (!selectedFishBatch) return;
    if (size === "LARGE") {
      setFishSellPrice("280");
      setFishProductName(`বড় সাইজের তাজা ${selectedFishBatch.species_name} (${selectedFishBatch.pond_name})`);
    } else if (size === "MEDIUM") {
      setFishSellPrice("220");
      setFishProductName(`মাঝারি ${selectedFishBatch.species_name} (${selectedFishBatch.pond_name})`);
    } else {
      setFishSellPrice("140");
      setFishProductName(`পোনা মাছ / ছোট ${selectedFishBatch.species_name} (${selectedFishBatch.pond_name})`);
    }
  };

  const handleConvertFishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFishBatch) return;
    const amountNum = parseFloat(fishAmount);
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
          type: "FISH",
          source_id: selectedFishBatch.id,
          product_name: fishProductName.trim(),
          quantity: amountNum,
          unit: fishUnit,
          sell_price: parseFloat(fishSellPrice) || 0,
          cost_price: 0,
          metadata: {
            pond_name: selectedFishBatch.pond_name,
            species_name: selectedFishBatch.species_name,
            size_category: fishSizeCategory,
          },
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.status === "success") {
        toast.success(resData.message || "মাছ সফলভাবে বিক্রয়যোগ্য পণ্যে রূপান্তর করা হয়েছে!", "সফল");
        setIsConvertFishModalOpen(false);
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

  const handleCreatePond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPond.pond_name.trim()) {
      toast.error("পুকুরের নাম আবশ্যক", "ত্রুটি");
      return;
    }
    try {
      setSavingPond(true);
      const res = await fetch("/api/fish/ponds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pond_name: newPond.pond_name.trim(),
          pond_code: newPond.pond_code.trim() || undefined,
          area_decimal: parseFloat(newPond.area_decimal) || 0,
          water_depth_feet: parseFloat(newPond.water_depth_feet) || 5,
          location: newPond.location.trim() || undefined,
          note: newPond.note.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.status === "success" && json.data) {
        toast.success("নতুন পুকুর সফলভাবে যুক্ত হয়েছে!", "সফল");
        setPonds((prev) => [json.data, ...prev]);
        setFormData((prev) => ({ ...prev, pond_id: String(json.data.id) }));
        setIsAddPondModalOpen(false);
        setNewPond({
          pond_name: "",
          pond_code: "",
          area_decimal: "",
          water_depth_feet: "5.0",
          location: "",
          note: "",
        });
      } else {
        toast.error(json.message || "পুকুর সংরক্ষণ করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSavingPond(false);
    }
  };

  const handleCreateSpecies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecies.species_name.trim()) {
      toast.error("মাছের প্রজাতির নাম আবশ্যক", "ত্রুটি");
      return;
    }
    try {
      setSavingSpecies(true);
      const res = await fetch("/api/fish/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          species_name: newSpecies.species_name.trim(),
          scientific_name: newSpecies.scientific_name.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.status === "success" && json.data) {
        toast.success("নতুন মাছের প্রজাতি যুক্ত হয়েছে!", "সফল");
        setSpeciesList((prev) => [json.data, ...prev]);
        setFormData((prev) => ({ ...prev, species_id: String(json.data.id) }));
        setIsAddSpeciesModalOpen(false);
        setNewSpecies({ species_name: "", scientific_name: "" });
      } else {
        toast.error(json.message || "সংরক্ষণ করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSavingSpecies(false);
    }
  };

  const [deleteBatch, setDeleteBatch] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteBatch = async () => {
    if (!deleteBatch) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/fish/batches?id=${deleteBatch.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.status === "success") {
        toast.success(json.message || "মাছের স্টক সফলভাবে মুছে ফেলা হয়েছে!", "সফল");
        setDeleteBatch(null);
        loadData();
      } else {
        toast.error(json.message || "মুছে ফেলা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setIsDeleting(false);
    }
  };

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

  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

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

  if (loading && batches.length === 0) {

    return <PageSkeleton />;

  }

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
        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="text-center w-12 p-[10px]">ক্র: নং</th>
                <th className="p-[10px]">পুকুরের নাম ও অবস্থান</th>
                <th className="p-[10px]">মাছের নাম ও জাত</th>
                <th className="text-center p-[10px]">সাইজ ক্যাটাগরি</th>
                <th className="text-center p-[10px]">বর্তমান জীবন্ত সংখ্যা</th>
                <th className="text-center p-[10px]">গড় ওজন</th>
                <th className="text-right p-[10px]">মোট ওজন</th>
                <th className="text-center p-[10px]">চাষকাল</th>
                <th className="text-center p-[10px]">স্ট্যাটাস</th>
                <th className="text-center w-28 p-[10px]">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 p-[10px]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>মাছের স্টক ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 font-bold p-[10px]">
                    কোনো পুকুরের মাছের স্টক পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => {
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
                      <td className="text-center font-bold text-slate-400 p-[10px]">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="p-[10px]">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5 text-sky-600" />
                          <span>{item.pond_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ব্যাচ: {item.batch_no} &bull; ছাড়া হয়েছে: {item.stocking_date}
                        </div>
                      </td>
                      <td className="font-semibold text-slate-800 dark:text-slate-200 p-[10px]">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400">
                          {item.species_name}
                        </span>
                      </td>
                      <td className="text-center p-[10px]">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${sizeColor}`}>
                          {sizeCategory}
                        </span>
                      </td>
                      <td className="text-center font-black text-emerald-700 dark:text-emerald-400 text-sm p-[10px]">
                        {item.current_fish_count.toLocaleString()} টি
                        <div className="text-[10px] text-slate-400 font-normal">
                          প্রারম্ভিক পোনা: {item.fingerling_count.toLocaleString()}
                        </div>
                      </td>
                      <td className="text-center font-bold text-slate-800 dark:text-slate-200 p-[10px]">
                        {w >= 1000 ? `${(w / 1000).toFixed(2)} কেজি` : `${w} গ্রাম`}
                      </td>
                      <td className="text-right font-black text-amber-700 dark:text-amber-400 text-sm p-[10px]">
                        {Math.round(item.estimated_biomass_kg).toLocaleString()} কেজি
                      </td>
                      <td className="text-center font-bold text-slate-700 dark:text-slate-300 p-[10px]">
                        {ageDays} দিন
                      </td>
                      <td className="text-center p-[10px]">
                        <span className="whitespace-nowrap inline-flex items-center shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {item.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="text-center p-[10px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDeleteBatch(item)}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center transition-colors cursor-pointer"
                            title="মাছের স্টক মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenConvertFishModal(item)}
                            className="h-[28px] px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                            title="বিক্রয়যোগ্য পণ্য হিসেবে প্রোডাক্ট ইনভেন্টরিতে যোগ করুন"
                          >
                            <Boxes className="w-3 h-3" />
                            <span>প্রোডাক্টে যোগ</span>
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

        {/* Mobile View: Compact Box Cards */}
        <div className="md:hidden space-y-2.5 p-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <span>মাছের স্টক ডাটা লোড হচ্ছে...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              কোনো পুকুরের মাছের স্টক পাওয়া যায়নি।
            </div>
          ) : (
            displayedItems.map((item, idx) => {
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
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 shadow-2xs"
                >
                  {/* Card Header: Pond & Batch + Species & Size */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{item.pond_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.batch_no} • ছাড়া হয়েছে: {item.stocking_date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="font-bold text-xs text-emerald-800 dark:text-emerald-400">
                        {item.species_name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${sizeColor}`}>
                        {sizeCategory}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteBatch(item)}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center transition-colors cursor-pointer"
                        title="মাছের স্টক মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenConvertFishModal(item)}
                        className="w-7 h-7 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="প্রোডাক্টে যোগ"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid: Compact, with ample space for numbers so they never wrap */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/70">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">বর্তমান জীবন্ত সংখ্যা</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm whitespace-nowrap">
                        {item.current_fish_count.toLocaleString()} টি
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        পোনা: {item.fingerling_count.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/70">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">মোট ওজন (বায়োমাস)</span>
                      <span className="font-black text-amber-700 dark:text-amber-400 text-sm whitespace-nowrap">
                        {Math.round(item.estimated_biomass_kg).toLocaleString()} কেজি
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        গড় ওজন: {w >= 1000 ? `${(w / 1000).toFixed(2)} কেজি` : `${w} গ্রাম`}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">চাষকাল</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs whitespace-nowrap">
                        {ageDays} দিন
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">স্ট্যাটাস</span>
                      <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {item.status || "ACTIVE"}
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

            <form onSubmit={handleCreateFishStock} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পুকুর নির্বাচন <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        options={ponds.map((p) => ({
                          value: String(p.id),
                          label: `${p.pond_name} (${p.pond_code})`,
                          subLabel: (p.area_decimal || p.pond_area_decimal) ? `আয়তন: ${p.area_decimal || p.pond_area_decimal} শতাংশ` : undefined,
                        }))}
                        value={formData.pond_id}
                        onChange={(val) => setFormData({ ...formData, pond_id: String(val) })}
                        placeholder="পুকুর বেছে নিন..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddPondModalOpen(true)}
                      className="h-[42px] w-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="নতুন পুকুর যোগ করুন"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মাছের প্রজাতি <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        options={speciesList.map((s) => ({
                          value: String(s.id),
                          label: s.species_name || s.name_bn || s.name_en || `প্রজাতি #${s.id}`,
                          subLabel: s.scientific_name || s.name_scientific || undefined,
                        }))}
                        value={formData.species_id}
                        onChange={(val) => setFormData({ ...formData, species_id: String(val) })}
                        placeholder="প্রজাতি বেছে নিন..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddSpeciesModalOpen(true)}
                      className="h-[42px] w-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="নতুন মাছের প্রজাতি যোগ করুন"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
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
                  <CustomDatePicker
                    value={formData.stocking_date}
                    onChange={(d) => setFormData({ ...formData, stocking_date: d })}
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

              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
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
      {/* Add New Pond Modal */}
      {isAddPondModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] flex flex-col">
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  নতুন পুকুর যোগ করুন (Add New Pond)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPondModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePond} className="flex flex-col">
              <div className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    পুকুরের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: পুকুর ১ (দক্ষিণ পাড়)"
                    value={newPond.pond_name}
                    onChange={(e) => setNewPond({ ...newPond, pond_name: e.target.value })}
                    className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      পুকুর কোড
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: PND-01"
                      value={newPond.pond_code}
                      onChange={(e) => setNewPond({ ...newPond, pond_code: e.target.value })}
                      className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      আয়তন (শতাংশ)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="যেমন: ৩০"
                      value={newPond.area_decimal}
                      onChange={(e) => setNewPond({ ...newPond, area_decimal: e.target.value })}
                      className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      গভীরতা (ফুট)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="যেমন: ৫.৫"
                      value={newPond.water_depth_feet}
                      onChange={(e) => setNewPond({ ...newPond, water_depth_feet: e.target.value })}
                      className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      অবস্থান / লোকেশন
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: খামার প্রাঙ্গণ"
                      value={newPond.location}
                      onChange={(e) => setNewPond({ ...newPond, location: e.target.value })}
                      className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddPondModalOpen(false)}
                  disabled={savingPond}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingPond}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {savingPond && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>পুকুর সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Fish Species Modal */}
      {isAddSpeciesModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] flex flex-col">
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  নতুন মাছের প্রজাতি যোগ করুন (Add Species)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSpeciesModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSpecies} className="flex flex-col">
              <div className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    প্রজাতির নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রুই, কাতলা, পাঙ্গাশ, তেলাপিয়া"
                    value={newSpecies.species_name}
                    onChange={(e) => setNewSpecies({ ...newSpecies, species_name: e.target.value })}
                    className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বৈজ্ঞানিক নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: Labeo rohita"
                    value={newSpecies.scientific_name}
                    onChange={(e) => setNewSpecies({ ...newSpecies, scientific_name: e.target.value })}
                    className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddSpeciesModalOpen(false)}
                  disabled={savingSpecies}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingSpecies}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {savingSpecies && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>প্রজাতি সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Fish Stock to Product Modal */}
      {isConvertFishModalOpen && selectedFishBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base leading-tight">মাছ বিক্রয়যোগ্য পণ্যে রূপান্তর / যোগ (Add Fish to Products)</h3>
                  <p className="text-[11px] text-emerald-100 font-normal">পুকুর স্টক হতে মাছ বিক্রয়যোগ্য পণ্য হিসেবে ইনভেন্টরিতে যুক্ত করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertFishModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConvertFishSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
                {/* Source details card */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">উৎস পুকুর ও প্রজাতি:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {selectedFishBatch.pond_name} ({selectedFishBatch.species_name})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">মজুত বায়োমাস ও মাছ:</span>
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                      {Math.round(selectedFishBatch.estimated_biomass_kg)} কেজি ({selectedFishBatch.current_fish_count} টি)
                    </span>
                  </div>
                </div>

                {/* Size Category Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    মাছের সাইজ ক্যাটাগরি <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFishSizeChange("LARGE")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        fishSizeCategory === "LARGE"
                          ? "bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-800 dark:text-purple-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      বড় মাছ (৮০০ গ্রাম+)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFishSizeChange("MEDIUM")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        fishSizeCategory === "MEDIUM"
                          ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-800 dark:text-sky-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      মাঝারি (২০০-৮০০ গ্রাম)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFishSizeChange("FINGERLING")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        fishSizeCategory === "FINGERLING"
                          ? "bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      পোনা মাছ (&lt;২০০ গ্রাম)
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
                        { value: "Kg", label: "কেজি (Kg)" },
                        { value: "Gram", label: "গ্রাম (Gram)" },
                        { value: "Pcs", label: "পিস (Piece / টি)" },
                      ]}
                      value={fishUnit}
                      onChange={(v) => setFishUnit(v as any)}
                      placeholder="একক নির্বাচন করুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      পরিমাণ ({fishUnit === "Kg" ? "কেজি" : fishUnit === "Gram" ? "গ্রাম" : "টি"}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={fishAmount}
                      onChange={(e) => setFishAmount(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white font-bold focus:outline-emerald-600"
                    />
                  </div>
                </div>

                {/* Selling Price & Product Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      বিক্রয় মূল্য প্রতি {fishUnit === "Kg" ? "কেজি" : fishUnit === "Gram" ? "গ্রাম" : "পিস"} (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={fishSellPrice}
                      onChange={(e) => setFishSellPrice(e.target.value)}
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
                      value={fishProductName}
                      onChange={(e) => setFishProductName(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsConvertFishModalOpen(false)}
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

      {/* Delete Batch Stock Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteBatch)}
        onClose={() => setDeleteBatch(null)}
        onConfirm={confirmDeleteBatch}
        recordIdentifier={deleteBatch?.batch_no}
        title="মাছের স্টক মুছে ফেলার নিশ্চিতকরণ"
        warningMessage={`আপনি কি নিশ্চিত যে ব্যাচ "${deleteBatch?.batch_no}" (${deleteBatch?.species_name}) এর স্টক মুছে ফেলতে চান?`}
        isLoading={isDeleting}
      />

    </div>
  );
}

