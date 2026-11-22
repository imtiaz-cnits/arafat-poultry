"use client";

import { useState, useEffect } from "react";
import { X, Plus, Loader2, PackagePlus } from "lucide-react";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: any) => void;
}

export function AddProductModal({
  isOpen,
  onClose,
  onProductCreated,
}: AddProductModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("2"); // Default Poultry Eggs
  const [unitId, setUnitId] = useState<string>("3"); // Default Piece
  const [brandId, setBrandId] = useState<string>("1"); // Default Kazi Farms
  const [sellPrice, setSellPrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("100");
  const [productCode, setProductCode] = useState<string>("");

  // Categories for Farm
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([
    { value: "2", label: "ডিম (Poultry Eggs)" },
    { value: "1", label: "ফিড (Poultry Feed)" },
    { value: "3", label: "মাছ (Fisheries)" },
    { value: "4", label: "মুরগি ও বাচ্চা (Poultry / Chicks)" },
  ]);

  // Units
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([
    { value: "3", label: "পিস (Piece)" },
    { value: "4", label: "হালি (Hali)" },
    { value: "5", label: "খাঁচা / ট্রে (Tray)" },
    { value: "2", label: "কেজি (Kg)" },
    { value: "1", label: "বস্তা (Bag)" },
  ]);

  // Fetch dynamic categories and units if available
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, unitRes] = await Promise.all([
          fetch("/api/categories").catch(() => null),
          fetch("/api/units").catch(() => null),
        ]);

        if (catRes && catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.status === "success" && Array.isArray(catJson.data) && catJson.data.length > 0) {
            setCategoryOptions(
              catJson.data.map((c: any) => ({
                value: String(c.id),
                label: c.category_name,
              }))
            );
          }
        }

        if (unitRes && unitRes.ok) {
          const unitJson = await unitRes.json();
          if (unitJson.status === "success" && Array.isArray(unitJson.data) && unitJson.data.length > 0) {
            setUnitOptions(
              unitJson.data.map((u: any) => ({
                value: String(u.id),
                label: u.unit_name,
              }))
            );
          }
        }
      } catch {
        // Fallback options already set
      }
    }

    if (isOpen) {
      loadMeta();
    }
  }, [isOpen]);

  // Auto-switch default unit when category changes
  useEffect(() => {
    if (categoryId === "2") {
      setUnitId("3"); // Piece for eggs
    } else if (categoryId === "3") {
      setUnitId("2"); // Kg for fish
    } else if (categoryId === "4") {
      setUnitId("3"); // Piece for chicken
    } else if (categoryId === "1") {
      setUnitId("1"); // Bag for feed
    }
  }, [categoryId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setProductName("");
      setSellPrice("");
      setCostPrice("");
      setQuantity("100");
      setProductCode("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error("পণ্যের নাম আবশ্যক!", "ভুল তথ্য");
      return;
    }

    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      toast.error("সঠিক বিক্রয় মূল্য লিখুন!", "ভুল তথ্য");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        product_name: productName.trim(),
        category_id: categoryId,
        unit_id: unitId,
        brand_id: brandId || "1",
        sell_price: parseFloat(sellPrice) || 0,
        cost_price: parseFloat(costPrice) || 0,
        quantity: parseFloat(quantity) || 0,
        product_code: productCode.trim() ? [productCode.trim()] : undefined,
        status: "active",
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success(`"${productName}" পণ্য সফলভাবে যোগ করা হয়েছে!`, "সফল");
        onProductCreated(data.data);
        onClose();
      } else {
        toast.error(data.message || "পণ্য যোগ করতে সমস্যা হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      console.error("Product create error:", err);
      toast.error("সার্ভার ত্রুটি, পুনরায় চেষ্টা করুন", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* MODAL HEADER: Deep Forest Green (#166534) Gradient with Circular Red Close Button (#dc2626) */}
        <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white px-5 py-3.5 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <PackagePlus className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black leading-tight text-white">
                নতুন পণ্য যুক্ত করুন (Add Product)
              </h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                পোল্ট্রি, ডিম, মাছ বা ফিড পণ্য সরাসরি ইনভেন্টরিতে অন্তর্ভুক্ত করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Product Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              পণ্যের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: লেয়ার লাল ডিম (গ্রেড এ), ব্রয়লার ফিড ৫০ কেজি"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-xs"
            />
          </div>

          {/* Category & Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                ক্যাটাগরি <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                options={categoryOptions}
                value={categoryId}
                onChange={(val) => setCategoryId(String(val))}
                placeholder="ক্যাটাগরি নির্বাচন করুন"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                পরিমাপের একক (Unit) <span className="text-rose-500">*</span>
              </label>
              <CustomSelect
                options={unitOptions}
                value={unitId}
                onChange={(val) => setUnitId(String(val))}
                placeholder="একক নির্বাচন করুন"
              />
            </div>
          </div>

          {/* Pricing Row: Selling Price & Cost Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                বিক্রয় মূল্য (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="0.00"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-black text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                ক্রয় দর (৳)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-xs"
              />
            </div>
          </div>

          {/* Opening Stock & Product Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                প্রারম্ভিক স্টক পরিমাণ
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                বারকোড / পণ্য কোড (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="খালি রাখলে স্বয়ংক্রিয় তৈরি হবে"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-[40px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[40px] px-5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>পণ্য সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
