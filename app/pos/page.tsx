"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Minus,
  CheckCircle,
  PauseCircle,
  FolderOpen,
  Send,
  Moon,
  Sun,
  Maximize,
  Minimize,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  SlidersHorizontal,
  X,
  Egg,
  Fish,
  ArrowRightLeft,
  Scale,
  Percent,
  Wallet,
  Loader2,
} from "lucide-react";
import { usePosStore, CartItem, Customer } from "@/lib/pos-store";
import { formatBdCurrency } from "@/lib/utils";
import { ThermalReceiptModal } from "@/components/pos/thermal-receipt";
import { CustomerModal } from "@/components/pos/customer-modal";
import { HeldInvoicesModal, HeldInvoice } from "@/components/pos/held-invoices-modal";
import { QuickProductModal } from "@/components/pos/quick-product-modal";
import { PosDatePicker } from "@/components/pos/date-picker";
import { getInitialTheme, applyTheme } from "@/lib/theme";
import { useToast } from "@/components/ui/toast";

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

interface Category {
  id: number;
  category_name: string;
}

type ProductFilterOption = "all" | "in_stock" | "out_of_stock" | "a_to_z";

const FILTER_OPTIONS: { id: ProductFilterOption; label: string }[] = [
  { id: "all", label: "সকল পণ্য (All)" },
  { id: "in_stock", label: "মজুত আছে (In Stock)" },
  { id: "out_of_stock", label: "স্টক শেষ (Out of Stock)" },
  { id: "a_to_z", label: "নামানুসারে (A to Z)" },
];

export default function ModernPosPage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Product Catalog States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: number; unit_name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<ProductFilterOption>("all");
  const [loading, setLoading] = useState(true);

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [isQuickProductModalOpen, setIsQuickProductModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [heldInvoices, setHeldInvoices] = useState<HeldInvoice[]>([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Exchange Panel State
  const [showExchangePanel, setShowExchangePanel] = useState(false);
  const [exchangeMode, setExchangeMode] = useState<"EGGS" | "FEED" | "CUSTOM">("EGGS");
  const [exchangeEggCount, setExchangeEggCount] = useState<string>("100");
  const [exchangeEggRate, setExchangeEggRate] = useState<string>("11.00");
  const [exchangeDirectAmount, setExchangeDirectAmount] = useState<string>("0");
  const [exchangeReason, setExchangeReason] = useState<string>("");

  // Store Hooks
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
    addItem,
    updateQty,
    updatePrice,
    updateUnitSelection,
    removeItem,
    clearCart,
    setCustomer,
    setDiscount,
    setDiscountType,
    setDeliveryCharge,
    setReturnAdjustment,
    setExchangeData,
    setPaidAmount,
    setPaymentMethod,
    setOrderNote,
    getSubTotal,
    getCalculatedDiscount,
    getGrandTotal,
    getDueAmount,
    getTotalDueWithPrevious,
  } = usePosStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Theme Init
  useEffect(() => {
    const isDark = getInitialTheme();
    setTheme(isDark ? "dark" : "light");
    applyTheme(isDark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = theme !== "dark";
    setTheme(nextIsDark ? "dark" : "light");
    applyTheme(nextIsDark);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes, custsRes, brandsRes, unitsRes] = await Promise.all([
        fetch("/api/products?limit=500"),
        fetch("/api/categories"),
        fetch("/api/customers?limit=200"),
        fetch("/api/brands"),
        fetch("/api/units"),
      ]);

      const [prodsData, catsData, custsData, brandsData, unitsData] = await Promise.all([
        prodsRes.json(),
        catsRes.json(),
        custsRes.json(),
        brandsRes.json(),
        unitsRes.json(),
      ]);

      if (prodsData.status === "success" && Array.isArray(prodsData.data)) {
        const formatted = prodsData.data.map((p: any) => ({
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

      if (catsData.status === "success" && Array.isArray(catsData.data)) {
        setCategories(catsData.data);
      }

      if (brandsData.status === "success" && Array.isArray(brandsData.data)) {
        setBrands(brandsData.data);
      }

      if (unitsData.status === "success" && Array.isArray(unitsData.data)) {
        setUnits(unitsData.data);
      }

      if (custsData.status === "success" && Array.isArray(custsData.data)) {
        const formattedCusts = custsData.data.map((c: any) => ({
          id: Number(c.id),
          customer_id: c.customer_id || `CUST-${c.id}`,
          customer_name: c.customer_name || c.name || "Customer",
          mobile: c.mobile || "",
          address_details: c.address_details || c.address || "",
          previous_due_amount: parseFloat(c.due_amount || c.previous_due || 0),
        }));
        setCustomers(formattedCusts);
        // Default customer if none selected
        if (!selectedCustomer && formattedCusts.length > 0) {
          setCustomer(formattedCusts[0]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("ডাটা লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Keyboard Shortcuts: F2 for search, F4 to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        handleSubmitOrder();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, selectedCustomer, paidAmount, returnAdjustment, invoiceDate]);

  // Product Filtering by Category Tabs
  const filteredProducts = useMemo(() => {
    // 0. Exclude Feed & Medicine from POS sales page
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
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.primary_code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    // Secondary Filter Option
    if (filterOption === "in_stock") {
      result = result.filter((p) => p.quantity > 0);
    } else if (filterOption === "out_of_stock") {
      result = result.filter((p) => p.quantity <= 0);
    } else if (filterOption === "a_to_z") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchQuery, filterOption]);

  // Add Product to Cart
  const handleProductClick = (prod: Product) => {
    addItem({
      product_id: prod.id,
      product_name: prod.name,
      barcode: prod.primary_code,
      cost_price: prod.cost_price,
      selling_price: prod.sell_price,
      stock: prod.quantity,
      unit: prod.unit,
      category: prod.category,
    });
  };

  // Update Exchange Offset
  const handleApplyExchange = () => {
    let amt = 0;
    let note = "";

    if (exchangeMode === "EGGS") {
      const qty = Number(exchangeEggCount || 0);
      const rate = Number(exchangeEggRate || 0);
      amt = Math.round(qty * rate);
      note = `ডিম বিনিময় সমন্বয়: ${qty} পিস @ ৳${rate}`;
    } else if (exchangeMode === "FEED") {
      amt = Number(exchangeDirectAmount || 0);
      note = `ফিড ক্রয় ক্রেডিট সমন্বয়: ৳${amt}`;
    } else {
      amt = Number(exchangeDirectAmount || 0);
      note = exchangeReason || `পণ্য বিনিময় সমন্বয়: ৳${amt}`;
    }

    setReturnAdjustment(amt);
    setExchangeData({
      type: exchangeMode,
      amount: amt,
      eggQty: Number(exchangeEggCount || 0),
      eggRate: Number(exchangeEggRate || 0),
      note,
    });

    toast.success(`বিনিময় সমন্বয় ৳${amt} প্রয়োগ করা হয়েছে`);
  };

  const handleClearExchange = () => {
    setReturnAdjustment(0);
    setExchangeData({
      type: "NONE",
      amount: 0,
      note: "",
    });
    setExchangeDirectAmount("0");
    setShowExchangePanel(false);
  };

  // Submit Order
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error("কার্ট খালি! পণ্য যুক্ত করুন");
      return;
    }
    if (!selectedCustomer) {
      toast.error("কাস্টমার নির্বাচন করুন");
      return;
    }

    const grand = getGrandTotal();
    const paid = Number(paidAmount || 0);
    const due = Math.max(0, grand - paid);

    try {
      setSubmittingOrder(true);
      const payload = {
        customer_id: selectedCustomer.id,
        sub_total: getSubTotal(),
        discount_amount: getCalculatedDiscount(),
        delivery_charge: deliveryCharge,
        return_adjustment_amount: returnAdjustment,
        paid_amount: paid,
        due_amount: due,
        previous_due_amount: selectedCustomer.previous_due_amount || 0,
        payment_method: paymentMethod || "Cash",
        order_note: orderNote || (returnAdjustment > 0 ? `বিনিময় সমন্বয়: ৳${returnAdjustment}` : ""),
        invoice_date: invoiceDate,
        products: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.selling_price,
          selling_price: item.selling_price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.status === "success" && (json.invoice_id || json.data)) {
        toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!", "সফল");
        const orderId = json.invoice_id || json.data?.id;
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

  // Quick Full Paid Button
  const handleFullPaid = () => {
    setPaidAmount(getGrandTotal());
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. TOP NAVBAR */}
      <header className="h-[52px] bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="h-[36px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">ড্যাশবোর্ড</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-1 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Image src="/logo1.png" alt="Arafat Logo" width={32} height={32} className="object-contain" priority />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-[#166534] dark:text-emerald-400 leading-tight">
                ARAFAT POULTRY &amp; FISHERIES POS
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                বিক্রয় ও ক্যাশ রেজিস্টার
              </div>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Date Picker */}
          <div className="hidden md:block">
            <PosDatePicker value={invoiceDate} onChange={setInvoiceDate} />
          </div>

          {/* Quick Product Add */}
          <button
            onClick={() => setIsQuickProductModalOpen(true)}
            className="h-[36px] px-3 rounded-xl bg-gradient-to-r from-[#14532d] to-[#166534] hover:from-[#0f3d21] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">+ নতুন পণ্য</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300"
            title="Toggle Dark / Light Mode"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN SPLIT INTERFACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 gap-2">
        {/* LEFT COLUMN: PRODUCT CATALOG */}
        <section className="flex-1 flex flex-col bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Top Search & Filter Bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="পণ্য খুঁজুন (নাম বা কোড) (F2)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[40px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Filter Dropdown */}
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value as any)}
                className="h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dedicated Category Pills: ডিম, মাছ, মুরগি */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-[#166534] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                সকল পণ্য (All)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("EGGS")}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  selectedCategory === "EGGS"
                    ? "bg-[#166534] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Egg className="w-3.5 h-3.5 text-amber-500" />
                <span>ডিম (Eggs)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("FISH")}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  selectedCategory === "FISH"
                    ? "bg-[#166534] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Fish className="w-3.5 h-3.5 text-sky-500" />
                <span>মাছ (Fish)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("POULTRY")}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  selectedCategory === "POULTRY"
                    ? "bg-[#166534] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-orange-500" />
                <span>মুরগি (Poultry)</span>
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                <span className="text-xs">পণ্য লোড হচ্ছে...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mb-2 stroke-1" />
                <span className="text-xs font-semibold">কোনো পণ্য পাওয়া যায়নি</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.quantity <= 0;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => !isOutOfStock && handleProductClick(prod)}
                      className={`group relative bg-white dark:bg-[#1e293b] rounded-2xl border transition-all p-3 flex flex-col justify-between ${
                        isOutOfStock
                          ? "border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                          : "border-slate-200 dark:border-slate-700/80 hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {prod.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isOutOfStock
                              ? "text-rose-600 font-black"
                              : prod.quantity <= 20
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        >
                          স্টক: {prod.quantity} {prod.unit}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-2">
                        {prod.name}
                      </h4>

                      {/* Price & Add Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 mt-auto">
                        <div>
                          <div className="text-[10px] text-slate-400">নির্ধারিত দর:</div>
                          <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                            {formatBdCurrency(prod.sell_price)}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className="w-7 h-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-transform active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: CART, CUSTOMER & CHECKOUT */}
        <section className="w-full lg:w-[460px] xl:w-[500px] flex flex-col bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden shrink-0">
          {/* Customer Selection Bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1e293b]/40">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="কাস্টমার নির্বাচন বা মোবাইল নম্বর..."
                  value={customerSearch}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                  className="w-full h-[38px] px-3 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />

                {/* Dropdown Results */}
                {isCustomerDropdownOpen && (
                  <div className="absolute top-[42px] left-0 right-0 max-h-48 overflow-y-auto bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 divide-y divide-slate-100 dark:divide-slate-800">
                    {customers
                      .filter(
                        (c) =>
                          c.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.mobile.includes(customerSearch)
                      )
                      .slice(0, 10)
                      .map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setCustomer(c);
                            setCustomerSearch(c.customer_name);
                            setIsCustomerDropdownOpen(false);
                          }}
                          className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">
                              {c.customer_name}
                            </div>
                            <div className="text-[10px] text-slate-400">{c.mobile || "মোবাইল নম্বর নেই"}</div>
                          </div>
                          {c.previous_due_amount > 0 && (
                            <span className="text-[10px] font-bold text-rose-600">
                              বকেয়া: {formatBdCurrency(c.previous_due_amount)}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="h-[38px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন</span>
              </button>
            </div>

            {/* Selected Customer Quick Badge */}
            {selectedCustomer && (
              <div className="mt-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    {selectedCustomer.customer_name}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-2">
                    {selectedCustomer.mobile}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  পূর্বের বকেয়া:{" "}
                  <strong className="text-rose-600">
                    {formatBdCurrency(selectedCustomer.previous_due_amount || 0)}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List (Independent Scroll) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <ShoppingBag className="w-12 h-12 mb-2 stroke-1" />
                <p className="text-xs font-semibold m-0">কার্ট খালি রয়েছে</p>
                <p className="text-[11px] text-slate-400 m-0">বাম পাশের তালিকা থেকে পণ্য ক্লিক করুন</p>
              </div>
            ) : (
              cart.map((item) => {
                const isEgg =
                  item.product_name.toLowerCase().includes("egg") ||
                  item.product_name.toLowerCase().includes("ডিম");
                const isFish =
                  item.product_name.toLowerCase().includes("fish") ||
                  item.product_name.toLowerCase().includes("মাছ");
                const isChicken =
                  item.product_name.toLowerCase().includes("মুরগি") ||
                  item.product_name.toLowerCase().includes("chicken") ||
                  item.product_name.toLowerCase().includes("chick");

                const lineTotal = item.selling_price * item.quantity;

                return (
                  <div
                    key={item.product_id}
                    className="p-3 bg-slate-50 dark:bg-[#1e293b]/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2"
                  >
                    {/* Item Top: Name and Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.product_name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          আইডি: #{item.product_id}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Unit Selectors (As requested: Egg hali/dozen/tray, Fish kg/gram, Chicken pcs/weight) */}
                    {isEgg && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400 mr-1">একক:</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, 1)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
                        >
                          ১ পিস
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, 4)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
                        >
                          ১ হালি (৪)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, 12)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
                        >
                          ১ ডজন (১২)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, 30)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
                        >
                          ১ ট্রে (৩০)
                        </button>
                      </div>
                    )}

                    {/* Manual Rate & Quantity Row */}
                    <div className="grid grid-cols-3 gap-2 items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      {/* Manual Editable Price as requested */}
                      <div>
                        <label className="text-[10px] text-slate-400 block">
                          দর (৳) [ম্যানুয়াল]:
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.selling_price}
                          onChange={(e) => updatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                          className="w-full h-[32px] px-2 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>

                      {/* Quantity / Weight Input */}
                      <div>
                        <label className="text-[10px] text-slate-400 block">
                          {isFish ? "ওজন (কেজি/গ্রাম):" : "পরিমাণ (Qty):"}
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => updateQty(item.product_id, Math.max(0.1, item.quantity - (isFish ? 0.5 : 1)))}
                            className="w-7 h-[32px] bg-slate-200 dark:bg-slate-700 rounded-l-lg flex items-center justify-center text-slate-700 dark:text-slate-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            value={item.quantity}
                            onChange={(e) => updateQty(item.product_id, parseFloat(e.target.value) || 0)}
                            className="w-full h-[32px] text-center font-bold text-xs bg-white dark:bg-[#0f172a] border-y border-slate-300 dark:border-slate-700 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(item.product_id, item.quantity + (isFish ? 0.5 : 1))}
                            className="w-7 h-[32px] bg-slate-200 dark:bg-slate-700 rounded-r-lg flex items-center justify-center text-slate-700 dark:text-slate-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">মোট মূল্য:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatBdCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 3. EXCHANGE & BARTER OFFSET ACCORDION (As requested by user!) */}
          <div className="px-3 py-2 bg-amber-50/60 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowExchangePanel(!showExchangePanel)}
                className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>পণ্য বিনিময় বা সমন্বয় (Exchange Offset)</span>
              </button>

              {returnAdjustment > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-600">
                    - {formatBdCurrency(returnAdjustment)}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearExchange}
                    className="text-[10px] text-slate-400 hover:text-rose-600 underline"
                  >
                    রিসেট
                  </button>
                </div>
              )}
            </div>

            {/* Expandable Exchange Controls */}
            {showExchangePanel && (
              <div className="mt-2.5 p-3 bg-white dark:bg-[#0f172a] rounded-xl border border-amber-300 dark:border-amber-800 space-y-2.5 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setExchangeMode("EGGS")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      exchangeMode === "EGGS"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                    }`}
                  >
                    ডিম দিয়ে পরিশোধ
                  </button>
                  <button
                    type="button"
                    onClick={() => setExchangeMode("FEED")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      exchangeMode === "FEED"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                    }`}
                  >
                    ফিড ক্রয় সমন্বয়
                  </button>
                  <button
                    type="button"
                    onClick={() => setExchangeMode("CUSTOM")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      exchangeMode === "CUSTOM"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                    }`}
                  >
                    কাস্টম বিনিময়
                  </button>
                </div>

                {exchangeMode === "EGGS" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block">ডিমের সংখ্যা (পিস):</label>
                      <input
                        type="number"
                        min="1"
                        value={exchangeEggCount}
                        onChange={(e) => setExchangeEggCount(e.target.value)}
                        className="w-full h-[32px] px-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">প্রতি ডিমের দর (৳):</label>
                      <input
                        type="number"
                        step="any"
                        value={exchangeEggRate}
                        onChange={(e) => setExchangeEggRate(e.target.value)}
                        className="w-full h-[32px] px-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] text-slate-500 block">সমন্বয়ের পরিমাণ (৳):</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={exchangeDirectAmount}
                      onChange={(e) => setExchangeDirectAmount(e.target.value)}
                      className="w-full h-[32px] px-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleApplyExchange}
                  className="w-full h-[32px] rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                >
                  বিনিময় সমন্বয় প্রয়োগ করুন
                </button>
              </div>
            )}
          </div>

          {/* 4. TOTALS & PAYMENT SECTION */}
          <div className="p-3 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* Payment Method Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              {["Cash", "bKash", "Nagad", "Rocket", "Bank", "Card"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    paymentMethod === m
                      ? "bg-[#166534] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {m === "Cash" ? "ক্যাশ" : m === "Bank" ? "ব্যাংক" : m}
                </button>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>সাব-টোটাল (Sub-Total):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatBdCurrency(getSubTotal())}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">ডিসকাউন্ট:</span>
                  <button
                    type="button"
                    onClick={() => setDiscountType(discountType === "flat" ? "percent" : "flat")}
                    className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                  >
                    {discountType === "flat" ? "৳ ফিক্সড" : "% পারসেন্ট"}
                  </button>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full h-[26px] px-2 text-right font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Net Payable */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="font-black text-slate-900 dark:text-white">সর্বমোট প্রদেয় (Net Payable):</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                  {formatBdCurrency(getGrandTotal())}
                </span>
              </div>

              {/* Paid Amount */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">পরিশোধ (Paid):</span>
                  <button
                    type="button"
                    onClick={handleFullPaid}
                    className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer"
                  >
                    সম্পূর্ণ পরিশোধ
                  </button>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={paidAmount || ""}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full h-[32px] px-2 text-right font-black text-emerald-700 text-sm bg-slate-50 dark:bg-slate-800 border border-emerald-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Dues */}
              <div className="flex items-center justify-between text-rose-600 font-bold pt-1">
                <span>বর্তমান বকেয়া (Current Due):</span>
                <span>{formatBdCurrency(getDueAmount())}</span>
              </div>
              {selectedCustomer && selectedCustomer.previous_due_amount > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>পূর্বের বকেয়াসহ মোট দেনা:</span>
                  <span className="font-bold text-rose-600">
                    {formatBdCurrency(getTotalDueWithPrevious())}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Submit Buttons */}
            <div className="pt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={clearCart}
                className="h-[42px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ক্লিয়ার</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={submittingOrder}
                className="col-span-2 h-[42px] rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {submittingOrder ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>অর্ডার সম্পন্ন ও মেমো (F4)</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 5. MODALS INTEGRATION */}
      {/* Thermal Receipt Modal with big official logo */}
      {isReceiptModalOpen && completedOrder && (
        <ThermalReceiptModal
          receiptData={completedOrder}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setCompletedOrder(null);
          }}
        />
      )}

      {/* Customer Create Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onCustomerCreated={(newCust: any) => {
            setCustomer(newCust);
            loadInitialData();
            setIsCustomerModalOpen(false);
          }}
        />
      )}

      {/* Quick Product Modal */}
      {isQuickProductModalOpen && (
        <QuickProductModal
          isOpen={isQuickProductModalOpen}
          categories={categories}
          brands={brands}
          units={units}
          onClose={() => setIsQuickProductModalOpen(false)}
          onProductCreated={() => {
            loadInitialData();
            setIsQuickProductModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
