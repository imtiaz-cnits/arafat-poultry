"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  Plus,
  Search,
  Calendar,
  Clock,
  Send,
  RotateCcw,
  Package,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  Layers,
  Fish,
  Egg,
  Eye,
  Trash2,
  Pencil,
  Printer,
  Utensils,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { Pagination , PageSkeleton } from "@/components/ui";
import { CustomDatePicker, CustomSelect, useToast } from "@/components/ui";

interface FeedProduct {
  id: number;
  product_name: string;
  quantity: number;
  cost_price: number;
  bag_weight_kg: number;
  target_type: string;
}

interface InternalIssue {
  id: number;
  issue_no: string;
  product_name?: string;
  destination: string;
  destination_type: string;
  bags: number;
  total_kg: number;
  unit_cost_per_kg: number;
  total_cost: number;
  date: string;
  note?: string;
}

interface FeedReport {
  summary: {
    total_purchased_bags: number;
    total_purchased_cost: number;
    total_sold_bags: number;
    total_sales_revenue: number;
    cogs_external_sales: number;
    gross_profit: number;
    total_internally_issued_bags: number;
    total_internally_issued_cost: number;
    expected_inventory_bags: number;
  };
  recent_internal_issues: InternalIssue[];
  feed_products?: FeedProduct[];
}

export default function FeedTradingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FeedReport | null>(null);
  const [activeTab, setActiveTab] = useState<"stocks" | "schedule">("stocks");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<"ALL" | "FISH" | "POULTRY">("ALL");
  const [issuesPage, setIssuesPage] = useState(1);
  const [issuesPageSize, setIssuesPageSize] = useState(20);
  const [stocksPage, setStocksPage] = useState(1);
  const [stocksPageSize, setStocksPageSize] = useState(20);

  useEffect(() => {
    setIssuesPage(1);
    setStocksPage(1);
  }, [searchTerm, feedCategoryFilter]);

  // Modal State (Record Feeding)
  const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
  const [feedingSubmitting, setFeedingSubmitting] = useState(false);
  const [feedingProductId, setFeedingProductId] = useState<number | "">("");
  const [feedingCategory, setFeedingCategory] = useState<"FISH" | "POULTRY">("POULTRY");
  const [feedingDestination, setFeedingDestination] = useState("");
  const [feedingDestinationId, setFeedingDestinationId] = useState<number | "">("");
  const [flocksList, setFlocksList] = useState<any[]>([]);
  const [pondsList, setPondsList] = useState<any[]>([]);
  const [feedingTime, setFeedingTime] = useState("সকাল (Morning)");
  const [feedingUnit, setFeedingUnit] = useState<"kg" | "gram" | "bag">("kg");
  const [feedingAmount, setFeedingAmount] = useState<string>("10");
  const [feedingDate, setFeedingDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [feedingNote, setFeedingNote] = useState("");

  // Add Feed Stock Modal State
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [addStockSubmitting, setAddStockSubmitting] = useState(false);
  const [addStockCategory, setAddStockCategory] = useState<"POULTRY" | "FISH">("POULTRY");
  const [addStockProductId, setAddStockProductId] = useState<number | "">("");
  const [addStockUnit, setAddStockUnit] = useState<"bag" | "kg" | "gram">("bag");
  const [addStockAmount, setAddStockAmount] = useState<string>("10");
  const [addStockBagWeight, setAddStockBagWeight] = useState<string>("50");
  const [addStockCostPrice, setAddStockCostPrice] = useState<string>("");
  const [addStockDate, setAddStockDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [addStockNote, setAddStockNote] = useState("");

  // Action Modals State
  const [viewIssue, setViewIssue] = useState<InternalIssue | null>(null);
  const [deleteIssue, setDeleteIssue] = useState<InternalIssue | null>(null);
  const [editingIssue, setEditingIssue] = useState<InternalIssue | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedRes, flocksRes, pondsRes] = await Promise.all([
        fetch("/api/feed/internal-issue"),
        fetch("/api/egg/flocks"),
        fetch("/api/fish/ponds"),
      ]);

      const [feedJson, flocksJson, pondsJson] = await Promise.all([
        feedRes.json(),
        flocksRes.json(),
        pondsRes.json(),
      ]);

      if (feedJson.status === "success") {
        setData(feedJson.data);
      } else {
        toast.error(feedJson.message || "ফিড ডাটা লোড করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }

      if (flocksJson.status === "success" && Array.isArray(flocksJson.data)) {
        setFlocksList(flocksJson.data);
      }

      if (pondsJson.status === "success" && Array.isArray(pondsJson.data)) {
        setPondsList(pondsJson.data);
      }
    } catch (err: any) {
      toast.error(err.message || "নেটওয়ার্ক সমস্যা", "ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  // Dynamic Shed Options for Poultry Feeding
  const shedOptions = useMemo(() => {
    const list: { value: string; label: string; subLabel?: string; id?: number }[] = [];
    flocksList.forEach((f) => {
      const name = f.shed_name || f.flock_code;
      if (name && !list.some((item) => item.value === name)) {
        list.push({
          value: name,
          label: name,
          subLabel: `ফ্লক: ${f.flock_code}${f.breed ? ` • ${f.breed}` : ""}`,
          id: f.id,
        });
      }
    });

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ap_chicken_sheds");
        if (stored) {
          const custom: string[] = JSON.parse(stored);
          custom.forEach((name) => {
            if (name && !list.some((item) => item.value === name)) {
              list.push({ value: name, label: name, subLabel: "সংরক্ষিত শেড" });
            }
          });
        }
      } catch {}
    }

    if (list.length === 0) {
      list.push(
        { value: "শেড ১", label: "শেড ১", subLabel: "ডিফল্ট শেড" },
        { value: "শেড ২", label: "শেড ২", subLabel: "ডিফল্ট শেড" },
        { value: "শেড ৩", label: "শেড ৩", subLabel: "ডিফল্ট শেড" }
      );
    }
    return list;
  }, [flocksList]);

  // Dynamic Pond Options for Fish Feeding
  const pondOptions = useMemo(() => {
    const list: { value: string; label: string; subLabel?: string; id?: number }[] = [];
    pondsList.forEach((p) => {
      const name = p.pond_name || p.pond_code;
      if (name && !list.some((item) => item.value === name)) {
        list.push({
          value: name,
          label: name,
          subLabel: `কোড: ${p.pond_code}${p.location ? ` • ${p.location}` : ""}`,
          id: p.id,
        });
      }
    });

    if (list.length === 0) {
      list.push(
        { value: "পুকুর ১", label: "পুকুর ১", subLabel: "ডিফল্ট পুকুর" },
        { value: "পুকুর ২", label: "পুকুর ২", subLabel: "ডিফল্ট পুকুর" }
      );
    }
    return list;
  }, [pondsList]);

  const fishProductsCount = useMemo(() => {
    return (data?.feed_products || []).filter(
      (p) =>
        p.target_type === "FISH" ||
        p.product_name.includes("মাছ") ||
        p.product_name.toLowerCase().includes("fish")
    ).length;
  }, [data?.feed_products]);

  const poultryProductsCount = useMemo(() => {
    return (data?.feed_products || []).filter(
      (p) =>
        p.target_type !== "FISH" &&
        !p.product_name.includes("মাছ") &&
        !p.product_name.toLowerCase().includes("fish")
    ).length;
  }, [data?.feed_products]);

  const addStockFilteredProducts = useMemo(() => {
    if (!data?.feed_products) return [];
    if (addStockCategory === "FISH") {
      return data.feed_products.filter(
        (p) =>
          p.target_type === "FISH" ||
          p.product_name.includes("মাছ") ||
          p.product_name.toLowerCase().includes("fish")
      );
    }
    return data.feed_products.filter(
      (p) =>
        p.target_type !== "FISH" &&
        !p.product_name.includes("মাছ") &&
        !p.product_name.toLowerCase().includes("fish")
    );
  }, [data?.feed_products, addStockCategory]);

  const handleSelectAddStockCategory = (cat: "POULTRY" | "FISH") => {
    setAddStockCategory(cat);
    const filtered = (data?.feed_products || []).filter((p) => {
      const isFish =
        p.target_type === "FISH" ||
        p.product_name.includes("মাছ") ||
        p.product_name.toLowerCase().includes("fish");
      return cat === "FISH" ? isFish : !isFish;
    });
    if (filtered.length > 0) {
      setAddStockProductId(filtered[0].id);
      setAddStockBagWeight(String(filtered[0].bag_weight_kg || 50));
      setAddStockCostPrice(String(filtered[0].cost_price || ""));
    } else {
      setAddStockProductId("");
    }
  };

  const feedingFilteredProducts = useMemo(() => {
    if (!data?.feed_products) return [];
    if (feedingCategory === "FISH") {
      return data.feed_products.filter(
        (p) =>
          p.target_type === "FISH" ||
          p.product_name.includes("মাছ") ||
          p.product_name.toLowerCase().includes("fish")
      );
    }
    return data.feed_products.filter(
      (p) =>
        p.target_type !== "FISH" &&
        !p.product_name.includes("মাছ") &&
        !p.product_name.toLowerCase().includes("fish")
    );
  }, [data?.feed_products, feedingCategory]);

  const handleSwitchFeedingCategory = (cat: "POULTRY" | "FISH") => {
    setFeedingCategory(cat);
    const filtered = (data?.feed_products || []).filter((p) => {
      const isFish =
        p.target_type === "FISH" ||
        p.product_name.includes("মাছ") ||
        p.product_name.toLowerCase().includes("fish");
      return cat === "FISH" ? isFish : !isFish;
    });
    if (filtered.length > 0) {
      setFeedingProductId(filtered[0].id);
    } else {
      setFeedingProductId("");
    }
    if (cat === "FISH") {
      setFeedingDestination(pondOptions[0]?.value || "পুকুর ১");
      setFeedingDestinationId(pondOptions[0]?.id || "");
    } else {
      setFeedingDestination(shedOptions[0]?.value || "শেড ১");
      setFeedingDestinationId(shedOptions[0]?.id || "");
    }
  };

  // Selected product details for Add Feed Stock modal
  const selectedAddStockProduct = useMemo(() => {
    if (!addStockProductId || !data?.feed_products) return null;
    return data.feed_products.find((p) => p.id === Number(addStockProductId)) || null;
  }, [addStockProductId, data]);

  // Update default bag weight & cost price when add stock product changes
  useEffect(() => {
    if (selectedAddStockProduct) {
      setAddStockBagWeight(String(selectedAddStockProduct.bag_weight_kg || 50));
      setAddStockCostPrice(String(selectedAddStockProduct.cost_price || ""));
    }
  }, [selectedAddStockProduct]);

  // Computed live conversion for Add Feed Stock
  const computedStockInValues = useMemo(() => {
    const amountNum = parseFloat(addStockAmount) || 0;
    const bagWeight = parseFloat(addStockBagWeight) || 50;
    const costPriceNum = parseFloat(addStockCostPrice) || 0;

    let computedBags = 0;
    let computedKg = 0;
    let computedGrams = 0;

    if (addStockUnit === "bag") {
      computedBags = amountNum;
      computedKg = amountNum * bagWeight;
      computedGrams = computedKg * 1000;
    } else if (addStockUnit === "kg") {
      computedKg = amountNum;
      computedBags = bagWeight > 0 ? amountNum / bagWeight : 0;
      computedGrams = amountNum * 1000;
    } else if (addStockUnit === "gram") {
      computedGrams = amountNum;
      computedKg = amountNum / 1000;
      computedBags = bagWeight > 0 ? (amountNum / 1000) / bagWeight : 0;
    }

    const totalCost = computedBags * costPriceNum;

    return {
      computedBags,
      computedKg,
      computedGrams,
      totalCost,
    };
  }, [addStockAmount, addStockBagWeight, addStockCostPrice, addStockUnit]);

  const handleOpenAddStockModal = () => {
    setAddStockCategory("POULTRY");
    const filtered = (data?.feed_products || []).filter(
      (p) =>
        p.target_type !== "FISH" &&
        !p.product_name.includes("মাছ") &&
        !p.product_name.toLowerCase().includes("fish")
    );
    if (filtered.length > 0) {
      setAddStockProductId(filtered[0].id);
      setAddStockBagWeight(String(filtered[0].bag_weight_kg || 50));
      setAddStockCostPrice(String(filtered[0].cost_price || ""));
    } else if (data?.feed_products && data.feed_products.length > 0) {
      const p = data.feed_products[0];
      setAddStockProductId(p.id);
      setAddStockBagWeight(String(p.bag_weight_kg || 50));
      setAddStockCostPrice(String(p.cost_price || ""));
    }
    setAddStockUnit("bag");
    setAddStockAmount("10");
    setAddStockDate(new Date().toISOString().split("T")[0]);
    setAddStockNote("");
    setIsAddStockModalOpen(true);
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStockProductId) {
      toast.error("অনুগ্রহ করে ফিড পণ্য নির্বাচন করুন", "সতর্কতা");
      return;
    }
    const amountNum = parseFloat(addStockAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error("সঠিক স্টক পরিমাণ দিন", "সতর্কতা");
      return;
    }

    try {
      setAddStockSubmitting(true);
      const res = await fetch("/api/feed/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: Number(addStockProductId),
          unit: addStockUnit,
          amount: amountNum,
          bag_weight_kg: parseFloat(addStockBagWeight) || 50,
          cost_price: parseFloat(addStockCostPrice) || 0,
          date: addStockDate,
          note: addStockNote.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.status === "success") {
        toast.success(resData.message || "ফিড স্টক সফলভাবে যোগ করা হয়েছে!", "সফল");
        setIsAddStockModalOpen(false);
        await loadData();
      } else {
        toast.error(resData.message || "ফিড স্টক যোগ করা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে", "ত্রুটি");
    } finally {
      setAddStockSubmitting(false);
    }
  };

  const handleOpenFeedingModal = (p?: FeedProduct) => {
    setEditingIssue(null);
    const prod = p || (data?.feed_products && data.feed_products[0]) || null;
    if (prod) {
      setFeedingProductId(prod.id);
      const isFish =
        prod.target_type === "FISH" ||
        prod.product_name.toLowerCase().includes("fish") ||
        prod.product_name.includes("মাছ");
      setFeedingCategory(isFish ? "FISH" : "POULTRY");
      if (isFish) {
        setFeedingDestination(pondOptions[0]?.value || "পুকুর ১");
        setFeedingDestinationId(pondOptions[0]?.id || "");
      } else {
        setFeedingDestination(shedOptions[0]?.value || "শেড ১");
        setFeedingDestinationId(shedOptions[0]?.id || "");
      }
    } else {
      setFeedingCategory("POULTRY");
      setFeedingDestination(shedOptions[0]?.value || "শেড ১");
      setFeedingDestinationId(shedOptions[0]?.id || "");
    }
    setFeedingTime("সকাল (Morning)");
    setFeedingUnit("kg");
    setFeedingAmount("10");
    setFeedingDate(new Date().toISOString().split("T")[0]);
    setFeedingNote("");
    setIsFeedingModalOpen(true);
  };

  const handleOpenEditFeeding = (iss: InternalIssue) => {
    setEditingIssue(iss);
    const isFish = iss.destination_type === "FISH_POND";
    setFeedingCategory(isFish ? "FISH" : "POULTRY");
    setFeedingDestination(iss.destination || "");
    setFeedingTime("সকাল (Morning)");
    setFeedingUnit("bag");
    setFeedingAmount(String(iss.bags || 1));
    setFeedingDate(iss.date || new Date().toISOString().split("T")[0]);
    setFeedingNote(iss.note || "");

    const matchedProd = (data?.feed_products || []).find((p) => p.product_name === iss.product_name);
    if (matchedProd) {
      setFeedingProductId(matchedProd.id);
    } else if (data?.feed_products && data.feed_products.length > 0) {
      setFeedingProductId(data.feed_products[0].id);
    }
    setIsFeedingModalOpen(true);
  };

  const selectedFeedingProduct = useMemo(() => {
    if (!data?.feed_products || data.feed_products.length === 0) return null;
    if (feedingProductId) {
      const match = data.feed_products.find((p) => p.id === Number(feedingProductId));
      if (match) return match;
    }
    const catMatch = feedingFilteredProducts[0] || data.feed_products[0];
    return catMatch || null;
  }, [feedingProductId, data, feedingFilteredProducts]);

  const computedFeedingValues = useMemo(() => {
    const amountNum = parseFloat(feedingAmount) || 0;
    const bagWeight = selectedFeedingProduct?.bag_weight_kg || 50;
    const costPerBag = selectedFeedingProduct?.cost_price || 0;

    let computedBags = 0;
    let computedKg = 0;

    if (feedingUnit === "bag") {
      computedBags = amountNum;
      computedKg = amountNum * bagWeight;
    } else if (feedingUnit === "kg") {
      computedKg = amountNum;
      computedBags = bagWeight > 0 ? amountNum / bagWeight : 0;
    } else if (feedingUnit === "gram") {
      computedKg = amountNum / 1000;
      computedBags = bagWeight > 0 ? (amountNum / 1000) / bagWeight : 0;
    }

    const totalCost = computedBags * costPerBag;
    return { computedBags, computedKg, totalCost };
  }, [feedingAmount, feedingUnit, selectedFeedingProduct]);

  const handleFeedingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveProdId =
      feedingProductId ||
      feedingFilteredProducts[0]?.id ||
      data?.feed_products?.find((p) =>
        feedingCategory === "FISH"
          ? p.target_type === "FISH" || p.product_name.includes("মাছ")
          : p.target_type === "POULTRY" || p.product_name.includes("মুরগি") || !p.product_name.includes("মাছ")
      )?.id ||
      data?.feed_products?.[0]?.id;

    if (!effectiveProdId) {
      toast.error("কোনো ফিড পণ্য পাওয়া যায়নি। অনুগ্রহ করে স্টক যোগ করুন।", "সতর্কতা");
      return;
    }
    if (!feedingDestination.trim()) {
      toast.error("পুকুর বা শেডের নাম দিন", "সতর্কতা");
      return;
    }
    if (computedFeedingValues.computedBags <= 0) {
      toast.error("সঠিক খাদ্যের পরিমাণ দিন", "সতর্কতা");
      return;
    }

    try {
      setFeedingSubmitting(true);
      const isEditing = Boolean(editingIssue);
      const url = "/api/feed/internal-issue";
      const method = isEditing ? "PUT" : "POST";

      const payload: any = {
        product_id: Number(effectiveProdId),
        destination_type: feedingCategory === "FISH" ? "FISH_POND" : "POULTRY_FARM",
        destination_id: feedingDestinationId || undefined,
        destination_name: feedingDestination.trim(),
        bags: computedFeedingValues.computedBags,
        bag_weight_kg: selectedFeedingProduct?.bag_weight_kg || 50,
        date: feedingDate,
        note: feedingNote.trim()
          ? `${feedingNote.trim()} | সময়: ${feedingTime} | ইনপুট: ${feedingAmount} ${feedingUnit === "bag" ? "বস্তা" : feedingUnit === "kg" ? "কেজি" : "গ্রাম"}`
          : `সময়: ${feedingTime} | ইনপুট: ${feedingAmount} ${feedingUnit === "bag" ? "বস্তা" : feedingUnit === "kg" ? "কেজি" : "গ্রাম"}`,
      };

      if (isEditing && editingIssue) {
        payload.id = editingIssue.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.status === "success") {
        toast.success(
          isEditing ? "খাবার প্রদানের তথ্য সফলভাবে আপডেট হয়েছে!" : "খাবার প্রদানের তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
          "সফল"
        );
        setIsFeedingModalOpen(false);
        setEditingIssue(null);
        await loadData();
        setActiveTab("schedule");
      } else {
        toast.error(resData.message || "সংরক্ষণ করা যায়নি", "ব্যর্থ");
      }
    } catch (err: any) {
      toast.error(err.message || "সার্ভারে সমস্যা হয়েছে", "ত্রুটি");
    } finally {
      setFeedingSubmitting(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!deleteIssue) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/feed/internal-issue?id=${deleteIssue.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.status === "success") {
        toast.success(json.message || "খাবার প্রদানের রেকর্ড বাতিল করা হয়েছে", "সফল");
        setDeleteIssue(null);
        loadData();
      } else {
        toast.error(json.message || "বাতিল করতে ব্যর্থ হয়েছে", "ত্রুটি");
      }
    } catch (err: any) {
      toast.error(err.message || "নেটওয়ার্ক সমস্যা", "ত্রুটি");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered issues list
  const filteredIssues = useMemo(() => {
    if (!data?.recent_internal_issues) return [];
    if (!searchTerm) return data.recent_internal_issues;
    const lower = searchTerm.toLowerCase();
    return data.recent_internal_issues.filter(
      (iss) =>
        iss.issue_no.toLowerCase().includes(lower) ||
        iss.destination.toLowerCase().includes(lower) ||
        (iss.product_name && iss.product_name.toLowerCase().includes(lower))
    );
  }, [data, searchTerm]);

  const displayedIssues = useMemo(() => {
    const start = (issuesPage - 1) * issuesPageSize;
    return filteredIssues.slice(start, start + issuesPageSize);
  }, [filteredIssues, issuesPage, issuesPageSize]);

  // Filtered stocks list with category filter and search
  const filteredStocks = useMemo(() => {
    const prods = data?.feed_products || [];
    let list = prods;
    if (feedCategoryFilter === "FISH") {
      list = list.filter(
        (p) =>
          p.target_type === "FISH" ||
          p.product_name.toLowerCase().includes("fish") ||
          p.product_name.includes("মাছ")
      );
    } else if (feedCategoryFilter === "POULTRY") {
      list = list.filter(
        (p) =>
          p.target_type !== "FISH" &&
          !p.product_name.toLowerCase().includes("fish") &&
          !p.product_name.includes("মাছ")
      );
    }
    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter((p) => p.product_name.toLowerCase().includes(lower));
  }, [data?.feed_products, feedCategoryFilter, searchTerm]);

  const displayedStocks = useMemo(() => {
    const start = (stocksPage - 1) * stocksPageSize;
    return filteredStocks.slice(start, start + stocksPageSize);
  }, [filteredStocks, stocksPage, stocksPageSize]);

  if (loading && !data) {

    return <PageSkeleton />;

  }

  return (
    <div className="no-print space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              পোল্ট্রি ও ফিশ ফিড ট্রেডিং (Feed Trading)
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              খাদ্য ক্রয়-বিক্রয়, বস্তা/কেজি রূপান্তর ও খামার/পুকুরে অভ্যন্তরীণ হস্তান্তর
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAddStockModal}
            className="h-[38px] px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-green-700 hover:from-emerald-900 hover:to-green-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ফিড স্টক যোগ (Add Feed Stock)</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Feed Purchases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট খাদ্য ক্রয়</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {data?.summary.total_purchased_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">
            মোট খরচ: {formatBdCurrency(data?.summary.total_purchased_cost || 0)}
          </div>
        </div>

        {/* Card 2: Commercial Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">বাণিজ্যিক বিক্রয়</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {data?.summary.total_sold_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-sky-600 font-medium">
            মোট বিক্রয় মূল্য: {formatBdCurrency(data?.summary.total_sales_revenue || 0)}
          </div>
        </div>

        {/* Card 3: Internal Transfers / Feed Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">মোট খাবার বিতরণ (প্রদান)</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {data?.summary.total_internally_issued_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-orange-600 font-medium">
            ব্যয় স্থানান্তরিত: {formatBdCurrency(data?.summary.total_internally_issued_cost || 0)}
          </div>
        </div>

        {/* Card 4: Inventory & Gross Profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">বর্তমান ফিড মজুত</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {data?.summary.expected_inventory_bags || 0} <span className="text-xs font-normal text-slate-500">বস্তা</span>
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
            মোট লাভ: <span className="text-emerald-600 font-bold">{formatBdCurrency(data?.summary.gross_profit || 0)}</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin select-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("stocks")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "stocks"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800/40"
              }`}
            >
              ফিড তালিকা ও মজুত ({filteredStocks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800/40"
              }`}
            >
              খাবার প্রদানের সময়সূচি ও হিস্টোরি ({data?.recent_internal_issues?.length || 0})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="সার্চ করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-emerald-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tab 2: Feeding Schedule & Logs Table */}
        {activeTab === "schedule" && (
          <>
          {/* Desktop View: Full Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-medium">
                  <th className="p-[10px]">ভাউচার নং</th>
                  <th className="p-[10px]">খাদ্যের নাম</th>
                  <th className="p-[10px]">ক্যাটাগরি</th>
                  <th className="p-[10px]">গন্তব্য / প্রাপক</th>
                  <th className="text-center p-[10px]">বিতরণকৃত বস্তা</th>
                  <th className="text-center p-[10px]">মোট কেজি</th>
                  <th className="text-right p-[10px]">স্থানান্তরিত ব্যয়</th>
                  <th className="text-center p-[10px]">তারিখ ও বিবরণ</th>
                  <th className="text-center w-28 p-[10px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 p-[10px]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      ডাটা লোড হচ্ছে...
                    </td>
                  </tr>
                ) : filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 p-[10px]">
                      কোনো খাবার প্রদানের তথ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  displayedIssues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="font-mono font-medium text-emerald-700 dark:text-emerald-400 p-[10px]">
                        {iss.issue_no}
                      </td>
                      <td className="font-medium text-gray-900 dark:text-white p-[10px]">
                        {iss.product_name || "ফিড পণ্য"}
                      </td>
                      <td className="p-[10px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            iss.destination_type === "FISH_POND"
                              ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                              : "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                          }`}
                        >
                          {iss.destination_type === "FISH_POND" ? (
                            <>
                              <Fish className="w-3 h-3" />
                              <span>মাছের ফিড</span>
                            </>
                          ) : (
                            <>
                              <Egg className="w-3 h-3" />
                              <span>মুরগির ফিড</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-[10px] font-medium text-slate-800 dark:text-slate-200">
                        {iss.destination}
                      </td>
                      <td className="text-center font-bold text-gray-900 dark:text-white p-[10px]">{iss.bags}</td>
                      <td className="text-center p-[10px] font-bold">{iss.total_kg} kg</td>
                      <td className="text-right font-bold text-emerald-700 dark:text-emerald-400 p-[10px]">
                        {formatBdCurrency(iss.total_cost)}
                      </td>
                      <td className="text-center text-slate-500 p-[10px] whitespace-nowrap">
                        <div>{iss.date}</div>
                        {iss.note && <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{iss.note}</div>}
                      </td>
                      <td className="text-center p-[10px]">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditFeeding(iss)}
                            className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                            title="খাবার রেকর্ড সম্পাদনা করুন"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewIssue(iss)}
                            className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center hover:bg-sky-100 transition-colors cursor-pointer"
                            title="বিস্তারিত ভাউচার দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteIssue(iss)}
                            className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                            title="খাবার রেকর্ড বাতিল করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Compact Box Cards */}
          <div className="md:hidden space-y-2.5 p-3">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                ডাটা লোড হচ্ছে...
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                কোনো খাবার প্রদানের তথ্য পাওয়া যায়নি।
              </div>
            ) : (
              displayedIssues.map((iss) => (
                <div
                  key={iss.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-xs">
                        {iss.product_name || "ফিড পণ্য"}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                        {iss.issue_no} • {iss.date}
                      </div>
                    </div>
                    {/* Action buttons: Icon Only! */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditFeeding(iss)}
                        className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewIssue(iss)}
                        className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center hover:bg-sky-100 transition-colors cursor-pointer"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteIssue(iss)}
                        className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                        title="রেকর্ড বাতিল করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/70">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">স্থানান্তরিত ব্যয়</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm whitespace-nowrap">
                        {formatBdCurrency(iss.total_cost)}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        দর: ৳{iss.unit_cost_per_kg.toFixed(2)}/কেজি
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                      <span className="text-[10px] text-slate-400 block">গন্তব্য ও পরিমাণ</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate block mt-0.5">
                        {iss.destination}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {iss.bags} বস্তা ({iss.total_kg} কেজি)
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Pagination
            currentPage={issuesPage}
            totalItems={filteredIssues.length}
            pageSize={issuesPageSize}
            onPageChange={setIssuesPage}
            onPageSizeChange={setIssuesPageSize}
            pageSizeOptions={[20, 50, 100, 200, 500]}
          />
          </>
        )}

        {/* Tab 1: Feed Products Stocks Table */}
        {activeTab === "stocks" && (
          <>
          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">ক্যাটাগরি:</span>
            <button
              type="button"
              onClick={() => setFeedCategoryFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                feedCategoryFilter === "ALL"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              সব ফিড ({data?.feed_products?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setFeedCategoryFilter("POULTRY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                feedCategoryFilter === "POULTRY"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <Egg className="w-3.5 h-3.5 text-orange-500" />
              <span>মুরগির ফিড ({poultryProductsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedCategoryFilter("FISH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                feedCategoryFilter === "FISH"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <Fish className="w-3.5 h-3.5 text-sky-500" />
              <span>মাছের ফিড ({fishProductsCount})</span>
            </button>
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-800 text-white font-medium">
                  <th className="text-center w-[50px] p-[10px]">ক্র: নং</th>
                  <th className="p-[10px]">খাদ্যের নাম</th>
                  <th className="text-center p-[10px]">ক্যাটাগরি</th>
                  <th className="text-center p-[10px]">বস্তার ওজন</th>
                  <th className="text-center p-[10px]">বর্তমান মজুত</th>
                  <th className="text-center p-[10px]">স্টক স্ট্যাটাস</th>
                  <th className="text-right p-[10px]">ক্রয় দর (বস্তা)</th>
                  <th className="text-right p-[10px]">দর (কেজি)</th>
                  <th className="text-center w-28 p-[10px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 p-[10px]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                      ডাটা লোড হচ্ছে...
                    </td>
                  </tr>
                ) : !data?.feed_products || data.feed_products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 p-[10px]">
                      কোনো ফিড পণ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  displayedStocks.map((p, idx) => {
                    const costPerKg = p.bag_weight_kg > 0 ? p.cost_price / p.bag_weight_kg : p.cost_price;
                    const isFish =
                      p.target_type === "FISH" ||
                      p.product_name.includes("মাছ") ||
                      p.product_name.toLowerCase().includes("fish");
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="text-center font-bold text-slate-400 p-[10px]">{idx + 1}</td>
                        <td className="font-medium text-gray-900 dark:text-white p-[10px]">{p.product_name}</td>
                        <td className="text-center p-[10px]">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isFish
                                ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                : "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                            }`}
                          >
                            {isFish ? <Fish className="w-3 h-3" /> : <Egg className="w-3 h-3" />}
                            <span>{isFish ? "মাছের ফিড" : "মুরগির ফিড"}</span>
                          </span>
                        </td>
                        <td className="text-center font-bold text-slate-700 dark:text-slate-300 p-[10px]">{p.bag_weight_kg} কেজি / বস্তা</td>
                        <td className="text-center font-bold text-emerald-700 dark:text-emerald-400 p-[10px]">
                          {p.quantity} বস্তা ({(p.quantity * p.bag_weight_kg).toLocaleString()} কেজি)
                        </td>
                        <td className="text-center p-[10px]">
                          {p.quantity <= 25 ? (
                            <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                              কম স্টক (Low Stock)
                            </span>
                          ) : (
                            <span className="whitespace-nowrap inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              পর্যাপ্ত (In Stock)
                            </span>
                          )}
                        </td>
                        <td className="text-right font-medium p-[10px]">{formatBdCurrency(p.cost_price)}</td>
                        <td className="text-right p-[10px]">৳{costPerKg.toFixed(2)}</td>
                        <td className="text-center p-[10px]">
                          <button
                            type="button"
                            onClick={() => handleOpenFeedingModal(p)}
                            className="h-[28px] px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center gap-1.5 mx-auto transition-all cursor-pointer shadow-xs"
                            title="খাবার সময়সূচি ও বিবরণ এন্ট্রি করুন"
                          >
                            <Utensils className="w-3 h-3" />
                            <span>খাবার দিন</span>
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
                ডাটা লোড হচ্ছে...
              </div>
            ) : !data?.feed_products || data.feed_products.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold">
                কোনো ফিড পণ্য পাওয়া যায়নি।
              </div>
            ) : (
              displayedStocks.map((p) => {
                const costPerKg = p.bag_weight_kg > 0 ? p.cost_price / p.bag_weight_kg : p.cost_price;
                const isFish =
                  p.target_type === "FISH" ||
                  p.product_name.includes("মাছ") ||
                  p.product_name.toLowerCase().includes("fish");
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-xs">
                          {p.product_name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isFish
                                ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200"
                                : "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200"
                            }`}
                          >
                            {isFish ? "মাছের ফিড" : "মুরগির ফিড"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.bag_weight_kg} কেজি/বস্তা
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenFeedingModal(p)}
                        className="h-7 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                        title="খাবার দিন"
                      >
                        <Utensils className="w-3 h-3" />
                        <span>খাবার দিন</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/70">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">বর্তমান মজুত</span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm whitespace-nowrap">
                          {p.quantity} বস্তা
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ({(p.quantity * p.bag_weight_kg).toLocaleString()} কেজি)
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                        <span className="text-[10px] text-slate-400 block">ক্রয় দর ও রেট</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs whitespace-nowrap block mt-0.5">
                          {formatBdCurrency(p.cost_price)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ৳{costPerKg.toFixed(2)}/কেজি
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Pagination
            currentPage={stocksPage}
            totalItems={filteredStocks.length}
            pageSize={stocksPageSize}
            onPageChange={setStocksPage}
            onPageSizeChange={setStocksPageSize}
            pageSizeOptions={[20, 50, 100, 200, 500]}
          />
          </>
        )}
      </div>

      {/* Feeding Modal (Record Feed Distribution / Schedule) */}
      {isFeedingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {editingIssue
                      ? "খাবার প্রদানের বিবরণ সম্পাদনা (Edit Feeding Record)"
                      : "খাবার প্রদানের বিবরণ এন্ট্রি (Record Feeding)"}
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-normal">খামার বা পুকুরে খাবার প্রদানের সময়সূচি, পরিমাণ ও বিবরণ সংরক্ষণ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFeedingModalOpen(false);
                  setEditingIssue(null);
                }}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFeedingSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    ফিড ক্যাটাগরি নির্বাচন <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSwitchFeedingCategory("POULTRY")}
                      className={`h-[42px] px-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs transition-all cursor-pointer ${
                        feedingCategory === "POULTRY"
                          ? "bg-orange-50 dark:bg-orange-950/50 border-orange-500 text-orange-700 dark:text-orange-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Egg className="w-4 h-4 text-orange-600" />
                      <span>মুরগির ফিড (Poultry Feed)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchFeedingCategory("FISH")}
                      className={`h-[42px] px-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs transition-all cursor-pointer ${
                        feedingCategory === "FISH"
                          ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Fish className="w-4 h-4 text-sky-600" />
                      <span>মাছের ফিড (Fish Feed)</span>
                    </button>
                  </div>
                </div>

                {/* Destination Dynamic Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {feedingCategory === "FISH" ? "পুকুর নির্বাচন / নাম" : "শেডের নাম / নম্বর"} <span className="text-red-500">*</span>
                  </label>
                  {feedingCategory === "FISH" ? (
                    <CustomSelect
                      options={pondOptions}
                      value={feedingDestination}
                      onChange={(v) => {
                        setFeedingDestination(String(v));
                        const match = pondOptions.find((p) => p.value === v);
                        setFeedingDestinationId(match?.id || "");
                      }}
                      placeholder="-- পুকুর বেছে নিন --"
                    />
                  ) : (
                    <CustomSelect
                      options={shedOptions}
                      value={feedingDestination}
                      onChange={(v) => {
                        setFeedingDestination(String(v));
                        const match = shedOptions.find((s) => s.value === v);
                        setFeedingDestinationId(match?.id || "");
                      }}
                      placeholder="-- শেড নির্বাচন করুন --"
                    />
                  )}
                </div>

                {/* Feeding Time / Shift */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    খাবার প্রদানের সময়সূচি / বেলা <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["সকাল (Morning)", "দুপুর (Noon)", "বিকাল (Afternoon)", "রাত (Night)"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFeedingTime(t)}
                        className={`h-[42px] px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          feedingTime === t
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unit & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      পরিমাপের একক <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={[
                        { value: "kg", label: "কেজি (Kg)" },
                        { value: "gram", label: "গ্রাম (Gram)" },
                        { value: "bag", label: "বস্তা (Bag)" },
                      ]}
                      value={feedingUnit}
                      onChange={(v) => setFeedingUnit(v as "kg" | "gram" | "bag")}
                      placeholder="একক নির্বাচন করুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      খাদ্যের পরিমাণ ({feedingUnit === "kg" ? "কেজি" : feedingUnit === "gram" ? "গ্রাম" : "বস্তা"}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      placeholder="যেমন: ১০"
                      value={feedingAmount}
                      onChange={(e) => setFeedingAmount(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600 font-bold"
                    />
                  </div>
                </div>

                {/* Live Real-time Calculation Summary Box */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">ইনপুট খাবার:</span>
                    <span className="font-bold text-emerald-950 dark:text-emerald-100 font-mono">
                      {feedingAmount || 0} {feedingUnit === "kg" ? "কেজি" : feedingUnit === "gram" ? "গ্রাম" : "বস্তা"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-slate-500 block">মোট কেজি:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        {computedFeedingValues.computedKg.toFixed(2)} কেজি
                      </span>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-slate-500 block">বস্তায় রূপান্তর:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        {computedFeedingValues.computedBags.toFixed(3)} বস্তা
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-100 dark:border-emerald-800/50">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">স্থানান্তরিত মোট ব্যয়:</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 font-mono text-sm">
                      {formatBdCurrency(computedFeedingValues.totalCost)}
                    </span>
                  </div>
                </div>

                {/* Feeding Date & Note */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">প্রদানের তারিখ</label>
                    <CustomDatePicker
                      value={feedingDate}
                      onChange={setFeedingDate}
                      placeholder="তারিখ নির্বাচন করুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">মন্তব্য / বিবরণ (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="যেমন: নিয়মিত সকালের খাদ্য"
                      value={feedingNote}
                      onChange={(e) => setFeedingNote(e.target.value)}
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsFeedingModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={feedingSubmitting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {feedingSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{editingIssue ? "পরিবর্তন সংরক্ষণ করুন" : "খাবার প্রদান সংরক্ষণ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Feed Stock Modal */}
      {isAddStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-bold text-base leading-tight">নতুন ফিড স্টক যোগ (Add Feed Stock)</h3>
                  <p className="text-[11px] text-emerald-100 font-normal">ফিড সরাসরি স্টকে যুক্ত করুন (বস্তা, কেজি বা গ্রাম)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStockModalOpen(false)}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddStockSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 text-xs">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    ফিড ক্যাটাগরি <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectAddStockCategory("POULTRY")}
                      className={`h-[42px] px-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs transition-all cursor-pointer ${
                        addStockCategory === "POULTRY"
                          ? "bg-orange-50 dark:bg-orange-950/50 border-orange-500 text-orange-700 dark:text-orange-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Egg className="w-4 h-4 text-orange-600" />
                      <span>মুরগির ফিড (Poultry Feed)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAddStockCategory("FISH")}
                      className={`h-[42px] px-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs transition-all cursor-pointer ${
                        addStockCategory === "FISH"
                          ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Fish className="w-4 h-4 text-sky-600" />
                      <span>মাছের ফিড (Fish Feed)</span>
                    </button>
                  </div>
                </div>

                {/* Product Select */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    ফিড পণ্য নির্বাচন করুন <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={
                      (addStockFilteredProducts.length > 0 ? addStockFilteredProducts : data?.feed_products || []).map((p) => ({
                        value: p.id,
                        label: p.product_name,
                        subLabel: `বর্তমান মজুত: ${p.quantity} বস্তা (${(p.quantity * p.bag_weight_kg).toLocaleString()} কেজি) | দর: ৳${p.cost_price}`,
                      }))
                    }
                    value={addStockProductId || ""}
                    onChange={(v) => setAddStockProductId(Number(v))}
                    placeholder="-- ফিড পণ্য বেছে নিন --"
                  />
                </div>

                {/* Unit & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      স্টক একক (Unit) <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={[
                        { value: "bag", label: "বস্তা (Bag)" },
                        { value: "kg", label: "কেজি (Kg)" },
                        { value: "gram", label: "গ্রাম (Gram)" },
                      ]}
                      value={addStockUnit}
                      onChange={(v) => setAddStockUnit(v as "bag" | "kg" | "gram")}
                      placeholder="একক নির্বাচন করুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      পরিমাণ ({addStockUnit === "bag" ? "বস্তা" : addStockUnit === "kg" ? "কেজি" : "গ্রাম"}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      placeholder="যেমন: ১০"
                      value={addStockAmount}
                      onChange={(e) => setAddStockAmount(e.target.value)}
                      required
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600 font-bold"
                    />
                  </div>
                </div>

                {/* Bag Weight & Cost Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      প্রতি বস্তার সাইজ (কেজি)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="৫০"
                      value={addStockBagWeight}
                      onChange={(e) => setAddStockBagWeight(e.target.value)}
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      ক্রয় দর প্রতি বস্তা (৳)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="যেমন: ৩২০০"
                      value={addStockCostPrice}
                      onChange={(e) => setAddStockCostPrice(e.target.value)}
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                </div>

                {/* Live Unit Conversion Summary Box */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-800/50 pb-2">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">ইনপুট পরিমাণ:</span>
                    <span className="font-bold text-emerald-950 dark:text-emerald-100 font-mono">
                      {addStockAmount || 0} {addStockUnit === "bag" ? "বস্তা" : addStockUnit === "kg" ? "কেজি" : "গ্রাম"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-slate-500 block">মোট বস্তা রূপান্তর:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        {computedStockInValues.computedBags.toFixed(2)} বস্তা
                      </span>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-slate-800/70 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-slate-500 block">মোট কেজি রূপান্তর:</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        {computedStockInValues.computedKg.toFixed(2)} কেজি
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-100 dark:border-emerald-800/50">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">মোট খাদ্য স্টক মূল্য:</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 font-mono text-sm">
                      {formatBdCurrency(computedStockInValues.totalCost)}
                    </span>
                  </div>
                </div>

                {/* Stock In Date & Note */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">স্টক ইন তারিখ</label>
                    <CustomDatePicker
                      value={addStockDate}
                      onChange={setAddStockDate}
                      placeholder="তারিখ নির্বাচন করুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">মন্তব্য (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="স্টক ইন সোর্স বা নোট"
                      value={addStockNote}
                      onChange={(e) => setAddStockNote(e.target.value)}
                      className="w-full h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsAddStockModalOpen(false)}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={addStockSubmitting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {addStockSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>স্টক ইন সংরক্ষণ করুন (Save Stock)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Issue Voucher Modal */}
      {viewIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">খাবার বিতরণ ভাউচার (Feed Distribution Voucher)</h3>
                  <p className="text-[11px] text-emerald-100 font-mono mt-0.5">{viewIssue.issue_no}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewIssue(null)}
                className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">খাদ্যের নাম:</span>
                  <span className="font-bold text-slate-800 dark:text-white">{viewIssue.product_name || "ফিড পণ্য"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">গন্তব্য / প্রাপক:</span>
                  <span className="whitespace-nowrap inline-flex items-center shrink-0 font-bold px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {viewIssue.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">হস্তান্তরের তারিখ:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{viewIssue.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 block text-[11px]">স্থানান্তরিত বস্তা</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">
                    {viewIssue.bags} <span className="text-xs font-normal">বস্তা</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">মোট {viewIssue.total_kg} কেজি</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-bold">স্থানান্তরিত মোট ব্যয়</span>
                  <span className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-1 block">
                    {formatBdCurrency(viewIssue.total_cost)}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                    ৳{viewIssue.unit_cost_per_kg.toFixed(2)} / কেজি
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="h-[38px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট ভাউচার</span>
              </button>
              <button
                type="button"
                onClick={() => setViewIssue(null)}
                className="h-[38px] px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Issue Confirmation Modal */}
      {deleteIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">হস্তান্তর রেকর্ড বাতিল ও স্টক রিভার্স</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteIssue(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 dark:text-slate-300 space-y-3">
              <p>
                আপনি কি নিশ্চিত যে চালান নম্বর <strong className="font-mono text-rose-600">{deleteIssue.issue_no}</strong>-এর হস্তান্তর বাতিল করতে চান?
              </p>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-medium">
                বাতিল করলে <strong>{deleteIssue.bags} বস্তা ফিড</strong> স্বয়ংক্রিয়ভাবে সেন্ট্রাল ইনভেন্টরি স্টকে ফেরত যোগ হবে এবং সংশ্লিষ্ট খামার/পুকুরের বরাদ্দকৃত ব্যয় সমন্বয় হবে।
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDeleteIssue(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteIssue}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>হ্যাঁ, বাতিল নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 4. Dedicated Print-Only Voucher Layout */}
      {viewIssue && (
        <div className="print-only text-black bg-white">
          <div className="border-b-2 border-slate-900 pb-2 mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 m-0">ARAFAT POULTRY &amp; FISHERIES</h1>
                <p className="text-[11px] text-slate-600 font-medium m-0">Quality Products. Trusted Service.</p>
                <h2 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
                  ফিড অভ্যন্তরীণ হস্তান্তর ভাউচার (FEED ISSUE VOUCHER)
                </h2>
              </div>
              <div className="text-right text-[10px] text-slate-600">
                <p>ভাউচার নং: <strong className="text-slate-900 font-mono">{viewIssue.issue_no}</strong></p>
                <p>তারিখ: <strong>{new Date(viewIssue.date).toLocaleDateString("en-GB")}</strong></p>
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs mb-4">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold">
                <th className="border border-slate-300 p-[10px]">ফিডের বিবরণ ও সাইজ</th>
                <th className="border border-slate-300 p-[10px]">গন্তব্য / ব্যাচ</th>
                <th className="border border-slate-300 text-center p-[10px]">বস্তা</th>
                <th className="border border-slate-300 text-center p-[10px]">মোট কেজি</th>
                <th className="border border-slate-300 text-right p-[10px]">কেজি প্রতি দর</th>
                <th className="border border-slate-300 text-right p-[10px]">স্থানান্তরিত ব্যয়</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 font-bold p-[10px]">{viewIssue.product_name}</td>
                <td className="border border-slate-300 p-[10px]">{viewIssue.destination}</td>
                <td className="border border-slate-300 text-center font-bold p-[10px]">{viewIssue.bags} বস্তা</td>
                <td className="border border-slate-300 text-center p-[10px]">{viewIssue.total_kg} কেজি</td>
                <td className="border border-slate-300 text-right p-[10px]">৳{viewIssue.unit_cost_per_kg.toFixed(2)}</td>
                <td className="border border-slate-300 text-right font-bold p-[10px]">{formatBdCurrency(viewIssue.total_cost)}</td>
              </tr>
            </tbody>
          </table>

          

          <div className="grid grid-cols-3 gap-8 pt-10 text-center text-xs text-slate-700">
            <div className="border-t border-slate-400 pt-1">প্রস্তুতকারক</div>
            <div className="border-t border-slate-400 pt-1">গ্রহীতা</div>
            <div className="border-t border-slate-400 pt-1">অনুমোদনকারী</div>
          </div>
        </div>
      )}
    </div>
  );
}