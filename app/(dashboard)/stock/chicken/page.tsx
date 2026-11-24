"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Egg,
  Plus,
  X,
  Search,
  Home,
  Boxes,
  TrendingUp,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  Package,
  CheckCircle2,
} from "lucide-react";
import { useToast, Pagination , PageSkeleton, CustomSelect, CustomDatePicker } from "@/components/ui";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Convert Chicken to Product Modal
  const [isConvertChickenModalOpen, setIsConvertChickenModalOpen] = useState(false);
  const [convertSubmitting, setConvertSubmitting] = useState(false);
  const [selectedChickenFlock, setSelectedChickenFlock] = useState<ShedStockItem | null>(null);
  const [chickenSizeGroup, setChickenSizeGroup] = useState<"LARGE" | "MEDIUM" | "CHICK">("LARGE");
  const [chickenUnit, setChickenUnit] = useState<"Pcs" | "Kg">("Pcs");
  const [chickenAmount, setChickenAmount] = useState<string>("50");
  const [chickenSellPrice, setChickenSellPrice] = useState<string>("220");
  const [chickenProductName, setChickenProductName] = useState<string>("জীবন্ত ব্রয়লার মুরগি");


  // Shed and Breed dynamic options
  const defaultSheds = useMemo(
    () => [
      "শেড ১",
      "শেড ২",
      "শেড ৩",
      "লেয়ার শেড ১",
      "লেয়ার শেড ২",
      "লেয়ার শেড ৩",
      "ব্রয়লার শেড ১",
      "ব্রয়লার শেড ২",
      "সোনালী শেড ১",
    ],
    []
  );

  const defaultBreeds = useMemo(
    () => [
      "লেয়ার (ব্রাউন)",
      "লেয়ার (সাদা)",
      "ব্রয়লার (মাংসের জন্য)",
      "সোনালী (ক্লাসিক)",
      "সোনালী (হাইব্রিড)",
      "হাই-লাইন ব্রাউন",
      "কক / ফাউমি",
      "দেশি মুরগি",
      "টার্কি",
      "কোয়েল",
    ],
    []
  );

  const [customSheds, setCustomSheds] = useState<string[]>([]);
  const [customBreeds, setCustomBreeds] = useState<string[]>([]);
  const [isAddShedModalOpen, setIsAddShedModalOpen] = useState(false);
  const [isAddBreedModalOpen, setIsAddBreedModalOpen] = useState(false);
  const [newShedInput, setNewShedInput] = useState("");
  const [newBreedInput, setNewBreedInput] = useState("");

  // Load custom sheds and breeds from localStorage
  useEffect(() => {
    try {
      const storedSheds = localStorage.getItem("ap_chicken_sheds");
      if (storedSheds) setCustomSheds(JSON.parse(storedSheds));
      const storedBreeds = localStorage.getItem("ap_chicken_breeds");
      if (storedBreeds) setCustomBreeds(JSON.parse(storedBreeds));
    } catch (e) {
      // ignore
    }
  }, []);

  const allSheds = useMemo(() => {
    const fromFlocks = flocks.map((f) => f.shed_name).filter(Boolean);
    const set = new Set([...customSheds, ...fromFlocks, ...defaultSheds]);
    return Array.from(set);
  }, [flocks, customSheds, defaultSheds]);

  const allBreeds = useMemo(() => {
    const fromFlocks = flocks.map((f) => f.breed).filter(Boolean);
    const set = new Set([...customBreeds, ...fromFlocks, ...defaultBreeds]);
    return Array.from(set);
  }, [flocks, customBreeds, defaultBreeds]);

  const handleSaveNewShed = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newShedInput.trim();
    if (!trimmed) {
      toast.error("শেডের নাম লিখুন", "ত্রুটি");
      return;
    }
    const updated = Array.from(new Set([trimmed, ...customSheds]));
    setCustomSheds(updated);
    try {
      localStorage.setItem("ap_chicken_sheds", JSON.stringify(updated));
    } catch (e) {}
    setFormData((prev) => ({ ...prev, shed_name: trimmed }));
    setNewShedInput("");
    setIsAddShedModalOpen(false);
    toast.success("নতুন শেড সফলভাবে যুক্ত হয়েছে!", "সফল");
  };

  const handleSaveNewBreed = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBreedInput.trim();
    if (!trimmed) {
      toast.error("মুরগির জাতের নাম লিখুন", "ত্রুটি");
      return;
    }
    const updated = Array.from(new Set([trimmed, ...customBreeds]));
    setCustomBreeds(updated);
    try {
      localStorage.setItem("ap_chicken_breeds", JSON.stringify(updated));
    } catch (e) {}
    setFormData((prev) => ({ ...prev, breed: trimmed }));
    setNewBreedInput("");
    setIsAddBreedModalOpen(false);
    toast.success("নতুন জাত সফলভাবে যুক্ত হয়েছে!", "সফল");
  };

  const [formData, setFormData] = useState({
    shed_name: "",
    breed: "লেয়ার (ব্রাউন)",
    initial_chicks_count: "",
    housing_date: new Date().toISOString().split("T")[0],
    unit_price: "",
    paid_amount: "",
    note: "",
  });


  const handleOpenConvertChickenModal = (item: ShedStockItem) => {
    setSelectedChickenFlock(item);
    setChickenSizeGroup("LARGE");
    setChickenUnit("Pcs");
    const count = Number(item.current_birds ?? item.current_birds_count ?? 10);
    setChickenAmount(String(Math.min(50, count)));
    setChickenSellPrice("220");
    setChickenProductName(`জীবন্ত ব্রয়লার মুরগি (${item.shed_name})`);
    setIsConvertChickenModalOpen(true);
  };

  const handleChickenSizeChange = (size: "LARGE" | "MEDIUM" | "CHICK") => {
    setChickenSizeGroup(size);
    if (!selectedChickenFlock) return;
    if (size === "LARGE") {
      setChickenSellPrice("220");
      setChickenProductName(`জীবন্ত বড় মুরগি (${selectedChickenFlock.shed_name} - ${selectedChickenFlock.breed})`);
    } else if (size === "MEDIUM") {
      setChickenSellPrice("180");
      setChickenProductName(`মাঝারি সাইজের মুরগি (${selectedChickenFlock.shed_name} - ${selectedChickenFlock.breed})`);
    } else {
      setChickenSellPrice("65");
      setChickenProductName(`বাচ্চা মুরগি / ছানা (${selectedChickenFlock.shed_name} - ${selectedChickenFlock.breed})`);
    }
  };

  const handleConvertChickenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChickenFlock) return;
    const amountNum = parseFloat(chickenAmount);
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
          },
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.status === "success") {
        toast.success(resData.message || "মুরগি সফলভাবে বিক্রয়যোগ্য পণ্যে রূপান্তর করা হয়েছে!", "সফল");
        setIsConvertChickenModalOpen(false);
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

  const handleCreateFlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shed_name || !formData.breed || !formData.initial_chicks_count) {
      toast.error("শেডের নাম, জাত এবং মুরগির সংখ্যা দিন", "ত্রুটি");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/egg/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shed_name: formData.shed_name,
          breed: formData.breed,
          initial_chicks_count: Number(formData.initial_chicks_count),
          housing_date: formData.housing_date,
          unit_price: Number(formData.unit_price || 0),
          paid_amount: Number(formData.paid_amount || 0),
          note: formData.note,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success("নতুন মুরগির বাচ্চা/স্টক সফলভাবে যুক্ত হয়েছে!", "সফল");
        setIsModalOpen(false);
        setFormData({
          shed_name: "",
          breed: "লেয়ার (ব্রাউন)",
          initial_chicks_count: "",
          housing_date: new Date().toISOString().split("T")[0],
          unit_price: "",
          paid_amount: "",
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

  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Aggregate stats:
  // বড় মুরগি (Adult Layers): age >= 120 days (~4+ months)
  // মাঝারি মুরগি (Growers): 45 <= age < 120 days
  // বাচ্চা মুরগি: age < 45 days
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

  if (loading && flocks.length === 0) {

    return <PageSkeleton />;

  }

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন বাচ্চা/মুরগি স্টক যোগ</span>
        </button>
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
            <span>ছোট ও বাচ্চা মুরগি</span>
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
        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="text-center w-12 p-[10px]">ক্র: নং</th>
                <th className="p-[10px]">শেডের নাম ও কোড</th>
                <th className="p-[10px]">মুরগির জাত</th>
                <th className="text-center p-[10px]">বড় মুরগি</th>
                <th className="text-center p-[10px]">মাঝারি মুরগি</th>
                <th className="text-center p-[10px]">বাচ্চা মুরগি</th>
                <th className="text-center p-[10px]">শেডে বর্তমান মোট</th>
                <th className="text-center p-[10px]">বয়স</th>
                <th className="text-center p-[10px]">স্ট্যাটাস</th>
                <th className="text-center w-28 p-[10px]">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 p-[10px]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>শেডের স্টক ডাটা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-slate-400 font-bold p-[10px]">
                    কোনো শেডের স্টক তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => {
                  const age = item.age_days || 0;
                  const isAdult = age >= 120;
                  const isGrower = age >= 45 && age < 120;
                  const isChick = age < 45;

                  const adultBirds = isAdult ? item.current_birds : 0;
                  const growerBirds = isGrower ? item.current_birds : 0;
                  const chickBirds = isChick ? item.current_birds : 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="text-center font-bold text-slate-400 p-[10px]">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="p-[10px]">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-emerald-700" />
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
                      <td className="text-center font-bold text-orange-600 dark:text-orange-400 p-[10px]">
                        {adultBirds > 0 ? `${adultBirds.toLocaleString()} টি` : "—"}
                      </td>
                      <td className="text-center font-bold text-sky-700 dark:text-sky-400 p-[10px]">
                        {growerBirds > 0 ? `${growerBirds.toLocaleString()} টি` : "—"}
                      </td>
                      <td className="text-center font-bold text-amber-600 dark:text-amber-400 p-[10px]">
                        {chickBirds > 0 ? `${chickBirds.toLocaleString()} টি` : "—"}
                      </td>
                      <td className="text-center font-black text-emerald-700 dark:text-emerald-400 text-sm p-[10px]">
                        {Number(item.current_birds ?? item.current_birds_count ?? 0).toLocaleString()} টি
                      </td>
                      <td className="text-center font-bold text-slate-700 dark:text-slate-300 p-[10px]">
                        {item.age_display || `${age} দিন`}
                      </td>
                      <td className="text-center p-[10px]">
                        <span className="whitespace-nowrap inline-flex items-center shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {item.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="text-center p-[10px]">
                        <button
                          type="button"
                          onClick={() => handleOpenConvertChickenModal(item)}
                          className="h-[28px] px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center gap-1.5 mx-auto transition-all cursor-pointer shadow-xs whitespace-nowrap"
                          title="বিক্রয়যোগ্য পণ্য হিসেবে প্রোডাক্ট ইনভেন্টরিতে যোগ করুন"
                        >
                          <Boxes className="w-3 h-3" />
                          <span>প্রোডাক্টে যোগ</span>
                        </button>
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
              <span>শেডের স্টক ডাটা লোড হচ্ছে...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              কোনো শেডের স্টক তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            displayedItems.map((item, idx) => {
              const age = item.age_days || 0;
              const isAdult = age >= 120;
              const isGrower = age >= 45 && age < 120;
              const isChick = age < 45;

              const adultBirds = isAdult ? item.current_birds : 0;
              const growerBirds = isGrower ? item.current_birds : 0;
              const chickBirds = isChick ? item.current_birds : 0;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 shadow-2xs"
                >
                  {/* Card Header: Shed Name & Code + Breed & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{item.shed_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.flock_code} • আগমন: {item.housing_date || "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                        {item.breed}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {item.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid: Compact, with ample space for numbers so they never wrap */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/70">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">শেডে বর্তমান মোট</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm whitespace-nowrap">
                        {Number(item.current_birds ?? item.current_birds_count ?? 0).toLocaleString()} টি
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">বয়স</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs whitespace-nowrap">
                        {item.age_display || `${age} দিন`}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 col-span-2 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[10px] block">বড় মুরগি</span>
                        <span className="font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                          {adultBirds > 0 ? `${adultBirds.toLocaleString()} টি` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">মাঝারি</span>
                        <span className="font-bold text-sky-700 dark:text-sky-400 whitespace-nowrap">
                          {growerBirds > 0 ? `${growerBirds.toLocaleString()} টি` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">বাচ্চা</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                          {chickBirds > 0 ? `${chickBirds.toLocaleString()} টি` : "—"}
                        </span>
                      </div>
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

      {/* Inward Stock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide m-0 text-white">
                  নতুন বাচ্চা / মুরগি স্টক ইন (Add Chicken Stock)
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

            <form onSubmit={handleCreateFlock} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    শেডের নাম / নম্বর <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        options={allSheds}
                        value={formData.shed_name}
                        onChange={(val) => setFormData({ ...formData, shed_name: String(val) })}
                        placeholder="শেড নির্বাচন করুন..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddShedModalOpen(true)}
                      className="h-[42px] w-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="নতুন শেড যোগ করুন"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মুরগির জাত / প্রজাতি <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <CustomSelect
                        options={allBreeds}
                        value={formData.breed}
                        onChange={(val) => setFormData({ ...formData, breed: String(val) })}
                        placeholder="জাত / প্রজাতি নির্বাচন করুন..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddBreedModalOpen(true)}
                      className="h-[42px] w-[42px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                      title="নতুন জাত যোগ করুন"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    বাচ্চা / মুরগির সংখ্যা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="যেমন: 500"
                    value={formData.initial_chicks_count}
                    onChange={(e) => setFormData({ ...formData, initial_chicks_count: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    শেডে আগমনের তারিখ <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={formData.housing_date}
                    onChange={(d) => setFormData({ ...formData, housing_date: d })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    প্রতি পিস ক্রয়মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পরিশোধিত টাকা (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.paid_amount}
                    onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মন্তব্য / বিবরণ
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: আফতাব ফিড হ্যাচারি থেকে সংগৃহীত"
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
      {/* Add New Shed Modal */}
      {isAddShedModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] flex flex-col">
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  নতুন শেড যোগ করুন (Add Shed)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddShedModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewShed} className="flex flex-col">
              <div className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    শেডের নাম / নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শেড ৪, ব্রয়লার শেড ২"
                    value={newShedInput}
                    onChange={(e) => setNewShedInput(e.target.value)}
                    className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddShedModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>শেড সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Breed Modal */}
      {isAddBreedModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] flex flex-col">
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  নতুন মুরগির জাত যোগ (Add Breed)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBreedModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewBreed} className="flex flex-col">
              <div className="p-5 space-y-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মুরগির জাত / প্রজাতির নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সোনালী সুপার, হাই-লাইন সাদা"
                    value={newBreedInput}
                    onChange={(e) => setNewBreedInput(e.target.value)}
                    className="w-full h-[42px] px-3 bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddBreedModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>জাত সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Chicken Stock to Product Modal */}
      {isConvertChickenModalOpen && selectedChickenFlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base leading-tight">মুরগি বিক্রয়যোগ্য পণ্যে রূপান্তর / যোগ (Add Chicken to Products)</h3>
                  <p className="text-[11px] text-emerald-100 font-normal">শেড স্টক হতে মুরগি বিক্রয়যোগ্য পণ্য হিসেবে ইনভেন্টরিতে যুক্ত করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertChickenModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConvertChickenSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
                {/* Source details card */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">উৎস শেড ও জাত:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {selectedChickenFlock.shed_name} ({selectedChickenFlock.breed})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">শেডে বর্তমান জীবন্ত মুরগি:</span>
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-xs">
                      {selectedChickenFlock.current_birds} টি
                    </span>
                  </div>
                </div>

                {/* Size / Group Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    মুরগির সাইজ ও বয়স ক্যাটাগরি <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChickenSizeChange("LARGE")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
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
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        chickenSizeGroup === "MEDIUM"
                          ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-800 dark:text-sky-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      মাঝারি (Grower)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChickenSizeChange("CHICK")}
                      className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        chickenSizeGroup === "CHICK"
                          ? "bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      বাচ্চা মুরগি (Chick)
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
                        { value: "Pcs", label: "পিস (Piece / টি)" },
                        { value: "Kg", label: "কেজি (Kg)" },
                      ]}
                      value={chickenUnit}
                      onChange={(v) => setChickenUnit(v as any)}
                      placeholder="একক নির্বাচন করুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      পরিমাণ ({chickenUnit === "Pcs" ? "টি" : "কেজি"}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={chickenAmount}
                      onChange={(e) => setChickenAmount(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white font-bold focus:outline-emerald-600"
                    />
                  </div>
                </div>

                {/* Selling Price & Product Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      বিক্রয় মূল্য প্রতি {chickenUnit === "Pcs" ? "পিস" : "কেজি"} (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={chickenSellPrice}
                      onChange={(e) => setChickenSellPrice(e.target.value)}
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
                      value={chickenProductName}
                      onChange={(e) => setChickenProductName(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsConvertChickenModalOpen(false)}
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

    </div>
  );
}

