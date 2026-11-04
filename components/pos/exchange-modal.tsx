"use client";

import { useState, useEffect } from "react";
import {
  X,
  ArrowRightLeft,
  Egg,
  Check,
  Package,
  Banknote,
  RotateCcw,
  User,
  Truck,
  Loader2,
  DollarSign,
  Scale,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { usePosStore } from "@/lib/pos-store";
import { useToast } from "@/components/ui/toast";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subTotal?: number;
}

interface PartyOption {
  id: number;
  name: string;
  phone: string;
  dueAmount: number;
  type: "CUSTOMER" | "SUPPLIER";
}

export function ExchangeModal({ isOpen, onClose, subTotal = 0 }: ExchangeModalProps) {
  const { toast } = useToast();
  const {
    selectedCustomer,
    returnAdjustment,
    setReturnAdjustment,
    setExchangeData,
  } = usePosStore();

  const [saving, setSaving] = useState(false);
  const [partyType, setPartyType] = useState<"CUSTOMER" | "SUPPLIER">("CUSTOMER");
  const [customers, setCustomers] = useState<PartyOption[]>([]);
  const [suppliers, setSuppliers] = useState<PartyOption[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  // Feed Side
  const [feedUnit, setFeedUnit] = useState<"bags" | "kg">("bags");
  const [feedQty, setFeedQty] = useState<number>(10);
  const [feedRate, setFeedRate] = useState<number>(3300);

  // Multi-Settlement Options
  // 1. Egg exchange
  const [eggEnabled, setEggEnabled] = useState<boolean>(true);
  const [eggUnit, setEggUnit] = useState<"trays" | "halis" | "dozens" | "pieces">("trays");
  const [eggQty, setEggQty] = useState<number>(10);
  const [ratePerEgg, setRatePerEgg] = useState<number>(11.5);

  // 2. Cash / Bank Portion
  const [cashEnabled, setCashEnabled] = useState<boolean>(true);
  const [cashAmount, setCashAmount] = useState<number>(500);
  const [cashMethod, setCashMethod] = useState<string>("Cash");

  // 3. Empty Bags Portion
  const [emptyBagsEnabled, setEmptyBagsEnabled] = useState<boolean>(false);
  const [emptyBagCount, setEmptyBagCount] = useState<number>(0);
  const [bagRate, setBagRate] = useState<number>(25);

  // Custom Note
  const [customNote, setCustomNote] = useState<string>("");

  // Load Customers & Suppliers
  useEffect(() => {
    if (!isOpen) return;

    async function loadParties() {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch("/api/customers?limit=100"),
          fetch("/api/suppliers?limit=100"),
        ]);
        const cJson = await cRes.json();
        const sJson = await sRes.json();

        if (cJson.status === "success" && Array.isArray(cJson.data)) {
          setCustomers(
            cJson.data.map((c: any) => ({
              id: Number(c.id),
              name: c.customer_name || "Unknown",
              phone: c.mobile || "",
              dueAmount: parseFloat(c.previous_due_amount || "0"),
              type: "CUSTOMER",
            }))
          );
        }

        if (sJson.status === "success" && Array.isArray(sJson.data)) {
          setSuppliers(
            sJson.data.map((s: any) => ({
              id: Number(s.id),
              name: s.supplier_name || "Unknown",
              phone: s.mobile || "",
              dueAmount: parseFloat(s.purchase_payable_amount || "0"),
              type: "SUPPLIER",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load party list for exchange:", err);
      }
    }

    loadParties();
  }, [isOpen]);

  // Sync selected customer from POS
  useEffect(() => {
    if (selectedCustomer && partyType === "CUSTOMER") {
      setSelectedPartyId(selectedCustomer.id);
    }
  }, [selectedCustomer, partyType]);

  // Derived egg calculations
  const calculateTotalPieces = () => {
    if (!eggEnabled) return 0;
    const qty = Math.max(0, eggQty || 0);
    switch (eggUnit) {
      case "trays":
        return Math.round(qty * 30);
      case "halis":
        return Math.round(qty * 4);
      case "dozens":
        return Math.round(qty * 12);
      case "pieces":
      default:
        return Math.round(qty);
    }
  };

  const totalEggPieces = calculateTotalPieces();
  const eggTotalValue = eggEnabled ? Math.round(totalEggPieces * (ratePerEgg || 0)) : 0;
  const cashTotalValue = cashEnabled ? Math.max(0, cashAmount || 0) : 0;
  const emptyBagsTotalValue = emptyBagsEnabled ? Math.round((emptyBagCount || 0) * (bagRate || 0)) : 0;

  // Combined Settlement Value
  const totalSettlementValue = eggTotalValue + cashTotalValue + emptyBagsTotalValue;

  // Feed bill calculation
  const feedTotalValue = Math.round((feedQty || 0) * (feedRate || 0));

  // Net remaining
  const baseBill = subTotal > 0 ? subTotal : feedTotalValue;
  const netRemaining = baseBill - totalSettlementValue;

  if (!isOpen) return null;

  // Party options for Select
  const activeParties = partyType === "CUSTOMER" ? customers : suppliers;
  const partySelectOptions: SelectOption[] = activeParties.map((p) => ({
    value: String(p.id),
    label: p.name,
    subLabel: `মোবাইল: ${p.phone || "N/A"} | ব্যালেন্স: ৳${formatBdCurrency(p.dueAmount)}`,
  }));

  const selectedParty = activeParties.find((p) => p.id === selectedPartyId);

  // Save exchange to DB & apply to POS
  const handleSaveAndApply = async () => {
    if (!selectedPartyId) {
      toast.error(
        partyType === "CUSTOMER"
          ? "অনুগ্রহ করে একজন কাস্টমার নির্বাচন করুন।"
          : "অনুগ্রহ করে একজন সরবরাহকারী নির্বাচন করুন।"
      );
      return;
    }

    if (totalSettlementValue <= 0 && feedTotalValue <= 0) {
      toast.error("অনুগ্রহ করে ফিড অথবা বিনিময়ের পরিমাণ প্রদান করুন।");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        partyType,
        customerId: partyType === "CUSTOMER" ? selectedPartyId : null,
        supplierId: partyType === "SUPPLIER" ? selectedPartyId : null,
        feedUnit,
        feedQty,
        feedRate,
        feedTotal: feedTotalValue,
        eggEnabled,
        eggUnit,
        eggQty,
        eggTotalPieces: totalEggPieces,
        eggRate: ratePerEgg,
        eggTotal: eggTotalValue,
        cashEnabled,
        cashAmount: cashTotalValue,
        paymentMethod: cashMethod,
        emptyBagsEnabled,
        emptyBagsQty: emptyBagCount,
        emptyBagsRate: bagRate,
        emptyBagsTotal: emptyBagsTotalValue,
        totalSettlement: totalSettlementValue,
        netRemaining,
        customNote,
      };

      const res = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.status === "success") {
        // Also apply adjustment to POS Cart Store
        setReturnAdjustment(totalSettlementValue);
        setExchangeData({
          type: "EGGS",
          amount: totalSettlementValue,
          eggQty: totalEggPieces,
          eggRate: ratePerEgg,
          note: json.data?.note || customNote,
        });

        toast.success(
          `বিনিময় সমন্বয় সফলভাবে সম্পন্ন ও লেজারে লিপিবদ্ধ হয়েছে! ভাউচার: ${json.data?.referenceNo}`,
          "সফল বিনিময়"
        );
        onClose();
      } else {
        toast.error(json.message || "বিনিময় সম্পন্ন করতে ত্রুটি হয়েছে");
      }
    } catch (err: any) {
      console.error("Exchange submission error:", err);
      toast.error("সার্ভার এরর: বিনিময় সম্পন্ন করা যায়নি");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFeedQty(0);
    setFeedRate(0);
    setEggQty(0);
    setCashAmount(0);
    setEmptyBagCount(0);
    setCustomNote("");
    setReturnAdjustment(0);
    setExchangeData({
      type: "NONE",
      amount: 0,
      eggQty: 0,
      eggRate: 11.5,
      note: "",
    });
    toast.info("বিনিময় ফিল্ড রিসেট করা হয়েছে");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white px-5 py-3.5 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <ArrowRightLeft className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black leading-tight text-white">
                পণ্য বিনিময় ও সমন্বয় (Feed &amp; Egg Multi-Settlement)
              </h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                ফিড ক্রয়ের বিপরীতে ডিম (খাঁচা/হালি/পিস) ও নগদ টাকা সমন্বয়
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

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. PARTY SELECTION: CUSTOMER VS SUPPLIER */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>পার্টি নির্বাচন করুন (Party Selection):</span>
              </label>

              {/* Party Type Radio Switcher */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setPartyType("CUSTOMER");
                    setSelectedPartyId(selectedCustomer ? selectedCustomer.id : null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    partyType === "CUSTOMER"
                      ? "bg-[#166534] text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>কাস্টমার (Customer)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPartyType("SUPPLIER");
                    setSelectedPartyId(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    partyType === "SUPPLIER"
                      ? "bg-[#166534] text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Truck className="w-3 h-3" />
                  <span>সরবরাহকারী (Supplier)</span>
                </button>
              </div>
            </div>

            {/* Searchable Select */}
            <CustomSelect
              options={partySelectOptions}
              value={selectedPartyId ? String(selectedPartyId) : ""}
              onChange={(val) => setSelectedPartyId(val ? Number(val) : null)}
              placeholder={
                partyType === "CUSTOMER"
                  ? "নাম বা মোবাইল দিয়ে কাস্টমার খুঁজুন..."
                  : "নাম বা মোবাইল দিয়ে সরবরাহকারী খুঁজুন..."
              }
            />

            {selectedParty && (
              <div className="flex items-center justify-between text-[11px] pt-1 px-1 text-slate-500 dark:text-slate-400 font-medium border-t border-slate-200/60 dark:border-slate-700/60">
                <span>
                  নাম: <strong className="text-slate-800 dark:text-slate-200">{selectedParty.name}</strong> ({selectedParty.phone})
                </span>
                <span>
                  পূর্বের ব্যালেন্স:{" "}
                  <strong className={selectedParty.dueAmount > 0 ? "text-rose-600 dark:text-rose-400 font-black" : "text-emerald-600 font-bold"}>
                    ৳ {formatBdCurrency(selectedParty.dueAmount)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* 2. FEED PURCHASE / RECEIPT SIDE */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>ফিড গ্রহণ / ক্রয়ের বিবরণ (Feed Purchased / Received)</span>
              </span>

              {/* Unit Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-amber-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setFeedUnit("bags")}
                  className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold cursor-pointer ${
                    feedUnit === "bags" ? "bg-amber-600 text-white" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  বস্তা (Bags)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedUnit("kg")}
                  className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold cursor-pointer ${
                    feedUnit === "kg" ? "bg-amber-600 text-white" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  কেজি (Kg)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  পরিমাণ ({feedUnit === "bags" ? "বস্তা" : "কেজি"})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={feedQty}
                  onChange={(e) => setFeedQty(parseFloat(e.target.value) || 0)}
                  className="w-full h-[38px] px-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  দর (৳ প্রতি {feedUnit === "bags" ? "বস্তা" : "কেজি"})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={feedRate}
                  onChange={(e) => setFeedRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-[38px] px-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  মোট ফিড মূল্য (৳)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`৳ ${formatBdCurrency(feedTotalValue)}`}
                  className="w-full h-[38px] px-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-100/50 dark:bg-amber-900/30 text-xs font-black text-amber-900 dark:text-amber-200 focus:outline-none text-right"
                />
              </div>
            </div>
          </div>

          {/* 3. SETTLEMENT / EXCHANGE OPTIONS (MULTIPLE COMBINED) */}
          <div className="space-y-3">
            <div className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>বিনিময় ও সমন্বয় মাধ্যম (একাধিক একসাথে নির্বাচন করা যাবে):</span>
            </div>

            {/* 3A. Egg Exchange Box */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                eggEnabled
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eggEnabled}
                    onChange={(e) => setEggEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-[#166534]"
                  />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Egg className="w-3.5 h-3.5 text-emerald-600" />
                    ১. ডিম বিনিময় (Egg Exchange)
                  </span>
                </label>

                {eggEnabled && (
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-emerald-200 dark:border-slate-700 text-[10.5px] font-bold">
                    {[
                      { id: "trays", label: "খাঁচা (৩০)" },
                      { id: "halis", label: "হালি (৪)" },
                      { id: "dozens", label: "ডজন (১২)" },
                      { id: "pieces", label: "পিস (১)" },
                    ].map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setEggUnit(u.id as any)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          eggUnit === u.id ? "bg-emerald-700 text-white" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {eggEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      পরিমাণ ({eggUnit === "trays" ? "খাঁচা" : eggUnit === "halis" ? "হালি" : eggUnit === "dozens" ? "ডজন" : "পিস"})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={eggQty}
                      onChange={(e) => setEggQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-[38px] px-3 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      প্রতি পিস ডিমের দর (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={ratePerEgg}
                      onChange={(e) => setRatePerEgg(parseFloat(e.target.value) || 0)}
                      className="w-full h-[38px] px-3 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      মোট ডিম মূল্য ({totalEggPieces} পিস)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`৳ ${formatBdCurrency(eggTotalValue)}`}
                      className="w-full h-[38px] px-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-100/60 dark:bg-emerald-900/30 text-xs font-black text-emerald-900 dark:text-emerald-200 focus:outline-none text-right"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3B. Cash / Bank Payment Portion */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                cashEnabled
                  ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800"
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cashEnabled}
                    onChange={(e) => setCashEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                  />
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-blue-600" />
                    ২. নগদ / ব্যাংক টাকা প্রদান (Cash / Bank Portion)
                  </span>
                </label>

                {cashEnabled && (
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    {["Cash", "bKash", "Nagad", "Bank"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCashMethod(m)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          cashMethod === m
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-slate-800 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {cashEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      প্রদত্ত নগদ/টাকার পরিমাণ (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={cashAmount || ""}
                      placeholder="0.00"
                      onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                      className="w-full h-[38px] px-3 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-xs font-black text-blue-950 dark:text-blue-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      পদ্ধতি ও হিসাব বিবরণ
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${cashMethod} পেমেন্ট (৳${formatBdCurrency(cashTotalValue)})`}
                      className="w-full h-[38px] px-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-100/50 dark:bg-blue-900/30 text-xs font-bold text-blue-900 dark:text-blue-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3C. Empty Bags Box */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                emptyBagsEnabled
                  ? "bg-sky-50/60 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800"
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emptyBagsEnabled}
                    onChange={(e) => setEmptyBagsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 accent-sky-600"
                  />
                  <span className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-sky-600" />
                    ৩. খালি বস্তা ফেরত সমন্বয় (Empty Bags Adjustment)
                  </span>
                </label>
              </div>

              {emptyBagsEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      খালি বস্তার সংখ্যা
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={emptyBagCount}
                      onChange={(e) => setEmptyBagCount(parseInt(e.target.value) || 0)}
                      className="w-full h-[38px] px-3 rounded-lg border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      প্রতি বস্তার দর (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bagRate}
                      onChange={(e) => setBagRate(parseFloat(e.target.value) || 0)}
                      className="w-full h-[38px] px-3 rounded-lg border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      মোট বস্তা মূল্য (৳)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`৳ ${formatBdCurrency(emptyBagsTotalValue)}`}
                      className="w-full h-[38px] px-3 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-100/60 dark:bg-sky-900/30 text-xs font-black text-sky-900 dark:text-sky-200 focus:outline-none text-right"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Note input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                বিশেষ নোট / রেফারেন্স (Optional Note):
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="যেমন: ৪ হালি ডিম ও ৫০০ টাকা নগদ সমন্বয়কৃত"
                className="w-full h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. FINAL CALCULATION SUMMARY */}
          <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>মোট ফিড / পণ্যের মূল্য (Total Feed Bill):</span>
              <span className="font-bold">৳ {formatBdCurrency(baseBill)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
              <span>
                মোট সমন্বয় কর্তন (ডিম ৳{formatBdCurrency(eggTotalValue)} + নগদ ৳{formatBdCurrency(cashTotalValue)} + বস্তা ৳{formatBdCurrency(emptyBagsTotalValue)}):
              </span>
              <span className="text-sm font-black">- ৳ {formatBdCurrency(totalSettlementValue)}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white">
              <span>অবশিষ্ট দেনা / পাওনা (Remaining Balance):</span>
              <span className={netRemaining > 0 ? "text-amber-600 font-black" : "text-emerald-700 dark:text-emerald-400 font-black"}>
                ৳ {formatBdCurrency(Math.abs(netRemaining))} {netRemaining > 0 ? "(বকেয়া প্রদেয়)" : "(পরিশোধিত)"}
              </span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-3 pb-3 px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 shrink-0 bg-white dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={handleReset}
            className="h-[38px] px-3.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={saving}
              className="h-[38px] px-5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>লেজারে সংরক্ষণ ও সমন্বয় প্রয়োগ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
