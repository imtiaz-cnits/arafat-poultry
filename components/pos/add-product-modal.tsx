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
  const [categoryId, setCategoryId] = useState<string>("102"); // Default Poultry Eggs
  const [unitId, setUnitId] = useState<string>("103"); // Default Piece
  const [sellPrice, setSellPrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("100");
  const [productCode, setProductCode] = useState<string>("");

  // Categories for Farm
  const categoryOptions: SelectOption[] = [
    { value: "102", label: "ডিম (Poultry Eggs)" },
    { value: "103", label: "মাছ (Fisheries & Aqua)" },
    { value: "104", label: "মুরগি / বাচ্চা (Poultry / Chicks)" },
    { value: "101", label: "ফিড (Poultry Feed)" },
  ];

  // Units
  const unitOptions: SelectOption[] = [
    { value: "103", label: "পিস (Piece)" },
    { value: "106", label: "হালি (Hali)" },
    { value: "104", label: "ডজন (Dozen)" },
    { value: "105", label: "খাঁচা / কেস (Tray)" },
    { value: "102", label: "কেজি (Kg)" },
    { value: "107", label: "গ্রাম (Gram)" },
    { value: "101", label: "বস্তা (Bag)" },
  ];

  // Auto-switch default unit when category changes
  useEffect(() => {
    if (categoryId === "102") {
      setUnitId("103"); // Piece for eggs
    } else if (categoryId === "103") {
      setUnitId("102"); // Kg for fish
    } else if (categoryId === "104") {
      setUnitId("103"); // Piece for chicken
    } else if (categoryId === "101") {
      setUnitId("101"); // Bag for feed
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
        brand_id: 101, // Default Kazi Farms Group
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
                ডিম, মাছ, মুরগি ও অন্যান্য ফার্ম পণ্যের প্রোফাইল
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY (Form) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              পণ্যের নাম (Product Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="উদা: সোনালী মুরগি (মাঝারি), কাতলা মাছ (বড়)..."
              className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
            />
          </div>

          {/* Category & Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ক্যাটাগরি (Category) <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={categoryOptions}
                value={categoryId}
                onChange={(val) => setCategoryId(String(val))}
                className="text-xs"
                matchTriggerWidth={true}
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                একক (Unit) <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                options={unitOptions}
                value={unitId}
                onChange={(val) => setUnitId(String(val))}
                className="text-xs"
                matchTriggerWidth={true}
              />
            </div>
          </div>

          {/* Sell Price & Cost Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Sell Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিক্রয় মূল্য (Sell Price ৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0.00"
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ক্রয় মূল্য / উৎপাদন খরচ (Cost Price ৳)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>
          </div>

          {/* Quantity & Product Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Initial Stock */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                প্রাথমিক স্টক পরিমাণ (Initial Stock)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>

            {/* Product Code / Barcode (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বারকোড / SKU (Barcode / SKU - ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="অটো তৈরি হবে বা কোড লিখুন"
                className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
            </div>
          </div>

          {/* STICKY FOOTER: Cancel (Red #dc2626) & Submit (Deep Forest Green #166534) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[38px] px-5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>পণ্য সংরক্ষণ করুন (Save)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

