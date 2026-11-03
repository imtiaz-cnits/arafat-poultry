"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Trash2,
  Minus,
  Check,
  X,
  RotateCcw,
  ShoppingCart,
  ShoppingBag,
  ArrowRightLeft,
  Loader2,
  Printer,
  User,
  LayoutGrid,
  List,
} from "lucide-react";
import { usePosStore, CartItem, Customer } from "@/lib/pos-store";
import { formatBdCurrency } from "@/lib/utils";
import { ThermalReceiptModal } from "@/components/pos/thermal-receipt";
import { CustomerModal } from "@/components/pos/customer-modal";
import { useToast } from "@/components/ui/toast";
import { CustomSelect, SelectOption } from "@/components/ui/custom-select";

interface Product {
  id: number;
  name: string;
  product_name: string;
  primary_code: string;
  display_codes: string;
  all_codes: string[];
  cost_price: number;
  sell_price: number;
  quantity: number;
  category_id: number;
  category: string;
  brand: string;
  unit: string;
  img_url?: string | null;
}

// Clean illustrated image helper for egg, fish, chicken
function getProductImage(product: Product): string {
  if (product.img_url) return product.img_url;
  const name = (product.name || "").toLowerCase();
  if (name.includes("ফাটা") || name.includes("ভাঙা") || name.includes("crack") || name.includes("damage")) {
    return "/images/products/egg-cracked.svg";
  }
  if (name.includes("ছোট ডিম") || (name.includes("egg") && (name.includes("small") || name.includes("grade b")))) {
    return "/images/products/egg-medium.svg";
  }
  if (name.includes("বড় ডিম") || (name.includes("egg") && (name.includes("large") || name.includes("grade a")))) {
    return "/images/products/egg-large.svg";
  }
  if (name.includes("ডিম") || name.includes("egg")) {
    return "/images/products/egg-small.svg";
  }
  if (name.includes("রুই") || name.includes("rui") || name.includes("carp") || name.includes("পোনা")) {
    return "/images/products/fish-rui.svg";
  }
  if (name.includes("মাছ") || name.includes("fish") || name.includes("তেলাপিয়া") || name.includes("tilapia")) {
    return "/images/products/fish-tilapia.svg";
  }
  if (name.includes("বড়") && (name.includes("মুরগি") || name.includes("chicken") || name.includes("layer"))) {
    return "/images/products/chicken-large.svg";
  }
  if (name.includes("মুরগি") || name.includes("chicken") || name.includes("chick") || name.includes("সোনালী")) {
    return "/images/products/chicken-medium.svg";
  }
  return "/images/products/egg-large.svg";
}

// Clean Bangla Display Name Mapping
function getProductDisplayName(product: { name?: string; product_name?: string }): string {
  const name = product.product_name || product.name || "";
  if (name.includes("Grade A") || (name.includes("Large") && name.includes("Egg"))) return "বড় ডিম";
  if (name.includes("Grade B") || (name.includes("Medium") && name.includes("Egg"))) return "মাঝারি ডিম";
  if (name.includes("ভাঙা") || name.includes("Cracked")) return "ফাটা ডিম";
  if (name.includes("Live Rui Fish") || (name.includes("রুই") && name.includes("মাঝারি"))) return "রুই মাছ (মাঝারি)";
  if (name.includes("Monosex Tilapia") || (name.includes("তেলাপিয়া") && name.includes("বড়"))) return "তেলাপিয়া মাছ (বড়)";
  if (name.includes("Large Layer Chicken") || (name.includes("লেয়ার") && name.includes("বড়"))) return "লেয়ার মুরগি (বড়)";
  if (name.includes("Medium Sonali Chicken") || (name.includes("লেয়ার") && name.includes("মাঝারি"))) return "লেয়ার মুরগি (মাঝারি)";
  if (name.includes("Fingerlings") || name.includes("পোনা")) return "পোনা মাছ";
  if (name.includes("Day-Old Chicks") || name.includes("DOC")) return "ব্রয়লার বাচ্চার মুরগি";
  return name;
}

// Unit Display Helper
function getProductUnitDisplay(product: { unit?: string; name?: string; product_name?: string }): string {
  const name = (product.product_name || product.name || "").toLowerCase();
  const unit = (product.unit || "").toLowerCase();
  if (name.includes("egg") || name.includes("ডিম")) return "ডজন";
  if (name.includes("fish") || name.includes("মাছ")) return "কেজি";
  if (name.includes("chick") || name.includes("মুরগি")) return "পিস";
  if (unit.includes("piece") || unit.includes("পিস")) return "পিস";
  if (unit.includes("kg") || unit.includes("কেজি")) return "কেজি";
  return product.unit || "পিস";
}

export default function ModernPosPage() {
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // POS Store
  const {
    cart,
    selectedCustomer,
    discount,
    discountType,
    deliveryCharge,
    returnAdjustment,
    paidAmount,
    paymentMethod,
    orderNote,
    exchangeNote,
    addItem,
    removeItem,
    updateQty,
    updatePrice,
    updateLineDiscount,
    updateUnitSelection,
    setCustomer,
    setDiscount,
    setDiscountType,
    setDeliveryCharge,
    setReturnAdjustment,
    setExchangeData,
    setPaidAmount,
    setPaymentMethod,
    setOrderNote,
    clearCart,
    getSubTotal,
    getGrandTotal,
    getDueAmount,
  } = usePosStore();

  // Component States
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Local card stepper quantities (productId -> quantity)
  const [cardQuantities, setCardQuantities] = useState<Record<number, number>>({});

  // Bottom action toggles
  const [showExchangePanel, setShowExchangePanel] = useState(false);
  const [exchangeDescription, setExchangeDescription] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Fetch initial data (Products & Customers)
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [prodsRes, custsRes] = await Promise.all([
        fetch("/api/products?page=1&limit=100"),
        fetch("/api/customers?page=1&limit=100"),
      ]);

      const [prodsData, custsData] = await Promise.all([
        prodsRes.json(),
        custsRes.json(),
      ]);

      if (prodsData.status === "success" && Array.isArray(prodsData.data)) {
        const formatted: Product[] = prodsData.data.map((p: any) => ({
          id: Number(p.id),
          name: p.product_name,
          product_name: p.product_name,
          primary_code: p.product_code?.[0] || `PRD-${p.id}`,
          display_codes: p.product_code?.[0] || `PRD-${p.id}`,
          all_codes: p.product_code || [],
          cost_price: parseFloat(p.cost_price || 0),
          sell_price: parseFloat(p.sell_price || 0),
          quantity: parseFloat(p.quantity || 0),
          category_id: Number(p.category_id),
          category: p.category?.category_name || "General",
          brand: p.brand?.name || "General",
          unit: p.unit?.unit_name || "Piece",
          img_url: p.img_url,
        }));
        setProducts(formatted);
      }

      if (custsData.status === "success" && Array.isArray(custsData.data)) {
        const formattedCusts: Customer[] = custsData.data.map((c: any) => ({
          id: Number(c.id),
          customer_id: c.customer_id || `CUST-${c.id}`,
          customer_name: c.customer_name || c.name || "Customer",
          mobile: c.mobile || "",
          address_details: c.address_details || c.address || "",
          previous_due_amount: parseFloat(c.due_amount || c.previous_due || c.previous_due_amount || 0),
        }));
        setCustomers(formattedCusts);
        // Default customer if none selected
        if (!selectedCustomer && formattedCusts.length > 0) {
          setCustomer(formattedCusts[0]);
        }
      }
    } catch (err) {
      console.error("POS Data fetch error:", err);
      toast.error("ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Keyboard Shortcuts: F2 for search, F4 to submit, F6 to print, Esc to reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        handleSubmitOrder();
      } else if (e.key === "F6") {
        e.preventDefault();
        if (completedOrder) {
          setIsReceiptModalOpen(true);
        } else {
          toast.info("কোনো সক্রিয় চালান বা মেমো নেই");
        }
      } else if (e.key === "Escape") {
        if (isCustomerModalOpen) setIsCustomerModalOpen(false);
        else if (isReceiptModalOpen) setIsReceiptModalOpen(false);
        else handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, selectedCustomer, paidAmount, returnAdjustment, completedOrder, isCustomerModalOpen, isReceiptModalOpen]);

  // Dynamic Category Product Counts (Strictly 3 categories: Eggs, Fish, Poultry; Feed & Medicine excluded)
  const categoryCounts = useMemo(() => {
    let egg = 0;
    let fish = 0;
    let poultry = 0;

    products.forEach((p) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const isFeed = cat.includes("feed") || cat.includes("ফিড") || name.includes("feed") || name.includes("ফিড");
      const isMed = cat.includes("medicine") || cat.includes("ওষুধ") || cat.includes("ভ্যাকসিন") || cat.includes("vet") || name.includes("vitamino");
      if (isFeed || isMed) return;

      if (cat.includes("egg") || cat.includes("ডিম") || name.includes("egg") || name.includes("ডিম")) {
        egg++;
      } else if (cat.includes("fish") || cat.includes("মাছ") || cat.includes("aqua") || name.includes("fish") || name.includes("মাছ")) {
        fish++;
      } else if (cat.includes("chick") || cat.includes("মুরগি") || cat.includes("poultry") || name.includes("মুরগি") || name.includes("chick")) {
        poultry++;
      }
    });

    return {
      all: egg + fish + poultry,
      eggs: egg,
      fish: fish,
      poultry: poultry,
    };
  }, [products]);

  // Filtered Products (Strictly Eggs, Fish, Poultry; Feed & Medicine excluded)
  const filteredProducts = useMemo(() => {
    // Exclude Feed & Medicine
    let result = products.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      const isFeed = cat.includes("feed") || cat.includes("ফিড") || name.includes("feed") || name.includes("ফিড");
      const isMedicine = cat.includes("medicine") || cat.includes("ওষুধ") || cat.includes("ভ্যাকসিন") || cat.includes("vet") || name.includes("vitamino");
      return !isFeed && !isMedicine;
    });

    // Category Filter
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        if (selectedCategory === "EGGS") {
          return cat.includes("egg") || cat.includes("ডিম") || name.includes("egg") || name.includes("ডিম");
        }
        if (selectedCategory === "FISH") {
          return cat.includes("fish") || cat.includes("মাছ") || cat.includes("aqua") || name.includes("fish") || name.includes("মাছ");
        }
        if (selectedCategory === "POULTRY") {
          return cat.includes("chick") || cat.includes("মুরগি") || cat.includes("poultry") || name.includes("মুরগি") || name.includes("chick");
        }
        return true;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.primary_code.toLowerCase().includes(q) ||
          p.all_codes.some((c) => c.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  // Stepper on Product Cards
  const getCardQuantity = (productId: number) => cardQuantities[productId] || 1;

  const handleCardQuantityChange = (productId: number, delta: number) => {
    setCardQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Add Product to Cart from Card
  const handleAddProductFromCard = (product: Product) => {
    const qty = getCardQuantity(product.id);
    addItem(
      {
        product_id: product.id,
        product_name: product.name,
        barcode: product.primary_code,
        cost_price: product.cost_price,
        selling_price: product.sell_price,
        stock: product.quantity,
        unit: product.unit || "Piece",
        category: product.category,
        line_discount: 0,
      },
      qty
    );
    toast.success(`${getProductDisplayName(product)} (${qty} ${getProductUnitDisplay(product)}) কার্টে যুক্ত হয়েছে`);
    // Reset local stepper quantity to 1
    setCardQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  // Customer Select Options
  const customerOptions: SelectOption[] = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: `${c.customer_name} (${c.mobile || "N/A"})`,
      subLabel: c.address_details || undefined,
      badge: c.previous_due_amount > 0 ? `বকেয়া: ৳${formatBdCurrency(c.previous_due_amount)}` : undefined,
    }));
  }, [customers]);

  const handleCustomerChange = (val: any) => {
    const cust = customers.find((c) => c.id === Number(val));
    if (cust) {
      setCustomer(cust);
    }
  };

  // Unit Options for Cart Table
  const getUnitOptions = (item: CartItem): SelectOption[] => {
    const cat = (item.category || "").toLowerCase();
    const name = (item.product_name || "").toLowerCase();

    if (cat.includes("egg") || cat.includes("ডিম") || name.includes("egg") || name.includes("ডিম")) {
      return [
        { value: "Dozen", label: "ডজন" },
        { value: "Hali", label: "হালি" },
        { value: "Piece", label: "পিস" },
        { value: "Tray", label: "খাঁচা" },
      ];
    }
    if (cat.includes("fish") || cat.includes("মাছ") || name.includes("fish") || name.includes("মাছ")) {
      return [
        { value: "Kg", label: "কেজি" },
        { value: "Gram", label: "গ্রাম" },
        { value: "Piece", label: "পিস" },
      ];
    }
    return [
      { value: "Piece", label: "পিস" },
      { value: "Kg", label: "কেজি" },
      { value: "Bag", label: "বস্তা" },
    ];
  };

  // Reset entire POS state
  const handleReset = () => {
    clearCart();
    setSearchQuery("");
    setSelectedCategory("ALL");
    setShowExchangePanel(false);
    setReturnAdjustment(0);
    toast.info("পিওএস রিসেট সম্পন্ন হয়েছে");
  };

  // Handle Order Submit
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error("কার্ট খালি! অনুগ্রহ করে প্রথমে পণ্য যোগ করুন।", "ত্রুটি");
      return;
    }

    if (!selectedCustomer) {
      toast.error("অনুগ্রহ করে কাস্টমার নির্বাচন করুন।", "ত্রুটি");
      return;
    }

    try {
      setSubmittingOrder(true);

      const netPayable = getGrandTotal();
      const currentDue = getDueAmount();

      const orderPayload = {
        customer_id: selectedCustomer.id,
        invoice_date: new Date().toISOString().split("T")[0],
        sub_total: getSubTotal(),
        discount_amount: discount,
        discount_type: discountType === "flat" ? "flat" : "percent",
        delivery_charge: deliveryCharge,
        return_adjustment_amount: returnAdjustment,
        net_payable: netPayable,
        paid_amount: paidAmount,
        due_amount: currentDue,
        previous_due_amount: selectedCustomer.previous_due_amount || 0,
        total_outstanding_due: (selectedCustomer.previous_due_amount || 0) + currentDue,
        payment_method: paymentMethod.toUpperCase(),
        order_note: orderNote,
        exchange_details: showExchangePanel ? { description: exchangeDescription, amount: returnAdjustment } : null,
        items: cart.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit || "Piece",
          unit_price: item.selling_price,
          line_discount: item.line_discount || 0,
          total_price: item.selling_price * item.quantity - (item.line_discount || 0),
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();

      if (res.ok && (json.status === "success" || json.success)) {
        toast.success("অর্ডার সফলভাবে সম্পন্ন ও মেমো তৈরি হয়েছে!", "অভিনন্দন");

        const orderId = json.invoice_id || json.data?.id || json.order_id;
        if (orderId) {
          try {
            const receiptRes = await fetch(`/api/invoice-print-receipt?id=${orderId}`);
            const receiptJson = await receiptRes.json();
            if (receiptJson.status === "success" && receiptJson.rows) {
              setCompletedOrder(receiptJson.rows);
              setIsReceiptModalOpen(true);
            }
          } catch (e) {
            console.error("Receipt fetch error:", e);
          }
        }
        clearCart();
        loadInitialData(); // Refresh live stock!
      } else {
        toast.error(json.message || "অর্ডার সম্পন্ন করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার এরর", "ত্রুটি");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const subtotal = getSubTotal();
  const netPayable = getGrandTotal();
  const currentDue = getDueAmount();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 select-none font-sans">
      {/* 1. TOP POS HEADER (Cart Icon + Title + Customer Selection Bar) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:px-4 mb-2.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
        {/* Left: Cart Icon Badge + Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-[#166534] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
              বিক্রয় (POS)
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
              পণ্য নির্বাচন, পরিমাণ, মূল্য ও পেমেন্ট একসাথে
            </p>
          </div>
        </div>

        {/* Right: Customer Selector Bar */}
        <div className="flex items-center gap-2">
          {/* Customer Icon & Label */}
          <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 hidden sm:inline">
            কাস্টমার:
          </span>

          {/* Searchable Customer CustomSelect */}
          <div className="w-52 sm:w-64 md:w-72">
            <CustomSelect
              options={customerOptions}
              value={selectedCustomer?.id}
              onChange={handleCustomerChange}
              placeholder="কাস্টমার নির্বাচন বা মোবাইল নম্বর..."
              searchThreshold={0}
              className="h-[38px] text-xs font-medium"
            />
          </div>

          {/* Add New Customer Button */}
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="h-[38px] px-3.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            title="নতুন কাস্টমার যোগ করুন"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">নতুন কাস্টমার</span>
          </button>
        </div>
      </section>

      {/* 2. CATEGORY FILTER & SEARCH BAR ROW */}
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 mb-2.5 shrink-0">
        {/* Left: Category Pills with Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* All Products */}
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${
              selectedCategory === "ALL"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>সব পণ্য</span>
            <span className="text-[11px] opacity-80">({categoryCounts.all})</span>
          </button>

          {/* Eggs */}
          <button
            onClick={() => setSelectedCategory("EGGS")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${
              selectedCategory === "EGGS"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>🥚 ডিম</span>
            <span className="text-[11px] opacity-80">({categoryCounts.eggs})</span>
          </button>

          {/* Fish */}
          <button
            onClick={() => setSelectedCategory("FISH")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${
              selectedCategory === "FISH"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>🐟 মাছ</span>
            <span className="text-[11px] opacity-80">({categoryCounts.fish})</span>
          </button>

          {/* Poultry / Chicken */}
          <button
            onClick={() => setSelectedCategory("POULTRY")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${
              selectedCategory === "POULTRY"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span>🐔 মুরগি</span>
            <span className="text-[11px] opacity-80">({categoryCounts.poultry})</span>
          </button>
        </div>

        {/* Right: Search Input + View Toggle */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্যের নাম খুঁজুন... (F2)"
              className="w-full h-[38px] pl-9 pr-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid View Toggle */}
          <button
            onClick={() => setViewMode("grid")}
            className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
            }`}
            title="গ্রিড ভিউ"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* List View Toggle */}
          <button
            onClick={() => setViewMode("list")}
            className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
            }`}
            title="লিস্ট ভিউ"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. PRODUCT CARDS ROW / CAROUSEL */}
      <section className="mb-2.5 shrink-0">
        {loading ? (
          <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>পণ্য তালিকা লোড হচ্ছে...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 p-4 text-xs">
            <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1" />
            <span>কোনো পণ্য খুঁজে পাওয়া যায়নি</span>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-950 snap-x">
            {filteredProducts.map((p) => {
              const qty = getCardQuantity(p.id);
              const displayName = getProductDisplayName(p);
              const unitDisplay = getProductUnitDisplay(p);
              const imgSrc = getProductImage(p);

              return (
                <div
                  key={p.id}
                  className="w-[148px] min-w-[148px] sm:w-[158px] sm:min-w-[158px] h-[212px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-emerald-500/60 transition-all shrink-0 snap-start group"
                >
                  {/* Top: Product Image */}
                  <div className="h-16 w-full flex items-center justify-center bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-1 relative overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={displayName}
                      width={64}
                      height={60}
                      className="max-h-14 w-auto object-contain transition-transform group-hover:scale-105"
                      priority={false}
                    />
                  </div>

                  {/* Middle: Name, Stock & Price */}
                  <div className="text-center my-0.5">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight" title={p.name}>
                      {displayName}
                    </h3>
                    <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      স্টক: {p.quantity.toLocaleString("bn-BD")} {unitDisplay}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      ৳ {p.sell_price.toFixed(2)} / {unitDisplay}
                    </div>
                  </div>

                  {/* Bottom: Stepper + Add to Cart Button */}
                  <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/60 overflow-hidden h-7">
                      <button
                        onClick={() => handleCardQuantityChange(p.id, -1)}
                        className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="কমান"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-slate-800 dark:text-slate-100">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleCardQuantityChange(p.id, 1)}
                        className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="বাড়ান"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Circular Add to Cart Button */}
                    <button
                      onClick={() => handleAddProductFromCard(p)}
                      className="w-7 h-7 rounded-full bg-[#166534] hover:bg-[#14532d] text-white flex items-center justify-center shadow-xs cursor-pointer transition-all active:scale-90"
                      title="কার্টে যোগ করুন"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MAIN SPLIT: CART TABLE (LEFT ~68%) & PAYMENT SUMMARY (RIGHT ~32%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0">
        {/* Left Side: Cart Table (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col min-h-0">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                নির্বাচিত পণ্যসমূহ ({cart.length} টি)
              </h2>
            </div>
            {cart.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-400">
                মোট আইটেম সংখ্যা: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>

          {/* Cart Table Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-auto min-h-[160px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
                <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
                  কোনো পণ্য কার্টে যুক্ত করা হয়নি
                </p>
                <p className="text-[11px] text-slate-400 text-center mt-0.5">
                  ওপরের পণ্যের কার্ড থেকে সরাসরি পণ্য নির্বাচন করুন (F2)
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200 dark:border-slate-700 z-10">
                  <tr>
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2.5 min-w-[130px]">পণ্য</th>
                    <th className="py-2 px-2 text-center w-[110px]">পরিমাণ</th>
                    <th className="py-2 px-2 text-center w-[92px]">একক</th>
                    <th className="py-2 px-2 text-center w-[85px]">দর (৳)</th>
                    <th className="py-2 px-2 text-right w-[85px]">মোট (৳)</th>
                    <th className="py-2 px-2 text-center w-[75px]">ছাড় (৳)</th>
                    <th className="py-2 px-2 text-right w-[85px]">নেট মোট (৳)</th>
                    <th className="py-2 px-1 text-center w-9">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  {cart.map((item, idx) => {
                    const rowTotal = item.selling_price * item.quantity;
                    const rowNet = rowTotal - (item.line_discount || 0);

                    return (
                      <tr
                        key={item.product_id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Serial Number */}
                        <td className="py-2.5 px-2 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        {/* Product Name */}
                        <td className="py-2.5 px-2.5">
                          <div className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {getProductDisplayName(item)}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                            {item.barcode || `PRD-${item.product_id}`}
                          </div>
                        </td>

                        {/* Quantity Stepper */}
                        <td className="py-2.5 px-2">
                          <div className="flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/60 overflow-hidden h-7">
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity - 1)}
                              className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={0.1}
                              step="any"
                              value={item.quantity}
                              onChange={(e) => updateQty(item.product_id, parseFloat(e.target.value) || 0)}
                              className="w-10 text-center font-bold text-xs bg-transparent focus:outline-none"
                            />
                            <button
                              onClick={() => updateQty(item.product_id, item.quantity + 1)}
                              className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Unit CustomSelect */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="w-[88px] mx-auto">
                            <CustomSelect
                              options={getUnitOptions(item)}
                              value={item.unit || "Piece"}
                              onChange={(val) =>
                                updateUnitSelection(item.product_id, {
                                  quantity: item.quantity,
                                  selected_unit: val,
                                })
                              }
                              matchTriggerWidth={true}
                              searchThreshold={99}
                              className="h-7 text-[11px] font-semibold"
                            />
                          </div>
                        </td>

                        {/* Unit Price (Editable) */}
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={item.selling_price}
                            onChange={(e) => updatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                            className="w-18 h-7 text-center font-bold text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                          />
                        </td>

                        {/* Line Total */}
                        <td className="py-2.5 px-2 text-right font-bold text-slate-700 dark:text-slate-200">
                          {rowTotal.toFixed(2)}
                        </td>

                        {/* Line Discount (Editable) */}
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={item.line_discount || 0}
                            onChange={(e) => updateLineDiscount(item.product_id, parseFloat(e.target.value) || 0)}
                            className="w-16 h-7 text-center font-bold text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                          />
                        </td>

                        {/* Line Net Total */}
                        <td className="py-2.5 px-2 text-right font-black text-emerald-700 dark:text-emerald-400">
                          {rowNet.toFixed(2)}
                        </td>

                        {/* Delete Action */}
                        <td className="py-2.5 px-1 text-center">
                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="w-7 h-7 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 flex items-center justify-center transition-colors cursor-pointer mx-auto"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Under Table Sub-Actions */}
          <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            {/* Left: Clear Cart & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব মুছে ফেলুন</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট (Esc)</span>
              </button>
            </div>

            {/* Right: Add More Products (Focus F2) */}
            <button
              onClick={() => searchInputRef.current?.focus()}
              className="px-3.5 py-1.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>আরও পণ্য (F2)</span>
            </button>
          </div>
        </div>

        {/* Right Side: Payment Summary Panel (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between gap-2.5 min-h-0">
          <div className="space-y-2.5">
            {/* 1. Subtotal */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">মোট মূল্য:</span>
              <span className="font-black text-slate-900 dark:text-white text-sm">
                ৳ {formatBdCurrency(subtotal)}
              </span>
            </div>

            {/* 2. Overall Discount (Toggle + Input) */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">সামগ্রিক ছাড়:</span>
              <div className="flex items-center gap-1.5">
                {/* Discount Type Toggle [৳ | %] */}
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                  <button
                    onClick={() => setDiscountType("flat")}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      discountType === "flat"
                        ? "bg-[#166534] text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ৳
                  </button>
                  <button
                    onClick={() => setDiscountType("percent")}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      discountType === "percent"
                        ? "bg-[#166534] text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    %
                  </button>
                </div>
                {/* Discount Input */}
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={discount || ""}
                  placeholder="0.00"
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 h-7 text-right font-black text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 3. Net Payable Highlight Box */}
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center justify-between shadow-2xs">
              <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                পরিশোধযোগ্য:
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-300">
                ৳ {formatBdCurrency(netPayable)}
              </span>
            </div>

            {/* 4. Payment Methods [Cash, bKash, Nagad, Bank] */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                পেমেন্ট (৳)
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "cash", label: "নগদ", icon: "📷" },
                  { id: "bkash", label: "bKash", icon: "" },
                  { id: "nagad", label: "Nagad", icon: "" },
                  { id: "bank", label: "ব্যাংক", icon: "🏛" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                      paymentMethod.toLowerCase() === m.id
                        ? "bg-[#166534] text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {m.icon && <span>{m.icon}</span>}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Paid Amount Input */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">প্রদেয় পরিমাণ:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPaidAmount(netPayable)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
                  title="পুরো টাকা পরিশোধ"
                >
                  সম্পূর্ণ
                </button>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={paidAmount || ""}
                  placeholder="0.00"
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="w-28 h-8 text-right font-black text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* 6. Current Due */}
            <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="font-bold text-slate-600 dark:text-slate-400">বকেয়া (বর্তমান):</span>
              <span
                className={`font-black text-sm ${
                  currentDue > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                ৳ {formatBdCurrency(currentDue)}
              </span>
            </div>
          </div>

          {/* Previous Customer Due Alert if Any */}
          {selectedCustomer && selectedCustomer.previous_due_amount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
              <span>পূর্বের মোট বকেয়া:</span>
              <span className="font-black">৳ {formatBdCurrency(selectedCustomer.previous_due_amount)}</span>
            </div>
          )}
        </div>
      </section>

      {/* 5. BOTTOM STICKY ACTION BAR (FULL WIDTH) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 px-4 mt-2.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
        {/* Left: Exchange Toggle Switch */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExchangePanel(!showExchangePanel)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
              showExchangePanel
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>বিনিময় / সমন্বয় (Exchange)</span>
            <span
              className={`w-6 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                showExchangePanel ? "bg-amber-500 justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-2xs" />
            </span>
          </button>
        </div>

        {/* Center: Note / Remark Input Box */}
        <div className="flex-1 max-w-xl">
          <input
            type="text"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="✏️ বিবরণ / নোট লিখুন..."
            className="w-full h-[38px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Right: Print Button + Submit Order Button */}
        <div className="flex items-center gap-2">
          {/* Print (F6) Button */}
          <button
            onClick={() => {
              if (completedOrder) {
                setIsReceiptModalOpen(true);
              } else {
                toast.info("কোনো সক্রিয় চালান বা মেমো নেই। বিক্রয় সম্পন্ন হলে অটো প্রিন্ট হবে।");
              }
            }}
            className="h-[42px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="চালান প্রিন্ট করুন (F6)"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>প্রিন্ট (F6)</span>
          </button>

          {/* Submit Order (F4) Button */}
          <button
            onClick={handleSubmitOrder}
            disabled={submittingOrder || cart.length === 0}
            className="h-[42px] px-6 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>প্রসেস হচ্ছে...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>বিক্রয় সম্পন্ন করুন (F4)</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Slide-down Exchange Deduction Panel (when toggled) */}
      {showExchangePanel && (
        <section className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-3.5 mt-2 shadow-2xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
            <span>পণ্য বা খাঁচা বিনিময় / সমন্বয় মূল্য কর্তন:</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="বিনিময় পণ্যের বিবরণ (যেমন: ৫ খাঁচা ফেরত)"
              value={exchangeDescription}
              onChange={(e) => {
                setExchangeDescription(e.target.value);
                setExchangeData({
                  type: "CUSTOM",
                  amount: returnAdjustment,
                  note: e.target.value,
                });
              }}
              className="h-8 px-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-64"
            />
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <span>সমন্বয় মূল্য (৳):</span>
              <input
                type="number"
                min={0}
                step="any"
                value={returnAdjustment || ""}
                placeholder="0.00"
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setReturnAdjustment(val);
                  setExchangeData({
                    type: "CUSTOM",
                    amount: val,
                    note: exchangeDescription,
                  });
                }}
                className="w-24 h-8 text-right font-black text-xs border border-amber-300 dark:border-amber-700 rounded-lg px-2 bg-white dark:bg-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </section>
      )}

      {/* Modals */}
      {/* 1. Customer Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onCustomerCreated={(newCust) => {
            setCustomers((prev) => [newCust, ...prev]);
            setCustomer(newCust);
            setIsCustomerModalOpen(false);
            toast.success("নতুন কাস্টমার সফলভাবে তৈরি ও নির্বাচিত হয়েছে!");
          }}
        />
      )}

      {/* 2. Thermal / A4 Print Receipt Modal */}
      {isReceiptModalOpen && completedOrder && (
        <ThermalReceiptModal
          receiptData={completedOrder}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </div>
  );
}
