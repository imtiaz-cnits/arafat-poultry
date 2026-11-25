"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Plus, Loader2, PackagePlus, Home, CheckCircle2 } from "lucide-react";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: any) => void;
}

interface ChickenShedStockOption {
  id: number;
  flock_code: string;
  shed_name: string;
  breed: string;
  current_birds: number;
  adult_birds: number;
  medium_birds: number;
  age_total_days: number;
  age_display: string;
  avg_weight_display: string;
  linked_product?: {
    id: number;
    product_name: string;
    quantity: number;
    sell_price: number;
    weight_display: string;
  } | null;
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
  const [brandId] = useState<string>("1");
  const [sellPrice, setSellPrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("100");
  const [productCode, setProductCode] = useState<string>("");

  // Chicken Stock Shed Linkage State (for Category 4 / মুরগি)
  const [chickenSheds, setChickenSheds] = useState<ChickenShedStockOption[]>([]);
  const [selectedFlockId, setSelectedFlockId] = useState<string>("");
  const [chickenWeight, setChickenWeight] = useState<string>("");

  // Categories for Farm (Feed/Bosta removed per requirement)
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([
    { value: "2", label: "ডিম (Poultry Eggs)" },
    { value: "3", label: "মাছ (Fisheries)" },
    { value: "4", label: "মুরগি (Poultry)" },
  ]);

  // Units (Bosta removed per requirement)
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([
    { value: "3", label: "পিস (Piece)" },
    { value: "4", label: "হালি (Hali)" },
    { value: "5", label: "খাঁচা / ট্রে (Tray)" },
    { value: "2", label: "কেজি (Kg)" },
  ]);

  const isChickenCategory = useMemo(() => {
    if (String(categoryId) === "4") return true;
    const matched = categoryOptions.find((c) => String(c.value) === String(categoryId));
    const lbl = (matched?.label || "").toLowerCase();
    return lbl.includes("মুরগি") || lbl.includes("chicken") || lbl.includes("poultry");
  }, [categoryId, categoryOptions]);

  const selectedFlock = useMemo(
    () => chickenSheds.find((s) => String(s.id) === String(selectedFlockId)) || null,
    [chickenSheds, selectedFlockId]
  );

  // Fetch dynamic categories, units, and live Chicken Stock sheds
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, unitRes, flocksRes] = await Promise.all([
          fetch("/api/categories").catch(() => null),
          fetch("/api/units").catch(() => null),
          fetch("/api/egg/flocks").catch(() => null),
        ]);

        if (catRes && catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.status === "success" && Array.isArray(catJson.data) && catJson.data.length > 0) {
            setCategoryOptions(
              catJson.data
                .filter((c: any) => {
                  const cName = (c.category_name || "").toLowerCase();
                  return (
                    String(c.id) !== "1" &&
                    !cName.includes("feed") &&
                    !cName.includes("ফিড") &&
                    !cName.includes("বস্তা")
                  );
                })
                .map((c: any) => ({
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
              unitJson.data
                .filter((u: any) => {
                  const uName = (u.unit_name || "").toLowerCase();
                  return String(u.id) !== "1" && !uName.includes("bag") && !uName.includes("বস্তা");
                })
                .map((u: any) => ({
                  value: String(u.id),
                  label: u.unit_name,
                }))
            );
          }
        }

        if (flocksRes && flocksRes.ok) {
          const flocksJson = await flocksRes.json();
          if (flocksJson.status === "success" && Array.isArray(flocksJson.data)) {
            // Strictly match Chicken Stock page: Only Stage 2 (মাঝারি: 45-119d) & Stage 3 (বড় মুরগি: 120d+)
            const sellableSheds: ChickenShedStockOption[] = flocksJson.data
              .filter((f: any) => (f.age_total_days ?? 0) >= 45)
              .map((f: any) => ({
                id: Number(f.id),
                flock_code: f.flock_code,
                shed_name: f.shed_name,
                breed: f.breed,
                current_birds: Number(f.current_birds ?? f.current_birds_count ?? 0),
                adult_birds: Number(f.adult_birds ?? 0),
                medium_birds: Number(f.medium_birds ?? 0),
                age_total_days: Number(f.age_total_days ?? 0),
                age_display: f.age_display || "",
                avg_weight_display: f.avg_weight_display || "",
                linked_product: f.linked_product || null,
              }));
            setChickenSheds(sellableSheds);
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

  const applyShedSelection = (shed: ChickenShedStockOption) => {
    setSelectedFlockId(String(shed.id));
    const isAdult = shed.age_total_days >= 120;
    const defaultName =
      shed.linked_product?.product_name ||
      `${isAdult ? "বড় মুরগি" : "মাঝারি মুরগি"} - ${shed.breed} (${shed.shed_name})`;
    setProductName(defaultName);
    setChickenWeight(shed.linked_product?.weight_display || shed.avg_weight_display || "");
    setQuantity(String(shed.linked_product ? shed.linked_product.quantity : shed.current_birds));
    if (shed.linked_product?.sell_price) {
      setSellPrice(String(shed.linked_product.sell_price));
    } else if (!sellPrice) {
      setSellPrice(isAdult ? "250" : "190");
    }
    setUnitId("3");
  };

  // Auto-switch default unit & pre-select shed when category changes
  useEffect(() => {
    if (categoryId === "2") {
      setUnitId("3"); // Piece for eggs
      setSelectedFlockId("");
    } else if (categoryId === "3") {
      setUnitId("2"); // Kg for fish
      setSelectedFlockId("");
    } else if (isChickenCategory) {
      setUnitId("3"); // Piece for chicken
      if (chickenSheds.length > 0 && !selectedFlockId) {
        applyShedSelection(chickenSheds[0]);
      }
    }
  }, [categoryId, isChickenCategory, chickenSheds]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setProductName("");
      setSellPrice("");
      setCostPrice("");
      setQuantity("100");
      setProductCode("");
      setSelectedFlockId("");
      setChickenWeight("");
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

      // If Chicken category, link directly with Chicken Stock shed via /api/stock/convert-to-product
      if (isChickenCategory) {
        if (!selectedFlock) {
          toast.error("মুরগির স্টক হতে একটি শেড নির্বাচন করুন!", "সতর্কতা");
          setLoading(false);
          return;
        }
        const qtyNum = parseFloat(quantity) || 0;
        if (qtyNum <= 0 || qtyNum > selectedFlock.current_birds) {
          toast.error(
            `এই শেডে বর্তমান মুরগি আছে ${selectedFlock.current_birds} টি (১ থেকে ${selectedFlock.current_birds} এর মধ্যে দিন)!`,
            "সতর্কতা"
          );
          setLoading(false);
          return;
        }

        const sizeGroup = selectedFlock.age_total_days >= 120 ? "LARGE" : "MEDIUM";
        const autoImgUrl =
          sizeGroup === "LARGE"
            ? "/images/products/chicken-large.svg"
            : "/images/products/chicken-medium.svg";

        const convRes = await fetch("/api/stock/convert-to-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "CHICKEN",
            source_id: selectedFlock.id,
            product_name: productName.trim(),
            quantity: qtyNum,
            unit: unitId === "2" ? "Kg" : "Pcs",
            sell_price: parseFloat(sellPrice) || 0,
            cost_price: parseFloat(costPrice) || 0,
            metadata: {
              shed_name: selectedFlock.shed_name,
              breed: selectedFlock.breed,
              size_group: sizeGroup,
              weight: chickenWeight.trim() || selectedFlock.avg_weight_display,
              replace_qty: true,
            },
          }),
        });

        const convJson = await convRes.json();
        if (convRes.ok && convJson.status === "success") {
          toast.success(`"${productName}" মুরগির স্টকের সাথে সংযুক্ত হয়ে যুক্ত হয়েছে!`, "সফল");
          onProductCreated({
            id: convJson.data.product_id,
            product_name: convJson.data.product_name,
            name: convJson.data.product_name,
            quantity: Number(convJson.data.total_quantity || qtyNum),
            sell_price: parseFloat(sellPrice) || 0,
            cost_price: parseFloat(costPrice) || 0,
            category_id: 4,
            category: "Poultry",
            unit: unitId === "2" ? "Kg" : "Pcs",
            img_url: autoImgUrl,
          });
          onClose();
        } else {
          toast.error(convJson.message || "মুরগি প্রোডাক্টে যোগ করতে সমস্যা হয়েছে", "ত্রুটি");
        }
        return;
      }

      // Non-chicken categories (Eggs / Fish)
      let autoImgUrl = "/images/products/egg-large.svg";
      const pNameLower = productName.trim().toLowerCase();

      if (
        categoryId === "3" ||
        pNameLower.includes("fish") ||
        pNameLower.includes("mach") ||
        pNameLower.includes("মাছ") ||
        pNameLower.includes("রুই") ||
        pNameLower.includes("কাতলা") ||
        pNameLower.includes("তেলাপিয়া") ||
        pNameLower.includes("পাঙ্গাস") ||
        pNameLower.includes("শিং")
      ) {
        autoImgUrl =
          pNameLower.includes("rui") || pNameLower.includes("রুই") || pNameLower.includes("কাতলা")
            ? "/images/products/fish-rui.svg"
            : "/images/products/fish-tilapia.svg";
      } else {
        if (pNameLower.includes("ফাটা") || pNameLower.includes("ভাঙা") || pNameLower.includes("crack")) {
          autoImgUrl = "/images/products/egg-cracked.svg";
        } else if (
          pNameLower.includes("medium") ||
          pNameLower.includes("মাঝারি") ||
          pNameLower.includes("ছোট") ||
          pNameLower.includes("কোয়েল")
        ) {
          autoImgUrl = "/images/products/egg-medium.svg";
        } else {
          autoImgUrl = "/images/products/egg-large.svg";
        }
      }

      const payload = {
        product_name: productName.trim(),
        category_id: categoryId,
        unit_id: unitId,
        brand_id: brandId || "1",
        sell_price: parseFloat(sellPrice) || 0,
        cost_price: parseFloat(costPrice) || 0,
        quantity: parseFloat(quantity) || 0,
        product_code: productCode.trim() ? [productCode.trim()] : undefined,
        img_url: autoImgUrl,
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
        onProductCreated({ ...data.data, img_url: autoImgUrl });
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
        {/* MODAL HEADER */}
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
                পোল্ট্রি মুরগি, ডিম বা মাছ পণ্য সরাসরি ইনভেন্টরিতে অন্তর্ভুক্ত করুন
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

          {/* CHICKEN STOCK SHED DATA PANEL (Visible when মুরগি category is selected) */}
          {isChickenCategory && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-emerald-700" />
                  <span>মুরগির স্টক ও শেডভিত্তিক হিসাব ({chickenSheds.length} টি শেড)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  বড় ও মাঝারি মুরগি
                </span>
              </div>

              {chickenSheds.length === 0 ? (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                  মুরগির স্টকে বর্তমানে কোনো বিক্রয়যোগ্য (মাঝারি বা বড়) মুরগির শেড নেই।
                </div>
              ) : (
                <>
                  {/* Live Shed Cards Summary */}
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {chickenSheds.map((shed) => {
                      const isSelected = String(shed.id) === String(selectedFlockId);
                      const isAdult = shed.age_total_days >= 120;
                      return (
                        <button
                          key={shed.id}
                          type="button"
                          onClick={() => applyShedSelection(shed)}
                          className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-white dark:bg-slate-900 border-emerald-600 ring-1 ring-emerald-600 shadow-2xs"
                              : "bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{shed.shed_name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                                {shed.breed}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {isAdult ? "বড় মুরগি" : "মাঝারি মুরগি"} • ওজন: {shed.avg_weight_display} • বয়স:{" "}
                              {shed.age_display}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-emerald-700 dark:text-emerald-400 text-xs">
                              {shed.current_birds} টি
                            </div>
                            {shed.linked_product && (
                              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-sky-600">
                                <CheckCircle2 className="w-2.5 h-2.5" /> প্রোডাক্টে যুক্ত
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Searchable Shed Dropdown + Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                        শেড নির্বাচন করুন <span className="text-rose-500">*</span>
                      </label>
                      <CustomSelect
                        options={chickenSheds.map((s) => ({
                          value: String(s.id),
                          label: `${s.shed_name} (${s.breed})`,
                          subLabel: `${s.age_total_days >= 120 ? "বড় মুরগি" : "মাঝারি মুরগি"}: ${s.current_birds} টি • ওজন: ${s.avg_weight_display}`,
                        }))}
                        value={selectedFlockId}
                        onChange={(val) => {
                          const found = chickenSheds.find((x) => String(x.id) === String(val));
                          if (found) applyShedSelection(found);
                        }}
                        placeholder="মুরগির শেড খুঁজুন..."
                        searchThreshold={0}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 block text-[11px]">
                        গড় ওজন
                      </label>
                      <input
                        type="text"
                        value={chickenWeight}
                        onChange={(e) => setChickenWeight(e.target.value)}
                        placeholder="১.৬০ কেজি"
                        className="w-full h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              পণ্যের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: লেয়ার লাল ডিম (গ্রেড এ), বড় মুরগি"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-xs"
            />
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

          {/* Stock Quantity & Product Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                {isChickenCategory && selectedFlock
                  ? `মুরগির সংখ্যা (শেডে স্টক: ${selectedFlock.current_birds} টি)`
                  : "প্রারম্ভিক স্টক পরিমাণ"}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                max={isChickenCategory && selectedFlock ? selectedFlock.current_birds : undefined}
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
              className="h-[40px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-bold transition-all cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading || (isChickenCategory && chickenSheds.length === 0)}
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
