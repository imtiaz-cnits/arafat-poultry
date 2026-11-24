"use client";

import { PosGridSkeleton, PosFullSkeleton } from "@/components/ui/table-skeleton";

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
  ChevronLeft,
  ChevronRight,
  PackagePlus,
} from "lucide-react";
import { usePosStore, CartItem, Customer } from "@/lib/pos-store";
import { formatBdCurrency } from "@/lib/utils";
import { ThermalReceiptModal } from "@/components/pos/thermal-receipt";
import { CustomerModal } from "@/components/pos/customer-modal";
import { AddProductModal } from "@/components/pos/add-product-modal";
import { ExchangeModal } from "@/components/pos/exchange-modal";
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

// Strict, deterministic category mapping
function getProductCategory(product: {
  category_id?: number | string | null;
  category?: string | null;
  name?: string | null;
  product_name?: string | null;
}): "EGGS" | "FISH" | "POULTRY" | "FEED" {
  const catId = product.category_id ? Number(product.category_id) : 0;
  const cat = (product.category || "").toLowerCase();
  const name = (product.product_name || product.name || "").toLowerCase();

  // 1. Feed (Category 1)
  if (catId === 1 || cat.includes("feed") || cat.includes("ফিড") || name.includes("feed") || name.includes("ফিড")) {
    return "FEED";
  }

  // 2. Eggs (Category 2, or name / category contains egg or dim)
  if (
    catId === 2 ||
    cat.includes("egg") ||
    cat.includes("ডিম") ||
    name.includes("egg") ||
    name.includes("dim") ||
    name.includes("ডিম")
  ) {
    return "EGGS";
  }

  // 3. Fish (Category 3, or fisheries, fish, mach, etc.)
  if (
    catId === 3 ||
    cat.includes("fish") ||
    cat.includes("মাছ") ||
    cat.includes("fisheries") ||
    cat.includes("aqua") ||
    name.includes("fish") ||
    name.includes("mach") ||
    name.includes("মাছ") ||
    name.includes("রুই") ||
    name.includes("কাতলা") ||
    name.includes("পাঙ্গাস") ||
    name.includes("তেলাপিয়া") ||
    name.includes("শিং") ||
    name.includes("পোনা")
  ) {
    return "FISH";
  }

  // 4. Poultry / Chicken (Category 4 or poultry, chicken, murgi)
  return "POULTRY";
}

// Clean illustrated image helper for egg, fish, chicken
function getProductImage(product: Product): string {
  const name = (product.name || product.product_name || "").toLowerCase();
  const pCat = getProductCategory(product);

  // 1. Fish
  if (pCat === "FISH") {
    if (product.img_url && product.img_url.includes("fish")) return product.img_url;
    if (name.includes("কাতলা") || name.includes("catla") || name.includes("রুই") || name.includes("rui") || name.includes("carp") || name.includes("পোনা")) {
      return "/images/products/fish-rui.svg";
    }
    return "/images/products/fish-tilapia.svg";
  }

  // 2. Chicken / Poultry
  if (pCat === "POULTRY") {
    if (product.img_url && product.img_url.includes("chicken")) return product.img_url;
    if (name.includes("বড়") || name.includes("large") || name.includes("parent")) {
      return "/images/products/chicken-large.svg";
    }
    return "/images/products/chicken-medium.svg";
  }

  // 3. Eggs (pCat === "EGGS" or fallback)
  if (product.img_url && product.img_url.includes("egg")) return product.img_url;
  if (name.includes("ফাটা") || name.includes("ভাঙা") || name.includes("crack") || name.includes("damage")) {
    return "/images/products/egg-cracked.svg";
  }
  if (name.includes("ছোট ডিম") || (name.includes("egg") && (name.includes("small") || name.includes("grade b"))) || name.includes("কোয়েল")) {
    return "/images/products/egg-medium.svg";
  }
  if (name.includes("হাঁস") || name.includes("duck") || name.includes("দেশি") || name.includes("বড় ডিম") || (name.includes("egg") && (name.includes("large") || name.includes("grade a")))) {
    return "/images/products/egg-large.svg";
  }
  if (name.includes("সাদা") || name.includes("white")) {
    return "/images/products/egg-large.svg";
  }
  return "/images/products/egg-small.svg";
}

// Clean Bangla Display Name Mapping
function getProductDisplayName(product: { name?: string; product_name?: string }): string {
  const name = product.product_name || product.name || "";
  if (name.toLowerCase() === "murgi") return "মুরগি";
  if (name.toLowerCase() === "dim") return "ডিম";
  if (name.toLowerCase() === "mach") return "মাছ";
  if (name.includes("Grade A") || (name.includes("Large") && name.includes("Egg"))) return "বড় ডিম";
  if (name.includes("Grade B") || (name.includes("Medium") && name.includes("Egg"))) return "মাঝারি ডিম";
  if (name.includes("ভাঙা") || name.includes("Cracked")) return "ফাটা ডিম";
  if (name.includes("Live Rui Fish") || (name.includes("রুই") && name.includes("মাঝারি"))) return "রুই মাছ (মাঝারি)";
  if (name.includes("Monosex Tilapia") || (name.includes("তেলাপিয়া") && name.includes("বড়"))) return "তেলাপিয়া মাছ (বড়)";
  if (name.includes("Large Layer Chicken") || (name.includes("লেয়ার") && name.includes("বড়"))) return "লেয়ার মুরগি (বড়)";
  if (name.includes("Medium Sonali Chicken") || (name.includes("লেয়ার") && name.includes("মাঝারি"))) return "লেয়ার মুরগি (মাঝারি)";
  if (name.includes("Fingerlings") || name.includes("পোনা")) return "পোনা মাছ";
  if (name.includes("Day-Old Chicks") || name.includes("DOC")) return "ব্রয়লার বাচ্চার মুরগি";
  return name.replace(/\([^)]*\)/g, "").trim() || name;
}

// Unit Display Helper: Eggs & Chicken in Pcs, Fish in Kg (No dozen calculation)
function getProductUnitDisplay(product: { unit?: string; name?: string; product_name?: string; category_id?: number | string | null; category?: string | null }): string {
  const pCat = getProductCategory(product);
  if (pCat === "FISH") {
    return "কেজি";
  }
  return "পিস";
}

export default function SalesPortalPage() {
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  // Sales Portal Store
  const {
    cart,
    selectedCustomer,
    discount,
    discountType,
    deliveryCharge,
    returnAdjustment,
    paidAmount,
    paymentMethod,
    paymentAccount,
    transactionId,
    orderNote,
    addItem,
    removeItem,
    updateQty,
    updatePrice,
    updateLineDiscount,
    updateUnit,
    updateUnitSelection,
    setCustomer,
    setDiscount,
    setDiscountType,
    setDeliveryCharge,
    setReturnAdjustment,
    setExchangeData,
    setPaidAmount,
    setPaymentMethod,
    setPaymentAccount,
    setTransactionId,
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
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Carousel Drag-to-Scroll & Navigation Controls
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = direction === "left" ? -340 : 340;
    carouselRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

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
          name: p.product_name || p.name,
          product_name: p.product_name || p.name,
          primary_code: p.primary_code || p.product_code?.[0] || `PRD-${p.id}`,
          display_codes: p.display_codes || p.primary_code || `PRD-${p.id}`,
          all_codes: p.all_codes || p.product_code || [],
          cost_price: parseFloat(p.cost_price || 0),
          sell_price: parseFloat(p.sell_price || 0),
          quantity: parseFloat(p.quantity || 0),
          category_id: Number(p.category_id),
          category: typeof p.category === "string" ? p.category : (p.category?.category_name || p.categories?.category_name || "General"),
          brand: typeof p.brand === "string" ? p.brand : (p.brand?.name || p.brands?.name || "General"),
          unit: typeof p.unit === "string" ? p.unit : (p.unit?.unit_name || p.units?.unit_name || "Piece"),
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
      console.error("Sales Portal Data fetch error:", err);
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

  // Dynamic Category Product Counts (Strictly 3 categories: Eggs, Fish, Poultry; Feed excluded)
  const categoryCounts = useMemo(() => {
    let egg = 0;
    let fish = 0;
    let poultry = 0;

    products.forEach((p) => {
      const pCat = getProductCategory(p);
      if (pCat === "EGGS") egg++;
      else if (pCat === "FISH") fish++;
      else if (pCat === "POULTRY") poultry++;
    });

    return {
      all: egg + fish + poultry,
      eggs: egg,
      fish: fish,
      poultry: poultry,
    };
  }, [products]);

  // Filtered Products (Strictly Eggs, Fish, Poultry; Feed excluded)
  const filteredProducts = useMemo(() => {
    // Exclude Feed
    let result = products.filter((p) => getProductCategory(p) !== "FEED");

    // Category Filter: only show products of the selected category
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => getProductCategory(p) === selectedCategory);
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

  // Add Product to Cart
  const handleAddProduct = (product: Product) => {
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

  // Customer Select Options (Clean 2-line structure for maximum readability)
  const customerOptions: SelectOption[] = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: c.customer_name,
      subLabel: `মোবাইল: ${c.mobile || "N/A"}${c.address_details ? ` • ${c.address_details}` : ""}`,
      badge: c.previous_due_amount > 0 ? `বকেয়া: ${formatBdCurrency(c.previous_due_amount)}` : undefined,
    }));
  }, [customers]);

  const handleCustomerChange = (val: any) => {
    const cust = customers.find((c) => c.id === Number(val));
    if (cust) {
      setCustomer(cust);
    }
  };

  // Unit Options for Cart Table (Bosta completely removed per requirement)
  const getUnitOptions = (item: CartItem): SelectOption[] => {
    const pCat = getProductCategory({
      name: item.product_name,
      category: item.category,
    });

    if (pCat === "EGGS") {
      return [
        { value: "Piece", label: "পিস" },
        { value: "Hali", label: "হালি" },
        { value: "Tray", label: "খাঁচা" },
      ];
    }
    if (pCat === "FISH") {
      return [
        { value: "Kg", label: "কেজি" },
        { value: "Gram", label: "গ্রাম" },
        { value: "Piece", label: "পিস" },
      ];
    }
    return [
      { value: "Piece", label: "পিস" },
      { value: "Kg", label: "কেজি" },
    ];
  };

  // Reset entire Sales Portal state
  const handleReset = () => {
    clearCart();
    setSearchQuery("");
    setSelectedCategory("ALL");
    setReturnAdjustment(0);
    setPaymentAccount("");
    setTransactionId("");
    toast.info("বিক্রয় পোর্টাল রিসেট সম্পন্ন হয়েছে");
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
        payment_account: paymentAccount || null,
        transaction_id: transactionId || null,
        order_note: `${orderNote}${paymentAccount ? ` [A/C: ${paymentAccount}]` : ""}${transactionId ? ` [TrxID: ${transactionId}]` : ""}`.trim(),
        exchange_details: returnAdjustment > 0 ? { description: orderNote || "পণ্য বিনিময় সমন্বয়", amount: returnAdjustment } : null,
        products: cart.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit || "Piece",
          price: item.cost_price || 0,
          selling_price: item.selling_price,
          line_discount: item.line_discount || 0,
          total_price: item.selling_price * item.quantity - (item.line_discount || 0),
        })),
        items: cart.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit || "Piece",
          price: item.cost_price || 0,
          unit_price: item.selling_price,
          selling_price: item.selling_price,
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

  if (loading && products.length === 0) {
    return <PosFullSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 select-none font-sans">
      {/* 1. TOP SALES PORTAL HEADER (Cart Icon + Title + Customer Selection Bar) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2 px-3 sm:px-4 mb-2 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0">
        {/* Left: Cart Icon Badge + Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-[#166534] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
              বিক্রয় পোর্টাল
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
              পণ্য নির্বাচন, পরিমাণ, মূল্য ও সমন্বিত ক্যাশ সেলস
            </p>
          </div>
        </div>

        {/* Right: Customer Selector Bar (Row 1: Customer selector, Row 2 on mobile: Add Customer + Exchange together) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Row 1 on mobile: Customer label & CustomSelect */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto flex-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              কাস্টমার:
            </span>
            <div className="flex-1 sm:w-72 md:w-80 lg:w-[340px] min-w-[170px]">
              <CustomSelect
                options={customerOptions}
                value={selectedCustomer?.id}
                onChange={handleCustomerChange}
                placeholder="কাস্টমার নির্বাচন বা মোবাইল নম্বর..."
                searchThreshold={0}
                minPopoverWidth={340}
                triggerClassName="h-[38px] px-3 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Row 2 on mobile (side-by-side on desktop): Add Customer + Exchange Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            {/* Add New Customer Button */}
            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex-1 sm:flex-initial h-[38px] px-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
              title="নতুন কাস্টমার যোগ করুন"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>নতুন কাস্টমার</span>
            </button>

            {/* Top Exchange Button */}
            <button
              type="button"
              onClick={() => setIsExchangeModalOpen(true)}
              className={`flex-1 sm:flex-initial h-[38px] px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 ${returnAdjustment > 0
                  ? "bg-amber-600 text-white border-amber-600 hover:bg-amber-700 animate-pulse"
                  : "bg-white dark:bg-slate-900 border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                }`}
              title="ফিড বা ডিম বিনিময় ও মূল্য সমন্বয় (Exchange)"
            >
              <ArrowRightLeft className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">ডিম/ফিড বিনিময়</span>
              {returnAdjustment > 0 ? (
                <span className="px-1.5 py-0.5 bg-white/20 text-white rounded text-[10px] font-black">
                  -৳{returnAdjustment}
                </span>
              ) : (
                <span className="px-1 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded text-[9px] font-bold">
                  বিনিময়
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTER & SEARCH BAR ROW */}
      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 mb-2 shrink-0">
        {/* Left: Category Pills with Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {/* All Products */}
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${selectedCategory === "ALL"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span>সব পণ্য</span>
            <span className="text-[10px] opacity-80">({categoryCounts.all})</span>
          </button>

          {/* Eggs */}
          <button
            onClick={() => setSelectedCategory("EGGS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${selectedCategory === "EGGS"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span>🥚 ডিম</span>
            <span className="text-[10px] opacity-80">({categoryCounts.eggs})</span>
          </button>

          {/* Fish */}
          <button
            onClick={() => setSelectedCategory("FISH")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${selectedCategory === "FISH"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span>🐟 মাছ</span>
            <span className="text-[10px] opacity-80">({categoryCounts.fish})</span>
          </button>

          {/* Poultry / Chicken */}
          <button
            onClick={() => setSelectedCategory("POULTRY")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${selectedCategory === "POULTRY"
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
          >
            <span>🐔 মুরগি</span>
            <span className="text-[10px] opacity-80">({categoryCounts.poultry})</span>
          </button>
        </div>

        {/* Right: Search Input + Add Product + View Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্যের নাম খুঁজুন... (F2)"
              className="w-full h-[34px] pl-8 pr-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            className="h-[34px] px-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            title="নতুন পণ্য যুক্ত করুন"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">নতুন পণ্য</span>
          </button>

          {/* Grid View Toggle */}
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`w-[34px] h-[34px] rounded-xl flex items-center justify-center border transition-all cursor-pointer ${viewMode === "grid"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
              }`}
            title="গ্রিড কার্ড ভিউ"
          >
            <LayoutGrid className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* List View Toggle */}
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`w-[34px] h-[34px] rounded-xl flex items-center justify-center border transition-all cursor-pointer ${viewMode === "list"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"
              }`}
            title="কমপ্যাক্ট লিস্ট ভিউ"
          >
            <List className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </section>

      {/* 3. PRODUCT CATALOG: GRID VIEW VS LIST VIEW (Requirement 7) */}
      <section className="mb-2.5 shrink-0">
        {loading ? (
          <PosGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 p-4 text-xs">
            <ShoppingBag className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1" />
            <span>কোনো পণ্য খুঁজে পাওয়া যায়নি</span>
          </div>
        ) : viewMode === "grid" ? (
          /* A. GRID VIEW (Horizontal Carousel with Drag & Swipe) */
          <div>
            {/* Carousel Navigation Header */}
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>পণ্য ক্যাটালগ ({filteredProducts.length} টি)</span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">• সোয়াইপ বা স্ক্রোল করুন</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-2xs"
                  title="বামে স্ক্রোল করুন"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-2xs"
                  title="ডানে স্ক্রোল করুন"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-500/30 hover:scrollbar-thumb-emerald-600/60 dark:scrollbar-thumb-emerald-900 scroll-smooth select-none"
            >
              {filteredProducts.map((p) => {
                const qty = getCardQuantity(p.id);
                const displayName = getProductDisplayName(p);
                const unitDisplay = getProductUnitDisplay(p);
                const imgSrc = getProductImage(p);

                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddProduct(p)}
                    className="w-[136px] min-w-[136px] sm:w-[146px] sm:min-w-[146px] h-[178px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-emerald-500/60 transition-all shrink-0 snap-start group cursor-pointer active:scale-[0.98]"
                  >
                    {/* Top: Product Image */}
                    <div className="h-13 w-full flex items-center justify-center bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-0.5 relative overflow-hidden">
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
                    <div
                      className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/60 overflow-hidden h-7">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardQuantityChange(p.id, -1);
                          }}
                          className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="কমান"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-800 dark:text-slate-100">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardQuantityChange(p.id, 1);
                          }}
                          className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="বাড়ান"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Circular Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProduct(p);
                        }}
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
          </div>
        ) : (
          /* B. LIST VIEW (Compact Row Table) */
          <div className="max-h-[220px] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xs scrollbar-thin">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredProducts.map((p) => {
                const qty = getCardQuantity(p.id);
                const displayName = getProductDisplayName(p);
                const unitDisplay = getProductUnitDisplay(p);
                const imgSrc = getProductImage(p);

                return (
                  <div
                    key={p.id}
                    onClick={() => handleAddProduct(p)}
                    className="flex items-center justify-between p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-500/50 transition-all gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {/* Left: Thumbnail & Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={displayName}
                          width={32}
                          height={32}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={p.name}>
                          {displayName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            স্টক: {p.quantity.toLocaleString("bn-BD")}
                          </span>
                          <span className="text-[11px] font-black text-slate-900 dark:text-white">
                            ৳{p.sell_price.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stepper + Add Button */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden h-6.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardQuantityChange(p.id, -1);
                          }}
                          className="w-4.5 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-4.5 text-center text-[11px] font-bold">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardQuantityChange(p.id, 1);
                          }}
                          className="w-4.5 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProduct(p);
                        }}
                        className="w-7 h-7 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="কার্টে যোগ করুন"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 4. MAIN SPLIT: CART TABLE (LEFT 60%) & PAYMENT SUMMARY (RIGHT 40%) */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">
        {/* Left Side: Cart Table (60% width) */}
        <div className="w-full lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col h-auto">
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
          <div className="flex-1 overflow-y-auto min-h-[160px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
                <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
                  কোনো পণ্য কার্টে যুক্ত করা হয়নি
                </p>
                <p className="text-[11px] text-slate-400 text-center mt-0.5">
                  ওপরের পণ্যের কার্ড থেকে সরাসরি পণ্য নির্বাচন করুন <span className="hidden sm:inline">(F2)</span>
                </p>
              </div>
            ) : (
              <>
                {/* Desktop View: Full Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] font-bold border-b border-slate-200 dark:border-slate-700 z-10">
                      <tr>
                        <th className="py-2 px-2 text-center w-8">#</th>
                        <th className="py-2 px-2.5 min-w-[130px]">পণ্য</th>
                        <th className="py-2 px-2 text-center w-[110px]">পরিমাণ</th>
                        <th className="py-2 px-2 text-center w-[92px]">একক</th>
                        <th className="py-2 px-2 text-center w-[85px]">দর (৳)</th>
                        <th className="py-2 px-2 text-right w-[85px]">মোট (৳)</th>
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
                            <td className="py-1.5 px-2 text-center font-bold text-slate-500">
                              {idx + 1}
                            </td>

                            <td className="py-1.5 px-2.5">
                              <div className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                {getProductDisplayName(item)}
                              </div>
                              <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                                {item.barcode || `PRD-${item.product_id}`}
                              </div>
                            </td>

                            <td className="py-1.5 px-2">
                              <div className="flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/60 overflow-hidden h-7 mx-auto w-[96px]">
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.product_id, item.quantity - 1)}
                                  className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min={0.1}
                                  step="any"
                                  value={item.quantity}
                                  onChange={(e) => updateQty(item.product_id, parseFloat(e.target.value) || 0)}
                                  className="w-12 h-full text-center font-bold text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.product_id, item.quantity + 1)}
                                  className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            <td className="py-1.5 px-2 text-center">
                              <div className="w-[84px] mx-auto">
                                <CustomSelect
                                  options={getUnitOptions(item)}
                                  value={item.unit || "Piece"}
                                  onChange={(val) => updateUnit(item.product_id, String(val))}
                                  matchTriggerWidth={true}
                                  searchThreshold={99}
                                  triggerClassName="h-8 min-h-8 px-2 py-0 text-xs font-semibold rounded-lg"
                                />
                              </div>
                            </td>

                            <td className="py-1.5 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={item.selling_price}
                                onChange={(e) => updatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                                className="w-18 h-7 text-center font-bold text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                              />
                            </td>

                            <td className="py-1.5 px-2 text-right font-bold text-slate-700 dark:text-slate-200">
                              {rowTotal.toFixed(2)}
                            </td>

                            <td className="py-1.5 px-2 text-right font-black text-emerald-700 dark:text-emerald-400">
                              {rowNet.toFixed(2)}
                            </td>

                            <td className="py-1.5 px-1 text-center">
                              <button
                                type="button"
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
                </div>

                {/* Mobile View: Compact Box/Cards with Vertical Scroll */}
                <div className="md:hidden space-y-2 max-h-[360px] overflow-y-auto pr-0.5 scrollbar-thin">
                  {cart.map((item, idx) => {
                    const rowTotal = item.selling_price * item.quantity;
                    const rowNet = rowTotal - (item.line_discount || 0);

                    return (
                      <div
                        key={item.product_id}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 shadow-2xs"
                      >
                        {/* Header: Serial + Name + Trash */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                {getProductDisplayName(item)}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {item.barcode || `PRD-${item.product_id}`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_id)}
                            className="w-7 h-7 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Controls: Stepper + Unit */}
                        <div className="grid grid-cols-2 gap-2 items-center">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden h-7">
                            <button
                              type="button"
                              onClick={() => updateQty(item.product_id, item.quantity - 1)}
                              className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={0.1}
                              step="any"
                              value={item.quantity}
                              onChange={(e) => updateQty(item.product_id, parseFloat(e.target.value) || 0)}
                              className="flex-1 h-full text-center font-bold text-xs bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateQty(item.product_id, item.quantity + 1)}
                              className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Unit Select */}
                          <CustomSelect
                            options={getUnitOptions(item)}
                            value={item.unit || "Piece"}
                            onChange={(val) => updateUnit(item.product_id, String(val))}
                            matchTriggerWidth={true}
                            searchThreshold={99}
                            triggerClassName="h-7 min-h-7 px-2 py-0 text-xs font-semibold rounded-lg"
                          />
                        </div>

                        {/* Bottom: Rate & Net */}
                        <div className="flex items-center justify-between gap-1 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <span>দর:</span>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.selling_price}
                              onChange={(e) => updatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                              className="w-16 h-6 text-center font-bold text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            />
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400">নেট: </span>
                            <span className="font-black text-xs text-emerald-700 dark:text-emerald-400">
                              ৳{rowNet.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Under Table Sub-Actions */}
          <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            {/* Left: Clear Cart & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>সব মুছে ফেলুন</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট <span className="hidden sm:inline">(Esc)</span></span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Summary Panel (40% width) */}
        <div className="w-full lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between h-auto">
          <div className="space-y-2 pr-0.5">
            {/* 1. Subtotal */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">মোট মূল্য:</span>
              <span className="font-black text-slate-900 dark:text-white text-sm">
                {formatBdCurrency(subtotal)}
              </span>
            </div>

            {/* 2. Overall Discount (Toggle + Input) */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">সামগ্রিক ছাড়:</span>
              <div className="flex items-center gap-1.5">
                {/* Discount Type Toggle [৳ | %] */}
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDiscountType("flat")}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${discountType === "flat"
                        ? "bg-[#166534] text-white"
                        : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    ৳
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("percent")}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${discountType === "percent"
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

            {/* Exchange Deduction Display (if any) */}
            {returnAdjustment > 0 && (
              <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2 text-amber-800 dark:text-amber-300">
                <span className="font-bold flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                  বিনিময় কর্তন:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black">- {formatBdCurrency(returnAdjustment)}</span>
                  <button
                    type="button"
                    onClick={() => setIsExchangeModalOpen(true)}
                    className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-[10px] font-bold hover:bg-amber-300 cursor-pointer"
                  >
                    পরিবর্তন
                  </button>
                </div>
              </div>
            )}

            {/* 3. Net Payable Highlight Box */}
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2 flex items-center justify-between shadow-2xs">
              <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                পরিশোধযোগ্য:
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300">
                {formatBdCurrency(netPayable)}
              </span>
            </div>

            {/* 4. Payment Methods [Cash, bKash, Nagad, Rocket, Bank, Card] */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                পেমেন্ট মাধ্যম (Payment Method)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                {[
                  { id: "cash", label: "নগদ" },
                  { id: "bkash", label: "bKash" },
                  { id: "nagad", label: "Nagad" },
                  { id: "rocket", label: "Rocket" },
                  { id: "bank", label: "ব্যাংক" },
                  { id: "card", label: "কার্ড" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${paymentMethod.toLowerCase() === m.id
                        ? "bg-[#166534] text-white shadow-xs font-black"
                        : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Non-Cash Fields: Mobile/Account No & Transaction ID */}
            {paymentMethod.toLowerCase() !== "cash" && (
              <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    মোবাইল / হিসাব নং
                  </label>
                  <input
                    type="text"
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    placeholder="017xxxxxxxx / A/C"
                    className="w-full h-7 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                    ট্রানজেকশন আইডি (TrxID)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="TrxID / Ref"
                    className="w-full h-7 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            )}

            {/* 5. Paid Amount Input */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="font-bold text-slate-700 dark:text-slate-300">প্রদেয় পরিমাণ:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
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
                  className="w-28 h-7.5 text-right font-black text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 6. Current Due */}
            <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-1.5">
              <span className="font-bold text-slate-600 dark:text-slate-400">বকেয়া (বর্তমান):</span>
              <span
                className={`font-black text-sm ${currentDue > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-800 dark:text-slate-200"
                  }`}
              >
                {formatBdCurrency(currentDue)}
              </span>
            </div>

            {/* 7. Order Note / Remark Input inside Payment Section */}
            <div>
              <input
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="✏️ বিবরণ / স্পেশাল নোট লিখুন..."
                className="w-full h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            {/* Previous Customer Due Alert if Any */}
            {selectedCustomer && selectedCustomer.previous_due_amount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-1.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>পূর্বের মোট বকেয়া:</span>
                <span className="font-black">{formatBdCurrency(selectedCustomer.previous_due_amount)}</span>
              </div>
            )}
          </div>

          {/* Pinned Bottom Buttons (Print + Complete Sale) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 shrink-0">
            {/* Print Button */}
            <button
              type="button"
              onClick={() => {
                if (completedOrder) {
                  setIsReceiptModalOpen(true);
                } else {
                  toast.info("কোনো সক্রিয় চালান বা মেমো নেই। বিক্রয় সম্পন্ন হলে অটো প্রিন্ট হবে।");
                }
              }}
              className="h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="চালান প্রিন্ট করুন (F6)"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>প্রিন্ট <span className="hidden sm:inline">(F6)</span></span>
            </button>

            {/* Submit Order Button */}
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={submittingOrder || cart.length === 0}
              className="h-10 px-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>প্রসেস...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>বিক্রয় সম্পন্ন <span className="hidden sm:inline">(F4)</span></span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {/* 1. Add Product Modal */}
      <ExchangeModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        subTotal={getSubTotal()}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductCreated={() => {
          loadInitialData();
          setIsAddProductModalOpen(false);
        }}
      />

      {/* 2. Customer Modal */}
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

