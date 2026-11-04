"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Users as UsersIcon,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  Edit2,
  Trash2,
  Crown,
  Briefcase,
  UserCheck,
  Check,
  Camera,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Pagination, DeleteConfirmModal, CustomSelect } from "@/components/ui";

interface UserItem {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  role: string;
  status: string;
  created_at: string;
  img_url?: string | null;
  permissions?: Record<string, boolean> | null;
}

export const SIDEBAR_MODULES: {
  key: string;
  label: string;
  desc: string;
  submenus?: { key: string; label: string; desc: string }[];
}[] = [
  { key: "dashboard", label: "ড্যাশবোর্ড (Dashboard)", desc: "মূল সার্বিক ড্যাশবোর্ড ওভারভিউ ও তথ্য" },
  { key: "sales-portal", label: "বিক্রয় পোর্টাল (Sales Portal)", desc: "পণ্য নির্বাচন, নগদ বিক্রয় ও দ্রুত ক্যাশ বিলিং" },
  { key: "purchases", label: "পণ্য ক্রয় (Purchases)", desc: "মাছ, ফিড ও অন্যান্য ক্রয় ও ইনওয়ার্ড স্টক" },
  { key: "poultry", label: "মুরগির হিসাব (Poultry Management)", desc: "শেডভিত্তিক ব্যাচ, বয়স, খাবার ও মৃত্যুর হিসাব" },
  { key: "fish", label: "মাছের হিসাব (Fisheries Management)", desc: "পুকুর ব্যবস্থাপনা, পোনা মজুদ, নমুনা ওজন ও আহরণ" },
  { key: "suppliers", label: "সরবরাহকারী (Suppliers & Vendors)", desc: "সরবরাহকারীর প্রোফাইল ও ক্রয় বকেয়া দেনা" },
  { key: "customers", label: "কাস্টমার (Customer Directory)", desc: "গ্রাহক তথ্য ও বাকির খাতা" },
  { key: "memo", label: "মেমো (Memo & Invoices)", desc: "বিক্রয় ইনভয়েস, চালান ও প্রিন্ট ভাউচার" },
  {
    key: "stock",
    label: "স্টক মডিউল (Stock Management)",
    desc: "সকল পণ্যের লাইভ গুদাম ও মজুদ নিয়ন্ত্রণ",
    submenus: [
      { key: "stock_eggs", label: "ডিমের স্টক (Egg Stock)", desc: "দৈনিক সংগ্রহ, ভালো ও ফাটা ডিমের হিসাব" },
      { key: "stock_fish", label: "মাছের স্টক (Fish Stock)", desc: "পুকুরভিত্তিক মাছের জীবন্ত মজুদ ও সাইজ" },
      { key: "stock_feed", label: "ফিডের স্টক (Feed Stock)", desc: "খাদ্যের বস্তা ও কেজিভিত্তিক মজুদ" },
      { key: "stock_chicken", label: "মুরগির স্টক (Chicken Stock)", desc: "শেডভিত্তিক বড়, মাঝারি ও বাচ্চার স্টক" },
    ],
  },
  { key: "medications", label: "ওষুধ ও ভ্যাকসিন (Medications & Vaccines)", desc: "টিকা সূচি, ডোজ ও ভ্যাকসিনের স্টক" },
  { key: "expenses", label: "খরচসমূহ (Expenses)", desc: "দৈনিক পরিচালন ও বিবিধ খামারের খরচ" },
  {
    key: "reports",
    label: "রিপোর্ট ও অ্যানালিটিক্স (Reports)",
    desc: "ব্যবসায়িক বিশ্লেষণ ও আর্থিক বিবরণী",
    submenus: [
      { key: "reports_income_expense", label: "আয় ও ব্যয় (Income & Expenses)", desc: "সার্বিক লাভ-ক্ষতি ও আয়-ব্যয়ের হিসাব" },
      { key: "reports_sales", label: "বিক্রয় রিপোর্ট (Sales Report)", desc: "দৈনিক ও তারিখভিত্তিক বিক্রয় বিবরণী" },
      { key: "reports_ledger", label: "দৈনিক লেজার (Daily Ledger)", desc: "গ্রাহক ও ভেন্ডর লেজার হিসাব" },
    ],
  },
  {
    key: "settings",
    label: "সেটিংস মডিউল (Settings)",
    desc: "সিস্টেম ও অ্যাকাউন্ট কনফিগারেশন",
    submenus: [
      { key: "settings_users", label: "ইউজার ও রোল (Users & Roles)", desc: "ব্যবহারকারী তৈরি ও পারমিশন নিয়ন্ত্রণ" },
      { key: "settings_profile", label: "প্রোফাইল (Profile)", desc: "ব্যবহারকারীর নিজস্ব প্রোফাইল ও পাসওয়ার্ড" },
    ],
  },
];

export const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  dashboard: true,
  "sales-portal": true,
  purchases: true,
  poultry: true,
  fish: true,
  suppliers: true,
  customers: true,
  memo: true,
  stock: true,
  stock_eggs: true,
  stock_fish: true,
  stock_feed: true,
  stock_chicken: true,
  medications: true,
  expenses: true,
  reports: true,
  reports_income_expense: true,
  reports_sales: true,
  reports_ledger: true,
  settings: true,
  settings_users: true,
  settings_profile: true,
};

export const ROLE_PRESETS: Record<string, Record<string, boolean>> = {
  admin: {
    dashboard: true,
    "sales-portal": true,
    purchases: true,
    poultry: true,
    fish: true,
    suppliers: true,
    customers: true,
    memo: true,
    stock: true,
    stock_eggs: true,
    stock_fish: true,
    stock_feed: true,
    stock_chicken: true,
    medications: true,
    expenses: true,
    reports: true,
    reports_income_expense: true,
    reports_sales: true,
    reports_ledger: true,
    settings: true,
    settings_users: true,
    settings_profile: true,
  },
  manager: {
    dashboard: true,
    "sales-portal": true,
    purchases: true,
    poultry: true,
    fish: true,
    suppliers: true,
    customers: true,
    memo: true,
    stock: true,
    stock_eggs: true,
    stock_fish: true,
    stock_feed: true,
    stock_chicken: true,
    medications: true,
    expenses: true,
    reports: true,
    reports_income_expense: true,
    reports_sales: true,
    reports_ledger: true,
    settings: true,
    settings_users: false,
    settings_profile: true,
  },
  staff: {
    dashboard: true,
    "sales-portal": true,
    purchases: false,
    poultry: true,
    fish: true,
    suppliers: false,
    customers: true,
    memo: true,
    stock: true,
    stock_eggs: true,
    stock_fish: true,
    stock_feed: true,
    stock_chicken: true,
    medications: true,
    expenses: true,
    reports: false,
    reports_income_expense: false,
    reports_sales: false,
    reports_ledger: false,
    settings: false,
    settings_users: false,
    settings_profile: true,
  },
};

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");

  // Delete Confirm Modal State
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    mobile: string;
    password: string;
    role: "admin" | "manager" | "staff";
    status: string;
    img_url: string;
    permissions: Record<string, boolean>;
  }>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "staff",
    status: "approved",
    img_url: "",
    permissions: { ...ROLE_PRESETS.staff },
  });

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json().catch(() => null);
      if (res.ok && data?.status === "success" && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "staff",
      status: "approved",
      img_url: "",
      permissions: { ...ROLE_PRESETS.staff },
    });
    setSelectedUser(null);
    setError("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    const rawRole = (user.role || "staff").toLowerCase();
    const cleanRole: "admin" | "manager" | "staff" =
      rawRole === "admin" || rawRole === "super_admin"
        ? "admin"
        : rawRole === "manager"
        ? "manager"
        : "staff";

    const basePermissions = ROLE_PRESETS[cleanRole] || DEFAULT_PERMISSIONS;
    const merged = { ...basePermissions, ...(user.permissions || {}) };

    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email || "",
      mobile: user.mobile,
      password: "",
      role: cleanRole,
      status: user.status || "approved",
      img_url: user.img_url || "",
      permissions: merged,
    });
    setError("");
    setModalOpen(true);
  };

  const handleRoleChange = (newRole: "admin" | "manager" | "staff") => {
    const preset = ROLE_PRESETS[newRole] || ROLE_PRESETS.staff;
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: { ...preset },
    }));
  };

  const togglePermission = (key: string) => {
    setFormData((prev) => {
      const nextVal = !prev.permissions[key];
      const updated = { ...prev.permissions, [key]: nextVal };

      // If toggling a parent module that has submenus, sync its children
      const mod = SIDEBAR_MODULES.find((m) => m.key === key);
      if (mod?.submenus) {
        mod.submenus.forEach((sub) => {
          updated[sub.key] = nextVal;
        });
      }

      return {
        ...prev,
        permissions: updated,
      };
    });
  };

  const toggleSubmenu = (parentKey: string, subKey: string) => {
    setFormData((prev) => {
      const nextVal = !prev.permissions[subKey];
      const updated = { ...prev.permissions, [subKey]: nextVal };

      // If at least one submenu is enabled, ensure parent is enabled
      const mod = SIDEBAR_MODULES.find((m) => m.key === parentKey);
      if (mod?.submenus) {
        const anySubActive = mod.submenus.some((s) => (s.key === subKey ? nextVal : updated[s.key]));
        if (anySubActive) {
          updated[parentKey] = true;
        }
      }

      return {
        ...prev,
        permissions: updated,
      };
    });
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setUploadingAvatar(true);
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/users/profile/avatar", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.img_url) {
        setFormData((prev) => ({ ...prev, img_url: data.img_url }));
        toast.success("User avatar photo uploaded!");
      } else {
        toast.error(data?.message || "Failed to upload avatar");
      }
    } catch {
      toast.error("Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteUser = (user: UserItem) => {
    const roleLower = user.role.toLowerCase();
    if (user.id === 1 || user.id === 7 || roleLower === "admin" || roleLower === "super_admin") {
      toast.error("Super Admin account cannot be deleted!");
      return;
    }
    setDeleteError(null);
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.status === "success") {
        toast.success("User account deleted successfully!");
        setUserToDelete(null);
        setCurrentPage(1);
        loadUsers();
      } else {
        setDeleteError(data?.message || `Failed to delete user account (Status ${res.status})`);
      }
    } catch (err: any) {
      setDeleteError(err?.message || "Communication error deleting user account");
    } finally {
      setIsDeleting(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : "/api/users";
      const method = selectedUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.status !== "success") {
        setError(data?.message || `Failed to ${selectedUser ? "update" : "create"} user`);
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      toast.success(selectedUser ? "User updated successfully!" : "User created successfully!");
      resetForm();
      setCurrentPage(1);
      loadUsers();
    } catch (err: any) {
      setError(err?.message || "Server communication error");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.mobile.includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const adminCount = users.filter(
    (u) => u.role.toLowerCase() === "admin" || u.role.toLowerCase() === "super_admin"
  ).length;
  const managerCount = users.filter((u) => u.role.toLowerCase() === "manager").length;
  const staffCount = users.filter((u) => u.role.toLowerCase() === "staff").length;

  return (
    <div className="space-y-4">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              ব্যবহারকারী ও রোল ব্যবস্থাপনা (Users &amp; Roles)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              সিস্টেম অ্যাকাউন্ট, রোল এবং সাইডবার মেনু পারমিশন নিয়ন্ত্রণ
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ব্যবহারকারী (Add User)</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards (Strictly 3 roles: Admin, Manager, Staff + Total) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Admin */}
        <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400">
              অ্যাডমিন (ADMIN)
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-300 m-0">
            {adminCount}
          </h2>
        </div>

        {/* Manager */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-400">
              ম্যানেজার (MANAGER)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 m-0">
            {managerCount}
          </h2>
        </div>

        {/* Staff */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              স্টাফ (STAFF)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 m-0">
            {staffCount}
          </h2>
        </div>

        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 shadow-xs hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              মোট ব্যবহারকারী (TOTAL)
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200 m-0">
            {users.length}
          </h2>
        </div>
      </div>

      {/* 3. User Table Container */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white m-0">
              সিস্টেম ব্যবহারকারী ও পারমিশন তালিকা
            </h3>
          </div>

          <div className="w-full sm:w-80 h-[38px] flex items-center px-3 bg-slate-50 dark:bg-[#1e293b] rounded-xl border border-[#cbd5e1] dark:border-[#334155] focus-within:ring-2 focus-within:ring-emerald-600/30 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="নাম, মোবাইল বা রোল দিয়ে খুঁজুন..."
              className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold whitespace-nowrap uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-center w-12">ক্র: নং (SL)</th>
                <th className="py-3 px-4">ব্যবহারকারী (User Info)</th>
                <th className="py-3 px-3">মোবাইল নম্বর (Mobile)</th>
                <th className="py-3 px-3 text-center">পদবী (Role)</th>
                <th className="py-3 px-3">সক্রিয় মেনু পারমিশন (Permissions)</th>
                <th className="py-3 px-3 text-center">অবস্থা (Status)</th>
                <th className="py-3 px-4 text-center w-28">অ্যাকশন (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>ব্যবহারকারী তালিকা লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    কোনো ব্যবহারকারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user, idx) => {
                  const r = user.role.toLowerCase();
                  const roleLabel =
                    r === "admin" || r === "super_admin"
                      ? "👑 Admin"
                      : r === "manager"
                      ? "💼 Manager"
                      : "👤 Staff";

                  const roleBadgeClass =
                    r === "admin" || r === "super_admin"
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300"
                      : r === "manager"
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";

                  const activePermCount = user.permissions
                    ? Object.values(user.permissions).filter(Boolean).length
                    : r === "admin" || r === "super_admin"
                    ? Object.keys(DEFAULT_PERMISSIONS).length
                    : 0;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {user.img_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.img_url}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                              <User className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{user.email || "No email"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium">{user.mobile}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadgeClass}`}
                        >
                          {roleLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {activePermCount} টি মেনু সক্রিয়
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {user.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>সক্রিয়</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <XCircle className="w-3 h-3" />
                            <span>অননুমোদিত</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {user.id !== 1 && user.id !== 7 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {displayedUsers.map((user) => (
            <div key={user.id} className="p-3.5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{user.name}</h4>
                  <p className="text-[11px] text-slate-400">{user.mobile}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  স্ট্যাটাস: {user.status === "approved" ? "সক্রিয়" : "অপেক্ষমাণ"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold"
                  >
                    Edit
                  </button>
                  {user.id !== 1 && user.id !== 7 && (
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[20, 50, 100]}
          />
        </div>
      </div>

      {/* 4. CREATE / EDIT USER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  {selectedUser ? "ব্যবহারকারী সম্পাদনা ও পারমিশন" : "নতুন ব্যবহারকারী ও পারমিশন তৈরি"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পূর্ণ নাম (Full Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ইমেইল এড্রেস (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@arafatpoultry.com"
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পাসওয়ার্ড{" "}
                    {selectedUser ? (
                      <span className="text-slate-400 font-normal">(অপরিবর্তিত রাখতে ফাঁকা রাখুন)</span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={!selectedUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* System Role: STRICTLY 3 OPTIONS (admin, manager, staff) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পদবী / রোল (System Role) <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={[
                      { value: "admin", label: "👑 Admin (অ্যাডমিন)" },
                      { value: "manager", label: "💼 Manager (ম্যানেজার)" },
                      { value: "staff", label: "👤 Staff (স্টাফ)" },
                    ]}
                    value={formData.role}
                    onChange={(v) => handleRoleChange(v as "admin" | "manager" | "staff")}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    অ্যাকাউন্ট স্ট্যাটাস <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    options={[
                      { value: "approved", label: "সক্রিয় (Approved / Active)" },
                      { value: "pending", label: "অননুমোদিত (Pending Approval)" },
                    ]}
                    value={formData.status}
                    onChange={(v) => setFormData({ ...formData, status: String(v) })}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    প্রোফাইল ছবি (ঐচ্ছিক)
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.img_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.img_url}
                        alt="Preview"
                        className="w-10 h-10 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <label className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{uploadingAvatar ? "আপলোড হচ্ছে..." : "ছবি আপলোড করুন"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                    </label>
                    {formData.img_url && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, img_url: "" })}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        ছবি সরান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirement 10: Module Access Permissions showing full sidebar menus & submenus */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 block">
                      সাইডবার মেনু অ্যাক্সেস পারমিশন (Module Access Permissions)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      প্রত্যেকটি মেনু ও সাবমেনুর পারমিশন চেকবক্স দিয়ে নিয়ন্ত্রণ করুন
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const allOn: Record<string, boolean> = {};
                        SIDEBAR_MODULES.forEach((m) => {
                          allOn[m.key] = true;
                          m.submenus?.forEach((s) => (allOn[s.key] = true));
                        });
                        setFormData((p) => ({ ...p, permissions: allOn }));
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                    >
                      সব নির্বাচন
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allOff: Record<string, boolean> = {};
                        SIDEBAR_MODULES.forEach((m) => {
                          allOff[m.key] = false;
                          m.submenus?.forEach((s) => (allOff[s.key] = false));
                        });
                        setFormData((p) => ({ ...p, permissions: allOff }));
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200"
                    >
                      সব বাতিল
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {SIDEBAR_MODULES.map((mod) => {
                    const isParentChecked = Boolean(formData.permissions[mod.key]);
                    const hasSubmenus = Boolean(mod.submenus && mod.submenus.length > 0);

                    return (
                      <div
                        key={mod.key}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                      >
                        {/* Parent Menu Row */}
                        <div
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isParentChecked
                              ? "bg-emerald-50/70 dark:bg-emerald-950/30"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                          onClick={() => togglePermission(mod.key)}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                                isParentChecked
                                  ? "bg-emerald-600 text-white"
                                  : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              }`}
                            >
                              {isParentChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                {mod.label}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{mod.desc}</div>
                            </div>
                          </div>

                          {hasSubmenus && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {mod.submenus?.length} টি সাবমেনু
                            </span>
                          )}
                        </div>

                        {/* Nested Submenus List if any */}
                        {hasSubmenus && (
                          <div className="bg-slate-50/80 dark:bg-slate-950/40 p-2 pl-6 sm:pl-8 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                            {mod.submenus?.map((sub) => {
                              const isSubChecked = Boolean(formData.permissions[sub.key]);

                              return (
                                <div
                                  key={sub.key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSubmenu(mod.key, sub.key);
                                  }}
                                  className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                    isSubChecked
                                      ? "bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 shadow-2xs"
                                      : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                                        isSubChecked
                                          ? "bg-emerald-600 text-white"
                                          : "border border-slate-300 dark:border-slate-600"
                                      }`}
                                    >
                                      {isSubChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                                        {sub.label}
                                      </div>
                                      <div className="text-[9.5px] text-slate-400 truncate">
                                        {sub.desc}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{selectedUser ? "হালনাগাদ করুন (Update)" : "সংরক্ষণ করুন (Save)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {userToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(userToDelete)}
          title="ব্যবহারকারী অ্যাকাউন্ট মুছে ফেলুন"
          itemName={`${userToDelete.name} (${userToDelete.role})`}
          warningMessage={`আপনি কি নিশ্চিতভাবে "${userToDelete.name}" (${userToDelete.role}) এর অ্যাকাউন্টটি মুছে ফেলতে চান?`}
          errorMessage={deleteError}
          isLoading={isDeleting}
          onConfirm={confirmDeleteUser}
          onClose={() => {
            setUserToDelete(null);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}
