"use client";
import { PageSkeleton } from "@/components/ui/table-skeleton";

import { isDevUser } from "@/lib/roles";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  History,
  RefreshCw,
  Trash2,
  Search,
  User as UserIcon,
  Zap,
  Package,
  ChevronDown,
  Check,
  Shield,
  Activity,
  Layers,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  X,
  Crown,
  Briefcase,
  UserCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Pagination } from "@/components/ui/pagination";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";

interface LogUser {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  role: string;
  img_url: string | null;
}

interface ActivityLogItem {
  id: number;
  user_id: number | null;
  user: LogUser;
  action: string;
  module: string;
  entity_id: string | null;
  description: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

interface LogStats {
  totalRecordedLogs: number;
  pageLoginsAndSessions: number;
  dataModifications: number;
  registeredUsers: number;
}

interface FilterOption {
  value: string;
  label: string;
}

export default function UserLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  // Stats
  const [stats, setStats] = useState<LogStats>({
    totalRecordedLogs: 0,
    pageLoginsAndSessions: 0,
    dataModifications: 0,
    registeredUsers: 0,
  });

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  // Filter options from API
  const [userOptions, setUserOptions] = useState<LogUser[]>([]);
  const [actionOptions, setActionOptions] = useState<FilterOption[]>([]);
  const [moduleOptions, setModuleOptions] = useState<FilterOption[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Custom Dropdown Open states
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false);

  // Search inside dropdowns
  const [userSearchText, setUserSearchText] = useState("");
  const [actionSearchText, setActionSearchText] = useState("");
  const [moduleSearchText, setModuleSearchText] = useState("");

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const moduleDropdownRef = useRef<HTMLDivElement>(null);

  // Clear All Modal state
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(target)) {
        setActionDropdownOpen(false);
      }
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(target)) {
        setModuleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Read current user role from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.email) setCurrentUserEmail(u.email);
        if (u.role) setCurrentUserRole(u.role);
      }
    } catch {}
  }, []);

  // Fetch logs from API
  async function fetchLogs(page = currentPage, isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      if (search.trim()) params.set("search", search.trim());
      if (selectedUser !== "all") params.set("user_id", selectedUser);
      if (selectedAction !== "all") params.set("action", selectedAction);
      if (selectedModule !== "all") params.set("module", selectedModule);

      const res = await fetch(`/api/user-logs?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.status === "success" && data.data) {
        setLogs(data.data.logs || []);
        setTotalItems(data.data.pagination?.total || 0);
        if (data.data.stats) setStats(data.data.stats);
        if (data.data.filterOptions) {
          if (data.data.filterOptions.users) setUserOptions(data.data.filterOptions.users);
          if (data.data.filterOptions.actions) setActionOptions(data.data.filterOptions.actions);
          if (data.data.filterOptions.modules) setModuleOptions(data.data.filterOptions.modules);
        }
      } else {
        toast.error(data?.message || "Failed to load activity logs");
      }
    } catch (err: any) {
      toast.error(err?.message || "Communication error loading activity logs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Trigger search on mount and filter changes
  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, pageSize, selectedUser, selectedAction, selectedModule]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedUser("all");
    setSelectedAction("all");
    setSelectedModule("all");
    setCurrentPage(1);
  };

  // Clear all logs handler (Super admin only)
  const handleClearAll = async () => {
    try {
      setClearing(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/user-logs", {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.status === "success") {
        toast.success("সকল ইউজার অ্যাক্টিভিটি হিস্ট্রি মুছে ফেলা হয়েছে");
        setClearModalOpen(false);
        setCurrentPage(1);
        fetchLogs(1);
      } else {
        toast.error(data?.message || "Failed to clear logs");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error clearing logs");
    } finally {
      setClearing(false);
    }
  };

  // Format date time helper
  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  // Role Badge Styling
  const renderRoleBadge = (role: string) => {
    const r = (role || "").toLowerCase();
    if (r === "super_admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
          <Crown className="w-2.5 h-2.5" />
          <span>Super Admin</span>
        </span>
      );
    }
    if (r === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
          <UserCheck className="w-2.5 h-2.5" />
          <span>Admin</span>
        </span>
      );
    }
    if (r === "manager") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          <Briefcase className="w-2.5 h-2.5" />
          <span>Manager</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <UserIcon className="w-2.5 h-2.5" />
        <span>Staff</span>
      </span>
    );
  };

  // Action Badge Styling
  const renderActionBadge = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act === "DELETE") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
          DELETE
        </span>
      );
    }
    if (act === "UPDATE") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
          UPDATE
        </span>
      );
    }
    if (act === "CREATE") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
          CREATE
        </span>
      );
    }
    if (act === "DUE_COLLECTION") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60">
          DUE_COLLECTION
        </span>
      );
    }
    if (act === "ADJUST") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
          ADJUST
        </span>
      );
    }
    if (act === "RETURN" || act === "CANCEL") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60">
          {act}
        </span>
      );
    }
    if (act === "HARVEST") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/60">
          HARVEST
        </span>
      );
    }
    if (act === "ISSUE") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60">
          ISSUE
        </span>
      );
    }
    if (act === "PAYMENT" || act === "RECEIPT") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
          {act}
        </span>
      );
    }
    if (act === "LOGIN") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900/60">
          LOGIN
        </span>
      );
    }
    if (act === "LOGOUT") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          LOGOUT
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
        {act}
      </span>
    );
  };

  // Selected label helpers
  const selectedUserLabel =
    selectedUser === "all"
      ? "All System Users"
      : userOptions.find((u) => String(u.id) === selectedUser)?.name || "Selected User";

  const selectedActionLabel =
    selectedAction === "all"
      ? "All Actions"
      : actionOptions.find((a) => a.value === selectedAction)?.label || selectedAction;

  const selectedModuleLabel =
    selectedModule === "all"
      ? "All Modules"
      : moduleOptions.find((m) => m.value === selectedModule)?.label || selectedModule;

  // Filtered dropdown items by inner search
  const filteredUserOptions = userOptions.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(userSearchText.toLowerCase()))
  );

  const filteredActionOptions = actionOptions.filter((a) =>
    a.label.toLowerCase().includes(actionSearchText.toLowerCase())
  );

  const filteredModuleOptions = moduleOptions.filter((m) =>
    m.label.toLowerCase().includes(moduleSearchText.toLowerCase())
  );

  const isFiltered =
    search.trim() !== "" ||
    selectedUser !== "all" ||
    selectedAction !== "all" ||
    selectedModule !== "all";

  // Access Control: Only admin and super_admin can view
  if (!loading && currentUserRole && currentUserRole !== "admin" && currentUserRole !== "super_admin") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
          অননুমোদিত প্রবেশাধিকার (Access Restricted)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          ইউজার অ্যাক্টিভিটি লগ ও হিস্ট্রি শুধুমাত্র <strong>অ্যাডমিন (Admin)</strong> এবং <strong>সুপার অ্যাডমিন (Super Admin)</strong> এর জন্য সংরক্ষিত।
        </p>
        <Link
          href="/dashboard"
          className="h-[42px] px-6 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
        >
          <span>ড্যাশবোর্ডে ফিরে যান</span>
        </Link>
      </div>
    );
  }

  if (loading && logs.length === 0) {

    return <PageSkeleton />;

  }

  return (
    <div className="space-y-4">
      {/* ============================================================ */}
      {/* 1. Header Section: Title & Actions                           */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              User Activity Logs &amp; History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Real-time audit trail of user logins, logouts, sales, and system changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => fetchLogs(currentPage, true)}
            disabled={refreshing}
            className="h-[38px] px-3.5 rounded-xl border border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>

          {/* Clear All Logs - Strictly Super Admin Only */}
          {((currentUserRole && currentUserRole.toLowerCase() === "super_admin") || (currentUserEmail && isDevUser(currentUserEmail))) && (
            <button
              onClick={() => setClearModalOpen(true)}
              className="h-[38px] px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="সকল হিস্ট্রি লগ মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>সকল লগ মুছুন</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Top 4 KPI Summary Cards                                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Recorded Logs */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              TOTAL RECORDED LOGS
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            {stats.totalRecordedLogs}
          </div>
        </div>

        {/* Page Logins & Sessions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              PAGE LOGINS &amp; SESSIONS
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {stats.pageLoginsAndSessions}
          </div>
        </div>

        {/* Data Modifications */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              DATA MODIFICATIONS
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {stats.dataModifications}
          </div>
        </div>

        {/* Registered Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              REGISTERED USERS
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.registeredUsers}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Filter Bar with 3 Custom Searchable Dropdowns             */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, description..."
              className="w-full h-[42px] pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-800/90 border border-[#cbd5e1] dark:border-[#334155] rounded-xl focus:outline-hidden focus:border-[#166534] dark:focus:border-emerald-500 text-slate-800 dark:text-white transition-colors"
            />
          </div>

          {/* Custom Dropdown 1: All System Users */}
          <div ref={userDropdownRef} className="relative min-w-[170px]">
            <button
              type="button"
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setActionDropdownOpen(false);
                setModuleDropdownOpen(false);
              }}
              className={`w-full h-[42px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/90 transition-all cursor-pointer ${
                userDropdownOpen
                  ? "border-[#166534] ring-2 ring-[#166534]/20"
                  : "border-[#cbd5e1] dark:border-[#334155] text-slate-700 dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedUserLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {userDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 max-w-[90vw] rounded-2xl bg-white dark:bg-slate-900 border border-[#cbd5e1] dark:border-[#334155] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    placeholder="Search users..."
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-hidden focus:border-[#166534]"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser("all");
                      setUserDropdownOpen(false);
                      setUserSearchText("");
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      selectedUser === "all"
                        ? "bg-[#166534] text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>All System Users</span>
                    {selectedUser === "all" && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {filteredUserOptions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(String(u.id));
                        setUserDropdownOpen(false);
                        setUserSearchText("");
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                        selectedUser === String(u.id)
                          ? "bg-[#166534] text-white font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate font-bold leading-tight">{u.name}</p>
                        <p className="text-[10px] opacity-75 capitalize truncate">{u.role}</p>
                      </div>
                      {selectedUser === String(u.id) && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Dropdown 2: All Actions */}
          <div ref={actionDropdownRef} className="relative min-w-[150px]">
            <button
              type="button"
              onClick={() => {
                setActionDropdownOpen(!actionDropdownOpen);
                setUserDropdownOpen(false);
                setModuleDropdownOpen(false);
              }}
              className={`w-full h-[42px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/90 transition-all cursor-pointer ${
                actionDropdownOpen
                  ? "border-[#166534] ring-2 ring-[#166534]/20"
                  : "border-[#cbd5e1] dark:border-[#334155] text-slate-700 dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{selectedActionLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${actionDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {actionDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 max-w-[90vw] rounded-2xl bg-white dark:bg-slate-900 border border-[#cbd5e1] dark:border-[#334155] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={actionSearchText}
                    onChange={(e) => setActionSearchText(e.target.value)}
                    placeholder="Search actions..."
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-hidden focus:border-[#166534]"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filteredActionOptions.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => {
                        setSelectedAction(a.value);
                        setActionDropdownOpen(false);
                        setActionSearchText("");
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                        selectedAction === a.value
                          ? "bg-[#166534] text-white font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate">{a.label}</span>
                      {selectedAction === a.value && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Dropdown 3: All Modules */}
          <div ref={moduleDropdownRef} className="relative min-w-[150px]">
            <button
              type="button"
              onClick={() => {
                setModuleDropdownOpen(!moduleDropdownOpen);
                setUserDropdownOpen(false);
                setActionDropdownOpen(false);
              }}
              className={`w-full h-[42px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/90 transition-all cursor-pointer ${
                moduleDropdownOpen
                  ? "border-[#166534] ring-2 ring-[#166534]/20"
                  : "border-[#cbd5e1] dark:border-[#334155] text-slate-700 dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Package className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="truncate">{selectedModuleLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${moduleDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {moduleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 max-w-[90vw] rounded-2xl bg-white dark:bg-slate-900 border border-[#cbd5e1] dark:border-[#334155] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={moduleSearchText}
                    onChange={(e) => setModuleSearchText(e.target.value)}
                    placeholder="Search modules..."
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-hidden focus:border-[#166534]"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filteredModuleOptions.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setSelectedModule(m.value);
                        setModuleDropdownOpen(false);
                        setModuleSearchText("");
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                        selectedModule === m.value
                          ? "bg-[#166534] text-white font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate">{m.label}</span>
                      {selectedModule === m.value && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Filter Button */}
          <button
            type="submit"
            className="h-[42px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-[42px] px-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              title="ফিল্টার রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* ============================================================ */}
      {/* 4. Table Section (Desktop View)                              */}
      {/* ============================================================ */}
      <div className="hidden md:block bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#14532d] text-white font-bold tracking-wider select-none">
                <th className="px-3 py-2.5 w-12 text-center border-r border-white/10">#</th>
                <th className="px-3 py-2.5 min-w-[180px] border-r border-white/10">USER</th>
                <th className="px-3 py-2.5 min-w-[110px] text-center border-r border-white/10">ROLE</th>
                <th className="px-3 py-2.5 min-w-[120px] text-center border-r border-white/10">ACTION</th>
                <th className="px-3 py-2.5 min-w-[130px] border-r border-white/10">MODULE</th>
                <th className="px-3 py-2.5 min-w-[280px] border-r border-white/10">ACTIVITY DESCRIPTION</th>
                <th className="px-3 py-2.5 min-w-[160px] text-right">DATE &amp; TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#166534] mb-2" />
                    <span>অ্যাক্টিভিটি হিস্ট্রি লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">কোনো লগ পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-400 mt-1">প্রদত্ত ফিল্টার অনুযায়ী কোনো রেকর্ড নেই।</p>
                  </td>
                </tr>
              ) : (
                logs.map((item, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* SL */}
                      <td className="px-3 py-2.5 text-center font-bold text-slate-500 dark:text-slate-400">
                        {sl}
                      </td>

                      {/* User Info */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-[#166534] to-[#0284c7] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {item.user.img_url ? (
                              <Image
                                src={item.user.img_url}
                                alt={item.user.name}
                                width={28}
                                height={28}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (item.user.name || "U").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate leading-tight">
                              {item.user.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {item.user.email || item.user.mobile}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-3 py-2.5 text-center">
                        {renderRoleBadge(item.user.role)}
                      </td>

                      {/* Action Badge */}
                      <td className="px-3 py-2.5 text-center">
                        {renderActionBadge(item.action)}
                      </td>

                      {/* Module Badge */}
                      <td className="px-3 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[140px]">
                          {item.module}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-3 py-2.5">
                        <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed whitespace-normal break-words">
                          {item.description}
                        </p>
                      </td>

                      {/* Date & Time */}
                      <td className="px-3 py-2.5 text-right font-medium text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {formatDateTime(item.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. Mobile Box Card View (`md:hidden`)                        */}
      {/* ============================================================ */}
      <div className="md:hidden space-y-2.5">
        {loading ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] p-6">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#166534] mb-2" />
            <span>অ্যাক্টিভিটি হিস্ট্রি লোড হচ্ছে...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] p-6">
            <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-bold text-slate-600 dark:text-slate-300 text-sm">কোনো লগ পাওয়া যায়নি</p>
          </div>
        ) : (
          logs.map((item, index) => {
            const sl = (currentPage - 1) * pageSize + index + 1;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] shadow-xs space-y-2.5"
              >
                {/* Card Top: User & Action */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                      {sl}
                    </span>
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-[#166534] to-[#0284c7] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {item.user.img_url ? (
                        <Image
                          src={item.user.img_url}
                          alt={item.user.name}
                          width={28}
                          height={28}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (item.user.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white text-xs truncate leading-tight">
                        {item.user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {item.user.email || item.user.mobile}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {renderRoleBadge(item.user.role)}
                    {renderActionBadge(item.action)}
                  </div>
                </div>

                {/* Card Body: Module & Description */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.module}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed break-words">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer: Date & Time */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* 6. Pagination Footer                                         */}
      {/* ============================================================ */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
      />

      {/* ============================================================ */}
      {/* 7. Clear All Confirmation Modal                              */}
      {/* ============================================================ */}
      <DeleteConfirmModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearAll}
        title="সকল হিস্ট্রি লগ মুছে ফেলবেন?"
        description="আপনি কি নিশ্চিত যে সকল ইউজার অ্যাক্টিভিটি হিস্ট্রি ও অডিট ট্রেইল মুছে ফেলতে চান? এটি স্থায়ীভাবে ডিলিট হয়ে যাবে এবং পুনরায় ফিরিয়ে আনা সম্ভব হবে না।"
        loading={clearing}
      />
    </div>
  );
}
