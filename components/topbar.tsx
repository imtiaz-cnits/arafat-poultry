"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Moon,
  Sun,
  Maximize,
  Minimize,
  Bell,
  LogOut,
  User as UserIcon,
  ShoppingCart,
  ChevronDown,
  Calendar,
  Clock,
  } from "lucide-react";
import { getInitialTheme, applyTheme } from "@/lib/theme";
import { NotificationDropdown } from "@/components/notification-dropdown";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("admin");

  

  // Live Date and Time State across all pages
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    // Load saved dark mode state
    setIsDark(getInitialTheme());

    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<{ isDark: boolean }>;
      if (custom.detail !== undefined) {
        setIsDark(custom.detail.isDark);
      }
    };
    window.addEventListener("theme-change", handleThemeChange);

    // Load user info from localStorage if available
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.role) setUserRole(parsed.role);
      }

      
    } catch {
      // ignore
    }

    // Live clock ticker
    const updateClock = () => {
      const now = new Date();
      const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
      const toBanglaNum = (num: number | string) =>
        String(num)
          .split("")
          .map((d) => banglaDigits[Number(d)] ?? d)
          .join("");

      const months = [
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
      ];

      const day = toBanglaNum(String(now.getDate()).padStart(2, "0"));
      const month = months[now.getMonth()];
      const year = toBanglaNum(now.getFullYear());

      let hours = now.getHours();
      const minutes = toBanglaNum(String(now.getMinutes()).padStart(2, "0"));
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      const hourStr = toBanglaNum(String(hours).padStart(2, "0"));

      setCurrentDateTime(`${day} ${month}, ${year} • ${hourStr}:${minutes} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 10000);

    

    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      
      clearInterval(interval);
    };
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
      setIsFullscreen(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.location.replace("/login");
    } catch {
      window.location.replace("/login");
    }
  }

  const pathname = usePathname();
  const isSalesPortal =
    pathname === "/sales-portal" ||
    pathname?.startsWith("/sales-portal/") ||
    pathname === "/pos" ||
    pathname?.startsWith("/pos/");

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-[#cbd5e1] dark:border-[#334155] px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          className="w-[38px] h-[38px] rounded-xl border-1 border-emerald-600 dark:border-emerald-500 hover:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 shrink-0"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        {isSalesPortal && (
          <div className="hidden sm:block">
            <h1 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">
              ARAFAT POULTRY &amp; FISHERIES SALES PORTAL
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-none">
              পোল্ট্রি, ডিম ও মাছের সমন্বিত বিক্রয় ব্যবস্থা
            </p>
          </div>
        )}
      </div>

      {/* Right: Sales Portal Launch, Date, Warehouse, Mode, Fullscreen, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Date & Time Badge (Visible on ALL pages) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#cbd5e1] dark:border-[#334155] bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{currentDateTime || "০৪ নভেম্বর, ২০২৬"}</span>
        </div>

        {/* Quick Launch Sales Portal Button (Theme Green #166534) */}
        {!isSalesPortal && (
          <Link
            href="/sales-portal"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>বিক্রয় পোর্টাল</span>
          </Link>
        )}

        {/* Low Stock & Store Notifications */}
        <NotificationDropdown />

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          aria-label="Toggle Fullscreen"
          className="w-[38px] h-[38px] rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer hidden sm:flex"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="w-[38px] h-[38px] rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-slate-50 dark:bg-slate-800/80 hover:border-emerald-600 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#166534] to-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-slate-800 dark:text-white leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">{userRole}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdown && (
            <div
              onClick={() => setUserDropdown(false)}
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border-[1.5px] border-[#cbd5e1] dark:border-[#334155] shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{userName}</p>
                <p className="text-[11px] text-slate-400 capitalize">{userRole}</p>
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>আমার প্রোফাইল</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগ আউট</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
